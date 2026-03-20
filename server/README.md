# SmartInvest Backend - MongoDB Migration

## What's Changed

This backend has been migrated from PostgreSQL to MongoDB, and the 4-digit CAPTCHA code generation has been updated to work locally without requiring an external server.

### Key Changes:

1. **Database Migration**: PostgreSQL → MongoDB (Mongoose)
2. **CAPTCHA Fix**: 4-digit codes are now generated locally by the registration code, not requiring an external CAPTCHA server
3. **Schema Initialization**: Added automatic schema and collection creation

## Setup Instructions

### 1. Install Dependencies

```bash
cd Smartinvest/server
npm install
```

### 2. Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your MongoDB URI:

```
VITE_MONGODB_URI=mongodb+srv://Dev:0DCVQfc00TpRQ6d2@cluster0.moflf.mongodb.net/smartinvest?retryWrites=true&w=majority&appName=Cluster0
PORT=8000
FRONTEND_URL=http://localhost:5000
JWT_SECRET=your_secret_key_here
```

### 3. Initialize Database

Run the database initialization script to create all collections and seed packages:

```bash
npm run init-db
```

This will:
- Connect to MongoDB
- Create all required collections (users, packages, investments, transactions, trades, captcha_codes)
- Add indexes for performance
- Seed 30 investment packages

### 4. Start the Server

```bash
npm start
```

The API will be available at `http://localhost:8000`

## Database Collections

The following collections are automatically created:

- **users**: User accounts, balance, referrals
- **packages**: Investment packages with ROI details
- **investments**: Active and completed user investments
- **transactions**: All financial transactions (deposits, withdrawals, returns, etc.)
- **trades**: Internal trading records
- **captcha_codes**: Temporary CAPTCHA codes for authentication

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/captcha` - Generate 4-digit CAPTCHA code (local, no external server)
- `GET /api/auth/me` - Get current user profile

### Packages
- `GET /api/packages` - Get all active packages
- `POST /api/packages/invest` - Purchase investment package

### Investments
- `GET /api/investments` - Get user investments
- `GET /api/investments/active` - Get active investments
- `GET /api/investments/summary` - Get investment summary

### Wallet
- `POST /api/wallet/fund` - Fund wallet via Paystack
- `GET /api/wallet/verify/:reference` - Verify payment
- `POST /api/wallet/withdraw` - Withdraw funds
- `GET /api/wallet/transactions` - Get transaction history

### Dashboard
- `GET /api/dashboard` - Get dashboard data
- `GET /api/dashboard/portfolio` - Get portfolio data

### Referrals
- `GET /api/referrals` - Get referral data

## Cron Jobs

The following automated jobs run:

- **Daily Returns**: Every 6 hours - Apply returns to active investments
- **Internal Trades**: Every 4 hours - Simulate trading activity
- **Captcha Cleanup**: Every 30 minutes - Remove expired CAPTCHA codes

## CAPTCHA System

The CAPTCHA system now works completely locally:

1. Frontend calls `GET /api/auth/captcha` to get a session key and 4-digit code
2. User enters the code during registration/login
3. Backend validates the code from the database (no external server needed)
4. Valid codes are deleted after use

## Health Check

Check if the API is running:

```bash
curl http://localhost:8000/api/health
```

Expected response:

```json
{
  "status": "ok",
  "db": "connected",
  "timestamp": "2024-03-21T12:00:00.000Z"
}
```

## Models

### User Model
```javascript
{
  username: String,
  email: String,
  password_hash: String,
  profile_picture: String,
  balance: Number,
  referral_code: String,
  referred_by: ObjectId,
  referral_earnings: Number,
  total_earnings: Number,
  is_active: Boolean,
  created_at: Date
}
```

### Package Model
```javascript
{
  name: String,
  price: Number,
  daily_return_pct: Number,
  duration_days: Number,
  total_roi: Number,
  tier: String,
  is_active: Boolean,
  created_at: Date
}
```

### Investment Model
```javascript
{
  user_id: ObjectId,
  package_id: ObjectId,
  package_name: String,
  amount: Number,
  daily_return_pct: Number,
  duration_days: Number,
  total_earned: Number,
  days_completed: Number,
  status: String,
  start_date: Date,
  end_date: Date,
  created_at: Date,
  last_return_at: Date
}
```

### Transaction Model
```javascript
{
  user_id: ObjectId,
  type: String,
  amount: Number,
  description: String,
  status: String,
  paystack_ref: String,
  reference: String,
  metadata: Object,
  created_at: Date
}
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure your MongoDB URI is correct in `.env`
- Check that your IP is whitelisted in MongoDB Atlas (if using Atlas)
- Verify network connectivity

### Port Already in Use
Change the PORT in `.env` or stop the process using port 8000:

```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>
```

### Missing Collections
Run the initialization script again:

```bash
npm run init-db
```

## License

MIT