const { Package } = require('../../models/index.cjs');
const connectDB = require('../../lib/db.cjs');
const { send } = require('../../lib/auth-utils.cjs');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });
  try {
    await connectDB();
    const packages = await Package.find({ is_active: true }).sort({ price: 1 });
    send(res, 200, packages);
  } catch (err) {
    console.error('Get packages error:', err);
    send(res, 500, { error: 'Failed to fetch packages' });
  }
};
