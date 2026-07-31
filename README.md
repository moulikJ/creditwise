# CreditWise — Credit Card Discovery & Recommendation Platform

A full-stack fintech web app to discover, compare, evaluate and select Indian credit cards based on real spending patterns. Built as a portfolio project for Product Management, Business Analyst, FinTech and Operations roles.

## Tech stack
- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (light/dark theme)
- **Next.js API routes** (full-stack, no separate server) + **JWT auth** (jose) + **bcrypt**
- **Recharts** for analytics & calculator visualisations
- **Zod** for request validation
- Repository data layer (JSON-backed for zero-config demo) — swap to Postgres by replacing `lib/repo.ts`. Reference schema in `db/schema.sql`.

## Modules
1. **Home** — search, featured cards, category browse, tool links
2. **Card Explorer** — search, filters (category/bank/fee/benefit), sort, grid + table views
3. **Card Detail** — overview, fees, reward structure, benefits, eligibility, pros/cons, similar cards
4. **Comparison** — up to 3 cards side-by-side, best-in-row highlighting
5. **Reward Calculator** — spend input → annual rewards, fee, net value, with charts
6. **Recommendation Engine** — spend + preferences → ranked cards with explained reasoning + fit score
7. **AI Card Advisor** — chat UI; natural-language spending description → explained recommendations (transparent rule-based NLU)
8. **User Accounts** — JWT auth, saved cards/favourites, recommendation history
9. **Financial Education Hub** — articles on credit scores, fees, responsible use, mistakes
10. **Admin Dashboard** — add/edit/delete cards (admin role)
11. **Analytics Dashboard** — most viewed/compared cards, search trends, engagement metrics
12. **SEO** — metadata, sitemap, robots

## Run locally
```bash
npm install
npm run dev        # http://localhost:3000
```

## Build
```bash
npm run build && npm run start
```

## Deploy (Vercel)
1. Push this folder to a GitHub repo (or use Vercel CLI / drag-drop).
2. Import into Vercel — it auto-detects Next.js, no config needed.
3. (Optional) set `AUTH_SECRET` env var to a strong random string for production JWTs.

## Notes
- The card dataset (`lib/seed.ts`, 35 cards) uses realistic approximations for education, **not** official bank terms.
- Demo convenience: registering with an email containing "admin" provisions an admin account so `/admin` is reachable.
- The data layer persists to a JSON file locally and to `/tmp` on Vercel. For real persistence, migrate `lib/repo.ts` to Postgres using `db/schema.sql`.

## Architecture
```
app/
  (pages)        home, explore, card/[slug], compare, calculator,
                 recommend, advisor, learn, login, account, admin, analytics
  api/           cards, recommend, calculate, advisor, analytics,
                 favorites, auth/*, admin/cards
components/      ui, header, shell, fav-button, theme-script
lib/
  types.ts       domain model
  seed.ts        35-card dataset + 4 articles
  engine.ts      reward valuation, eligibility, recommendation scoring
  repo.ts        repository layer (swap to Postgres here)
  auth.ts        JWT session + password hashing
db/schema.sql    reference PostgreSQL schema
```
