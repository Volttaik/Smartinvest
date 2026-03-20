const axios = require('axios');
const { User, Transaction } = require('../../models/index.cjs');
const connectDB = require('../../lib/db.cjs');
const { verifyToken, send } = require('../../lib/auth-utils.cjs');

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || '';
const BASE = 'https://api.paystack.co';
const headers = () => ({ Authorization: `Bearer ${PAYSTACK_SECRET}`, 'Content-Type': 'application/json' });

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  try {
    const userId = await verifyToken(req);
    await connectDB();

    const { amount } = req.body || {};
    if (!amount || amount < 100) return send(res, 400, { error: 'Minimum deposit is ₦100' });

    const user = await User.findById(userId).select('email');
    if (!user) return send(res, 404, { error: 'User not found' });

    const FRONTEND_URL = process.env.FRONTEND_URL || `https://${process.env.VERCEL_URL || 'localhost:5000'}`;
    const reference = `dep_${userId}_${Date.now()}`;

    const resp = await axios.post(`${BASE}/transaction/initialize`, {
      email: user.email,
      amount: Math.round(parseFloat(amount) * 100),
      reference,
      callback_url: `${FRONTEND_URL}/dashboard?funded=true&ref=${reference}`,
      metadata: { userId, type: 'deposit' }
    }, { headers: headers() });

    const result = resp.data;
    if (!result.status) return send(res, 400, { error: result.message || 'Failed to initialize payment' });

    await Transaction.create({
      user_id: userId,
      type: 'deposit',
      amount,
      description: 'Wallet funding via Paystack',
      status: 'pending',
      paystack_ref: reference,
      reference
    });

    send(res, 200, { authorizationUrl: result.data.authorization_url, reference });
  } catch (err) {
    console.error('Fund error:', err.message);
    send(res, err.status || 500, { error: err.message || 'Payment initialization failed.' });
  }
};
