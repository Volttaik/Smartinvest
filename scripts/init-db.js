/**
 * Initialize the SmartInvest Turso/libSQL schema and seed investment packages.
 * Run with: npm run init-db
 */

const { createClient } = require('@libsql/client');

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set.');
  process.exit(1);
}

const db = createClient({ url, authToken });

const schema = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE, email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL, profile_picture TEXT NOT NULL DEFAULT 'avatar1',
    balance REAL NOT NULL DEFAULT 0, referral_code TEXT NOT NULL UNIQUE, referred_by TEXT,
    referral_earnings REAL NOT NULL DEFAULT 0, total_earnings REAL NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1, is_admin INTEGER NOT NULL DEFAULT 0,
    profile_completed INTEGER NOT NULL DEFAULT 0, date_of_birth TEXT NOT NULL DEFAULT '',
    gender TEXT NOT NULL DEFAULT '', address TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '',
    bio TEXT NOT NULL DEFAULT '', nin TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS packages (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, price REAL NOT NULL, daily_return_pct REAL NOT NULL,
    duration_days INTEGER NOT NULL, total_roi REAL NOT NULL, tier TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS investments (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, package_id TEXT NOT NULL, package_name TEXT NOT NULL,
    amount REAL NOT NULL, daily_return_pct REAL NOT NULL, duration_days INTEGER NOT NULL,
    total_earned REAL NOT NULL DEFAULT 0, days_completed INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active', start_date TEXT NOT NULL, end_date TEXT,
    created_at TEXT NOT NULL, last_return_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, type TEXT NOT NULL, amount REAL NOT NULL,
    description TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'completed', failure_reason TEXT,
    paystack_ref TEXT, reference TEXT, metadata TEXT, created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'system',
    title TEXT NOT NULL, message TEXT NOT NULL, read INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS trades (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, investment_id TEXT, type TEXT NOT NULL,
    amount REAL NOT NULL, description TEXT, created_at TEXT NOT NULL
  )`,
];

const packages = [
  ['Bronze Starter', 5000, 0.5, 20, 'Starter'], ['Silver Starter', 5500, 0.6, 20, 'Starter'],
  ['Gold Starter', 6000, 0.7, 25, 'Starter'], ['Premium Starter', 6500, 0.8, 25, 'Starter'],
  ['Elite Starter', 7000, 0.9, 30, 'Starter'], ['Bronze Basic', 7500, 1, 20, 'Basic'],
  ['Silver Basic', 8000, 1.1, 25, 'Basic'], ['Gold Basic', 8500, 1.2, 25, 'Basic'],
  ['Premium Basic', 9000, 1.3, 30, 'Basic'], ['Elite Basic', 9500, 1.4, 30, 'Basic'],
  ['Bronze Standard', 10000, 1.5, 25, 'Standard'], ['Silver Standard', 10500, 1.6, 30, 'Standard'],
  ['Gold Standard', 11000, 1.7, 30, 'Standard'], ['Premium Standard', 12000, 1.8, 35, 'Standard'],
  ['Elite Standard', 13000, 1.9, 35, 'Standard'], ['Bronze Advanced', 14000, 2, 30, 'Advanced'],
  ['Silver Advanced', 14500, 2.1, 35, 'Advanced'], ['Gold Advanced', 15000, 2.2, 35, 'Advanced'],
  ['Premium Advanced', 16000, 2.3, 40, 'Advanced'], ['Elite Advanced', 17500, 2.4, 40, 'Advanced'],
  ['Bronze Pro', 18000, 2.5, 35, 'Professional'], ['Silver Pro', 19000, 2.6, 40, 'Professional'],
  ['Gold Pro', 19500, 2.7, 45, 'Professional'], ['Premium Pro', 20000, 2.8, 45, 'Professional'],
  ['Elite Pro', 21000, 2.9, 50, 'Professional'], ['Bronze Executive', 22000, 3, 40, 'Executive'],
  ['Silver Executive', 23000, 3.1, 45, 'Executive'], ['Gold Executive', 24000, 3.2, 50, 'Executive'],
  ['Premium Executive', 24500, 3.3, 55, 'Executive'], ['Elite Executive', 25000, 3.5, 60, 'Executive'],
];

async function main() {
  await Promise.all(schema.map((sql) => db.execute(sql)));
  const existing = await db.execute('SELECT COUNT(*) AS count FROM packages');
  if (Number(existing.rows[0].count) === 0) {
    for (const [name, price, daily, days, tier] of packages) {
      await db.execute({
        sql: `INSERT INTO packages
          (id, name, price, daily_return_pct, duration_days, total_roi, tier, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [crypto.randomUUID(), name, price, daily, days, daily * days, tier, new Date().toISOString()],
      });
    }
    console.log(`Seeded ${packages.length} investment packages.`);
  } else {
    console.log('Investment packages already exist; nothing to seed.');
  }
  console.log('Turso schema is ready.');
  db.close();
}

main().catch((error) => {
  console.error('Turso initialization failed:', error.message);
  process.exit(1);
});