import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Notification } from '@/lib/models/Notification';
import { verifyToken } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
  try {
    const userId = verifyToken(req);
    await connectDB();
    const notifications = await Notification.find({ user_id: userId })
      .sort({ created_at: -1 })
      .limit(50)
      .lean();
    return NextResponse.json(notifications);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.status || 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = verifyToken(req);
    await connectDB();
    await Notification.updateMany({ user_id: userId, read: false }, { read: true });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.status || 500 });
  }
}
