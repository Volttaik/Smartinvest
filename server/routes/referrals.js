const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { rows: [user] } = await pool.query(
      `SELECT referral_code, referral_earnings FROM users WHERE id = $1`,
      [req.userId]
    );

    const { rows: referred } = await pool.query(
      `SELECT u.username, u.created_at,
              COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'investment'), 0) as total_invested
       FROM users u
       LEFT JOIN transactions t ON t.user_id = u.id
       WHERE u.referred_by = $1
       GROUP BY u.id, u.username, u.created_at
       ORDER BY u.created_at DESC`,
      [req.userId]
    );

    const { rows: commissions } = await pool.query(
      `SELECT amount, description, created_at FROM transactions
       WHERE user_id = $1 AND type = 'referral_bonus'
       ORDER BY created_at DESC LIMIT 20`,
      [req.userId]
    );

    res.json({
      referralCode: user.referral_code,
      totalEarnings: user.referral_earnings,
      referredUsers: referred,
      commissions,
      commissionRate: 5,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch referral data' });
  }
});

module.exports = router;
