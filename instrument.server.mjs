import * as Sentry from '@sentry/tanstackstart-react'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV ?? 'development',
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  // Performance tracing — lower rate on the server
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  // Don't send PII
  sendDefaultPii: false,
})
