# Cohorts - Marketing Agency Dashboard

A comprehensive Next.js application for marketing agencies to manage clients, track ad performance, handle tasks, manage finances, create proposals, and collaborate with teams.

## Features

### Client Management & Analytics Dashboard
- Real-time data sync from Google Ads, Meta Ads, TikTok Ads, LinkedIn Ads
- Display Budget, CPC, Clicks, Conversion Rate, Leads, CPL, Revenue, ROAS
- Time filters: Daily, Weekly, Monthly
- Interactive graphs and charts for CTR, CPC, ROI
- Pie charts for budget allocation
- KPI summary tables

### Task & Team Management
- Assign and track tasks across teams and clients
- Integration with Slack, Outlook, WhatsApp
- Dashboard showing current work assignments
- AI-powered team productivity summaries
- Automated follow-ups and smart task suggestions

### Finance
- Revenue dashboard and analytics
- Expense tracking per client
- Financial insights and cash flow predictions

### Expense Management (MVP)
- Expense categories CRUD (Convex-backed API routes)
- Vendor management CRUD
- Expenses with cost types (fixed/variable/time/milestone/reimbursements)
- Receipt / image attachments via Convex R2 (scoped file access)
- Basic approval workflow (submit → approve/reject → mark paid)
- Expense reports grouped by employee

### Proposal Generator
- Dynamic form to collect client information
- AI-powered proposal content generation
- PDF document creation and export
- Automated email sending capabilities

### Collaboration & Communication
- Real-time chat and messaging
- Centralized file storage
- Multi-channel notifications (Slack/WhatsApp/Email)
- Meeting summary generation
- Sentiment analysis on communications

