import * as Sentry from '@sentry/nextjs'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
const tracesSampleRate = Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1')
const profilesSampleRate = Number(process.env.NEXT_PUBLIC_SENTRY_PROFILES_SAMPLE_RATE ?? process.env.SENTRY_PROFILES_SAMPLE_RATE ?? '0.1')
const replaysSessionSampleRate = Number(process.env.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE ?? '0')
const replaysOnErrorSampleRate = Number(process.env.NEXT_PUBLIC_SENTRY_REPLAYS_ERROR_SAMPLE_RATE ?? '1')

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: process.env.NEXT_PUBLIC_RUNTIME_ENV ?? process.env.NODE_ENV,
  tracesSampleRate,
  profilesSampleRate,
  replaysSessionSampleRate,
  replaysOnErrorSampleRate,
  integrations: (integrations) => integrations,
})
