const axios = require('axios');

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || '';
const BASE = 'https://api.paystack.co';

const headers = () => ({
  Authorization: `Bearer ${PAYSTACK_SECRET}`,
  'Content-Type': 'application/json',
});

async function initializeTransaction({ email, amount, reference, callbackUrl, metadata }) {
  const resp = await axios.post(`${BASE}/transaction/initialize`, {
    email,
    amount: Math.round(amount * 100),
    reference,
    callback_url: callbackUrl,
    metadata,
  }, { headers: headers() });
  return resp.data;
}

async function verifyTransaction(reference) {
  const resp = await axios.get(`${BASE}/transaction/verify/${reference}`, { headers: headers() });
  return resp.data;
}

async function createTransferRecipient({ name, accountNumber, bankCode }) {
  const resp = await axios.post(`${BASE}/transferrecipient`, {
    type: 'nuban',
    name,
    account_number: accountNumber,
    bank_code: bankCode,
    currency: 'NGN',
  }, { headers: headers() });
  return resp.data;
}

async function initiateTransfer({ amount, recipient, reason, reference }) {
  const resp = await axios.post(`${BASE}/transfer`, {
    source: 'balance',
    amount: Math.round(amount * 100),
    recipient,
    reason,
    reference,
  }, { headers: headers() });
  return resp.data;
}

module.exports = { initializeTransaction, verifyTransaction, createTransferRecipient, initiateTransfer };
