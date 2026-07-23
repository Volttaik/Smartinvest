# SmartInvest deployment

SmartInvest is a Next.js 14 App Router application. It deploys as one Next.js service; no separate Vite frontend or Express backend is required.

## Environment variables

Configure these in the deployment environment:

| Variable | Required | Purpose |
| --- | --- | --- |
| `TURSO_DATABASE_URL` | Yes | Turso/libSQL database URL |
| `TURSO_AUTH_TOKEN` | Yes | Turso database authentication token |
| `JWT_SECRET` | Yes | JWT signing secret |
| `INIT_SECRET` | Yes | Protects package seeding |
| `CRON_SECRET` | Yes | Protects scheduled return processing |
| `PAYSTACK_SECRET_KEY` | Optional | Paystack server-side payment calls |
| `PAYSTACK_PUBLIC_KEY` | Optional | Paystack browser configuration |
| `FRONTEND_URL` | Optional | Payment callback base URL |

Never commit Turso or Paystack credentials.

## Build and start

```bash
npm install
npm run build
npm start
```

The application uses port 5000 in this project. The first database connection creates the required tables. Run `npm run init-db` once to seed investment packages.

## Scheduled returns

The `/api/cron` route processes investment returns. Configure the deployment scheduler to call:

```text
/api/cron?job=all
```

and provide the configured cron secret using the mechanism supported by the deployment platform.

## Main routes

- `/` — landing page
- `/login` and `/register` — authentication
- `/dashboard` — authenticated investment dashboard
- `/api/*` — server-side API route handlers