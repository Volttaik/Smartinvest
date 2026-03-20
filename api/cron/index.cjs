const { Investment, User, Transaction, Trade } = require('../../models/index.cjs');
const connectDB = require('../../lib/db.cjs');
const { send } = require('../../lib/auth-utils.cjs');

const ASSETS = ['Oil & Energy', 'Crypto', 'Gold', 'Equities', 'Forex', 'Real Estate'];

async function applyDailyReturns() {
  await connectDB();
  const now = new Date();
  const yesterday = new Date(now.getTime() - 23 * 60 * 60 * 1000);
  const activeInvestments = await Investment.find({
    status: 'active',
    $or: [{ last_return_at: { $lt: yesterday } }, { last_return_at: { $exists: false } }]
  }).populate('user_id', 'balance email');

  let processed = 0;
  for (const inv of activeInvestments) {
    try {
      const dailyReturn = (parseFloat(inv.amount) * parseFloat(inv.daily_return_pct)) / 100;
      const newDaysCompleted = parseInt(inv.days_completed) + 1;
      const newTotalEarned = parseFloat(inv.total_earned) + dailyReturn;

      inv.days_completed = newDaysCompleted;
      inv.total_earned = newTotalEarned;
      inv.last_return_at = now;
      if (newDaysCompleted >= inv.duration_days) { inv.status = 'completed'; inv.end_date = now; }
      await inv.save();

      const user = await User.findById(inv.user_id._id);
      if (user) {
        user.balance = parseFloat(user.balance) + dailyReturn;
        user.total_earnings = parseFloat(user.total_earnings) + dailyReturn;
        await user.save();
        await Transaction.create({
          user_id: inv.user_id._id, type: 'daily_return', amount: dailyReturn,
          description: `Daily return from ${inv.package_name}`, status: 'completed',
          reference: `ret_${inv._id}_${newDaysCompleted}`
        });
      }
      processed++;
    } catch (err) {
      console.error('[CRON] Error processing investment', inv._id, err.message);
    }
  }
  return { success: true, processed };
}

async function runInternalTrades() {
  await connectDB();
  const users = await User.find({ is_active: true, balance: { $gt: 0 } });

  let processed = 0;
  for (const user of users) {
    const activeInv = await Investment.findOne({ user_id: user._id, status: 'active' });
    if (!activeInv) continue;

    const rand = Math.random();
    const asset = ASSETS[Math.floor(Math.random() * ASSETS.length)];
    const tradeAmount = parseFloat(activeInv.amount) * (0.01 + Math.random() * 0.02);

    let tradeType, balanceChange;
    if (rand < 0.50) { tradeType = 'gain'; balanceChange = tradeAmount; }
    else if (rand < 0.90) { tradeType = 'loss'; balanceChange = -Math.min(tradeAmount * 0.5, parseFloat(user.balance) * 0.01); }
    else continue;

    user.balance = Math.max(0, parseFloat(user.balance) + balanceChange);
    await user.save();

    await Trade.create({
      user_id: user._id, asset, type: rand < 0.50 ? 'buy' : 'sell',
      amount: Math.abs(balanceChange), price: Math.random() * 1000,
      profit_loss: balanceChange, status: 'completed'
    });
    await Transaction.create({
      user_id: user._id, type: tradeType === 'gain' ? 'trade_gain' : 'trade_loss',
      amount: Math.abs(balanceChange), description: `Internal trade ${tradeType} on ${asset}`, status: 'completed'
    });
    processed++;
  }
  return { success: true, processed };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });

  const cronSecret = (req.query || {}).secret || req.headers['x-cron-secret'];
  if (cronSecret !== process.env.CRON_SECRET) return send(res, 401, { error: 'Unauthorized' });

  try {
    const jobType = (req.query || {}).job;
    let result;
    if (jobType === 'daily-returns') result = await applyDailyReturns();
    else if (jobType === 'internal-trades') result = await runInternalTrades();
    else {
      const r1 = await applyDailyReturns();
      const r2 = await runInternalTrades();
      result = { dailyReturns: r1, internalTrades: r2 };
    }
    send(res, 200, { success: true, timestamp: new Date().toISOString(), result });
  } catch (err) {
    console.error('[CRON] Error:', err);
    send(res, 500, { error: err.message });
  }
};
