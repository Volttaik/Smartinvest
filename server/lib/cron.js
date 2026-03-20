const cron = require('node-cron');
const pool = require('../db');

const ASSETS = ['Oil & Energy', 'Crypto', 'Gold', 'Equities', 'Forex', 'Real Estate'];

async function applyDailyReturns() {
  console.log('[CRON] Applying daily returns...');
  try {
    const { rows: activeInvestments } = await pool.query(
      `SELECT i.*, u.balance, u.email FROM investments i
       JOIN users u ON u.id = i.user_id
       WHERE i.status = 'active'
       AND (i.last_return_date IS NULL OR i.last_return_date < NOW() - INTERVAL '23 hours')`
    );

    for (const inv of activeInvestments) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const dailyReturn = (parseFloat(inv.amount) * parseFloat(inv.daily_return_pct)) / 100;
        const newDaysCompleted = parseInt(inv.days_completed) + 1;
        const newTotalEarned = parseFloat(inv.total_earned) + dailyReturn;
        const newBalance = parseFloat(inv.balance) + dailyReturn;

        await client.query(
          `UPDATE investments SET days_completed = $1, total_earned = $2, last_return_date = NOW(),
           status = CASE WHEN $1 >= duration_days THEN 'completed' ELSE 'active' END,
           end_date = CASE WHEN $1 >= duration_days THEN NOW() ELSE NULL END
           WHERE id = $3`,
          [newDaysCompleted, newTotalEarned, inv.id]
        );

        await client.query(
          `UPDATE users SET balance = $1, total_earnings = total_earnings + $2 WHERE id = $3`,
          [newBalance, dailyReturn, inv.user_id]
        );

        await client.query(
          `INSERT INTO transactions (user_id, type, amount, description, status, reference)
           VALUES ($1, 'daily_return', $2, $3, 'completed', $4)`,
          [inv.user_id, dailyReturn, `Daily return from ${inv.package_name}`, `ret_${inv.id}_${newDaysCompleted}`]
        );

        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        console.error('[CRON] Error processing investment', inv.id, err.message);
      } finally {
        client.release();
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
    const { rows: users } = await pool.query(
      `SELECT id, balance FROM users WHERE is_active = true AND balance > 0`
    );

    for (const user of users) {
      const { rows: activeInvs } = await pool.query(
        `SELECT * FROM investments WHERE user_id = $1 AND status = 'active' LIMIT 1`,
        [user.id]
      );
      if (activeInvs.length === 0) continue;

      const inv = activeInvs[0];
      const rand = Math.random();
      const asset = ASSETS[Math.floor(Math.random() * ASSETS.length)];
      const tradeAmount = parseFloat(inv.amount) * (0.01 + Math.random() * 0.02);

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
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(`UPDATE users SET balance = $1 WHERE id = $2`, [newBalance, user.id]);
        await client.query(
          `INSERT INTO trades (user_id, investment_id, asset, trade_type, amount, balance_before, balance_after)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [user.id, inv.id, asset, tradeType, Math.abs(balanceChange), user.balance, newBalance]
        );
        await client.query(
          `INSERT INTO transactions (user_id, type, amount, description, status)
           VALUES ($1, $2, $3, $4, 'completed')`,
          [user.id, tradeType === 'gain' ? 'trade_gain' : 'trade_loss',
           Math.abs(balanceChange),
           `Internal trade ${tradeType} on ${asset}`]
        );
        await client.query('COMMIT');
      } catch {
        await client.query('ROLLBACK');
      } finally {
        client.release();
      }
    }
  } catch (err) {
    console.error('[CRON] Internal trades error:', err.message);
  }
}

async function cleanExpiredCaptchas() {
  await pool.query(`DELETE FROM captcha_codes WHERE expires_at < NOW()`);
}

function startCronJobs() {
  cron.schedule('0 */6 * * *', applyDailyReturns);
  cron.schedule('0 */4 * * *', runInternalTrades);
  cron.schedule('*/30 * * * *', cleanExpiredCaptchas);
  console.log('[CRON] Jobs scheduled: daily returns (6h), trades (4h), captcha cleanup (30m)');
}

module.exports = { startCronJobs, applyDailyReturns, runInternalTrades };
