import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { Transaction } from '@/lib/models/Transaction';
import { Notification } from '@/lib/models/Notification';
import { verifyToken } from '@/lib/server-auth';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || '';
const BASE = 'https://api.paystack.co';

export async function GET(req: NextRequest, { params }: { params: { reference: string } }) {
  try {
    const userId = verifyToken(req);
    await connectDB();
    const { reference } = params;
    if (!reference) return NextResponse.json({ error: 'Reference required' }, { status: 400 });

    const resp = await fetch(`${BASE}/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    });
    const result = await resp.json();

    if (!result.status || result.data.status !== 'success') {
      const failReason = result.data?.gateway_response || result.message || 'Payment not successful';
      await Transaction.updateOne(
        { paystack_ref: reference, user_id: userId },
        { status: 'failed', failure_reason: failReason }
      );
      return NextResponse.json({ error: `Payment failed: ${failReason}` }, { status: 400 });
    }

    const existing = await Transaction.findOne({ paystack_ref: reference, status: 'completed' });
    if (existing) return NextResponse.json({ message: 'Already credited', already: true });

    const amount = result.data.amount / 100;
    await Transaction.updateOne({ paystack_ref: reference, user_id: userId }, { status: 'completed', amount });
    await User.findByIdAndUpdate(userId, { $inc: { balance: amount } });

    await Notification.create({
      user_id: userId,
      type: 'deposit',
      title: 'Wallet Funded',
      message: `Your wallet has been credited with ₦${amount.toLocaleString()}. Your balance is now updated.`,
    });

    return NextResponse.json({ message: 'Wallet funded successfully', amount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Payment verification failed' }, { status: err.status || 500 });
  }
}
