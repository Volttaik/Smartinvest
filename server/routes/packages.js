const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM packages WHERE is_active = true ORDER BY price ASC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

router.post('/invest', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    const { packageId } = req.body;
    if (!packageId) return res.status(400).json({ error: 'Package ID required' });

    const { rows: pkgs } = await client.query(
      'SELECT * FROM packages WHERE id = $1 AND is_active = true', [packageId]
    );
    if (pkgs.length === 0) return res.status(404).json({ error: 'Package not found' });
    const pkg = pkgs[0];

    const { rows: users } = await client.query('SELECT * FROM users WHERE id = $1', [req.userId]);
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = users[0];

    if (parseFloat(user.balance) < parseFloat(pkg.price)) {
      return res.status(400).json({ error: `Insufficient balance. You need ₦${pkg.price.toLocaleString()} but have ₦${parseFloat(user.balance).toLocaleString()}` });
    }

    await client.query('BEGIN');
    const newBalance = parseFloat(user.balance) - parseFloat(pkg.price);
    await client.query('UPDATE users SET balance = $1 WHERE id = $2', [newBalance, req.userId]);

    const { rows: [investment] } = await client.query(
      `INSERT INTO investments (user_id, package_id, package_name, amount, daily_return_pct, duration_days)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.userId, pkg.id, pkg.name, pkg.price, pkg.daily_return_pct, pkg.duration_days]
    );

    await client.query(
      `INSERT INTO transactions (user_id, type, amount, description, status, reference)
       VALUES ($1, 'investment', $2, $3, 'completed', $4)`,
      [req.userId, pkg.price, `Purchased ${pkg.name} package`, `inv_${investment.id}`]
    );

    const { rows: referralCheck } = await client.query(
      'SELECT referred_by FROM users WHERE id = $1', [req.userId]
    );
    if (referralCheck[0]?.referred_by) {
      const referrerId = referralCheck[0].referred_by;
      const commission = parseFloat(pkg.price) * 0.05;
      await client.query(
        `UPDATE users SET balance = balance + $1, referral_earnings = referral_earnings + $1 WHERE id = $2`,
        [commission, referrerId]
      );
      await client.query(
        `INSERT INTO transactions (user_id, type, amount, description, status)
         VALUES ($1, 'referral_bonus', $2, $3, 'completed')`,
        [referrerId, commission, `5% referral commission from ${user.username}'s investment`]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Investment activated!', investment, newBalance });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Invest error:', err);
    res.status(500).json({ error: 'Investment failed. Please try again.' });
  } finally {
    client.release();
  }
});

module.exports = router;
