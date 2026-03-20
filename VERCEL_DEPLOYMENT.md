# SmartInvest - Vercel Deployment Guide

## 🚀 Overview

This project is now configured for **Vercel deployment** with serverless API functions. No separate backend server needed!

---

## 📋 Features

- ✅ **Serverless API Routes** - All backend logic as Vercel functions
- ✅ **MongoDB Atlas** - Database connection via Mongoose
- ✅ **Local CAPTCHA Generation** - No external server needed
- ✅ **Vercel Cron Jobs** - Automated daily returns and trades
- ✅ **Paystack Integration** - Secure payments
- ✅ **JWT Authentication** - Secure user sessions

---

## 🔧 Environment Variables

Set these in **Vercel Dashboard** → **Settings** → **Environment Variables**:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_MONGODB_URI` | MongoDB connection string | `mongodb+srv://Dev:password@cluster0.moflf.mongodb.net/smartinvest?retryWrites=true&w=majority` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key-here` |
| `PAYSTACK_SECRET_KEY` | Paystack secret key | `sk_test_xxxxx` |
| `PAYSTACK_PUBLIC_KEY` | Paystack public key | `pk_test_xxxxx` |
| `FRONTEND_URL` | Your Vercel app URL | `https://your-app.vercel.app` |
| `CRON_SECRET` | Secret for cron jobs | `cron-secret-change-me` |
| `INIT_SECRET` | Secret for DB init | `init-secret-change-me` |

---

## 📦 Deployment Steps

### 1. Push to GitHub

```bash
git add .
git commit -m "Convert to Vercel serverless functions"
git push origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import from GitHub: `Volttaik/Smartinvest`
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add all environment variables
6. Click **Deploy**

### 3. Initialize Database

After deployment, initialize the database by calling:

```bash
curl -X POST https://your-app.vercel.app/api/init \
  -H "Content-Type: application/json" \
  -d '{"secret": "YOUR_INIT_SECRET"}'
```

Or use Postman/Insomnia:
- Method: POST
- URL: `https://your-app.vercel.app/api/init`
- Headers: `Content-Type: application/json`
- Body (JSON):
  ```json
  {
    "secret": "YOUR_INIT_SECRET"
  }
  ```

This will:
- Connect to MongoDB
- Create all collections
- Seed 30 investment packages

---

## 🔗 API Endpoints

All endpoints are under `/api`:

### Authentication
- `GET /api/auth/captcha` - Generate 4-digit CAPTCHA (local)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile (requires auth)

### Packages
- `GET /api/packages` - Get all active packages
- `POST /api/packages/invest` - Purchase investment package (requires auth)

### Investments
- `GET /api/investments` - Get user investments (requires auth)
- `GET /api/investments/active` - Get active investments (requires auth)
- `GET /api/investments/summary` - Get investment summary (requires auth)

### Wallet
- `POST /api/wallet/fund` - Fund wallet via Paystack (requires auth)
- `GET /api/wallet/verify/:reference` - Verify payment (requires auth)
- `POST /api/wallet/withdraw` - Withdraw funds (requires auth)
- `GET /api/wallet/transactions` - Get transaction history (requires auth)

### Dashboard
- `GET /api/dashboard` - Get dashboard data (requires auth)
- `GET /api/dashboard/portfolio` - Get portfolio data (requires auth)

### Referrals
- `GET /api/referrals` - Get referral data (requires auth)

### Cron Jobs (Internal)
- `GET /api/cron?job=daily-returns&secret=CRON_SECRET` - Apply daily returns
- `GET /api/cron?job=internal-trades&secret=CRON_SECRET` - Run internal trades
- `GET /api/cron?job=cleanup-captchas&secret=CRON_SECRET` - Clean expired CAPTCHAs

### Database Initialization
- `POST /api/init` - Initialize database and seed packages

---

## ⏰ Cron Jobs

Vercel Cron Jobs are configured in `vercel-cron.json`:

- **Daily Returns**: Every 6 hours (`0 */6 * * *`)
- **Internal Trades**: Every 4 hours (`0 */4 * * *`)
- **Captcha Cleanup**: Every 30 minutes (`*/30 * * * *`)

