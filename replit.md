# SmartInvest — AI-Powered Investment Platform

A full-stack Next.js investment platform with MongoDB, Paystack payments, and a comprehensive user dashboard.

## Architecture

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Frontend:** React 18 + Tailwind CSS + Framer Motion + Recharts
- **Backend:** Next.js Route Handlers (API routes)
- **Database:** MongoDB (Mongoose ODM)
- **Payments:** Paystack (deposits via EasyBuy channel + bank withdrawals)
- **Auth:** JWT (jsonwebtoken) + bcryptjs
- **Styling:** Tailwind CSS v3 + Radix UI components

## Key Environment Variables

Set these in Replit Secrets:
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — JWT signing key
- `PAYSTACK_SECRET_KEY` — Paystack secret key (sk_live_... or sk_test_...)
- `PAYSTACK_PUBLIC_KEY` / `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` — Paystack public key
- `CRON_SECRET` — Secret for cron job endpoint
- `INIT_SECRET` — Secret for DB init endpoint

## Project Structure

```
app/
  page.tsx              — Landing page
  layout.tsx            — Root layout with AuthProvider
  providers.tsx         — Client-side AuthProvider + useAuth
  dashboard/page.tsx    — Full dashboard (2000+ lines, all tabs in one file)
  api/
    auth/login|register|me/  — Authentication endpoints
    dashboard/           — Main dashboard data endpoint
    packages/            — Investment packages + invest action
    wallet/fund|verify|withdraw|transactions/ — Wallet operations
    notifications/       — Notifications (GET list, PATCH mark-read)
    user/profile/        — Profile update (including profile_picture)
    banks/               — Nigerian bank list + account resolution
    admin/               — Admin endpoints (stats, users, packages, etc.)
    init/                — DB seeding endpoint

lib/
  db.ts                 — MongoDB connection singleton (imports all models)
  server-auth.ts        — JWT sign/verify
  models/
    User.ts             — User schema
    Package.ts          — Investment package schema
    Investment.ts       — User investment schema
    Transaction.ts      — Transaction log schema
    Notification.ts     — User notifications schema
    Trade.ts            — Trading simulation schema

src/
  components/           — Landing page components (Navbar, Hero, etc.)
  components/ui/        — Radix-based UI primitives
  lib/
    api.ts              — Axios client + API functions
    auth.tsx            — AuthContext + useAuth hook

scripts/
  init-db.js            — Seeds investment packages
```

## Dashboard Tabs

- **Home (overview)** — Portfolio carousel, quick stats, charts, active investments, recent transactions
- **Portfolio** — Asset allocation chart + live market prices
- **Assets** — Crypto/stocks/commodities price tracker
- **Invest** — Browse and purchase investment packages
- **Transactions** — Full transaction history
- **Referrals** — Referral code, stats, tiered commission info
- **Fund Wallet** — Paystack funding with EasyBuy channel guide
- **Withdraw** — Bank withdrawal form with account resolution
- **Notifications** — All notifications with mark-read
- **Profile** — Personal info + profile picture upload
- **Security** — Paystack security info + EasyBuy channel explanation

## Features

- Real-time dashboard polling (30s data, 10s notifications) — no page reload needed
- Profile picture upload (base64, stored in MongoDB)
- Notification bell dropdown with solid background, live updates
- Transaction cancelled / failed messages via toast notifications
- Custom refresh button (no full page reload)
- Scrollable transaction card in overview
- Security page explaining Paystack PCI DSS, SSL, 3DS, and EasyBuy channel

## Workflows

- **Start application** — `npm run dev` (Next.js on port 5000)
