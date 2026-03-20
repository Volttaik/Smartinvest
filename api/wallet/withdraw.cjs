const axios = require('axios');
const { User, Transaction } = require('../../models/index.cjs');
const connectDB = require('../../lib/db.cjs');
const { verifyToken, send } = require('../../lib/auth-utils.cjs');

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || '';
const BASE = 'https://api.paystack.co';
const headers = () => ({ Authorization: `Bearer ${PAYSTACK_SECRET}`, 'Content-Type': 'application/json' });
const MIN_WITHDRAWAL = 10000;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  try {
    const userId = await verifyToken(req);
    await connectDB();

    const { amount, accountName, accountNumber, bankCode, bankName } = req.body || {};
    if (!amount || !accountName || !accountNumber || !bankCode) {
      return send(res, 400, { error: 'Amount, account name, number, and bank code are required' });
    }
    if (amount < MIN_WITHDRAWAL) {
      return send(res, 400, { error: `Minimum withdrawal is ₦${MIN_WITHDRAWAL.toLocaleString()}` });
    }

    const user = await User.findById(userId);
    if (!user) return send(res, 404, { error: 'User not found' });
    if (parseFloat(user.balance) < amount) return send(res, 400, { error: 'Insufficient balance' });

    const reference = `wdw_${userId}_${Date.now()}`;

    const recipientResp = await axios.post(`${BASE}/transferrecipient`, {
      type: 'nuban', name: accountName, account_number: accountNumber, bank_code: bankCode, currency: 'NGN'
    }, { headers: headers() });

    if (!recipientResp.data.status) return send(res, 400, { error: 'Invalid bank details' });

    const recipientCode = recipientResp.data.data.recipient_code;
    const transferResp = await axios.post(`${BASE}/transfer`, {
      source: 'balance', amount: Math.round(parseFloat(amount) * 100),
      recipient: recipientCode, reason: 'SmartInvest Withdrawal', reference
    }, { headers: headers() });

    const status = transferResp.data.status ? 'completed' : 'failed';
    if (transferResp.data.status) {
      user.balance = parseFloat(user.balance) - parseFloat(amount);
      await user.save();
    }

    await Transaction.create({
      user_id: userId, type: 'withdrawal', amount,
      description: `Withdrawal to ${bankName} - ${accountNumber}`,
      status, reference, metadata: { accountName, accountNumber, bankName, bankCode }
    });

    if (status === 'completed') {
      send(res, 200, { message: 'Withdrawal initiated successfully', reference });
    } else {
      send(res, 400, { error: 'Transfer failed. Please try again or contact support.' });
    }
  } catch (err) {
    console.error('Withdraw error:', err.message);
    send(res, err.status || 500, { error: err.message || 'Withdrawal failed. Please try again.' });
  }
};
