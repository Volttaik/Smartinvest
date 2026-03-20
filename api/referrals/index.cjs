const { User, Transaction } = require('../../models/index.cjs');
const connectDB = require('../../lib/db.cjs');
const { verifyToken, send } = require('../../lib/auth-utils.cjs');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });
  try {
    const userId = await verifyToken(req);
    await connectDB();

    const user = await User.findById(userId).select('referral_code referral_earnings');
    if (!user) return send(res, 404, { error: 'User not found' });

    const referred = await User.find({ referred_by: userId })
      .select('username created_at')
      .sort({ created_at: -1 })
      .lean();

    for (const refUser of referred) {
      const investmentTotal = await Transaction.aggregate([
        { $match: { user_id: refUser._id, type: 'investment', status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      refUser.total_invested = investmentTotal[0]?.total || 0;
    }

    const commissions = await Transaction.find({ user_id: userId, type: 'referral_bonus' })
      .select('amount description created_at')
      .sort({ created_at: -1 })
      .limit(20);

    send(res, 200, {
      referralCode: user.referral_code,
      totalEarnings: user.referral_earnings,
      referredUsers: referred,
      commissions,
      commissionRate: 5
    });
  } catch (err) {
    send(res, err.status || 500, { error: err.message || 'Failed to fetch referral data' });
  }
};
