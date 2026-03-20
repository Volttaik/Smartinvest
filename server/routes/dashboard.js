const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { rows: [user] } = await pool.query(
      `SELECT id, username, email, profile_picture, balance, referral_code, referral_earnings, total_earnings, created_at
       FROM users WHERE id = $1`,
      [req.userId]
    );
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { rows: [invSummary] } = await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'active') as active_count,
         COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
         COALESCE(SUM(total_earned), 0) as total_earned,
         COALESCE(SUM(amount) FILTER (WHERE status = 'active'), 0) as total_invested
       FROM investments WHERE user_id = $1`,
      [req.userId]
    );

    const { rows: activeInvestments } = await pool.query(
      `SELECT i.id, i.package_name, i.amount, i.daily_return_pct, i.duration_days,
              i.days_completed, i.total_earned, i.status, i.start_date, p.tier
       FROM investments i JOIN packages p ON p.id = i.package_id
       WHERE i.user_id = $1 AND i.status = 'active'
       ORDER BY i.created_at DESC LIMIT 5`,
      [req.userId]
    );

    const { rows: recentTransactions } = await pool.query(
      `SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10`,
      [req.userId]
    );

    const { rows: recentTrades } = await pool.query(
      `SELECT * FROM trades WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10`,
      [req.userId]
    );

    const { rows: [refStats] } = await pool.query(
      `SELECT COUNT(*) as referred_users FROM users WHERE referred_by = $1`,
      [req.userId]
    );

    const { rows: monthlyData } = await pool.query(
      `SELECT
         TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') as month,
         SUM(amount) FILTER (WHERE type IN ('daily_return', 'trade_gain', 'referral_bonus')) as earnings,
         SUM(amount) FILTER (WHERE type = 'investment') as invested
       FROM transactions
       WHERE user_id = $1 AND created_at > NOW() - INTERVAL '12 months'
       GROUP BY DATE_TRUNC('month', created_at)
       ORDER BY DATE_TRUNC('month', created_at)`,
      [req.userId]
    );

    res.json({
      user,
      balance: parseFloat(user.balance),
      investments: invSummary,
      activeInvestments,
      recentTransactions,
      recentTrades,
      referrals: { ...refStats, earnings: user.referral_earnings },
      chartData: monthlyData,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

router.get('/portfolio', auth, async (req, res) => {
  try {
    const { rows: allInvestments } = await pool.query(
      `SELECT i.*, p.tier, p.name as pkg_name
       FROM investments i JOIN packages p ON p.id = i.package_id
       WHERE i.user_id = $1 ORDER BY i.created_at DESC`,
      [req.userId]
    );

    const { rows: allTrades } = await pool.query(
      `SELECT * FROM trades WHERE user_id = $1 ORDER BY created_at DESC LIMIT 30`,
      [req.userId]
    );

    const { rows: [user] } = await pool.query(
      `SELECT balance, total_earnings, referral_earnings FROM users WHERE id = $1`,
      [req.userId]
    );

    const allocationData = {};
    allInvestments.filter(i => i.status === 'active').forEach(i => {
      const tier = i.tier || 'Other';
      allocationData[tier] = (allocationData[tier] || 0) + parseFloat(i.amount);
    });

    res.json({
      investments: allInvestments,
      trades: allTrades,
      balance: user.balance,
      totalEarnings: user.total_earnings,
      referralEarnings: user.referral_earnings,
      allocation: Object.entries(allocationData).map(([name, value]) => ({ name, value })),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch portfolio data' });
  }
});

module.exports = router;
