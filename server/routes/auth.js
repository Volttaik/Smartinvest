const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'smartinvest_secret_key';

function generateReferralCode(username) {
  return username.toUpperCase().slice(0, 4) + Math.random().toString(36).substring(2, 7).toUpperCase();
}

router.get('/captcha', async (req, res) => {
  try {
    const code = String(Math.floor(1000 + Math.random() * 9000));
    const sessionKey = uuidv4();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await pool.query(
      `INSERT INTO captcha_codes (session_key, code, expires_at) VALUES ($1, $2, $3)
       ON CONFLICT (session_key) DO UPDATE SET code = $2, expires_at = $3`,
      [sessionKey, code, expiresAt]
    );
    res.json({ sessionKey, code });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate captcha' });
  }
});

async function validateCaptcha(sessionKey, userCode) {
  const { rows } = await pool.query(
    `SELECT * FROM captcha_codes WHERE session_key = $1 AND expires_at > NOW()`,
    [sessionKey]
  );
  if (rows.length === 0) return false;
  const valid = rows[0].code === String(userCode);
  if (valid) {
    await pool.query(`DELETE FROM captcha_codes WHERE session_key = $1`, [sessionKey]);
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

    const { rows: existing } = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email.toLowerCase(), username.toLowerCase()]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email or username already taken' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const myReferralCode = generateReferralCode(username);
    let referredById = null;

    if (referralCode) {
      const { rows: referrer } = await pool.query(
        'SELECT id FROM users WHERE referral_code = $1',
        [referralCode.toUpperCase()]
      );
      if (referrer.length > 0) referredById = referrer[0].id;
    }

    const { rows: [newUser] } = await pool.query(
      `INSERT INTO users (username, email, password_hash, profile_picture, referral_code, referred_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, email, profile_picture, balance, referral_code`,
      [username.toLowerCase(), email.toLowerCase(), passwordHash, profilePicture || 'avatar1', myReferralCode, referredById]
    );

    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: newUser });
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

    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const user = rows[0];
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account suspended. Contact support.' });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profile_picture: user.profile_picture,
        balance: user.balance,
        referral_code: user.referral_code,
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, username, email, profile_picture, balance, referral_code,
       referral_earnings, total_earnings, created_at FROM users WHERE id = $1`,
      [req.userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router;
