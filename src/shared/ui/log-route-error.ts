'use client'

import { logError } from '@/lib/convex-errors'

/**
 * Log route segment errors from Next.js error boundaries (no toast).
 */
export function logRouteError(error: Error & { digest?: string }, segment: string): void {
  logError(error, `RouteError:${segment}`)
  if (typeof error.digest === 'string' && error.digest.length > 0) {
    console.error(`[RouteError:${segment}] digest:`, error.digest)
  }
}
