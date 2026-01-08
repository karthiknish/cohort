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

### Finance & Billing
- Accept payments via Stripe
- Auto-generate professional invoices
- Revenue dashboard and analytics
- Expense tracking per client
- Financial insights and cash flow predictions
- Self-serve subscription management with Stripe Checkout & Billing Portal

### Expense Management (MVP)
- Expense categories CRUD (Firestore-backed)
- Vendor management CRUD
- Expenses with cost types (fixed/variable/time/milestone/reimbursements)
- Receipt / image attachments via Firebase Storage (client uploads)
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
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Charts**: Recharts
- **UI Components**: Radix UI + Custom components
- **AI**: Google Gemini API
- **Payments**: Stripe
- **PDF Generation**: jsPDF
- **Real-time**: Socket.io

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

3. Configure your environment variables in `.env.local` (see `.env.local.example` for all required variables)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Protected dashboard routes
│   │   ├── analytics/     # Analytics dashboard
│   │   ├── clients/       # Client management
│   │   ├── tasks/         # Task management
│   │   ├── finance/       # Finance & billing
│   │   ├── proposals/     # Proposal generator
│   │   └── collaboration/ # Team communication
│   ├── auth/              # Authentication pages
│   └── api/               # API routes
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── navigation.tsx    # Navigation components
│   └── protected-route.tsx # Authentication wrapper
├── contexts/             # React contexts
│   └── auth-context.tsx  # Authentication context
├── services/             # External API services
│   ├── auth.ts           # Authentication service
│   ├── ads.ts            # Ad platform integrations
│   └── gemini.ts         # Gemini AI service
├── types/                # TypeScript type definitions
├── lib/                  # Utility libraries
├── hooks/                # Custom React hooks
└── utils/                # Helper functions
```

## Authentication & Security

- Firebase Authentication integration
- Role-based access control (Admin, Manager, Member)
- Protected routes and API endpoints
- Session management and automatic logout
- Secure API key handling

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
1. Build the application:
```bash
npm run build
```

2. Start production server:
```bash
npm start
```

### Stripe Setup

The in-app billing experience (Settings → Billing & Payments) relies on three subscription prices configured in your Stripe account.

1. Create the products and recurring prices you intend to sell (e.g. Starter, Growth, Scale).
2. Copy each price ID (`price_...`) into the corresponding environment variable:
	- `STRIPE_PRICE_STARTER_MONTHLY`
	- `STRIPE_PRICE_GROWTH_MONTHLY`
	- `STRIPE_PRICE_SCALE_MONTHLY`
3. Set your Stripe keys locally (`STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, and optionally `STRIPE_WEBHOOK_SECRET`) and in production.
4. Ensure `NEXT_PUBLIC_APP_URL` reflects the domain customers should return to after checkout/portal sessions.

Once configured, users can self-manage subscriptions, update payment methods, and download invoices directly from the Settings page.

### Firebase Setup

This project now includes hardened Firestore and Storage rules for production deployments.

1. Install the Firebase CLI and log in:
	```bash
	npm install -g firebase-tools
	firebase login
	```
2. Configure your service account credentials in the environment (locally via `.env.local`, and in your hosting provider as secrets):
	```bash
	FIREBASE_ADMIN_PROJECT_ID=your-project-id
	FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@your-project-id.iam.gserviceaccount.com
	FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
	```
	Alternatively, set `FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY` with the full JSON payload.
3. Enable Firebase Analytics by adding your GA4 measurement ID to `.env.local`:
	```bash
	NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
	```
	Without this value, client-side analytics logging will be skipped gracefully.
4. Deploy security rules once credentials are configured:
	```bash
	firebase deploy --only firestore:rules,firestore:indexes,storage:rules
	```
	The generated files (`firestore.rules`, `firestore.indexes.json`, `storage.rules`) match the application’s access patterns—users may only touch their own nested data, while administrative operations run through secured API routes using the Firebase Admin SDK.

#### Expense APIs (Finance)

- `GET /api/finance/expense-categories`
- `POST /api/finance/expense-categories` (admin)
- `PATCH /api/finance/expense-categories/:id` (admin)
- `DELETE /api/finance/expense-categories/:id` (admin)
- `POST /api/finance/expense-categories/seed-defaults` (admin)

- `GET /api/finance/vendors`
- `POST /api/finance/vendors` (admin)
- `PATCH /api/finance/vendors/:id` (admin)
- `DELETE /api/finance/vendors/:id` (admin)

- `GET /api/finance/expenses`
- `POST /api/finance/expenses`
- `PATCH /api/finance/expenses/:id`
- `POST /api/finance/expenses/:id` (status transitions)
- `DELETE /api/finance/expenses/:id`
- `GET /api/finance/expenses/report` (admin)

Receipt uploads use Firebase client SDK and store files under `users/{uid}/expenses/...`.

### Monitoring & Observability (Sentry)

Sentry is wired into both the client (`sentry.client.config.ts`) and every server runtime (`sentry.server.config.ts`, `sentry.edge.config.ts`, `instrumentation.ts`).

1. Add these variables to `.env.local` (and production secrets):
	- `SENTRY_DSN` (or `NEXT_PUBLIC_SENTRY_DSN` for client usage)
	- `SENTRY_EDGE_DSN` (optional edge-only DSN)
	- `SENTRY_TRACES_SAMPLE_RATE` (defaults to `0.1`)
	- `SENTRY_PROFILES_SAMPLE_RATE` (defaults to `0.1`, Node runtime only)
	- `SENTRY_ENVIRONMENT` (falls back to `NODE_ENV`)
	- `SENTRY_DEBUG` (`true` to enable verbose logging)
2. Rebuild the app so instrumentation is bundled:
	```bash
	npm run build
	```
3. Deploy as normal. `withSentryConfig` in `next.config.ts` enables automatic error and trace capture for API routes, server components, and edge handlers.

Tune sample rates per environment—e.g., heavier sampling in staging, lighter in production—simply by adjusting the env vars before releasing.

## License

This project is licensed under the MIT License.
