import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Package } from '@/lib/models/Package';
import { Investment } from '@/lib/models/Investment';
import { Transaction } from '@/lib/models/Transaction';
import { User } from '@/lib/models/User';
import { verifyToken } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
  try {
    const userId = verifyToken(req);
    await connectDB();
    const { packageId } = await req.json();
    if (!packageId) return NextResponse.json({ error: 'Package ID required' }, { status: 400 });

    const pkg = await Package.findOne({ _id: packageId, is_active: true });
    if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 });

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (parseFloat(user.balance) < parseFloat(pkg.price)) {
      return NextResponse.json({
        error: `Insufficient balance. You need ₦${pkg.price.toLocaleString()} but have ₦${parseFloat(user.balance).toLocaleString()}`,
      }, { status: 400 });
    }

    const newBalance = parseFloat(user.balance) - parseFloat(pkg.price);
    user.balance = newBalance;
    await user.save();

    const investment = await Investment.create({
      user_id: userId,
      package_id: pkg._id,
      package_name: pkg.name,
      amount: pkg.price,
      daily_return_pct: pkg.daily_return_pct,
      duration_days: pkg.duration_days,
    });

    await Transaction.create({
      user_id: userId,
      type: 'investment',
      amount: pkg.price,
      description: `Purchased ${pkg.name} package`,
      status: 'completed',
      reference: `inv_${investment._id}`,
    });

    if (user.referred_by) {
      const commission = parseFloat(pkg.price) * 0.05;
      await User.findByIdAndUpdate(user.referred_by, { $inc: { balance: commission, referral_earnings: commission } });
      await Transaction.create({
        user_id: user.referred_by,
        type: 'referral_bonus',
        amount: commission,
        description: `5% referral commission from ${user.username}'s investment`,
        status: 'completed',
      });
    }

    return NextResponse.json({ message: 'Investment activated!', investment, newBalance });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Investment failed.' }, { status: err.status || 500 });
  }
}
