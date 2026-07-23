# SmartInvest

A Next.js 14 investment platform with JWT authentication, a responsive investment dashboard, Paystack wallet payments, and a Turso/libSQL database.

## Stack

- **Frontend:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Framer Motion, Recharts, Radix UI
- **Auth:** JWT via `jsonwebtoken`, passwords hashed with `bcryptjs`
- **Database:** Turso/libSQL via `@libsql/client`
- **Payments:** Paystack (wallet funding + bank withdrawals)
- **Theme:** `next-themes` (dark mode default, togglable via Settings)

## Running locally

```bash
npm install
npm run dev   # serves on port 5000
```

### Required environment variables

| Variable | Purpose |
|---|---|
| `TURSO_DATABASE_URL` | libsql://your-database.turso.io |
| `TURSO_AUTH_TOKEN` | Turso auth token |
| `JWT_SECRET` | Long random string for signing JWTs |
| `INIT_SECRET` | Secret to protect the /api/init-db route |
| `CRON_SECRET` | Secret to protect the /api/cron route |
| `SESSION_SECRET` | Session encryption secret |
| `PAYSTACK_SECRET_KEY` | (Optional) Paystack secret — payment flows only |
| `PAYSTACK_PUBLIC_KEY` | (Optional) Paystack public key — payment flows only |
| `FRONTEND_URL` | (Optional) Production callback URL for Paystack |

### Initialize database

```bash
npm run init-db
```

## Project structure

```
app/
  page.tsx               Landing page
  dashboard/page.tsx     Authenticated dashboard (all tabs)
  login/ register/       Auth pages
  api/                   Next.js Route Handlers
  providers.tsx          AuthProvider + ThemeProvider
  globals.css            Design tokens (light + dark CSS vars)
components/              Landing page sections
src/components/          Shared UI components
lib/
  db.ts                  Turso client + schema
  models/                DB model accessors
  server-auth.ts         JWT helpers
scripts/
  init-db.js             Schema init + package seeding
```

## Dashboard features

- **Dark mode by default** — togglable via Settings tab or sun/moon button in header
- **Bottom navigation** — fixed mobile nav (Home, Portfolio, Invest, Wallet, Settings)
- **Settings tab** — appearance (Light/Dark/System), account quick-links
- Swipeable investment card carousel
- Live intraday asset charts (My Assets tab)
- P&L chart, earnings history, active investments
- Paystack wallet funding + bank withdrawal
- Referral program with tiered commissions
- Notifications, Profile, Security tabs

## User preferences

- UI-only changes preferred — do not alter architecture, database schema, or API routes without explicit instruction
- Dark mode is the default theme
