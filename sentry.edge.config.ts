import * as Sentry from '@sentry/nextjs'

const dsn = process.env.SENTRY_EDGE_DSN ?? process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN
const tracesSampleRate = Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1')

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  tracesSampleRate,
  environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NEXT_PUBLIC_RUNTIME_ENV ?? process.env.NODE_ENV,
  debug: process.env.SENTRY_DEBUG === 'true',
})
