import type { NextRequest } from 'next/server'
import { cache } from 'react'
import { getToken as getBetterAuthToken } from '@convex-dev/better-auth/utils'

export interface AuthResult {
  uid: string | null
  email: string | null
  name: string | null
  claims: Record<string, unknown>
  isCron: boolean
}

import { ApiError } from './api-errors'
import { ConvexHttpClient } from 'convex/browser'
import { convexSiteUrl, getToken as getNextJsToken } from './auth-server'
import { api } from '../../convex/_generated/api'

class AuthenticationError extends ApiError {
  constructor(message: string, status = 401) {
    super(message, status, 'UNAUTHORIZED')
  }
}

const fetchCurrentUser = cache(async (convex: ConvexHttpClient) => {
  return (await convex.query(api.auth.getCurrentUser, {})) as
    | { id?: string; _id?: string; userId?: string; sub?: string; email?: string | null; name?: string | null }
    | null
})

const fetchUserByEmail = cache(async (convex: ConvexHttpClient, email: string) => {
  return (await convex.query(api.users.getByEmail, { email })) as
    | { legacyId: string; role?: string | null; status?: string | null; agencyId?: string | null }
    | null
})

type BetterAuthSessionUser = {
  id?: string
  _id?: string
  userId?: string
  sub?: string
  email?: string | null
  name?: string | null
  role?: string | null
  status?: string | null
  agencyId?: string | null
}

type BetterAuthSessionPayload = {
  user?: BetterAuthSessionUser | null
  session?: {
    activeOrganizationId?: string | null
  } | null
}

function readCookieClaim(request: NextRequest, name: string): string | undefined {
  const value = request.cookies.get(name)?.value
  if (typeof value !== 'string') {
    return undefined
  }

  const normalized = value.trim()
  return normalized.length > 0 ? normalized : undefined
}

async function fetchBetterAuthSession(request: NextRequest): Promise<BetterAuthSessionPayload | null> {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) {
    return null
  }

  const origin = request.nextUrl.origin
    || process.env.NEXT_PUBLIC_SITE_URL
    || process.env.NEXT_PUBLIC_APP_URL
    || 'http://localhost:3000'

  try {
    const headers = new Headers({
      accept: 'application/json',
      cookie: cookieHeader,
    })

    const userAgent = request.headers.get('user-agent')
    if (typeof userAgent === 'string' && userAgent.length > 0) {
      headers.set('user-agent', userAgent)
    }

    const response = await fetch(new URL('/api/auth/get-session?disableCookieCache=true', origin), {
      method: 'GET',
      headers,
      cache: 'no-store',
    })

    if (!response.ok) {
      return null
    }

    const payload = (await response.json().catch(() => null)) as unknown
    if (!payload || typeof payload !== 'object') {
      return null
    }

    const record = payload as BetterAuthSessionPayload
    return {
      user: record.user && typeof record.user === 'object' ? record.user : null,
      session: record.session && typeof record.session === 'object' ? record.session : null,
    }
  } catch {
    return null
  }
}

async function fetchConvexTokenFromBetterAuthRoute(request: NextRequest): Promise<string | null> {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) {
    return null
  }

  const origin = request.nextUrl.origin
    || process.env.NEXT_PUBLIC_SITE_URL
    || process.env.NEXT_PUBLIC_APP_URL
    || 'http://localhost:3000'

  try {
    const headers = new Headers({
      accept: 'application/json',
      cookie: cookieHeader,
    })

    const userAgent = request.headers.get('user-agent')
    if (typeof userAgent === 'string' && userAgent.length > 0) {
      headers.set('user-agent', userAgent)
    }

    const response = await fetch(new URL('/api/auth/convex/token', origin), {
      method: 'GET',
      headers,
      cache: 'no-store',
    })

    if (!response.ok) {
      return null
    }

    const payload = (await response.json().catch(() => null)) as { token?: unknown } | null
    const token = payload?.token
    return typeof token === 'string' && token.length > 0 ? token : null
  } catch {
    return null
  }
}

