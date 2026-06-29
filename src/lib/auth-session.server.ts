/**
 * Server-only session validation.
 *
 * Split from auth-guard.ts because getToken requires a server-only import
 * (@tanstack/react-start/server) which cannot be in client-bundled modules.
 */
import { getToken } from '@/lib/auth-token.server'
import { decodeJwtSubject } from '@/lib/jwt-utils'
import { getSystemConvexClient } from '@/lib/convex-system-client'
import { internal } from '@convex/_generated/api'
import type { FunctionReference } from 'convex/server'

export async function hasValidSession(_request: Request): Promise<boolean> {
  try {
    const token = await getToken()
    return !!token
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[auth-guard] session check error:', err)
    }
    return false
  }
}

/**
 * Resolve the signed-in user's domain status server-side for the SSR auth
 * guard. Replaces the legacy `cohorts_status` cookie: with the official
 * Convex + Better Auth structure there are no custom session cookies, so the
 * `_authed` beforeLoad guard derives status from the Convex JWT subject
 * (= better-auth user id = domain `users.legacyId`) via the domain table.
 *
 * Returns `null` when the status can't be determined (no session, decode
 * failure, Convex unavailable, or no domain row yet). Callers treat `null` as
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
    // ConvexHttpClient.query expects a public reference; the internal query is
    // callable here because the system client authenticates with a deploy key.
    const result = await client.query(
      internal.users.getStatusByLegacyId as unknown as FunctionReference<'query'>,
      { legacyId },
    )
    if (!result) return null
    return result.status
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[auth-guard] status resolution error:', err)
    }
    return null
  }
}
