const { User, Investment, Trade } = require('../../models/index.cjs');
const connectDB = require('../../lib/db.cjs');
const { verifyToken, send } = require('../../lib/auth-utils.cjs');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });
  try {
    const userId = await verifyToken(req);
    await connectDB();

    const allInvestments = await Investment.find({ user_id: userId })
      .populate('package_id', 'tier name')
      .sort({ created_at: -1 });

    const allTrades = await Trade.find({ user_id: userId }).sort({ created_at: -1 }).limit(30);

    const user = await User.findById(userId).select('balance total_earnings referral_earnings');

    const allocationData = {};
    allInvestments.filter(i => i.status === 'active').forEach(i => {
      const tier = i.package_id?.tier || 'Other';
      allocationData[tier] = (allocationData[tier] || 0) + parseFloat(i.amount);
    });

    const allocation = Object.entries(allocationData).map(([name, value]) => ({ name, value }));

    send(res, 200, {
      investments: allInvestments,
      trades: allTrades,
      balance: user.balance,
      totalEarnings: user.total_earnings,
      referralEarnings: user.referral_earnings,
      allocation
    });
  } catch (err) {
    send(res, err.status || 500, { error: err.message || 'Failed to fetch portfolio data' });
  }
};
