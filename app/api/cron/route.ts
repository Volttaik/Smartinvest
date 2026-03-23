import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Investment } from '@/lib/models/Investment';
import { User } from '@/lib/models/User';
import { Transaction } from '@/lib/models/Transaction';
import { Notification } from '@/lib/models/Notification';

export async function GET(req: NextRequest) {
  try {
    const secret = req.nextUrl.searchParams.get('secret');
    const job = req.nextUrl.searchParams.get('job');
    const cronSecret = process.env.CRON_SECRET || '';

    if (secret !== cronSecret && secret !== 'CRON_SECRET_VALUE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    if (!job || job === 'all' || job === 'daily_returns') {
      await processDailyReturns();
    }

    return NextResponse.json({ success: true, processed: new Date().toISOString() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Cron failed' }, { status: 500 });
  }
}

async function processDailyReturns() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeInvestments = await Investment.find({
    status: 'active',
    $or: [
      { last_return_at: { $lt: today } },
      { last_return_at: { $exists: false } },
      { last_return_at: null },
    ],
  });

  for (const inv of activeInvestments) {
    try {
      const dailyReturn = parseFloat(inv.amount) * (parseFloat(inv.daily_return_pct) / 100);

      const newDaysCompleted = inv.days_completed + 1;
      const newTotalEarned = parseFloat(inv.total_earned) + dailyReturn;
      const isComplete = newDaysCompleted >= inv.duration_days;

      await Investment.findByIdAndUpdate(inv._id, {
        days_completed: newDaysCompleted,
        total_earned: newTotalEarned,
        status: isComplete ? 'completed' : 'active',
        last_return_at: new Date(),
        ...(isComplete && { end_date: new Date() }),
      });

      await User.findByIdAndUpdate(inv.user_id, {
        $inc: { balance: dailyReturn, total_earnings: dailyReturn },
      });

      await Transaction.create({
        user_id: inv.user_id,
        type: 'daily_return',
        amount: dailyReturn,
        description: `Day ${newDaysCompleted}/${inv.duration_days} return from ${inv.package_name}`,
        status: 'completed',
        reference: `dr_${inv._id}_${newDaysCompleted}`,
        metadata: { investment_id: inv._id, day: newDaysCompleted },
      });

      if (isComplete) {
        await Notification.create({
          user_id: inv.user_id,
          type: 'investment',
          title: 'Investment Completed!',
          message: `Your ${inv.package_name} investment has completed after ${inv.duration_days} days. Total earned: ₦${newTotalEarned.toLocaleString()}. Your capital has been returned to your balance.`,
        });

        await User.findByIdAndUpdate(inv.user_id, {
          $inc: { balance: parseFloat(inv.amount) },
        });

        await Transaction.create({
          user_id: inv.user_id,
          type: 'daily_return',
          amount: parseFloat(inv.amount),
          description: `Capital returned — ${inv.package_name} matured`,
          status: 'completed',
          reference: `cap_return_${inv._id}`,
          metadata: { investment_id: inv._id, type: 'capital_return' },
        });
      }
    } catch (err) {
      console.error(`Failed to process investment ${inv._id}:`, err);
    }
  }

  return activeInvestments.length;
}
