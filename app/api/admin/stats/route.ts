import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAdmin } from '@/lib/admin-auth';
import { User } from '@/lib/models/User';
import { Investment } from '@/lib/models/Investment';
import { Transaction } from '@/lib/models/Transaction';

export async function GET(req: NextRequest) {
  try {
    await verifyAdmin(req);
    await connectDB();

    const [
      totalUsers,
      activeUsers,
      totalInvestments,
      activeInvestments,
      totalTransactions,
      pendingWithdrawals,
      users,
      investments,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ is_active: true }),
      Investment.countDocuments(),
      Investment.countDocuments({ status: 'active' }),
      Transaction.countDocuments(),
      Transaction.countDocuments({ type: 'withdrawal', status: 'pending' }),
      User.find().select('balance total_earnings referral_earnings created_at'),
      Investment.find().select('amount total_earned status'),
    ]);

    const totalBalance = users.reduce((s: number, u: any) => s + (u.balance || 0), 0);
    const totalEarnings = users.reduce((s: number, u: any) => s + (u.total_earnings || 0), 0);
    const totalInvested = investments.reduce((s: number, i: any) => s + (i.amount || 0), 0);
    const totalPaidOut = investments.reduce((s: number, i: any) => s + (i.total_earned || 0), 0);

    const recentTransactions = await Transaction.find()
      .sort({ created_at: -1 })
      .limit(10)
      .populate('user_id', 'username email');

    const recentUsers = await User.find()
      .sort({ created_at: -1 })
      .limit(5)
      .select('username email balance is_active created_at is_admin');

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalInvestments,
      activeInvestments,
      totalTransactions,
      pendingWithdrawals,
      totalBalance,
      totalEarnings,
      totalInvested,
      totalPaidOut,
      recentTransactions,
      recentUsers,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.status || 500 });
  }
}
