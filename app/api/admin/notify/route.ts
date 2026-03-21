import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAdmin } from '@/lib/admin-auth';
import { Notification } from '@/lib/models/Notification';
import { User } from '@/lib/models/User';

export async function POST(req: NextRequest) {
  try {
    await verifyAdmin(req);
    await connectDB();

    const { title, message, type, userId } = await req.json();
    if (!title || !message) {
      return NextResponse.json({ error: 'title and message are required' }, { status: 400 });
    }

    if (userId) {
      await Notification.create({ user_id: userId, title, message, type: type || 'info' });
      return NextResponse.json({ success: true, sent: 1 });
    }

    const users = await User.find({ is_active: true }).select('_id');
    await Notification.insertMany(
      users.map((u: any) => ({ user_id: u._id, title, message, type: type || 'info' }))
    );
    return NextResponse.json({ success: true, sent: users.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.status || 500 });
  }
}
