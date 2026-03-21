import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAdmin } from '@/lib/admin-auth';
import { User } from '@/lib/models/User';
import { Transaction } from '@/lib/models/Transaction';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await verifyAdmin(req);
    await connectDB();

    const user = await User.findById(params.id).select('-password_hash');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const transactions = await Transaction.find({ user_id: params.id })
      .sort({ created_at: -1 })
      .limit(20);

    return NextResponse.json({ user, transactions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.status || 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await verifyAdmin(req);
    await connectDB();

    const body = await req.json();
    const allowed = ['is_active', 'is_admin', 'balance', 'profile_completed'];
    const update: any = {};
    for (const key of allowed) {
      if (key in body) update[key] = body[key];
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    update.updated_at = new Date();
    const user = await User.findByIdAndUpdate(params.id, { $set: update }, { new: true }).select('-password_hash');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.status || 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminId = await verifyAdmin(req);
    if (adminId === params.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }
    await connectDB();
    await User.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.status || 500 });
  }
}
