const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { User, Transaction } = require('../models');
const auth = require('../middleware/auth');
const paystack = require('../lib/paystack');

const router = express.Router();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5000';
const MIN_WITHDRAWAL = 10000;

router.post('/fund', auth, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ error: 'Minimum deposit is ₦100' });
    }

    const user = await User.findById(req.userId).select('email');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

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

router.get('/verify/:reference', auth, async (req, res) => {
  try {
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

router.post('/withdraw', auth, async (req, res) => {
  try {
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

router.get('/transactions', auth, async (req, res) => {
  try {
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