# SmartInvest

## Overview

SmartInvest is a Next.js 14 App Router investment platform with a responsive landing page, authenticated dashboard, JWT sessions, Paystack wallet flows, and Turso/libSQL persistence.

## Architecture

- **Framework:** Next.js 14 with TypeScript and the App Router
- **UI:** React, Tailwind CSS, Framer Motion, Recharts, and Radix UI
- **Server:** Next.js Route Handlers in `app/api/`
- **Database:** Turso/libSQL through `@libsql/client`
- **Authentication:** JWT and bcryptjs
- **Payments:** Paystack (optional)
- **Run command:** `npm run dev` on port 5000

## Required environment

Set these as Replit Secrets:

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `JWT_SECRET`
- `INIT_SECRET`
- `CRON_SECRET`

Optional payment configuration:

- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_PUBLIC_KEY`
- `FRONTEND_URL`

The old MongoDB configuration is no longer used.

## Database

`lib/db.ts` creates the Turso/libSQL client, ensures the application tables exist, and provides the model access layer used by the route handlers. Run `npm run init-db` to explicitly initialize the schema and seed investment packages.

## Important directories

- `app/`: pages, layout, auth provider, and API route handlers
- `components/`: shared UI components
- `lib/models/`: Turso-backed model accessors
- `scripts/init-db.js`: schema initialization and package seeding
- `public/`: static assets

## User preferences

- Keep the existing Next.js structure and visual design.
- Avoid introducing a separate frontend or backend server.
- Keep database credentials in Replit Secrets and never expose them to client code.