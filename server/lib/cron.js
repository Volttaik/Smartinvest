const cron = require('node-cron');
const { Investment, User, Transaction, Trade, CaptchaCode } = require('../models');

const ASSETS = ['Oil & Energy', 'Crypto', 'Gold', 'Equities', 'Forex', 'Real Estate'];

async function applyDailyReturns() {
  console.log('[CRON] Applying daily returns...');
  try {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 23 * 60 * 60 * 1000);

    const activeInvestments = await Investment.find({
      status: 'active',
      $or: [
        { last_return_at: { $lt: yesterday } },
        { last_return_at: { $exists: false } }
      ]
    })
      .populate('user_id', 'balance email');

    for (const inv of activeInvestments) {
      try {
        const dailyReturn = (parseFloat(inv.amount) * parseFloat(inv.daily_return_pct)) / 100;
        const newDaysCompleted = parseInt(inv.days_completed) + 1;
        const newTotalEarned = parseFloat(inv.total_earned) + dailyReturn;

        inv.days_completed = newDaysCompleted;
        inv.total_earned = newTotalEarned;
        inv.last_return_at = now;

        if (newDaysCompleted >= inv.duration_days) {
          inv.status = 'completed';
          inv.end_date = now;
        }

        await inv.save();

        const user = await User.findById(inv.user_id._id);
        if (user) {
          user.balance = parseFloat(user.balance) + dailyReturn;
          user.total_earnings = parseFloat(user.total_earnings) + dailyReturn;
          await user.save();

          await Transaction.create({
            user_id: inv.user_id._id,
            type: 'daily_return',
            amount: dailyReturn,
            description: `Daily return from ${inv.package_name}`,
            status: 'completed',
            reference: `ret_${inv._id}_${newDaysCompleted}`
          });
        }
      } catch (err) {
        console.error('[CRON] Error processing investment', inv._id, err.message);
      }
    }

    console.log(`[CRON] Processed ${activeInvestments.length} investments.`);
  } catch (err) {
    console.error('[CRON] Daily returns error:', err.message);
  }
}

async function runInternalTrades() {
  console.log('[CRON] Running internal trades...');
  try {
    const users = await User.find({
      is_active: true,
      balance: { $gt: 0 }
    });

    for (const user of users) {
      const activeInv = await Investment.findOne({
        user_id: user._id,
        status: 'active'
      });

      if (!activeInv) continue;

      const rand = Math.random();
      const asset = ASSETS[Math.floor(Math.random() * ASSETS.length)];
      const tradeAmount = parseFloat(activeInv.amount) * (0.01 + Math.random() * 0.02);

      let tradeType, balanceChange;
      if (rand < 0.50) {
        tradeType = 'gain';
        balanceChange = tradeAmount;
      } else if (rand < 0.90) {
        tradeType = 'loss';
        balanceChange = -Math.min(tradeAmount * 0.5, parseFloat(user.balance) * 0.01);
      } else {
        continue;
      }

      const newBalance = Math.max(0, parseFloat(user.balance) + balanceChange);

      user.balance = newBalance;
      await user.save();

      await Trade.create({
        user_id: user._id,
        asset: asset,
        type: rand < 0.50 ? 'buy' : 'sell',
        amount: Math.abs(balanceChange),
        price: Math.random() * 1000,
        profit_loss: balanceChange,
        status: 'completed'
      });

      await Transaction.create({
        user_id: user._id,
        type: tradeType === 'gain' ? 'trade_gain' : 'trade_loss',
        amount: Math.abs(balanceChange),
        description: `Internal trade ${tradeType} on ${asset}`,
        status: 'completed'
      });
    }

    console.log('[CRON] Internal trades completed.');
  } catch (err) {
    console.error('[CRON] Internal trades error:', err.message);
  }
}

async function cleanExpiredCaptchas() {
  try {
    await CaptchaCode.deleteMany({ expires_at: { $lt: new Date() } });
    console.log('[CRON] Cleaned expired captchas.');
  } catch (err) {
    console.error('[CRON] Captcha cleanup error:', err.message);
  }
}

function startCronJobs() {
  cron.schedule('0 */6 * * *', applyDailyReturns);
  cron.schedule('0 */4 * * *', runInternalTrades);
  cron.schedule('*/30 * * * *', cleanExpiredCaptchas);
  console.log('[CRON] Jobs scheduled: daily returns (6h), trades (4h), captcha cleanup (30m)');
}

module.exports = { startCronJobs, applyDailyReturns, runInternalTrades };