const express = require('express');
const { User, Transaction } = require('../../models');
const connectDB = require('../../lib/db');

const router = express.Router();

const authMiddleware = async (req, res, next) => {
  const jwt = require('jsonwebtoken');
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smartinvest_secret_key');
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

router.get('/', authMiddleware, async (req, res) => {
  try {
    await connectDB();

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