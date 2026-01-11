import { NextRequest } from 'next/server'

export interface AuthResult {
  uid: string | null
  email: string | null
  name: string | null
  claims: Record<string, unknown>
  isCron: boolean
}

import { ApiError } from './api-errors'
import { ConvexHttpClient } from 'convex/browser'

import { getToken as getConvexBetterAuthToken } from '@convex-dev/better-auth/utils'

class AuthenticationError extends ApiError {
  constructor(message: string, status = 401) {
    super(message, status, 'UNAUTHORIZED')
  }
}


async function tryVerifyBetterAuthSession(request: NextRequest): Promise<AuthResult | null> {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
  const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL ?? process.env.NEXT_PUBLIC_CONVEX_HTTP_URL
  if (!convexUrl || !convexSiteUrl) return null

  try {
    const tokenResult = await getConvexBetterAuthToken(convexSiteUrl, request.headers)
    const token = tokenResult?.token
    if (!token) return null

    const convex = new ConvexHttpClient(convexUrl, { auth: token })

    const user = (await convex.query('auth:getCurrentUser' as any, {})) as
      | { id?: string; email?: string | null; name?: string | null }
      | null

    if (!user) return null

    const email = user.email ? String(user.email) : null
    const name = user.name ? String(user.name) : null

    if (!email) {
      return null
    }

    // Bridge strategy: map Better Auth sessions to a stable user ID.
    // Prefer Convex-migrated user profiles. If missing, create one in Convex.

    const normalizedEmail = email.toLowerCase()

    let resolvedUid: string | null = null
    let role: string | undefined
    let status: string | undefined
    let agencyId: string | undefined

    const betterAuthUserId = user.id ? String(user.id) : null

    try {
      const convexUser = (await convex.query('users:getByEmail' as any, {
        email: normalizedEmail,
      })) as
        | { legacyId: string; role?: string | null; status?: string | null; agencyId?: string | null }
        | null

      if (convexUser?.legacyId) {
        resolvedUid = String(convexUser.legacyId)
        role = typeof convexUser.role === 'string' ? convexUser.role : undefined
        status = typeof convexUser.status === 'string' ? convexUser.status : undefined
        agencyId = typeof convexUser.agencyId === 'string' ? convexUser.agencyId : undefined
      }
    } catch {
      // ignore and fall back
    }

    if (!resolvedUid && betterAuthUserId) {
      // Ensure the user exists in the Convex `users` table so role/status lookups
      // and legacy-id bridging are stable going forward.
      try {
        await convex.mutation('users:bulkUpsert' as any, {
          users: [
            {
              legacyId: betterAuthUserId,
              email: normalizedEmail,
              name,
            },
          ],
        })

        const convexUser = (await convex.query('users:getByEmail' as any, {
          email: normalizedEmail,
        })) as
          | { legacyId: string; role?: string | null; status?: string | null; agencyId?: string | null }
          | null

        if (convexUser?.legacyId) {
          resolvedUid = String(convexUser.legacyId)
          role = typeof convexUser.role === 'string' ? convexUser.role : role
          status = typeof convexUser.status === 'string' ? convexUser.status : status
          agencyId = typeof convexUser.agencyId === 'string' ? convexUser.agencyId : agencyId
        }
      } catch {
        // If we can't upsert, still allow auth with Better Auth user id.
      }
    }

    // Fallback to Better Auth user id if no profile exists yet.
    const uid = resolvedUid ?? betterAuthUserId
    if (!uid) return null

    if (!role) {
      const admins = (process.env.ADMIN_EMAILS ?? '')
        .split(',')
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean)

      role = admins.includes(normalizedEmail) ? 'admin' : 'client'
    }

    if (!status) {
      status = 'active'
    }

    return {
      uid,
      email,
      name,
      claims: {
        provider: 'better-auth',
        role,
        status,
        agencyId,
      },
      isCron: false,
    }
  } catch {
    // If Better Auth is configured but the request has no session, treat as unauthenticated.
    return null
  }
}


/**
 * Authenticates an incoming request.
  * Priority:
  * 1. System Cron Key (header)
  * 2. Better Auth session (cookies)
  */
export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  // 1. Check for Cron Key
  const cronSecret = process.env.INTEGRATIONS_CRON_SECRET
  const cronKey = request.headers.get('x-cron-key')

  if (cronSecret && cronKey && cronKey === cronSecret) {
    return { uid: null, email: null, name: 'System Cron', claims: {}, isCron: true }
  }

  // 2. Check for Better Auth session cookie
  const betterAuthResult = await tryVerifyBetterAuthSession(request)
  if (betterAuthResult) {
    return betterAuthResult
  }

  throw new AuthenticationError('Authentication required', 401)
}

export function assertAdmin(auth: AuthResult) {
  if (auth.isCron) return

  // Check custom claims
  const role = auth.claims?.role
  if (role === 'admin') {
    return
  }

  // Fallback to email whitelist
  const admins = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  if (!auth.email || !admins.includes(auth.email.toLowerCase())) {
    throw new AuthenticationError('Admin access required', 403)
  }
}

export { AuthenticationError }
