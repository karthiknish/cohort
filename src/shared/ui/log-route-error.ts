'use client';

import { useEffect, useEffectEvent } from 'react'
import { logError } from '@/lib/convex-errors'

/**
 * Log route segment errors from Next.js error boundaries (no toast).
 */
export function logRouteError(
  error: Error & {
    digest?: string
    componentStack?: string
  },
  segment: string,
): void {
  logError(error, { segment, digest: error.digest })
}

/** Logs when `error` changes — use instead of an effect in the error page component. */
export function RouteErrorLogger({
  error,
  segment,
}: {
  error: Error & { digest?: string; componentStack?: string }
  segment: string
}) {
  const log = useEffectEvent(() => {
    logRouteError(error, segment)
    if (typeof error.componentStack === 'string' && error.componentStack.length > 0) {
      logError(error, { segment, componentStack: error.componentStack })
    }
  })

  useEffect(() => {
    log()
  }, [error, segment])

  return null
}
