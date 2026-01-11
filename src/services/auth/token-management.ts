/**
 * Token management (legacy)
 *
 * Firebase ID tokens are no longer used after migrating to Better Auth.
 * Keep minimal helpers so any remaining imports continue to typecheck.
 */

import { UnauthorizedError } from '@/lib/api-errors'

export interface TokenCache {
  token: string
  expiresAt: number
}

export function cacheIdToken(): TokenCache {
  throw new UnauthorizedError('Bearer tokens are no longer supported; use cookie auth')
}

export async function fetchAndCacheIdToken(): Promise<string> {
  throw new UnauthorizedError('Bearer tokens are no longer supported; use cookie auth')
}
