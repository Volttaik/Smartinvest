import { NextResponse } from 'next/server';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || '';

export async function GET() {
  try {
    const res = await fetch('https://api.paystack.co/bank?currency=NGN&country=nigeria&perPage=100', {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    if (!data.status) return NextResponse.json({ banks: [] });
    return NextResponse.json({ banks: data.data });
  } catch {
    return NextResponse.json({ banks: [] });
  }
}
