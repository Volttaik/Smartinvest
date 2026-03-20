const mongoose = require('mongoose');
const { Investment } = require('../../models/index.cjs');
const connectDB = require('../../lib/db.cjs');
const { verifyToken, send } = require('../../lib/auth-utils.cjs');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });
  try {
    const userId = await verifyToken(req);
    await connectDB();

    const userObjId = new mongoose.Types.ObjectId(userId);

    const result = await Investment.aggregate([
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
    send(res, 200, result[0] || { active_count: 0, completed_count: 0, total_earned: 0, total_invested: 0 });
  } catch (err) {
    send(res, err.status || 500, { error: err.message || 'Failed to fetch investment summary' });
  }
};
