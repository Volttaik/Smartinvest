/**
 * SmartInvest - Database Initialization Script
 * Run with: node scripts/init-db.js
 *
 * Creates all MongoDB collections and indexes if they don't already exist.
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI environment variable is not set.');
  process.exit(1);
}

async function initDB() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.\n');

  const db = mongoose.connection.db;

  const collectionsToCreate = [
    'users',
    'investments',
    'packages',
    'transactions',
    'notifications',
    'trades',
  ];

  const existingCollections = (await db.listCollections().toArray()).map(c => c.name);

  for (const name of collectionsToCreate) {
    if (!existingCollections.includes(name)) {
      await db.createCollection(name);
      console.log(`Created collection: ${name}`);
    } else {
      console.log(`Collection already exists: ${name}`);
    }
  }

  console.log('\nEnsuring indexes...');

  const users = db.collection('users');
  await users.createIndex({ email: 1 }, { unique: true, background: true });
  await users.createIndex({ username: 1 }, { unique: true, background: true });
  await users.createIndex({ referral_code: 1 }, { unique: true, sparse: true, background: true });
  await users.createIndex({ referred_by: 1 }, { background: true });
  console.log('users: indexes ensured');

  const transactions = db.collection('transactions');
  await transactions.createIndex({ user_id: 1, created_at: -1 }, { background: true });
  await transactions.createIndex({ paystack_ref: 1 }, { sparse: true, background: true });
  await transactions.createIndex({ reference: 1 }, { sparse: true, background: true });
  await transactions.createIndex({ status: 1 }, { background: true });
  console.log('transactions: indexes ensured');

  const investments = db.collection('investments');
  await investments.createIndex({ user_id: 1, status: 1 }, { background: true });
  await investments.createIndex({ user_id: 1, created_at: -1 }, { background: true });
  console.log('investments: indexes ensured');

  const notifications = db.collection('notifications');
  await notifications.createIndex({ user_id: 1, created_at: -1 }, { background: true });
  await notifications.createIndex({ user_id: 1, read: 1 }, { background: true });
  console.log('notifications: indexes ensured');

  const packages = db.collection('packages');
  await packages.createIndex({ tier: 1 }, { background: true });
  await packages.createIndex({ active: 1 }, { background: true });
  console.log('packages: indexes ensured');

  const trades = db.collection('trades');
  await trades.createIndex({ user_id: 1, created_at: -1 }, { background: true });
  console.log('trades: indexes ensured');

  console.log('\nDatabase initialization complete.');
  await mongoose.disconnect();
  process.exit(0);
}

initDB().catch(err => {
  console.error('Initialization failed:', err.message);
  process.exit(1);
});
