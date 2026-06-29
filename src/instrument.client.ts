import * as Sentry from '@sentry/tanstackstart-react'

if (typeof window !== 'undefined') {
  console.log('[Sentry] instrument.client.ts executing, dsn:', process.env.NEXT_PUBLIC_SENTRY_DSN ? 'set' : 'unset')
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV ?? 'development',
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  integrations: [
    Sentry.replayIntegration({
      // Mask text in inputs but show everything else for debugging
      maskAllText: false,
      blockAllMedia: false,
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
