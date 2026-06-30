/**
 * Server-side Sentry initialization.
 *
 * This module is imported by `src/start.ts` so that `Sentry.init()` runs
 * before any server middleware or server function executes. The Sentry
 * TanStack Start middleware (`sentryGlobalRequestMiddleware`,
 * `sentryGlobalFunctionMiddleware`) requires an initialized client to
 * actually capture events.
 *
 * Production-only: in development the DSN is intentionally left unset so
 * no events are sent, keeping the Sentry project clean and avoiding noise.
 */
import * as Sentry from '@sentry/tanstackstart-react'

const serverDsn =
  process.env.SENTRY_DSN ??
  process.env.NEXT_PUBLIC_SENTRY_DSN ??
  process.env.VITE_SENTRY_DSN

const isProduction = process.env.NODE_ENV === 'production'

if (isProduction && serverDsn) {
  Sentry.init({
    dsn: serverDsn,
    environment: 'production',
    // The Sentry Vite plugin injects SENTRY_RELEASE at build time.
    release: process.env.SENTRY_RELEASE ?? process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    // Server-side traces — sample 10% in production
    tracesSampleRate: 0.1,
    // Don't send PII
    sendDefaultPii: false,
    // Filter noisy non-actionable errors (shared with client init)
    ignoreErrors: [
      'top.GLOBALS',
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'Network request failed',
      'Failed to fetch',
      /ConvexError.*UNAUTHORIZED/i,
    ],
  })
}
