const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { User, Transaction } = require('../../models/index.cjs');
const connectDB = require('../../lib/db.cjs');

const axios = require('axios');

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || '';
const BASE = 'https://api.paystack.co';

const headers = () => ({
  Authorization: `Bearer ${PAYSTACK_SECRET}`,
  'Content-Type': 'application/json',
});

const paystack = {
  initializeTransaction: async ({ email, amount, reference, callbackUrl, metadata }) => {
    const resp = await axios.post(`${BASE}/transaction/initialize`, {
      email,
      amount: Math.round(amount * 100),
      reference,
      callback_url: callbackUrl,
      metadata,
    }, { headers: headers() });
    return resp.data;
  },
  verifyTransaction: async (reference) => {
    const resp = await axios.get(`${BASE}/transaction/verify/${reference}`, { headers: headers() });
    return resp.data;
  },
  createTransferRecipient: async ({ name, accountNumber, bankCode }) => {
    const resp = await axios.post(`${BASE}/transferrecipient`, {
      type: 'nuban',
      name,
      account_number: accountNumber,
      bank_code: bankCode,
      currency: 'NGN',
    }, { headers: headers() });
    return resp.data;
  },
  initiateTransfer: async ({ amount, recipient, reason, reference }) => {
    const resp = await axios.post(`${BASE}/transfer`, {
      source: 'balance',
      amount: Math.round(amount * 100),
      recipient,
      reason,
      reference,
    }, { headers: headers() });
    return resp.data;
  }
};

const router = express.Router();
const MIN_WITHDRAWAL = 10000;

const authMiddleware = async (req, res, next) => {
  const jwt = require('jsonwebtoken');
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

router.post('/fund', authMiddleware, async (req, res) => {
  try {
    await connectDB();

    const { amount } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ error: 'Minimum deposit is ₦100' });
    }

    const user = await User.findById(req.userId).select('email');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5000';
    const reference = `dep_${req.userId}_${Date.now()}`;

    const result = await paystack.initializeTransaction({
      email: user.email,
      amount: parseFloat(amount),
      reference,
      callbackUrl: `${FRONTEND_URL}/dashboard?funded=true&ref=${reference}`,
      metadata: { userId: req.userId, type: 'deposit' }
    });

    if (!result.status) {
      return res.status(400).json({ error: result.message || 'Failed to initialize payment' });
    }

    await Transaction.create({
      user_id: req.userId,
      type: 'deposit',
      amount: amount,
      description: 'Wallet funding via Paystack',
      status: 'pending',
      paystack_ref: reference,
      reference: reference
    });

    res.json({
      authorizationUrl: result.data.authorization_url,
      reference
    });
  } catch (err) {
    console.error('Fund error:', err.message);
    res.status(500).json({ error: 'Payment initialization failed. Check Paystack configuration.' });
  }
});

router.get('/verify/:reference', authMiddleware, async (req, res) => {
  try {
    await connectDB();

    const { reference } = req.params;

    const result = await paystack.verifyTransaction(reference);

    if (!result.status || result.data.status !== 'success') {
      await Transaction.updateOne(
        { paystack_ref: reference, user_id: req.userId },
        { status: 'failed' }
      );
      return res.status(400).json({ error: 'Payment not successful' });
    }

    const existing = await Transaction.findOne({
      paystack_ref: reference,
      status: 'completed'
    });

    if (existing) {
      return res.json({ message: 'Already credited', already: true });
    }

    const amount = result.data.amount / 100;

    await Transaction.updateOne(
      { paystack_ref: reference, user_id: req.userId },
      {
        status: 'completed',
        amount: amount
      }
    );

    await User.findByIdAndUpdate(req.userId, {
      $inc: { balance: amount }
    });

    res.json({
      message: 'Wallet funded successfully',
      amount
    });
  } catch (err) {
    console.error('Verify error:', err.message);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

router.post('/withdraw', authMiddleware, async (req, res) => {
  try {
    await connectDB();

    const { amount, accountName, accountNumber, bankCode, bankName } = req.body;

    if (!amount || !accountName || !accountNumber || !bankCode) {
      return res.status(400).json({ error: 'Amount, account name, number, and bank code are required' });
    }

    if (amount < MIN_WITHDRAWAL) {
      return res.status(400).json({ error: `Minimum withdrawal is ₦${MIN_WITHDRAWAL.toLocaleString()}` });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (parseFloat(user.balance) < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const reference = `wdw_${req.userId}_${Date.now()}`;

    const recipientResult = await paystack.createTransferRecipient({
      name: accountName,
      accountNumber,
      bankCode
    });

    if (!recipientResult.status) {
      return res.status(400).json({ error: 'Invalid bank details' });
    }

    const recipientCode = recipientResult.data.recipient_code;

    const transferResult = await paystack.initiateTransfer({
      amount: parseFloat(amount),
      recipient: recipientCode,
      reason: 'SmartInvest Withdrawal',
      reference
    });

    const status = transferResult.status ? 'completed' : 'failed';

    if (transferResult.status) {
      user.balance = parseFloat(user.balance) - parseFloat(amount);
      await user.save();
    }

    await Transaction.create({
      user_id: req.userId,
      type: 'withdrawal',
      amount: amount,
      description: `Withdrawal to ${bankName} - ${accountNumber}`,
      status: status,
      reference: reference,
      metadata: {
        accountName,
        accountNumber,
        bankName,
        bankCode
      }
    });

    if (status === 'completed') {
      res.json({ message: 'Withdrawal initiated successfully', reference });
    } else {
      res.status(400).json({ error: 'Transfer failed. Please try again or contact support.' });
    }
  } catch (err) {
    console.error('Withdraw error:', err.message);
    res.status(500).json({ error: 'Withdrawal failed. Please try again.' });
  }
});

router.get('/transactions', authMiddleware, async (req, res) => {
  try {
    await connectDB();

    const transactions = await Transaction.find({ user_id: req.userId })
      .sort({ created_at: -1 })
      .limit(50);

    res.json(transactions);
  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

module.exports = router;