import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { Investment } from '@/lib/models/Investment';
import { Package } from '@/lib/models/Package';
import { Transaction } from '@/lib/models/Transaction';
import { Trade } from '@/lib/models/Trade';
import { verifyToken } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
  try {
    const userId = verifyToken(req);
    await connectDB();

    const userObjId = new mongoose.Types.ObjectId(userId);

    const user = await User.findById(userId).select(
      'username email profile_picture balance referral_code referral_earnings total_earnings created_at'
    );
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const invSummary = await Investment.aggregate([
      { $match: { user_id: userObjId } },
      {
        $group: {
          _id: null,
          active_count: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          completed_count: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          total_earned: { $sum: '$total_earned' },
          total_invested: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, '$amount', 0] } },
          all_time_invested: { $sum: '$amount' },
        },
      },
    ]);

    const summary = invSummary[0] || {
      active_count: 0,
      completed_count: 0,
      total_earned: 0,
      total_invested: 0,
      all_time_invested: 0,
    };

    const activeInvestments = await Investment.find({ user_id: userId, status: 'active' })
      .populate('package_id', 'tier name')
      .select('package_name amount daily_return_pct duration_days days_completed total_earned status start_date last_return_at')
      .sort({ created_at: -1 })
      .limit(10);

    const recentTransactions = await Transaction.find({ user_id: userId }).sort({ created_at: -1 }).limit(20);
    const recentTrades = await Trade.find({ user_id: userId }).sort({ created_at: -1 }).limit(10);
    const referredCount = await User.countDocuments({ referred_by: userId });

    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          user_id: userObjId,
          created_at: { $gt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: { year: { $year: '$created_at' }, month: { $month: '$created_at' } },
          earnings: {
            $sum: {
              $cond: [{ $in: ['$type', ['daily_return', 'trade_gain', 'referral_bonus', 'referral_commission']] }, '$amount', 0],
            },
          },
          invested: { $sum: { $cond: [{ $eq: ['$type', 'investment'] }, '$amount', 0] } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = monthlyData.map((d: any) => ({
      month: monthNames[d._id.month - 1],
      earnings: d.earnings,
      invested: d.invested,
    }));

    const dailyReturnHistory = await Transaction.aggregate([
      {
        $match: {
          user_id: userObjId,
          type: 'daily_return',
          status: 'completed',
          created_at: { $gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$created_at' },
            month: { $month: '$created_at' },
            day: { $dayOfMonth: '$created_at' },
          },
          total: { $sum: '$amount' },
          date: { $first: '$created_at' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    const allocation = activeInvestments.map((inv: any) => ({
      name: inv.package_name,
      value: inv.amount,
    }));

    const availableBalance = parseFloat(user.balance);
    const capitalBalance = parseFloat(String(summary.total_invested));
    const roiBalance = parseFloat(String(summary.total_earned));
    const totalBalance = availableBalance + capitalBalance;

    return NextResponse.json({
      user,
      balance: availableBalance,
      capital_balance: capitalBalance,
      roi_balance: roiBalance,
      total_balance: totalBalance,
      investments: summary,
      activeInvestments,
      recentTransactions,
      recentTrades,
      dailyReturnHistory,
      referrals: { referred_users: referredCount, earnings: user.referral_earnings },
      chartData,
      allocation,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch dashboard data' }, { status: err.status || 500 });
  }
}
