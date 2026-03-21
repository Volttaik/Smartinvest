import { NextRequest, NextResponse } from 'next/server';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || '';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const account_number = searchParams.get('account_number');
    const bank_code = searchParams.get('bank_code');
    if (!account_number || !bank_code) {
      return NextResponse.json({ error: 'account_number and bank_code required' }, { status: 400 });
    }
    const res = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );
    const data = await res.json();
    if (!data.status) return NextResponse.json({ error: data.message || 'Could not resolve account' }, { status: 400 });
    return NextResponse.json({ account_name: data.data.account_name });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
