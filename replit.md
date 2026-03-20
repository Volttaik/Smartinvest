# SmartInvest — AI-Powered Investment Platform

A fully functional investment platform with real backend, Paystack payments, internal trading simulation, and comprehensive user management.

## Architecture

- **Frontend:** React 18 + TypeScript + Vite (port 5000)
- **Backend:** Node.js + Express (port 8000)
- **Database:** PostgreSQL (Replit built-in)
- **Payments:** Paystack (deposits + withdrawals)
- **Auth:** JWT + bcrypt
- **Styling:** Tailwind CSS v3 + Radix UI

## Features

### User System
- Registration with 4-step flow (Account → Password → Avatar selection → Confirm)
- 8 profile avatar options
- CAPTCHA (4-digit code) on login and registration to prevent bots
- JWT authentication (7-day expiry)
- Referral system: unique codes, 5% commission on referred investments

### Investment Packages (30 total)
- 6 tiers: Starter (₦5k-₦7k), Basic (₦7.5k-₦9.5k), Standard (₦10k-₦13k), Advanced (₦14k-₦17.5k), Professional (₦18k-₦21k), Executive (₦22k-₦25k)
- Daily return percentages: 0.5% to 3.5%
- Durations: 20 to 60 days

### Financial System
- Wallet funding via Paystack (inline popup)
- Automated withdrawals via Paystack bank transfer (min ₦10,000)
- Daily returns credited every 6 hours (cron)
- Internal trading simulation every 4 hours (50% gain, 40% loss probability)
- All transactions logged to PostgreSQL

### Pages
- **/** — Landing page with live packages from backend
- **/login** — Auth with CAPTCHA
- **/register** — 4-step registration with avatar selection
- **/dashboard** — Full dashboard: overview, invest, transactions, referrals, fund, withdraw
- **/portfolio** — Investment history, trade log, allocation chart
- **/support** — FAQ + contact form
- **/privacy** — Privacy policy
- **/terms** — Terms & conditions

## Project Structure

```
server/
  index.js          — Express app entry (port 8000)
  db.js             — PostgreSQL connection
  middleware/
    auth.js         — JWT middleware
  routes/
    auth.js         — Register, login, captcha, /me
    packages.js     — Get packages, invest
    investments.js  — Investment history
    wallet.js       — Fund, verify, withdraw, transactions
    dashboard.js    — Dashboard + portfolio data
    referrals.js    — Referral stats
  seeds/
    packages.js     — Seeds 30 investment packages
  lib/
    paystack.js     — Paystack API client
    cron.js         — Daily returns + trading simulation

src/
  lib/
    api.ts          — Axios client + all API functions
    auth.tsx        — AuthContext + useAuth hook
  components/
    ProtectedRoute.tsx — Redirects to /login if not authenticated
    Navbar.tsx      — Auth-aware navigation
    Pricing.tsx     — 30 live packages from backend
    Footer.tsx      — Links to all pages
  pages/
    Login.tsx       — Real auth + CAPTCHA
    Register.tsx    — 4-step flow + avatar + CAPTCHA
    Dashboard.tsx   — Full dashboard with real data
    Portfolio.tsx   — Portfolio + trade log
    Support.tsx     — FAQ + contact
    PrivacyPolicy.tsx — Privacy policy
    Terms.tsx       — Terms & conditions
```

## Environment Variables

Set these in Replit Secrets or server/.env:
- `DATABASE_URL` — Auto-set by Replit PostgreSQL
- `JWT_SECRET` — JWT signing key
- `PAYSTACK_SECRET_KEY` — Paystack secret key (sk_live_... or sk_test_...)
- `PAYSTACK_PUBLIC_KEY` — Paystack public key

## Workflows

- **Start application** — `npm run dev` (frontend, port 5000)
- **Start Backend** — `node server/index.js` (backend, port 8000)

## Development

Frontend calls `/api/*` which is proxied by Vite to `http://localhost:8000`.