### Gemini AI Integration
- Analyze ad data and generate performance summaries
- Predictive recommendations for budget optimization
- Automated insights and weak KPI identification
- Forecast capabilities and trend analysis

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Backend**: [Convex](https://www.convex.dev/) (queries, mutations, actions, cron)
- **Auth**: [Better Auth](https://www.better-auth.com/) via `@convex-dev/better-auth`
- **Files**: Cloudflare R2 (`@convex-dev/r2`)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **UI**: Radix UI + shared design system under `src/shared/ui`
- **AI**: Google Gemini API
- **PDF / decks**: jsPDF, Gamma integration

See [docs/engineering-guardrails.md](docs/engineering-guardrails.md) for CI commands and [docs/convex-architecture.md](docs/convex-architecture.md) for backend layout.

## Installation

1. Install dependencies:
```bash
bun install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

3. Configure your environment variables in `.env.local` (see `.env.local.example` for all required variables)

4. Run the development server:
```bash
bun run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js App Router (pages, API routes)
├── features/            # Product domains (dashboard, admin, settings, …)
├── shared/              # UI primitives, contexts, hooks
├── lib/                 # App utilities, Convex client helpers
├── services/            # External API clients (ads, integrations)
└── types/               # Shared TypeScript types

convex/
├── schema/              # Table definitions (modular)
├── lib/                 # Shared server helpers
├── agentActions/        # Agent runtime
├── adsIntegrations/     # Ads provider wiring
└── *.ts                 # Functions (migrating to domain folders — see docs)
```

## Authentication & Security

- Better Auth + Convex session validation
- Role-based access control (admin, team, client roles)
- Workspace-scoped Convex wrappers (`zWorkspaceQuery`, `zWorkspaceMutation`, `zWorkspaceAction`)
- CSP and security headers in `next.config.ts`
- Scoped file URLs (`convex/files.ts` + `convex/lib/storageAccess.ts`)

## Quality checks

```bash
bun run ci:check   # lint (src + convex) + typecheck + convex:typecheck
bun run test       # Vitest
bun run ci:build   # Next.js production build
```

Do not rely on root `*_output.txt` files — they are not part of CI. See [docs/engineering-guardrails.md](docs/engineering-guardrails.md).

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
1. Build the application:
```bash
bun run build
```

2. Start production server:
```bash
bun run start
```

### Convex Setup

Your Convex endpoints:

- Dev deployment URL: `https://grand-sparrow-698.convex.cloud`
- Dev HTTP Actions URL: `https://grand-sparrow-698.convex.site`
- Prod deployment URL: `https://deafening-impala-890.convex.cloud`
- Prod HTTP Actions URL: `https://deafening-impala-890.convex.site`

1. Add your *dev* values to `.env.local` (and set the *prod* values in your hosting provider env vars):
	```bash
	NEXT_PUBLIC_CONVEX_URL=https://grand-sparrow-698.convex.cloud
	NEXT_PUBLIC_CONVEX_HTTP_URL=https://grand-sparrow-698.convex.site
	CONVEX_DEPLOYMENT=grand-sparrow-698
	```
2. Start Convex in dev (first run will prompt you to log in/link the project):
	```bash
	bun run convex:dev
	```
3. Deploy Convex functions:
	```bash
	bun run convex:deploy
	```

The app uses `ConvexProvider` (see `src/shared/contexts/` and app layout). Client calls go through `src/lib/convex-api.ts`.

### Better Auth

Better Auth stores users/sessions in Convex via the official component.

- Convex component registration: [convex/convex.config.ts](convex/convex.config.ts)
- Convex Better Auth config: [convex/auth.config.ts](convex/auth.config.ts)
- Convex Better Auth instance + helpers: [convex/auth.ts](convex/auth.ts)
- Convex HTTP routes for auth: [convex/http.ts](convex/http.ts)
- Next.js proxy handler: [src/app/api/auth/%5B...all%5D/route.ts](src/app/api/auth/%5B...all%5D/route.ts)
- Next.js utilities: [src/lib/auth-server.ts](src/lib/auth-server.ts)
- Client auth client: [src/lib/auth-client.ts](src/lib/auth-client.ts)

Env vars (Next.js):
- `NEXT_PUBLIC_CONVEX_URL` (ends in `.convex.cloud`)
- `NEXT_PUBLIC_CONVEX_SITE_URL` (ends in `.convex.site`)
- `NEXT_PUBLIC_SITE_URL` (e.g. `http://localhost:3000`; **required in production** — auth proxy fails fast if missing)
- Optional: `NEXT_PUBLIC_USE_BETTER_AUTH=true` (enables client-side syncing of `cohorts_role`/`cohorts_session_expires`)
- Optional: `NEXT_PUBLIC_SCREEN_RECORDING_ENABLED=true` (forces sample data across dashboard and for-you surfaces and hides the preview banner for recordings/demo sessions). Server-only `SCREEN_RECORDING_ALLOW_AUTH_BYPASS` can skip the session gate on **non–production-Vercel** deploys only — see [docs/security-and-env.md](docs/security-and-env.md)

Env vars (Convex dashboard / `bunx convex env set`):
- `BETTER_AUTH_SECRET` (>= 32 chars)
- `SITE_URL` (must exactly match the browser origin: scheme + host + port, no trailing slash)
- `BETTER_AUTH_URL` (optional; same value as `SITE_URL` on production)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (if using Google sign-in)
- Optional on Vercel previews: `VERCEL_URL` / `VERCEL_BRANCH_URL` are read on Convex when set

**Production parity:** Convex `SITE_URL` must equal Vercel `NEXT_PUBLIC_SITE_URL`. List prod Convex env with `npx convex env list --prod`.

**Smoke test** (replace with your deployment + live domain):

```bash
# Convex auth layer (expect 200 + null session, or 401 — not 500)
curl -si -H "Origin: https://YOUR_LIVE_DOMAIN" \
  "https://YOUR_DEPLOYMENT.convex.site/api/auth/get-session"

# Health (no secrets): baseURL + trustedOriginCount
curl -si "https://YOUR_DEPLOYMENT.convex.site/api/auth/ok"

# Via Next.js proxy
curl -si "https://YOUR_LIVE_DOMAIN/api/auth/get-session"
```

If you see HTTP 500 with *"Your request couldn't be completed"*, check Convex logs for `[betterAuth] BETTER_AUTH_SECRET`, HTTPS/`SITE_URL` errors, or a missing trusted origin (www vs apex). Vercel logs show `[auth-server] Convex auth … → 500` with parsed `code` / `message`.

### Legacy Firebase

Firebase is **not** the canonical stack. Historical setup notes live in [docs/archive/firebase-legacy.md](docs/archive/firebase-legacy.md).

#### Expense APIs (Finance)

Finance routes under `/api/finance/*` (categories, vendors, expenses, reporting) use Convex-backed handlers where migrated.

### Monitoring & Observability (Sentry)

Sentry is wired into this TanStack Start app via `src/instrument.client.ts`, `instrument.server.ts`, `src/client.tsx`, `src/server.ts`, and the `sentryTanstackStart(...)` Vite plugin in `vite.config.mts`. The server instrument file uses a `.ts` extension (not `.mjs`) so Vite's SSR pipeline processes it correctly and inlines environment variables.

1. Add these variables to local env files and production secrets:
	- `NEXT_PUBLIC_SENTRY_DSN` for browser events
	- `SENTRY_DSN` for server events (falls back to `NEXT_PUBLIC_SENTRY_DSN` if unset)
	- `SENTRY_AUTH_TOKEN` to enable production source map uploads during builds
	- `SENTRY_ORG` / `SENTRY_PROJECT` if you want to override the default build-plugin target
	- `SENTRY_TRACES_SAMPLE_RATE` (optional server trace sampling override; defaults to `0.1` in production)
	- `SENTRY_ENVIRONMENT` / `SENTRY_RELEASE` (optional server metadata overrides)
	- `NEXT_PUBLIC_SENTRY_RELEASE` (optional client release tag)
2. Rebuild the app so instrumentation and source maps are bundled:
	```bash
	bun run build:start
	```
3. Deploy as normal. The Vite Sentry plugin uploads source maps when `SENTRY_AUTH_TOKEN` is set.

Note: this repo does **not** use Next.js `withSentryConfig`, `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, or `instrumentation.ts`.

## License

This project is licensed under the MIT License.
