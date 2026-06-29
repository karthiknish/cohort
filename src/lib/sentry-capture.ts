/**
 * Centralized Sentry capture bridge.
 *
 * Keeps Sentry imports in one place so the rest of the codebase can report
 * errors without depending on the Sentry SDK directly. Falls back to a no-op
 * when the SDK is not initialized (e.g. during SSR before init, or in tests).
 */
import * as Sentry from '@sentry/tanstackstart-react'

/**
 * Returns true only when the Sentry SDK has actually been initialized via
 * `Sentry.init()`. This is more reliable than checking for the DSN env var
 * at module load time -- if init failed, was skipped, or hasn't run yet,
 * `getClient()` returns `undefined` and we correctly skip capture calls.
 */
function isSdkActive(): boolean {
  return Boolean(Sentry.getClient())
}

/**
 * Report an error to Sentry with optional context tags.
 * Safe to call from client or server code.
 */
export function captureError(
  error: unknown,
  context?: {
    tags?: Record<string, string | number | boolean>
    extra?: Record<string, unknown>
    level?: 'error' | 'warning' | 'info'
  },
): void {
  if (!isSdkActive()) return
  Sentry.captureException(error, {
    tags: context?.tags,
    extra: context?.extra,
    level: context?.level ?? 'error',
  })
}

/**
 * Report a structured message/event to Sentry.
 */
export function captureMessage(
  message: string,
  level: 'error' | 'warning' | 'info' = 'info',
  context?: {
    tags?: Record<string, string | number | boolean>
    extra?: Record<string, unknown>
  },
): void {
  if (!isSdkActive()) return
  Sentry.captureMessage(message, {
    level,
    tags: context?.tags,
    extra: context?.extra,
  })
}

/**
 * Set the authenticated user context on the Sentry scope so subsequent
 * errors are attributed correctly. Pass `null` to clear.
 */
export function setSentryUser(user: {
  id: string
  email?: string
  role?: string
} | null): void {
  if (!isSdkActive()) return
  if (user) {
    // Only set the id -- email/role are intentionally omitted from the user
    // object to avoid PII, but role is attached as a tag for filtering.
    Sentry.setUser({
      id: user.id,
    })
    Sentry.setTag('user_role', user.role ?? 'unknown')
  } else {
    Sentry.setUser(null)
    Sentry.setTag('user_role', 'anonymous')
  }
}

/**
 * Set a tag on the Sentry scope (applies to all subsequent events).
 */
export function setSentryTag(key: string, value: string | number | boolean): void {
  if (!isSdkActive()) return
  Sentry.setTag(key, value)
}
