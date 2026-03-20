# Smartinvest (nexus-ai-builder)

An AI-powered investment platform providing institutional-grade, data-driven investment strategies to individual investors.

## Tech Stack

- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite 5
- **Styling:** Tailwind CSS v3 + Radix UI components
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Routing:** React Router DOM v6
- **Package Manager:** npm

## Project Structure

- `src/` - Main source code
  - `components/` - Reusable UI components (navbar, hero, pricing, etc.)
  - `components/ui/` - Low-level design system components (shadcn/ui patterns)
  - `pages/` - Page-level components (Dashboard, Login, Register)
  - `lib/` - Utility functions
  - `main.tsx` - App entry point
  - `App.tsx` - Router and layout wrapper
- `index.html` - HTML entry point
- `vite.config.ts` - Vite configuration (port 5000, host 0.0.0.0, allowedHosts: true)

## Development

```bash
npm install
npm run dev
```

Runs on port 5000 at `http://0.0.0.0:5000`.

## Deployment

Configured as a static site deployment. Build output goes to `dist/`.

```bash
npm run build
```
