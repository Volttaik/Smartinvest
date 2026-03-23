import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { Transaction } from '@/lib/models/Transaction';
import { verifyToken } from '@/lib/server-auth';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || '';
const BASE = 'https://api.paystack.co';
const PAYSTACK_FEE = 100;

export async function POST(req: NextRequest) {
  try {
    const userId = verifyToken(req);
    await connectDB();
    const { amount } = await req.json();
    if (!amount || amount < 100) return NextResponse.json({ error: 'Minimum deposit is ₦100' }, { status: 400 });

    const user = await User.findById(userId).select('email');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const host = req.headers.get('host') || 'localhost:3000';
    const proto = host.includes('localhost') ? 'http' : 'https';
    const FRONTEND_URL = process.env.FRONTEND_URL || `${proto}://${host}`;
    const reference = `dep_${userId}_${Date.now()}`;

    const amountToPay = Math.round(parseFloat(amount) * 100) + PAYSTACK_FEE * 100;

    const resp = await fetch(`${BASE}/transaction/initialize`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        amount: amountToPay,
        reference,
        callback_url: `${FRONTEND_URL}/dashboard?funded=true&ref=${reference}`,
        metadata: {
          userId,
          type: 'deposit',
          credit_amount: parseFloat(amount),
          fee: PAYSTACK_FEE,
        },
      }),
    });

    const result = await resp.json();
    if (!result.status) return NextResponse.json({ error: result.message || 'Failed to initialize payment' }, { status: 400 });

    await Transaction.create({
      user_id: userId,
      type: 'deposit',
      amount,
      description: `Wallet funding via Paystack (₦${PAYSTACK_FEE} processing fee applied)`,
      status: 'pending',
      paystack_ref: reference,
      reference,
      metadata: { fee: PAYSTACK_FEE, gross_amount: amount + PAYSTACK_FEE },
    });

    return NextResponse.json({
      authorizationUrl: result.data.authorization_url,
      reference,
      fee: PAYSTACK_FEE,
      total_charge: parseFloat(amount) + PAYSTACK_FEE,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Payment initialization failed.' }, { status: err.status || 500 });
  }
}
