const { Package, Investment, Transaction, User } = require('../../models/index.cjs');
const connectDB = require('../../lib/db.cjs');
const { verifyToken, send } = require('../../lib/auth-utils.cjs');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  try {
    const userId = await verifyToken(req);
    await connectDB();

    const { packageId } = req.body || {};
    if (!packageId) return send(res, 400, { error: 'Package ID required' });

    const pkg = await Package.findOne({ _id: packageId, is_active: true });
    if (!pkg) return send(res, 404, { error: 'Package not found' });

    const user = await User.findById(userId);
    if (!user) return send(res, 404, { error: 'User not found' });

    if (parseFloat(user.balance) < parseFloat(pkg.price)) {
      return send(res, 400, {
        error: `Insufficient balance. You need ₦${pkg.price.toLocaleString()} but have ₦${parseFloat(user.balance).toLocaleString()}`
      });
    }

    const newBalance = parseFloat(user.balance) - parseFloat(pkg.price);
    user.balance = newBalance;
    await user.save();

    const investment = await Investment.create({
      user_id: userId,
      package_id: pkg._id,
      package_name: pkg.name,
      amount: pkg.price,
      daily_return_pct: pkg.daily_return_pct,
      duration_days: pkg.duration_days
    });

    await Transaction.create({
      user_id: userId,
      type: 'investment',
      amount: pkg.price,
      description: `Purchased ${pkg.name} package`,
      status: 'completed',
      reference: `inv_${investment._id}`
    });

    if (user.referred_by) {
      const commission = parseFloat(pkg.price) * 0.05;
      await User.findByIdAndUpdate(user.referred_by, {
        $inc: { balance: commission, referral_earnings: commission }
      });
      await Transaction.create({
        user_id: user.referred_by,
        type: 'referral_bonus',
        amount: commission,
        description: `5% referral commission from ${user.username}'s investment`,
        status: 'completed'
      });
    }

    send(res, 200, { message: 'Investment activated!', investment, newBalance });
  } catch (err) {
    send(res, err.status || 500, { error: err.message || 'Investment failed. Please try again.' });
  }
};
