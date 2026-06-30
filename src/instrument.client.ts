import * as Sentry from '@sentry/tanstackstart-react'

const clientDsn = process.env.NEXT_PUBLIC_SENTRY_DSN

/**
 * Query-string keys that may carry secrets. Stripped from Sentry request
 * URLs and breadcrumb URLs so tokens / OAuth codes never leave the browser.
 */
const SENSITIVE_QUERY_KEYS = [
  'token',
  'access_token',
  'refresh_token',
  'id_token',
  'code',
  'oobCode',
  'password',
  'reset',
  'key',
  'apiKey',
  'api_key',
  'secret',
  'session',
  'authorization',
]

function scrubUrl(rawUrl: string | undefined): string | undefined {
  if (!rawUrl) return rawUrl
  try {
    const url = new URL(rawUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
    let modified = false
    for (const key of SENSITIVE_QUERY_KEYS) {
      if (url.searchParams.has(key)) {
        url.searchParams.set(key, '[Filtered]')
        modified = true
      }
    }
    // Also scrub hash fragments that look like tokens (OAuth implicit flow)
    if (url.hash.length > 1 && /[?&](access_token|id_token|token)=/.test(url.hash)) {
      url.hash = '#[Filtered]'
      modified = true
    }
    return modified ? url.toString() : rawUrl
  } catch {
    // Not a parseable URL -- return as-is so we don't lose the breadcrumb entirely
    return rawUrl
  }
}

/**
 * `beforeSend` -- last-chance filtering and PII scrubbing before an event
 * is sent to Sentry. Returning `null` drops the event entirely.
 */
function beforeSend(event: Sentry.ErrorEvent): Sentry.ErrorEvent | null {
  // --- Drop deployment noise: chunk-load / dynamic-import failures ---
  // These happen when a user's browser has a stale build cached after a
  // deploy. The fix is to refresh -- not actionable for developers.
  for (const exc of event.exception?.values ?? []) {
    const msg = exc.value ?? ''
    if (
      /Loading chunk \d+ failed/i.test(msg) ||
      /Loading CSS chunk \d+ failed/i.test(msg) ||
      /Failed to fetch dynamically imported module/i.test(msg) ||
      /Importing a module script failed/i.test(msg)
    ) {
      return null
    }
  }

  // --- Scrub sensitive query params from request URLs ---
  if (event.request?.url) {
    event.request.url = scrubUrl(event.request.url) ?? event.request.url
  }

  // --- Scrub sensitive query params from breadcrumbs ---
  if (event.breadcrumbs) {
    for (const crumb of event.breadcrumbs) {
      if (crumb.data?.url) {
        crumb.data.url = scrubUrl(crumb.data.url as string) ?? crumb.data.url
      }
      if (crumb.data?.from) {
        crumb.data.from = scrubUrl(crumb.data.from as string) ?? crumb.data.from
      }
      if (crumb.data?.to) {
        crumb.data.to = scrubUrl(crumb.data.to as string) ?? crumb.data.to
      }
    }
  }

  return event
}

if (typeof window !== 'undefined' && clientDsn) {
  Sentry.init({
    dsn: clientDsn,
    environment: process.env.NODE_ENV ?? 'development',
    // The Sentry Vite plugin injects SENTRY_RELEASE at build time; fall back
    // to the Next.js-style public var for parity with the server init.
    release: process.env.SENTRY_RELEASE ?? process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    integrations: [
      Sentry.replayIntegration({
        // Privacy-first replay defaults -- keep errors and DOM structure, but mask content.
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Capture 10% of sessions for replay, 100% of sessions with errors
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    // Performance tracing -- sample 10% in production, 100% in dev
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Don't send PII
    sendDefaultPii: false,
    beforeSend,
    // Filter out noisy errors. Strings are substring-matched against the
    // error message -- keep these specific to avoid swallowing real bugs.
    ignoreErrors: [
      // Browser extensions / third-party scripts
      'top.GLOBALS',
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      // Network errors that the UI already handles via toast/alert
      'Network request failed',
      'Failed to fetch',
      // Convex auth polling -- the SDK polls /api/auth/session on an interval
      // and 401s are expected when the session expires. Match the specific
      // Convex error message, NOT the generic word "Unauthorized" which would
      // also swallow real auth/permission bugs.
      /ConvexError.*UNAUTHORIZED/i,
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
