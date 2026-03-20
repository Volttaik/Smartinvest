import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Package } from '@/lib/models/Package';

export async function GET() {
  try {
    await connectDB();
    const packages = await Package.find({ is_active: true }).sort({ price: 1 });
    return NextResponse.json(packages.map((p: any) => ({
      id: p._id,
      name: p.name,
      price: p.price,
      daily_return_pct: p.daily_return_pct,
      duration_days: p.duration_days,
      total_roi: p.total_roi,
      tier: p.tier,
    })));
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 });
  }
}
