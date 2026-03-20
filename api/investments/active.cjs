const { Investment } = require('../../models/index.cjs');
const connectDB = require('../../lib/db.cjs');
const { verifyToken, send } = require('../../lib/auth-utils.cjs');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });
  try {
    const userId = await verifyToken(req);
    await connectDB();
    const investments = await Investment.find({ user_id: userId, status: 'active' })
      .populate('package_id', 'tier')
      .sort({ created_at: -1 });
    send(res, 200, investments);
  } catch (err) {
    send(res, err.status || 500, { error: err.message || 'Failed to fetch active investments' });
  }
};
