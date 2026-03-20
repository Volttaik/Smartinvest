const express = require('express');
const { v4: uuidv4 } = require('uuid');
const pool = require('../db');
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
    const { rows: [user] } = await pool.query('SELECT email FROM users WHERE id = $1', [req.userId]);
    const reference = `dep_${req.userId}_${Date.now()}`;

    const result = await paystack.initializeTransaction({
      email: user.email,
      amount: parseFloat(amount),
      reference,
      callbackUrl: `${FRONTEND_URL}/dashboard?funded=true&ref=${reference}`,
      metadata: { userId: req.userId, type: 'deposit' },
    });

    if (!result.status) {
      return res.status(400).json({ error: result.message || 'Failed to initialize payment' });
    }

    await pool.query(
      `INSERT INTO transactions (user_id, type, amount, description, status, paystack_ref, reference)
       VALUES ($1, 'deposit', $2, 'Wallet funding via Paystack', 'pending', $3, $3)`,
      [req.userId, amount, reference]
    );

    res.json({ authorizationUrl: result.data.authorization_url, reference });
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
      await pool.query(
        `UPDATE transactions SET status = 'failed' WHERE paystack_ref = $1 AND user_id = $2`,
        [reference, req.userId]
      );
      return res.status(400).json({ error: 'Payment not successful' });
    }

    const { rows: existing } = await pool.query(
      `SELECT * FROM transactions WHERE paystack_ref = $1 AND status = 'completed'`,
      [reference]
    );
    if (existing.length > 0) {
      return res.json({ message: 'Already credited', already: true });
    }

    const amount = result.data.amount / 100;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `UPDATE transactions SET status = 'completed', amount = $1 WHERE paystack_ref = $2 AND user_id = $3`,
        [amount, reference, req.userId]
      );
      await client.query(
        `UPDATE users SET balance = balance + $1 WHERE id = $2`,
        [amount, req.userId]
      );
      await client.query('COMMIT');
      res.json({ message: 'Wallet funded successfully', amount });
    } catch {
      await client.query('ROLLBACK');
      res.status(500).json({ error: 'Failed to credit wallet' });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Verify error:', err.message);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

router.post('/withdraw', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    const { amount, accountName, accountNumber, bankCode, bankName } = req.body;
    if (!amount || !accountName || !accountNumber || !bankCode) {
      return res.status(400).json({ error: 'Amount, account name, number, and bank code are required' });
    }
    if (amount < MIN_WITHDRAWAL) {
      return res.status(400).json({ error: `Minimum withdrawal is ₦${MIN_WITHDRAWAL.toLocaleString()}` });
    }

    const { rows: [user] } = await client.query('SELECT * FROM users WHERE id = $1', [req.userId]);
    if (parseFloat(user.balance) < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    await client.query('BEGIN');
    const reference = `wdw_${req.userId}_${Date.now()}`;

    const recipientResult = await paystack.createTransferRecipient({
      name: accountName,
      accountNumber,
      bankCode,
    });
    if (!recipientResult.status) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invalid bank details' });
    }
    const recipientCode = recipientResult.data.recipient_code;

    const transferResult = await paystack.initiateTransfer({
      amount: parseFloat(amount),
      recipient: recipientCode,
      reason: 'SmartInvest Withdrawal',
      reference,
    });

    const status = transferResult.status ? 'completed' : 'failed';
    const newBalance = parseFloat(user.balance) - parseFloat(amount);

    if (transferResult.status) {
      await client.query('UPDATE users SET balance = $1 WHERE id = $2', [newBalance, req.userId]);
    }

    await client.query(
      `INSERT INTO transactions (user_id, type, amount, description, status, reference, metadata)
       VALUES ($1, 'withdrawal', $2, $3, $4, $5, $6)`,
      [req.userId, amount, `Withdrawal to ${bankName} - ${accountNumber}`, status, reference,
       JSON.stringify({ accountName, accountNumber, bankName, bankCode })]
    );

    await client.query('COMMIT');
    if (status === 'completed') {
      res.json({ message: 'Withdrawal initiated successfully', reference });
    } else {
      res.status(400).json({ error: 'Transfer failed. Please try again or contact support.' });
    }
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Withdraw error:', err.message);
    res.status(500).json({ error: 'Withdrawal failed. Please try again.' });
  } finally {
    client.release();
  }
});

router.get('/transactions', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

module.exports = router;
