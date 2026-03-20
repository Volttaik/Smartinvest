import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { Transaction } from '@/lib/models/Transaction';
import { verifyToken } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
  try {
    const userId = verifyToken(req);
    await connectDB();

    const user = await User.findById(userId).select('referral_code referral_earnings');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const referred = await User.find({ referred_by: userId })
      .select('username created_at')
      .sort({ created_at: -1 })
      .lean() as any[];

    for (const refUser of referred) {
      const investmentTotal = await Transaction.aggregate([
        { $match: { user_id: new mongoose.Types.ObjectId(refUser._id), type: 'investment', status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      refUser.total_invested = investmentTotal[0]?.total || 0;
    }

    const commissions = await Transaction.find({ user_id: userId, type: 'referral_bonus' })
      .select('amount description created_at')
      .sort({ created_at: -1 })
      .limit(20);

    return NextResponse.json({
      referralCode: user.referral_code,
      totalEarnings: user.referral_earnings,
      referredUsers: referred,
      commissions,
      commissionRate: 5,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed' }, { status: err.status || 500 });
  }
}
