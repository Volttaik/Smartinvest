const { Package } = require('../../models/index.cjs');
const connectDB = require('../../lib/db.cjs');
const { send } = require('../../lib/auth-utils.cjs');

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

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });

  const initSecret = (req.body || {}).secret || req.headers['x-init-secret'];
  if (initSecret !== process.env.INIT_SECRET) {
    return send(res, 401, { error: 'Unauthorized' });
  }

  try {
    await connectDB();
    const count = await Package.countDocuments();
    if (count > 0) {
      return send(res, 200, { success: true, message: 'Packages already seeded', packageCount: count });
    }

    for (const p of packages) {
      await Package.create({
        name: p.name, price: p.price, daily_return_pct: p.daily,
        duration_days: p.days, total_roi: p.daily * p.days, tier: p.tier
      });
    }
    send(res, 200, { success: true, message: `Seeded ${packages.length} packages`, packageCount: packages.length });
  } catch (err) {
    console.error('Init error:', err);
    send(res, 500, { success: false, error: err.message });
  }
};
