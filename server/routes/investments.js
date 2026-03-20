const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT i.*, p.name as pkg_name, p.tier
       FROM investments i
       JOIN packages p ON p.id = i.package_id
       WHERE i.user_id = $1
       ORDER BY i.created_at DESC`,
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
});

router.get('/active', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT i.*, p.tier FROM investments i
       JOIN packages p ON p.id = i.package_id
       WHERE i.user_id = $1 AND i.status = 'active'
       ORDER BY i.created_at DESC`,
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch active investments' });
  }
});

router.get('/summary', auth, async (req, res) => {
  try {
    const { rows: [summary] } = await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'active') as active_count,
         COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
         COALESCE(SUM(total_earned), 0) as total_earned,
         COALESCE(SUM(amount) FILTER (WHERE status = 'active'), 0) as total_invested
       FROM investments WHERE user_id = $1`,
      [req.userId]
    );
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch investment summary' });
  }
});

module.exports = router;
