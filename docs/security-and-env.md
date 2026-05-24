# Security and environment

Operational switches that affect auth, HTML injection, and CI must be understood before changing env vars.

## Screen recording and preview mode

| Variable | Scope | Effect |
|----------|-------|--------|
| `NEXT_PUBLIC_SCREEN_RECORDING_ENABLED` | Public (build-time) | Forces sample/preview data on dashboard and for-you surfaces; hides the preview banner |
| `SCREEN_RECORDING_ALLOW_AUTH_BYPASS` | Server only | When screen recording is on **and** this is `true`/`1`, the Next.js proxy skips the session gate for `/dashboard/*` and `/for-you/*` |

**Auth bypass rules**

- **Local dev** (`NODE_ENV !== 'production'`): bypass is on whenever screen recording is enabled (no extra flag).
- **Production Vercel** (`VERCEL_ENV=production`): bypass is **never** allowed, even if both flags above are set. Use a Vercel preview deployment or public preview routes (`?preview=1` on allowlisted paths — see `src/lib/preview-data/utils.ts`).
- **Other production builds** (e.g. self-hosted): bypass requires both `NEXT_PUBLIC_SCREEN_RECORDING_ENABLED` and `SCREEN_RECORDING_ALLOW_AUTH_BYPASS`. Treat this as break-glass only.

**Safer alternatives for demos**

- Allowlisted preview URLs with `?preview=1` (no session bypass).
- Vercel preview deployment with screen-recording flags (bypass allowed only when `VERCEL_ENV` is not `production`).

Implementation: `proxy.ts` (session gate), `src/lib/preview-data/utils.ts`.

## Better Auth / app origin

The Next.js auth proxy rewrites Convex `*.convex.site` URLs to the app origin for OAuth.

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_CONVEX_URL` | Yes | `.convex.cloud` deployment URL |
| `NEXT_PUBLIC_CONVEX_SITE_URL` or `NEXT_PUBLIC_CONVEX_HTTP_URL` | Yes | `.convex.site` HTTP URL |
| `NEXT_PUBLIC_SITE_URL` or `NEXT_PUBLIC_APP_URL` | **Yes in production** | Must match the browser origin (scheme + host + port, no trailing slash) |

In production, missing site URL env vars cause `auth-server.ts` to throw at startup instead of defaulting to `http://localhost:3000`.

Convex dashboard must set `SITE_URL` to the same value as `NEXT_PUBLIC_SITE_URL`.

## CI environment (`config/ci.env`)

GitHub Actions copies `config/ci.env` → `.env.local` before `ci:check` / `ci:test` / `ci:build`.

- Values are **intentional placeholders** (`ci-*`, `ci.example.com`) so CI can typecheck and build without real secrets.
- **Do not** copy this file into staging or production `.env`.
- Prefer GitHub Actions secrets or deployment env UI for real credentials.

`bun run verify:ci-env` asserts placeholder shape before CI runs.

## Trusted HTML (`TrustedHtml`)

`TrustedHtml` / `createTrustedHtml` are **type markers only** — they do not sanitize HTML.

- Only pass HTML that is already escaped or from a trusted template.
- `sanitizeInput` in `src/lib/utils.ts` is for plain text, not HTML.
- Current use: collaboration code blocks after `highlightCode` escapes `&`, `<`, `>`.

## Health and debug

- `GET /api/health` — public liveness
- `GET /api/health/ready` — detailed; admin session or `HEALTH_CHECK_SECRET`
- Debug introspection is gated in production unless `ENABLE_DEBUG_INTROSPECTION=true` (see `src/lib/debug-introspection.ts`)