**To add cron jobs to Vercel:**

1. Go to **Vercel Dashboard** → **Your Project** → **Settings** → **Cron Jobs**
2. Click **"Add Cron Job"**
3. Add each job from `vercel-cron.json`
4. Replace `YOUR_CRON_SECRET` with your actual `CRON_SECRET`

---

## 🗂️ Project Structure

```
Smartinvest/
├── api/                    # Vercel serverless functions
│   ├── auth/              # Authentication endpoints
│   ├── packages/          # Package management
│   ├── investments/       # Investment tracking
│   ├── wallet/            # Wallet & payments
│   ├── dashboard/         # Dashboard data
│   ├── referrals/         # Referral system
│   ├── cron/              # Cron job handler
│   └── init/              # Database initialization
├── lib/                   # Shared utilities
│   └── db.js              # MongoDB connection
├── models/                # MongoDB schemas
│   ├── User.js
│   ├── Package.js
│   ├── Investment.js
│   ├── Transaction.js
│   ├── Trade.js
│   └── CaptchaCode.js
├── src/                   # Frontend React app
│   └── lib/
│       └── api.ts         # API client (already configured)
├── vercel.json            # Vercel configuration
└── vercel-cron.json       # Cron jobs configuration
```

---

## 🔒 Security Notes

1. **Never commit secrets** - Use Vercel environment variables
2. **Change default secrets** - Update `JWT_SECRET`, `CRON_SECRET`, `INIT_SECRET`
3. **MongoDB IP Whitelist** - Add `0.0.0.0/0` to MongoDB Atlas Network Access
4. **Cron Protection** - Cron jobs require `CRON_SECRET` in query params
5. **Init Protection** - DB init requires `INIT_SECRET` in body

---

## 📊 Database Collections

Auto-created on initialization:

- **users** - User accounts and profiles
- **packages** - Investment packages (30 tiers)
- **investments** - Active and completed investments
- **transactions** - All financial transactions
- **trades** - Internal trading records
- **captchacodes** - Temporary CAPTCHA codes

---

## 🧪 Testing Locally

```bash
# Install dependencies
npm install

# Start Vite dev server (includes API routes)
npm run dev
```

API routes will be available at `http://localhost:5000/api/*`

---

## 🐛 Troubleshooting

### API Routes Not Working
- Check Vercel build logs
- Ensure `vercel.json` is present
- Verify `api/` folder structure

### MongoDB Connection Failed
- Verify `VITE_MONGODB_URI` in Vercel env vars
- Check MongoDB Atlas network access (whitelist 0.0.0.0/0)
- Ensure MongoDB user has correct permissions

### Cron Jobs Not Running
- Verify cron jobs added in Vercel Dashboard
- Check `CRON_SECRET` matches in both env vars and cron URLs
- View Vercel cron job logs

### Database Not Initialized
- Call `/api/init` with `INIT_SECRET`
- Check MongoDB collections exist
- Verify packages seeded (should have 30)

---

## 📈 Vercel Features Used

- **Serverless Functions** - API routes
- **Cron Jobs** - Automated tasks
- **Environment Variables** - Secure secrets
- **Edge Network** - Global CDN
- **Automatic HTTPS** - SSL certificates
- **Preview Deployments** - Git branch previews

---

## 🔄 Migration from Local Server

**Before:** Required separate Express server on port 8000

**After:** Everything runs on Vercel with serverless functions

**No changes needed in frontend** - API client (`src/lib/api.ts`) already uses `/api` prefix!

---

## 💡 Tips

1. **Use preview deployments** - Test changes before merging to main
2. **Monitor logs** - Check Vercel logs for errors
3. **Set alerts** - Get notified on build failures
4. **Back up MongoDB** - Enable automatic backups in Atlas
5. **Monitor costs** - Vercel free tier includes 100GB bandwidth/month

---

## 📝 License

MIT

---

**Ready to deploy!** 🚀

After setting up environment variables and deploying, don't forget to:
1. Add cron jobs in Vercel Dashboard
2. Initialize database with `/api/init`
3. Test registration/login
4. Make a test payment (if Paystack configured)