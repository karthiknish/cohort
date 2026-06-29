import * as Sentry from '@sentry/tanstackstart-react'

const serverDsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN

if (serverDsn) {
  Sentry.init({
    dsn: serverDsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? 'development',
    release: process.env.SENTRY_RELEASE ?? process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    // Performance tracing — lower rate on the server
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? (process.env.NODE_ENV === 'production' ? '0.1' : '1.0')),
    // Don't send PII
    sendDefaultPii: false,
  })
}
