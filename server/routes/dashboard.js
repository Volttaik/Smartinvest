const express = require('express');
const { User, Investment, Transaction, Trade } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      'id username email profile_picture balance referral_code referral_earnings total_earnings created_at'
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const invSummary = await Investment.aggregate([
      { $match: { user_id: req.userId } },
      {
        $group: {
          _id: null,
          active_count: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          completed_count: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          total_earned: { $sum: '$total_earned' },
          total_invested: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, '$amount', 0] }
          }
        }
      }
    ]);

    const summary = invSummary[0] || {
      active_count: 0,
      completed_count: 0,
      total_earned: 0,
      total_invested: 0
    };

    const activeInvestments = await Investment.find({
      user_id: req.userId,
      status: 'active'
    })
      .populate('package_id', 'tier name')
      .select('id package_name amount daily_return_pct duration_days days_completed total_earned status start_date')
      .sort({ created_at: -1 })
      .limit(5);

    const recentTransactions = await Transaction.find({ user_id: req.userId })
      .sort({ created_at: -1 })
      .limit(10);

    const recentTrades = await Trade.find({ user_id: req.userId })
      .sort({ created_at: -1 })
      .limit(10);

    const referredCount = await User.countDocuments({ referred_by: req.userId });

    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          user_id: req.userId,
          created_at: { $gt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$created_at' },
            month: { $month: '$created_at' }
          },
          earnings: {
            $sum: {
              $cond: [
                {
                  $in: ['$type', ['daily_return', 'trade_gain', 'referral_bonus']]
                },
                '$amount',
                0
              ]
            }
          },
          invested: {
            $sum: {
              $cond: [{ $eq: ['$type', 'investment'] }, '$amount', 0]
            }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Format month names
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedData = monthlyData.map(d => ({
      month: monthNames[d._id.month - 1],
      earnings: d.earnings,
      invested: d.invested
    }));

    res.json({
      user,
      balance: parseFloat(user.balance),
      investments: summary,
      activeInvestments,
      recentTransactions,
      recentTrades,
      referrals: {
        referred_users: referredCount,
        earnings: user.referral_earnings
      },
      chartData: formattedData
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

router.get('/portfolio', auth, async (req, res) => {
  try {
    const allInvestments = await Investment.find({ user_id: req.userId })
      .populate('package_id', 'tier name')
      .sort({ created_at: -1 });

    const allTrades = await Trade.find({ user_id: req.userId })
      .sort({ created_at: -1 })
      .limit(30);

    const user = await User.findById(req.userId).select(
      'balance total_earnings referral_earnings'
    );

    const allocationData = {};
    allInvestments
      .filter(i => i.status === 'active')
      .forEach(i => {
        const tier = i.package_id?.tier || 'Other';
        allocationData[tier] = (allocationData[tier] || 0) + parseFloat(i.amount);
      });

    const allocation = Object.entries(allocationData).map(([name, value]) => ({
      name,
      value
    }));

    res.json({
      investments: allInvestments,
      trades: allTrades,
      balance: user.balance,
      totalEarnings: user.total_earnings,
      referralEarnings: user.referral_earnings,
      allocation
    });
  } catch (err) {
    console.error('Portfolio error:', err);
    res.status(500).json({ error: 'Failed to fetch portfolio data' });
  }
});

module.exports = router;