/**
 * Server-only session validation.
 *
 * Uses the official `getToken` from `convexBetterAuthReactStart` via
 * `@/lib/auth-server`. The token fetch is server-only (reads request cookies).
 */
import { getToken } from '@/lib/auth-server'
import { decodeJwtSubject } from '@/lib/jwt-utils'
import { getSystemConvexClient } from '@/lib/convex-system-client'
import { internal } from '@convex/_generated/api'
import { logError } from '@/lib/convex-errors'
import type { FunctionReference } from 'convex/server'

export async function hasValidSession(_request: Request): Promise<boolean> {
  try {
    const token = await getToken()
    return !!token
  } catch (err) {
    logError(err, '[auth-guard] session check error')
    return false
  }
}

/**
 * Resolve the signed-in user's domain status server-side for the SSR auth
 * guard. Derives status from the Convex JWT subject (= better-auth user id
 * = domain `users.legacyId`) via the domain table.
 *
 * Returns `null` when the status can't be determined. Callers treat `null` as
 * "no SSR redirect" and let the client `ProtectedRoute` gate handle it.
 */
export async function resolveUserStatus(): Promise<string | null> {
  try {
    const token = await getToken()
    if (!token) return null
    const legacyId = decodeJwtSubject(token)
    if (!legacyId) return null
    const client = getSystemConvexClient()
    if (!client) return null
    const result = await client.query(
      internal.users.getStatusByLegacyId as unknown as FunctionReference<'query'>,
      { legacyId },
    )
    if (!result) return null
    return result.status
  } catch (err) {
    logError(err, '[auth-guard] status resolution error')
    return null
  }
}
