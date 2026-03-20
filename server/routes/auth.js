const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { User, CaptchaCode } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'smartinvest_secret_key';

// Generate referral code from register code (not from external server)
function generateReferralCode(username) {
  return username.toUpperCase().slice(0, 4) + Math.random().toString(36).substring(2, 7).toUpperCase();
}

// Generate 4-digit CAPTCHA code locally (no external server needed)
router.get('/captcha', async (req, res) => {
  try {
    const code = String(Math.floor(1000 + Math.random() * 9000));
    const sessionKey = uuidv4();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await CaptchaCode.create({
      session_key: sessionKey,
      code: code,
      expires_at: expiresAt
    });

    res.json({ sessionKey, code });
  } catch (err) {
    console.error('Captcha error:', err);
    res.status(500).json({ error: 'Failed to generate captcha' });
  }
});

async function validateCaptcha(sessionKey, userCode) {
  const captcha = await CaptchaCode.findOne({
    session_key: sessionKey,
    expires_at: { $gt: new Date() }
  });

  if (!captcha) return false;

  const valid = captcha.code === String(userCode);
  if (valid) {
    await CaptchaCode.deleteOne({ session_key: sessionKey });
  }
  return valid;
}

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, profilePicture, referralCode, captchaKey, captchaCode } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }
    if (!captchaKey || !captchaCode) {
      return res.status(400).json({ error: 'CAPTCHA verification required' });
    }

    const captchaValid = await validateCaptcha(captchaKey, captchaCode);
    if (!captchaValid) {
      return res.status(400).json({ error: 'Invalid or expired CAPTCHA code' });
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
    const { email, password, captchaKey, captchaCode } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (!captchaKey || !captchaCode) {
      return res.status(400).json({ error: 'CAPTCHA verification required' });
    }

    const captchaValid = await validateCaptcha(captchaKey, captchaCode);
    if (!captchaValid) {
      return res.status(400).json({ error: 'Invalid or expired CAPTCHA code' });
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

router.get('/me', auth, async (req, res) => {
  try {
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