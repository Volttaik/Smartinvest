const express = require('express');
const { Investment, Package } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const investments = await Investment.find({ user_id: req.userId })
      .populate('package_id', 'name tier')
      .sort({ created_at: -1 });

    res.json(investments);
  } catch (err) {
    console.error('Get investments error:', err);
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
});

router.get('/active', auth, async (req, res) => {
  try {
    const investments = await Investment.find({
      user_id: req.userId,
      status: 'active'
    })
      .populate('package_id', 'tier')
      .sort({ created_at: -1 });

    res.json(investments);
  } catch (err) {
    console.error('Get active investments error:', err);
    res.status(500).json({ error: 'Failed to fetch active investments' });
  }
});

router.get('/summary', auth, async (req, res) => {
  try {
    const summary = await Investment.aggregate([
      { $match: { user_id: req.userId } },
      {
        $group: {
          _id: null,
          active_count: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          completed_count: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          total_earned: { $sum: '$total_earned' },
          total_invested: {
            $sum: {
              $cond: [{ $eq: ['$status', 'active'] }, '$amount', 0]
            }
          }
        }
      }
    ]);

    const result = summary[0] || {
      active_count: 0,
      completed_count: 0,
      total_earned: 0,
      total_invested: 0
    };

    res.json(result);
  } catch (err) {
    console.error('Get investment summary error:', err);
    res.status(500).json({ error: 'Failed to fetch investment summary' });
  }
});

module.exports = router;