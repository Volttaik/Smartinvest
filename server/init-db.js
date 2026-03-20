const mongoose = require('mongoose');
require('dotenv').config();

// Use MONGODB_URI from environment variables (server-side only)
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MongoDB URI is missing. Please set MONGODB_URI in environment variables.');
}

// Define all schemas and models

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true },
  profile_picture: { type: String, default: 'avatar1' },
  balance: { type: Number, default: 0 },
  referral_code: { type: String, required: true, unique: true },
  referred_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  referral_earnings: { type: Number, default: 0 },
  total_earnings: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  daily_return_pct: { type: Number, required: true },
  duration_days: { type: Number, required: true },
  total_roi: { type: Number, required: true },
  tier: { type: String, required: true },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now }
});

const investmentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  package_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
  package_name: { type: String, required: true },
  amount: { type: Number, required: true },
  daily_return_pct: { type: Number, required: true },
  duration_days: { type: Number, required: true },
  total_earned: { type: Number, default: 0 },
  days_completed: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  start_date: { type: Date, default: Date.now },
  end_date: { type: Date },
  created_at: { type: Date, default: Date.now },
  last_return_at: { type: Date }
});

const transactionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true, enum: ['deposit', 'withdrawal', 'investment', 'daily_return', 'referral_bonus', 'trade_gain', 'trade_loss'] },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  paystack_ref: { type: String },
  reference: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
  created_at: { type: Date, default: Date.now }
});

const tradeSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  asset: { type: String, required: true },
  type: { type: String, required: true, enum: ['buy', 'sell'] },
  amount: { type: Number, required: true },
  price: { type: Number, required: true },
  profit_loss: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  created_at: { type: Date, default: Date.now }
});

const captchaCodeSchema = new mongoose.Schema({
  session_key: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  expires_at: { type: Date, required: true },
  created_at: { type: Date, default: Date.now }
});

// Create models
const User = mongoose.model('User', userSchema);
const Package = mongoose.model('Package', packageSchema);
const Investment = mongoose.model('Investment', investmentSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const Trade = mongoose.model('Trade', tradeSchema);
const CaptchaCode = mongoose.model('CaptchaCode', captchaCodeSchema);

// Packages to seed
const packages = [
  { name: 'Bronze Starter', price: 5000, daily: 0.5, days: 20, tier: 'Starter' },
  { name: 'Silver Starter', price: 5500, daily: 0.6, days: 20, tier: 'Starter' },
  { name: 'Gold Starter', price: 6000, daily: 0.7, days: 25, tier: 'Starter' },
  { name: 'Premium Starter', price: 6500, daily: 0.8, days: 25, tier: 'Starter' },
  { name: 'Elite Starter', price: 7000, daily: 0.9, days: 30, tier: 'Starter' },
  { name: 'Bronze Basic', price: 7500, daily: 1.0, days: 20, tier: 'Basic' },
  { name: 'Silver Basic', price: 8000, daily: 1.1, days: 25, tier: 'Basic' },
  { name: 'Gold Basic', price: 8500, daily: 1.2, days: 25, tier: 'Basic' },
  { name: 'Premium Basic', price: 9000, daily: 1.3, days: 30, tier: 'Basic' },
  { name: 'Elite Basic', price: 9500, daily: 1.4, days: 30, tier: 'Basic' },
  { name: 'Bronze Standard', price: 10000, daily: 1.5, days: 25, tier: 'Standard' },
  { name: 'Silver Standard', price: 10500, daily: 1.6, days: 30, tier: 'Standard' },
  { name: 'Gold Standard', price: 11000, daily: 1.7, days: 30, tier: 'Standard' },
  { name: 'Premium Standard', price: 12000, daily: 1.8, days: 35, tier: 'Standard' },
  { name: 'Elite Standard', price: 13000, daily: 1.9, days: 35, tier: 'Standard' },
  { name: 'Bronze Advanced', price: 14000, daily: 2.0, days: 30, tier: 'Advanced' },
  { name: 'Silver Advanced', price: 14500, daily: 2.1, days: 35, tier: 'Advanced' },
  { name: 'Gold Advanced', price: 15000, daily: 2.2, days: 35, tier: 'Advanced' },
  { name: 'Premium Advanced', price: 16000, daily: 2.3, days: 40, tier: 'Advanced' },
  { name: 'Elite Advanced', price: 17500, daily: 2.4, days: 40, tier: 'Advanced' },
  { name: 'Bronze Pro', price: 18000, daily: 2.5, days: 35, tier: 'Professional' },
  { name: 'Silver Pro', price: 19000, daily: 2.6, days: 40, tier: 'Professional' },
  { name: 'Gold Pro', price: 19500, daily: 2.7, days: 45, tier: 'Professional' },
  { name: 'Premium Pro', price: 20000, daily: 2.8, days: 45, tier: 'Professional' },
  { name: 'Elite Pro', price: 21000, daily: 2.9, days: 50, tier: 'Professional' },
  { name: 'Bronze Executive', price: 22000, daily: 3.0, days: 40, tier: 'Executive' },
  { name: 'Silver Executive', price: 23000, daily: 3.1, days: 45, tier: 'Executive' },
  { name: 'Gold Executive', price: 24000, daily: 3.2, days: 50, tier: 'Executive' },
  { name: 'Premium Executive', price: 24500, daily: 3.3, days: 55, tier: 'Executive' },
  { name: 'Elite Executive', price: 25000, daily: 3.5, days: 60, tier: 'Executive' },
];

async function initializeDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);

    // Create collections and indexes
    console.log('📊 Checking and creating collections...');

    // Check existing collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    // Seed packages if not exists
    const packageCount = await Package.countDocuments();
    if (packageCount === 0) {
      console.log('📦 Seeding packages...');
      for (const p of packages) {
        const totalROI = p.daily * p.days;
        await Package.create({
          name: p.name,
          price: p.price,
          daily_return_pct: p.daily,
          duration_days: p.days,
          total_roi: totalROI,
          tier: p.tier
        });
      }
      console.log(`✅ Seeded ${packages.length} packages`);
    } else {
      console.log(`✅ Packages already exist (${packageCount} packages)`);
    }

    // Ensure indexes for better performance
    console.log('🔍 Creating indexes...');
    await User.createIndexes();
    await Package.createIndexes();
    await Investment.createIndexes();
    await Transaction.createIndexes();
    await Trade.createIndexes();
    await CaptchaCode.createIndexes();

    console.log('✅ Database initialization complete!');
    console.log('\n📋 Collections:');
    console.log(`  - Users: ${await User.countDocuments()}`);
    console.log(`  - Packages: ${await Package.countDocuments()}`);
    console.log(`  - Investments: ${await Investment.countDocuments()}`);
    console.log(`  - Transactions: ${await Transaction.countDocuments()}`);
    console.log(`  - Trades: ${await Trade.countDocuments()}`);
    console.log(`  - CaptchaCodes: ${await CaptchaCode.countDocuments()}`);

    await mongoose.connection.close();
    console.log('\n👋 Database connection closed.');
  } catch (err) {
    console.error('❌ Database initialization error:', err);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = {
  User,
  Package,
  Investment,
  Transaction,
  Trade,
  CaptchaCode,
  initializeDatabase
};