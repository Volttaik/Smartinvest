const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../../models/index.cjs');
const connectDB = require('../../lib/db.cjs');
const { send, JWT_SECRET } = require('../../lib/auth-utils.cjs');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  try {
    await connectDB();
    const { email, password } = req.body || {};

    if (!email || !password) {
      return send(res, 400, { error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return send(res, 400, { error: 'No account found with that email address' });
    }
    if (!user.is_active) {
      return send(res, 403, { error: 'Account suspended. Contact support.' });
    }

    if (!user.password_hash) {
      return send(res, 400, { error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return send(res, 400, { error: 'Incorrect password. Please try again.' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    send(res, 200, {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile_picture: user.profile_picture,
        balance: user.balance,
        referral_code: user.referral_code
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    send(res, 500, { error: 'Login failed. Please try again.' });
  }
};
