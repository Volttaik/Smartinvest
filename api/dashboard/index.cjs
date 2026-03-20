const mongoose = require('mongoose');
const { User, Investment, Transaction, Trade } = require('../../models/index.cjs');
const connectDB = require('../../lib/db.cjs');
const { verifyToken, send } = require('../../lib/auth-utils.cjs');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });
  try {
    const userId = await verifyToken(req);
    await connectDB();

    const userObjId = new mongoose.Types.ObjectId(userId);

    const user = await User.findById(userId).select(
      'id username email profile_picture balance referral_code referral_earnings total_earnings created_at'
    );
    if (!user) return send(res, 404, { error: 'User not found' });

    const invSummary = await Investment.aggregate([
      { $match: { user_id: userObjId } },
      {
        $group: {
          _id: null,
          active_count: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          completed_count: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          total_earned: { $sum: '$total_earned' },
          total_invested: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, '$amount', 0] } }
        }
      }
    ]);

    const summary = invSummary[0] || { active_count: 0, completed_count: 0, total_earned: 0, total_invested: 0 };

    const activeInvestments = await Investment.find({ user_id: userId, status: 'active' })
      .populate('package_id', 'tier name')
      .select('id package_name amount daily_return_pct duration_days days_completed total_earned status start_date')
      .sort({ created_at: -1 })
      .limit(5);

    const recentTransactions = await Transaction.find({ user_id: userId }).sort({ created_at: -1 }).limit(10);
    const recentTrades = await Trade.find({ user_id: userId }).sort({ created_at: -1 }).limit(10);
    const referredCount = await User.countDocuments({ referred_by: userId });

    const monthlyData = await Transaction.aggregate([
      { $match: { user_id: userObjId, created_at: { $gt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } } },
      {
        $group: {
          _id: { year: { $year: '$created_at' }, month: { $month: '$created_at' } },
          earnings: { $sum: { $cond: [{ $in: ['$type', ['daily_return', 'trade_gain', 'referral_bonus']] }, '$amount', 0] } },
          invested: { $sum: { $cond: [{ $eq: ['$type', 'investment'] }, '$amount', 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = monthlyData.map(d => ({
      month: monthNames[d._id.month - 1],
      earnings: d.earnings,
      invested: d.invested
    }));

    send(res, 200, {
      user,
      balance: parseFloat(user.balance),
      investments: summary,
      activeInvestments,
      recentTransactions,
      recentTrades,
      referrals: { referred_users: referredCount, earnings: user.referral_earnings },
      chartData
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    send(res, err.status || 500, { error: err.message || 'Failed to fetch dashboard data' });
  }
};
