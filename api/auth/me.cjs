const { User } = require('../../models/index.cjs');
const connectDB = require('../../lib/db.cjs');
const { verifyToken, send } = require('../../lib/auth-utils.cjs');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });
  try {
    const userId = await verifyToken(req);
    await connectDB();

    const user = await User.findById(userId).select(
      'id username email profile_picture balance referral_code referral_earnings total_earnings created_at'
    );
    if (!user) return send(res, 404, { error: 'User not found' });

    send(res, 200, user);
  } catch (err) {
    send(res, err.status || 500, { error: err.message || 'Failed to fetch profile' });
  }
};
