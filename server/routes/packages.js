const express = require('express');
const { Package, Investment, Transaction, User } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const packages = await Package.find({ is_active: true }).sort({ price: 1 });
    res.json(packages);
  } catch (err) {
    console.error('Get packages error:', err);
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

router.post('/invest', auth, async (req, res) => {
  try {
    const { packageId } = req.body;

    if (!packageId) {
      return res.status(400).json({ error: 'Package ID required' });
    }

    const pkg = await Package.findOne({ _id: packageId, is_active: true });
    if (!pkg) {
      return res.status(404).json({ error: 'Package not found' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (parseFloat(user.balance) < parseFloat(pkg.price)) {
      return res.status(400).json({
        error: `Insufficient balance. You need ₦${pkg.price.toLocaleString()} but have ₦${parseFloat(user.balance).toLocaleString()}`
      });
    }

    const newBalance = parseFloat(user.balance) - parseFloat(pkg.price);
    user.balance = newBalance;
    await user.save();

    const investment = await Investment.create({
      user_id: req.userId,
      package_id: pkg._id,
      package_name: pkg.name,
      amount: pkg.price,
      daily_return_pct: pkg.daily_return_pct,
      duration_days: pkg.duration_days
    });

    await Transaction.create({
      user_id: req.userId,
      type: 'investment',
      amount: pkg.price,
      description: `Purchased ${pkg.name} package`,
      status: 'completed',
      reference: `inv_${investment._id}`
    });

    // Check for referral commission
    if (user.referred_by) {
      const commission = parseFloat(pkg.price) * 0.05;
      await User.findByIdAndUpdate(user.referred_by, {
        $inc: {
          balance: commission,
          referral_earnings: commission
        }
      });

      await Transaction.create({
        user_id: user.referred_by,
        type: 'referral_bonus',
        amount: commission,
        description: `5% referral commission from ${user.username}'s investment`,
        status: 'completed'
      });
    }

    res.json({
      message: 'Investment activated!',
      investment,
      newBalance
    });
  } catch (err) {
    console.error('Invest error:', err);
    res.status(500).json({ error: 'Investment failed. Please try again.' });
  }
});

module.exports = router;