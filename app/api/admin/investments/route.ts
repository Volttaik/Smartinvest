import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAdmin } from '@/lib/admin-auth';
import { Investment } from '@/lib/models/Investment';

export async function GET(req: NextRequest) {
  try {
    await verifyAdmin(req);
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const query: any = {};
    if (status) query.status = status;

    const [investments, total] = await Promise.all([
      Investment.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user_id', 'username email'),
      Investment.countDocuments(query),
    ]);

    return NextResponse.json({ investments, total, page, limit });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.status || 500 });
  }
}
