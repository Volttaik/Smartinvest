import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { Investment } from '@/lib/models/Investment';
import { Transaction } from '@/lib/models/Transaction';
import { Notification } from '@/lib/models/Notification';
import { verifyToken } from '@/lib/server-auth';

const MIN_WITHDRAWAL = 5000;

export async function POST(req: NextRequest) {
  try {
    const userId = verifyToken(req);
    await connectDB();
    const { amount, accountName, accountNumber, bankCode, bankName, include_capital } = await req.json();

    if (!amount || !accountName || !accountNumber || !bankCode) {
      return NextResponse.json({ error: 'Amount, account name, number, and bank are required' }, { status: 400 });
    }
    if (!bankName) {
      return NextResponse.json({ error: 'Bank name is required' }, { status: 400 });
    }
    if (amount < MIN_WITHDRAWAL) {
      return NextResponse.json({ error: `Minimum withdrawal is ₦${MIN_WITHDRAWAL.toLocaleString()}` }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const userBalance = parseFloat(user.balance);
    const requestedAmount = parseFloat(amount);

    if (!include_capital) {
      if (userBalance < requestedAmount) {
        return NextResponse.json({
          error: `Insufficient balance. Your available balance is ₦${userBalance.toLocaleString()}`,
        }, { status: 400 });
      }

      user.balance = userBalance - requestedAmount;
      await user.save();
    } else {
      const activeInvestments = await Investment.find({ user_id: userId, status: 'active' }).sort({ amount: -1 });
      const capitalBalance = activeInvestments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
      const totalAvailable = userBalance + capitalBalance;

      if (totalAvailable < requestedAmount) {
        return NextResponse.json({
          error: `Insufficient total balance. Available ₦${userBalance.toLocaleString()} + Capital ₦${capitalBalance.toLocaleString()} = ₦${totalAvailable.toLocaleString()}`,
        }, { status: 400 });
      }

      let remainingToDeduct = requestedAmount;

      if (userBalance >= remainingToDeduct) {
        user.balance = userBalance - remainingToDeduct;
        remainingToDeduct = 0;
      } else {
        remainingToDeduct -= userBalance;
        user.balance = 0;
      }

      if (remainingToDeduct > 0 && activeInvestments.length > 0) {
        for (const inv of activeInvestments) {
          if (remainingToDeduct <= 0) break;
          const invAmount = parseFloat(inv.amount);

          if (invAmount <= remainingToDeduct) {
            remainingToDeduct -= invAmount;
            await Investment.findByIdAndUpdate(inv._id, {
              amount: 0,
              status: 'completed',
              end_date: new Date(),
            });
            await Transaction.create({
              user_id: userId,
              type: 'withdrawal',
              amount: invAmount,
              description: `Capital withdrawn from ${inv.package_name}`,
              status: 'completed',
              reference: `cap_wdw_${inv._id}_${Date.now()}`,
              metadata: { investment_id: inv._id, type: 'capital_withdrawal' },
            });
          } else {
            const newAmount = invAmount - remainingToDeduct;
            remainingToDeduct = 0;
            await Investment.findByIdAndUpdate(inv._id, {
              amount: newAmount,
            });
            await Transaction.create({
              user_id: userId,
              type: 'withdrawal',
              amount: invAmount - newAmount,
              description: `Partial capital withdrawn from ${inv.package_name} — new capital ₦${newAmount.toLocaleString()}`,
              status: 'completed',
              reference: `cap_wdw_${inv._id}_${Date.now()}`,
              metadata: { investment_id: inv._id, type: 'capital_withdrawal', new_amount: newAmount },
            });
          }
        }
      }

      await user.save();
    }

    const reference = `wdw_${userId}_${Date.now()}`;

    await Transaction.create({
      user_id: userId,
      type: 'withdrawal',
      amount: requestedAmount,
      description: `Withdrawal to ${bankName} - ${accountNumber}${include_capital ? ' (includes capital)' : ''}`,
      status: 'pending',
      reference,
      metadata: { accountName, accountNumber, bankName, bankCode, include_capital: !!include_capital },
    });

    await Notification.create({
      user_id: userId,
      type: 'withdrawal',
      title: 'Withdrawal Request Submitted',
      message: `Your withdrawal request of ₦${requestedAmount.toLocaleString()} to ${bankName} (${accountNumber}) has been received and is being reviewed. You will be notified once it is processed (typically within 1–3 business days).`,
    });

    return NextResponse.json({
      message: 'Withdrawal request submitted successfully',
      reference,
      status: 'pending',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Withdrawal request failed.' }, { status: err.status || 500 });
  }
}
