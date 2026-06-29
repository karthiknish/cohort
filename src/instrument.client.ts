import * as Sentry from '@sentry/tanstackstart-react'

const clientDsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (typeof window !== 'undefined' && clientDsn) {
  Sentry.init({
    dsn: clientDsn,
    environment: process.env.NODE_ENV ?? 'development',
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    integrations: [
      Sentry.replayIntegration({
        // Privacy-first replay defaults — keep errors and DOM structure, but mask content.
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Capture 10% of sessions for replay, 100% of sessions with errors
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    // Performance tracing — sample 10% in production, 100% in dev
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Don't send PII
    sendDefaultPii: false,
    // Filter out noisy errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      // Network errors that the UI already handles
      'Network request failed',
      'Failed to fetch',
      // Convex auth polling
      'Unauthorized',
    ],
    denyUrls: [
      // Browser extensions
      /extensions\//i,
      /^chrome:\/\//i,
      // PostHog
      /posthog\.com/i,
    ],
  })
}