function buildAuthResultFromBetterAuthSession(
  request: NextRequest,
  sessionPayload: BetterAuthSessionPayload
): AuthResult | null {
  const user = sessionPayload.user
  if (!user || typeof user !== 'object') {
    return null
  }

  const uid = user.id ?? user._id ?? user.userId ?? user.sub ?? null
  if (!uid) {
    return null
  }

  const email = typeof user.email === 'string' ? user.email.toLowerCase() : null
  const name = typeof user.name === 'string' ? user.name : null

  const role =
    (typeof user.role === 'string' && user.role.length > 0 ? user.role : undefined)
    ?? readCookieClaim(request, 'cohorts_role')
    ?? 'client'

  const status =
    (typeof user.status === 'string' && user.status.length > 0 ? user.status : undefined)
    ?? readCookieClaim(request, 'cohorts_status')
    ?? 'pending'

  const agencyId =
    (typeof user.agencyId === 'string' && user.agencyId.length > 0 ? user.agencyId : undefined)
    ?? (typeof sessionPayload.session?.activeOrganizationId === 'string' && sessionPayload.session.activeOrganizationId.length > 0
      ? sessionPayload.session.activeOrganizationId
      : undefined)
    ?? readCookieClaim(request, 'cohorts_agency_id')

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
}

async function resolveBetterAuthToken(request: NextRequest): Promise<string | null> {
  try {
    const nextJsToken = await getNextJsToken()
    if (typeof nextJsToken === 'string' && nextJsToken.length > 0) {
      return nextJsToken
    }
  } catch {
    // Fall through to the raw request-header lookup below.
  }

  try {
    const tokenResult = await getBetterAuthToken(convexSiteUrl, request.headers)
    const token = tokenResult?.token
    if (typeof token === 'string' && token.length > 0) {
      return token
    }
  } catch {
    // Fall through to the Better Auth route fallback below.
  }

  return await fetchConvexTokenFromBetterAuthRoute(request)
}

function readBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get('authorization')
  if (!authorization) return null

  const [scheme, token] = authorization.split(' ')
  if (scheme?.toLowerCase() !== 'bearer') return null
  if (typeof token !== 'string') return null

  const normalized = token.trim()
  return normalized.length > 0 ? normalized : null
}

async function buildAuthResultFromConvexToken(token: string): Promise<AuthResult | null> {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!convexUrl) return null

  try {
    const convex = new ConvexHttpClient(convexUrl, { auth: token })

    // 3. Get user info from Convex
    const user = await fetchCurrentUser(convex)

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

    const betterAuthUserId = user.id ?? user._id ?? user.userId ?? user.sub ?? null

    if (process.env.NODE_ENV !== 'production') {
      console.log('[server-auth] resolved betterAuthUserId:', {
        id: user.id,
        _id: user._id,
        userId: user.userId,
        sub: user.sub,
        final: betterAuthUserId
      })
    }

    try {
      const convexUser = await fetchUserByEmail(convex, normalizedEmail)

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
        await convex.mutation(api.users.bulkUpsert, {
          users: [
            {
              legacyId: betterAuthUserId,
              email: normalizedEmail,
              name,
            },
          ],
        })

        const convexUser = await fetchUserByEmail(convex, normalizedEmail)

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
      role = 'client'
    }

    if (!status) {
      status = 'pending'
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

async function tryVerifyBetterAuthSession(request: NextRequest): Promise<AuthResult | null> {
  const token = await resolveBetterAuthToken(request)
  if (token) {
    const authFromToken = await buildAuthResultFromConvexToken(token)
    if (authFromToken) {
      return authFromToken
    }
  }

  const sessionPayload = await fetchBetterAuthSession(request)
  if (!sessionPayload) {
    return null
  }

  return buildAuthResultFromBetterAuthSession(request, sessionPayload)
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

  // 2. Accept an explicit Convex bearer token when the browser already has one.
  const bearerToken = readBearerToken(request)
  if (bearerToken) {
    const bearerAuthResult = await buildAuthResultFromConvexToken(bearerToken)
    if (bearerAuthResult) {
      return bearerAuthResult
    }
  }

  // 3. Check for Better Auth session cookie
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

  throw new AuthenticationError('Admin access required', 403)
}

export { AuthenticationError }
