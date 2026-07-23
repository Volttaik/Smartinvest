# SmartInvest

SmartInvest is a Next.js 14 investment platform with JWT authentication, a responsive investment dashboard, Paystack wallet payments, and a Turso/libSQL database.

## Stack

- Next.js 14 App Router and React 18
- TypeScript, Tailwind CSS, Framer Motion, Recharts, and Radix UI
- Next.js Route Handlers under `app/api/`
- Turso/libSQL via `@libsql/client`
- JWT authentication with `jsonwebtoken` and password hashing with `bcryptjs`
- Paystack for optional wallet deposits and bank withdrawals

## Local setup

Requirements: Node.js 18+ and a Turso database.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set the required environment variables. Copy `.env.example` to `.env.local` and provide:

   ```env
   TURSO_DATABASE_URL=libsql://your-database.turso.io
   TURSO_AUTH_TOKEN=your_turso_auth_token
   JWT_SECRET=replace_with_a_long_random_value
   INIT_SECRET=replace_with_a_seed_secret
   CRON_SECRET=replace_with_a_cron_secret
   ```

   `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`, and `FRONTEND_URL` are only needed for payment flows and production callbacks.

3. Create the Turso tables and seed the investment packages:

   ```bash
   npm run init-db
   ```

4. Start the Next.js development server:

   ```bash
   npm run dev
   ```

   The app is served on port 5000.

## Production

```bash
npm run build
npm start
```

Set the same Turso, JWT, cron, initialization, and optional Paystack variables in the deployment environment. The database schema is also created automatically when a route first connects.

## Project structure

```text
app/
  page.tsx                 Landing page
  dashboard/page.tsx       Authenticated dashboard
  api/                     Next.js Route Handlers
  providers.tsx            Client-side auth provider
components/                Shared landing and UI components
lib/
  db.ts                    Turso/libSQL client, schema, and model compatibility layer
  models/                  Database model accessors
  server-auth.ts           JWT signing and verification
scripts/
  init-db.js               Turso schema initialization and package seeding
public/                    Static assets
```

## API areas

- Authentication: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- Dashboard: `/api/dashboard`
- Investments and packages: `/api/investments`, `/api/packages`
- Wallet: `/api/wallet/*`
- Notifications and profile: `/api/notifications`, `/api/user/profile`
- Referrals: `/api/referrals`
- Admin: `/api/admin/*`
- Scheduled returns: `/api/cron`

## Notes

- All database access is server-side; Turso credentials must never be exposed to the browser.
- The app uses the Next.js App Router and does not require a separate Express or Vite server.
- Payment routes require valid Paystack credentials; the rest of the app can run without payment configuration.