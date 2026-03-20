import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Investment } from '@/lib/models/Investment';
import { verifyToken } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
  try {
    const userId = verifyToken(req);
    await connectDB();
    const investments = await Investment.find({ user_id: userId }).sort({ created_at: -1 });
    return NextResponse.json(investments);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed' }, { status: err.status || 500 });
  }
}
