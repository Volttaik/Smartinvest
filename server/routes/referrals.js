const express = require('express');
const { User, Transaction } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      'referral_code referral_earnings'
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const referred = await User.find({ referred_by: req.userId })
      .select('username created_at')
      .sort({ created_at: -1 })
      .lean();

    // Get total invested amount for each referred user
    for (const refUser of referred) {
      const investmentTotal = await Transaction.aggregate([
        {
          $match: {
            user_id: refUser._id,
            type: 'investment',
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);
      refUser.total_invested = investmentTotal[0]?.total || 0;
    }

    const commissions = await Transaction.find({
      user_id: req.userId,
      type: 'referral_bonus'
    })
      .select('amount description created_at')
      .sort({ created_at: -1 })
      .limit(20);

    res.json({
      referralCode: user.referral_code,
      totalEarnings: user.referral_earnings,
      referredUsers: referred,
      commissions,
      commissionRate: 5
    });
  } catch (err) {
    console.error('Referrals error:', err);
    res.status(500).json({ error: 'Failed to fetch referral data' });
  }
});

module.exports = router;