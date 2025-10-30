# Cohorts Project Audit — 30 Oct 2025

## Executive Summary
- The app delivers a cohesive Next.js 16 + Firebase workspace covering analytics, tasks, finance, proposals, collaboration, chatbot, and billing flows.
- Core dashboards draw from Firestore via authenticated API routes, with Gemini/Gamma AI integrations powering analytics insights and proposal decks.
- Security posture improved: storage rules restrict proposal assets, admin APIs guard cost mutations, and client context scoping is consistent. Verification still relies on REST token lookups per request.
- Significant gaps remain around automated testing, env configuration, observability, and parity between README claims and actual feature depth (e.g., Stripe flows stubbed, real-time chat not implemented).
- Focus next on tightening production readiness: tests, environment scaffolding, dependency hygiene, documentation updates, and hardening long-running AI/cron workflows.

## Feature Coverage Against Prior Requests
| Requirement | Status | Notes |
| --- | --- | --- |
| Split finance dashboard into modular components | ✅ | Implemented via `src/app/dashboard/finance/components/*` with shared hook `use-finance-data`. |
| Split collaboration dashboard & collapsible sidebar | ✅ | Modular layout in `collaboration/components` with `Sidebar` toggle (`components/navigation.tsx`). |
| Sidebar collapsible & responsive | ✅ | State-driven collapse in `components/navigation.tsx` (`Sidebar`). |
| Settings page profile editing incl. phone | ✅ | `src/app/settings/page.tsx` updates name/phone via `updateProfile`. |
| Cache auth session to avoid repeated ID token fetches | ✅ | `use-collaboration-data.ts` caches tokens + cookie fallback. |
| Integrate Gamma API via Gemini prompts | ✅ | `src/app/api/proposals/[id]/submit/route.ts` orchestrates Gemini summary + Gamma PPTX generation and storage. |
| Remove PDF generation & store PPTX in Firebase Storage | ✅ | PPTX stored by `storeProposalPresentation(...)`, PDF optional metadata only. |
| Harden Firebase Storage rules for proposals | ✅ | `storage.rules` enforces ownership, size, content-type, download tokens. |
| Run feature audit & produce completeness report | ⚠️ | This document satisfies analysis scope; README/docs still need updates to reflect findings. |

## Architecture Overview
- **Framework**: Next.js 16 App Router with client/server components, TypeScript, Tailwind 4.
- **State**: Auth via `AuthProvider` (`contexts/auth-context.tsx`), client scoping via `ClientProvider`.
- **Data layer**: Server APIs under `src/app/api/*` read/write Firestore/Storage via `lib/firebase-admin.ts`. Client services wrap authenticated fetches (e.g., `services/finance.ts`, `services/proposals.ts`).
- **AI integrations**: Gemini service (`services/gemini.ts`) centralizes content generation; Gamma wrapper (`services/gamma.ts`) handles presentation creation/polling.
- **UI composition**: Dashboard modules share shadcn-inspired UI primitives in `components/ui`. Each vertical (analytics, tasks, finance, collaboration, proposals) isolates concerns into hooks + presentational components.
- **Security**: API routes guard with `authenticateRequest` (`lib/server-auth.ts`); admin-only actions gated via `assertAdmin` + env `ADMIN_EMAILS`. Storage rules restrict proposal uploads.

## Module Findings
### Analytics (`src/app/dashboard/analytics/page.tsx`)
- Fetches metrics and Gemini-powered insights via SWR, scoped by client selection. Charting uses Recharts with derived aggregates.
- API routes (`api/metrics`, `api/analytics/insights`) assume Firestore `adMetrics` population via external sync jobs; doc `docs/integrations.md` outlines expected ingestion but no job runner is present.
- README promises TikTok integration and budget allocation visuals; code currently supports Google/Meta/LinkedIn labels, with Creative breakdown limited to Meta. Consider updating marketing copy or expanding support.

### Tasks (`src/app/dashboard/tasks/page.tsx`)
- CRUD limited to fetch + create; no update/delete endpoints. Form uses client context for default client selection and toasts for feedback.
- API (`api/tasks/route.ts`) enforces auth, basic zod validation, but lacks pagination and background processing. Firestore doc structure straightforward; consider indexing for clientId/status queries.

### Finance (`src/app/dashboard/finance/*`)
- Hook centralizes fetch, memoized derivations, and cost mutations; components render modular sections (stats, charts, invoices, upcoming payments). Skeleton handles initial load gracefully.
- API `GET /api/finance` aggregates revenue, invoices, costs with simple filtering; `POST/DELETE /api/finance/costs` requires admin role.
- Observed gap: `selectedPeriod` currently affects UI helper text only; backend ignores period filtering.

### Proposals (`src/app/dashboard/proposals/page.tsx`)
- Wizard merges form state via `mergeProposalForm`, autosave flows (via `services/proposals.ts`), and submission triggers Gemini summary + Gamma PPT storage. History view surfaces `pptUrl` + Gamma share links.
- API `submit` route handles summarization errors gracefully, preserving previous deck URLs if storage fails. Consider rate limiting / idempotency for repeated submissions.

