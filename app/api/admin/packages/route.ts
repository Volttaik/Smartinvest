import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAdmin } from '@/lib/admin-auth';
import { Package } from '@/lib/models/Package';

export async function GET(req: NextRequest) {
  try {
    await verifyAdmin(req);
    await connectDB();
    const packages = await Package.find().sort({ price: 1 });
    return NextResponse.json({ packages });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.status || 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await verifyAdmin(req);
    await connectDB();

    const { packageId, is_active, name, price, daily_return_pct, duration_days, total_roi, tier } = await req.json();
    if (!packageId) return NextResponse.json({ error: 'packageId required' }, { status: 400 });

    const update: any = {};
    if (typeof is_active === 'boolean') update.is_active = is_active;
    if (name !== undefined) update.name = name;
    if (price !== undefined) update.price = price;
    if (daily_return_pct !== undefined) update.daily_return_pct = daily_return_pct;
    if (duration_days !== undefined) update.duration_days = duration_days;
    if (total_roi !== undefined) update.total_roi = total_roi;
    if (tier !== undefined) update.tier = tier;

    const pkg = await Package.findByIdAndUpdate(packageId, { $set: update }, { new: true });
    if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    return NextResponse.json({ package: pkg });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.status || 500 });
  }
}
