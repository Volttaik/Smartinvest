const axios = require('axios');
const { User, Transaction } = require('../../../models/index.cjs');
const connectDB = require('../../../lib/db.cjs');
const { verifyToken, send } = require('../../../lib/auth-utils.cjs');

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || '';
const BASE = 'https://api.paystack.co';
const headers = () => ({ Authorization: `Bearer ${PAYSTACK_SECRET}`, 'Content-Type': 'application/json' });

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });
  try {
    const userId = await verifyToken(req);
    await connectDB();

    const reference = req.query.reference;
    if (!reference) return send(res, 400, { error: 'Reference required' });

    const resp = await axios.get(`${BASE}/transaction/verify/${reference}`, { headers: headers() });
    const result = resp.data;

    if (!result.status || result.data.status !== 'success') {
      await Transaction.updateOne({ paystack_ref: reference, user_id: userId }, { status: 'failed' });
      return send(res, 400, { error: 'Payment not successful' });
    }

    const existing = await Transaction.findOne({ paystack_ref: reference, status: 'completed' });
    if (existing) return send(res, 200, { message: 'Already credited', already: true });

    const amount = result.data.amount / 100;
    await Transaction.updateOne({ paystack_ref: reference, user_id: userId }, { status: 'completed', amount });
    await User.findByIdAndUpdate(userId, { $inc: { balance: amount } });

    send(res, 200, { message: 'Wallet funded successfully', amount });
  } catch (err) {
    console.error('Verify error:', err.message);
    send(res, err.status || 500, { error: err.message || 'Payment verification failed' });
  }
};