### Collaboration (`src/app/dashboard/collaboration/*`)
- Channel list, message pane, and sidebar modularized; session token cache reduces repeated `getIdToken` calls, storing tokens in cookies for reuse.
- Messaging endpoints under `api/collaboration/messages` (not reviewed in depth) should be validated for rate limiting and persistence; README claims real-time chat but no Socket.IO usage—messaging appears request/response only.

### Settings & Billing (`src/app/settings/page.tsx`)
- Profile update form now edits name/phone with validation and toasts.
- Billing section expects `/api/billing/*` routes to return Stripe plan/subscription data; requires environment setup. README states Stripe payments operational, but code depends on yet-to-be-verified backend logic.

### Chatbot (`components/chatbot.tsx`, `services/chatbot.ts`)
- Chat widget shells Gemini responses into JSON instructions for suggestions/actions. Error handling provides fallback text. No server-side conversation storage; purely session-based.

### Docset
- Existing integration doc (`docs/integrations.md`) provides clear data sync blueprint. Newly added `docs/finance-dashboard.md` explains finance architecture.
- README still advertises legacy features (PDF generation, real-time Socket.io) inconsistent with current code.

## Security & Compliance Observations
- **Auth verification**: `authenticateRequest` calls Google Identity Toolkit for each request. Works but incurs latency and quota; consider caching decoded tokens or switching to Admin SDK `verifyIdToken` for efficiency.
- **Admin gating**: `assertAdmin` falls back to `ADMIN_EMAILS` list if custom claim absent. Ensure env configured; otherwise cost mutations inaccessible.
- **Storage rules**: Strengthened to enforce owner uploads with type/size checks (`storage.rules`). Ensure Firestore rules receive similar review (not included in repo snapshot).
- **Secrets**: Multiple env vars (Gamma, Gemini, Stripe, Firebase Admin) required; `.env.local.example` referenced in README but missing.
- **Cron access**: APIs support `INTEGRATIONS_CRON_SECRET`, yet no background worker included. Documented but unimplemented.

## Documentation, DX, & Tooling
- README overstates functionality (Stripe payments, real-time chat, jsPDF) and references non-existent `.env.local.example`. Needs alignment with current stack (Gamma PPTX, token caching, etc.).
- Dependencies include unused packages (e.g., `socket.io`, `jspdf`, `axios`), increasing bundle size risk; audit `package.json`.
- No testing framework configured (no Jest/Vitest/Playwright). `npm run lint` is only quality gate.
- Lack of scripts for seeding Firestore or running cron jobs; onboarding requires additional guidance.

## Testing & Observability
- Unit/integration tests absent across modules. Hooks/services interacting with Firestore and AI lack mocks or contract tests.
- No logging/monitoring beyond `console.error`. Consider structured logging and error reporting (e.g., Sentry) before production rollout.
- Edge cases (AI failures, missing env vars, large uploads) partially handled with toasts but not covered by automated tests.

## Risks & Gaps
- **AI/External dependency resilience**: Gamma/Gemini failures degrade gracefully but there is no retry/backoff or user re-queue mechanism.
- **Data freshness**: Analytics relies on external sync jobs not present in repo; without them dashboards will stay empty.
- **Auth token reuse**: Collaboration cookie cache stores raw Firebase token client-side; ensure token TTL respected and refresh triggered before expiry.
- **Billing flows**: Stripe endpoints must be validated; absence of webhook handling implies manual reconciliation.
- **Docs drift**: README promises features not currently backed by code; can mislead stakeholders.

## Recommendations & Next Steps
1. **Testing foundation**: Introduce Vitest/Jest for hooks/services and Playwright for key flows (auth, proposals, finance). Focus first on `use-finance-data`, `proposals` submission, and API routes.
2. **Documentation refresh**: Update README to reflect Gamma PPT workflow, remove jsPDF references, enumerate required env vars, and link to `docs/finance-dashboard.md` / `docs/integrations.md`. Add `.env.local.example`.
3. **Dependency audit**: Remove unused packages (`socket.io`, `jspdf`, `axios` unless planned) and lock versions that align with Next 16/Tailwind 4 maturity.
4. **Background jobs**: Implement cron worker or Cloud Function for `adMetrics` ingestion per `docs/integrations.md`, including retries and logging.
5. **Security hardening**: Migrate auth verification to Admin SDK token checks, ensure `ADMIN_EMAILS` configured, and add Firestore rules matching access patterns.
6. **Observability**: Add structured logging and error tracking for AI/services; consider queuing for long-running AI deck generation.
7. **Feature parity**: Either implement promised real-time chat/Stripe automations or adjust go-to-market messaging to avoid expectation gaps.
8. **Performance**: Evaluate SWR caching strategies, pagination for tasks/metrics, and memoization for large datasets before scaling user counts.

This audit should equip contributors with a clear map of the current system, its strengths, and the work required to productionize the Cohorts platform.
