import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { Transaction } from '@/lib/models/Transaction';
import { Notification } from '@/lib/models/Notification';
import { verifyToken } from '@/lib/server-auth';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || '';
const BASE = 'https://api.paystack.co';
const MIN_WITHDRAWAL = 10000;

export async function POST(req: NextRequest) {
  try {
    const userId = verifyToken(req);
    await connectDB();
    const { amount, accountName, accountNumber, bankCode, bankName } = await req.json();

    if (!amount || !accountName || !accountNumber || !bankCode) {
      return NextResponse.json({ error: 'Amount, account name, number, and bank are required' }, { status: 400 });
    }
    if (amount < MIN_WITHDRAWAL) {
      return NextResponse.json({ error: `Minimum withdrawal is ₦${MIN_WITHDRAWAL.toLocaleString()}` }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (parseFloat(user.balance) < amount) return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });

    const reference = `wdw_${userId}_${Date.now()}`;
    const headers = { Authorization: `Bearer ${PAYSTACK_SECRET}`, 'Content-Type': 'application/json' };

    const recipientResp = await fetch(`${BASE}/transferrecipient`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ type: 'nuban', name: accountName, account_number: accountNumber, bank_code: bankCode, currency: 'NGN' }),
    });
    const recipientData = await recipientResp.json();
    if (!recipientData.status) return NextResponse.json({ error: 'Invalid bank details' }, { status: 400 });

    const recipientCode = recipientData.data.recipient_code;
    const transferResp = await fetch(`${BASE}/transfer`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        source: 'balance', amount: Math.round(parseFloat(amount) * 100),
        recipient: recipientCode, reason: 'SmartInvest Withdrawal', reference,
      }),
    });
    const transferData = await transferResp.json();
    const status = transferData.status ? 'completed' : 'failed';

    if (transferData.status) {
      user.balance = parseFloat(user.balance) - parseFloat(amount);
      await user.save();
    }

    await Transaction.create({
      user_id: userId, type: 'withdrawal', amount,
      description: `Withdrawal to ${bankName} - ${accountNumber}`,
      status, reference, metadata: { accountName, accountNumber, bankName, bankCode },
    });

    await Notification.create({
      user_id: userId,
      type: 'withdrawal',
      title: status === 'completed' ? 'Withdrawal Initiated' : 'Withdrawal Failed',
      message: status === 'completed'
        ? `Your withdrawal of ₦${parseFloat(amount).toLocaleString()} to ${bankName} (${accountNumber}) has been initiated and is being processed.`
        : `Your withdrawal request of ₦${parseFloat(amount).toLocaleString()} could not be processed. Please try again.`,
    });

    if (status === 'completed') {
      return NextResponse.json({ message: 'Withdrawal initiated successfully', reference });
    }
    return NextResponse.json({ error: 'Transfer failed. Please try again or contact support.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Withdrawal failed.' }, { status: err.status || 500 });
  }
}
