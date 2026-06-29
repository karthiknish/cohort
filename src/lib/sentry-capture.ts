/**
 * Centralized Sentry capture bridge.
 *
 * Keeps Sentry imports in one place so the rest of the codebase can report
 * errors without depending on the Sentry SDK directly. Falls back to a no-op
 * when the SDK is not initialized (e.g. during SSR before init, or in tests).
 */
import * as Sentry from '@sentry/tanstackstart-react'

let sdkActive = false

try {
  // Sentry.init is called in instrument.client.ts / instrument.server.mjs.
  // If the DSN is unset the SDK is effectively disabled, but the import
  // itself is safe to call.
  const publicDsn = process.env.NEXT_PUBLIC_SENTRY_DSN
  const serverDsn = typeof window === 'undefined' ? process.env.SENTRY_DSN : undefined
  sdkActive = Boolean(publicDsn || serverDsn)
} catch {
  sdkActive = false
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
  if (!sdkActive) return
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
  if (!sdkActive) return
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
  if (!sdkActive) return
  if (user) {
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
  if (!sdkActive) return
  Sentry.setTag(key, value)
}
