import * as Sentry from '@sentry/tanstackstart-react'

const serverDsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN

/**
 * `beforeSend` for the server -- filters handled errors that are expected
 * application flow (404s, rate limits, auth failures from API routes) so
 * they don't create noise in Sentry.
 */
function beforeSend(event: Sentry.ErrorEvent): Sentry.ErrorEvent | null {
  // Drop 404 / NOT_FOUND errors -- these are almost always a bad URL, not a bug
  for (const exc of event.exception?.values ?? []) {
    const msg = exc.value ?? ''
    if (
      /NOT_FOUND/i.test(msg) ||
      /Route not found/i.test(msg) ||
      /ConvexError.*NOT_FOUND/i.test(msg)
    ) {
      return null
    }
  }
  return event
}

if (serverDsn) {
  Sentry.init({
    dsn: serverDsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? 'development',
    release: process.env.SENTRY_RELEASE ?? process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    // Performance tracing -- lower rate on the server
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? (process.env.NODE_ENV === 'production' ? '0.1' : '1.0')),
    // Don't send PII
    sendDefaultPii: false,
    beforeSend,
    // Filter handled server-side errors that are expected application flow
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
    ],
  })
}
