import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAdmin } from '@/lib/admin-auth';
import { Transaction } from '@/lib/models/Transaction';
import { User } from '@/lib/models/User';
import { Notification } from '@/lib/models/Notification';

export async function GET(req: NextRequest) {
  try {
    await verifyAdmin(req);
    await connectDB();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const query: any = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user_id', 'username email'),
      Transaction.countDocuments(query),
    ]);

    return NextResponse.json({ transactions, total, page, limit });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.status || 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await verifyAdmin(req);
    await connectDB();

    const { transactionId, status, action } = await req.json();
    if (!transactionId) return NextResponse.json({ error: 'transactionId required' }, { status: 400 });

    const tx = await Transaction.findById(transactionId);
    if (!tx) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });

    if (action === 'approve_withdrawal') {
      tx.status = 'completed';
      await tx.save();
      await Notification.create({
        user_id: tx.user_id,
        type: 'withdrawal',
        title: 'Withdrawal Approved',
        message: `Your withdrawal of ₦${parseFloat(tx.amount).toLocaleString()} has been approved and processed. The funds should arrive in your account shortly.`,
      });
      return NextResponse.json({ transaction: tx });
    }

    if (action === 'reject_withdrawal') {
      tx.status = 'failed';
      tx.failure_reason = 'Rejected by administrator';
      await tx.save();
      await User.findByIdAndUpdate(tx.user_id, { $inc: { balance: tx.amount } });
      await Notification.create({
        user_id: tx.user_id,
        type: 'withdrawal',
        title: 'Withdrawal Rejected',
        message: `Your withdrawal request of ₦${parseFloat(tx.amount).toLocaleString()} was rejected. The amount has been refunded to your wallet balance.`,
      });
      return NextResponse.json({ transaction: tx });
    }

    if (status) {
      tx.status = status;
      await tx.save();
    }

    return NextResponse.json({ transaction: tx });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.status || 500 });
  }
}
