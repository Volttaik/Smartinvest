const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../../models');
const connectDB = require('../../lib/db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'smartinvest_secret_key';

// Generate referral code from username (local, no external server)
function generateReferralCode(username) {
  return username.toUpperCase().slice(0, 4) + Math.random().toString(36).substring(2, 7).toUpperCase();
}

router.post('/register', async (req, res) => {
  try {
    await connectDB();

    const { username, email, password, profilePicture, referralCode } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    const existing = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() }
      ]
    });

    if (existing) {
      return res.status(400).json({ error: 'Email or username already taken' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const myReferralCode = generateReferralCode(username);
    let referredById = null;

    if (referralCode) {
      const referrer = await User.findOne({ referral_code: referralCode.toUpperCase() });
      if (referrer) {
        referredById = referrer._id;
      }
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

    res.status(201).json({
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
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    await connectDB();

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account suspended. Contact support.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
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
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Auth middleware
const authMiddleware = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smartinvest_secret_key');
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

router.get('/me', authMiddleware, async (req, res) => {
  try {
    await connectDB();

    const user = await User.findById(req.userId).select(
      'id username email profile_picture balance referral_code referral_earnings total_earnings created_at'
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router;