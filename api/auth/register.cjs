const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../../models/index.cjs');
const connectDB = require('../../lib/db.cjs');
const { send, JWT_SECRET } = require('../../lib/auth-utils.cjs');

function generateReferralCode(username) {
  return username.toUpperCase().slice(0, 4) + Math.random().toString(36).substring(2, 7).toUpperCase();
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  try {
    await connectDB();
    const { username, email, password, profilePicture, referralCode } = req.body || {};

    if (!username || !email || !password) {
      return send(res, 400, { error: 'Username, email, and password are required' });
    }

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }]
    });
    if (existing) return send(res, 400, { error: 'Email or username already taken' });

    const passwordHash = await bcrypt.hash(password, 12);
    const myReferralCode = generateReferralCode(username);
    let referredById = null;

    if (referralCode) {
      const referrer = await User.findOne({ referral_code: referralCode.toUpperCase() });
      if (referrer) referredById = referrer._id;
    }

    const newUser = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password_hash: passwordHash,
      profile_picture: profilePicture || 'avatar1',
      referral_code: myReferralCode,
      referred_by: referredById
    });

    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: '7d' });
    send(res, 201, {
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        profile_picture: newUser.profile_picture,
        balance: newUser.balance,
        referral_code: newUser.referral_code
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    send(res, 500, { error: 'Registration failed. Please try again.' });
  }
};
