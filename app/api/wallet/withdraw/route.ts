import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { Transaction } from '@/lib/models/Transaction';
import { Notification } from '@/lib/models/Notification';
import { verifyToken } from '@/lib/server-auth';

const MIN_WITHDRAWAL = 5000;

export async function POST(req: NextRequest) {
  try {
    const userId = verifyToken(req);
    await connectDB();
    const { amount, accountName, accountNumber, bankCode, bankName } = await req.json();

    if (!amount || !accountName || !accountNumber || !bankCode) {
      return NextResponse.json({ error: 'Amount, account name, number, and bank are required' }, { status: 400 });
    }
    if (!bankName) {
      return NextResponse.json({ error: 'Bank name is required' }, { status: 400 });
    }
    if (amount < MIN_WITHDRAWAL) {
      return NextResponse.json({ error: `Minimum withdrawal is ₦${MIN_WITHDRAWAL.toLocaleString()}` }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const userBalance = parseFloat(user.balance);
    if (userBalance < amount) {
      return NextResponse.json({
        error: `Insufficient balance. Your available balance is ₦${userBalance.toLocaleString()}`
      }, { status: 400 });
    }

    const reference = `wdw_${userId}_${Date.now()}`;

    user.balance = userBalance - parseFloat(amount);
    await user.save();

    await Transaction.create({
      user_id: userId,
      type: 'withdrawal',
      amount,
      description: `Withdrawal to ${bankName} - ${accountNumber}`,
      status: 'pending',
      reference,
      metadata: { accountName, accountNumber, bankName, bankCode },
    });

    await Notification.create({
      user_id: userId,
      type: 'withdrawal',
      title: 'Withdrawal Request Submitted',
      message: `Your withdrawal request of ₦${parseFloat(amount).toLocaleString()} to ${bankName} (${accountNumber}) has been received and is being reviewed. You will be notified once it is processed (typically within 1–3 business days).`,
    });

    return NextResponse.json({
      message: 'Withdrawal request submitted successfully',
      reference,
      status: 'pending',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Withdrawal request failed.' }, { status: err.status || 500 });
  }
}
