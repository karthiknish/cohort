import { z } from 'zod'
import { ConvexHttpClient } from 'convex/browser'

import { createApiHandler } from '@/lib/api-handler'
import { UnauthorizedError, NotFoundError } from '@/lib/api-errors'
import { api } from '/_generated/api'

const DEFAULT_USER_ROLE = 'client'
const DEFAULT_USER_STATUS = 'pending'

// Helper to add timeout to promises
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    )
  ])
}

const bodySchema = z.object({}).strict()

async function fetchConvexTokenFromRequest(req: Request): Promise<string | null> {
  try {
    const siteUrl = new URL(req.url).origin
    const response = await fetch(`${siteUrl}/api/auth/convex/token`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Cookie': req.headers.get('cookie') || '',
      },
    })
    if (!response.ok) return null
    const data = await response.json()
    return data?.token || null
  } catch {
    return null
  }
}

export const POST = createApiHandler(
  {
    auth: 'required',
    bodySchema,
    rateLimit: 'sensitive',
    skipIdempotency: true,
  },
  async (req, { auth }) => {
    if (!auth.uid) {
      throw new UnauthorizedError('Not authenticated')
    }

    const fallbackRole = typeof auth.claims?.role === 'string' ? auth.claims.role : DEFAULT_USER_ROLE
    const fallbackStatus = typeof auth.claims?.status === 'string' ? auth.claims.status : DEFAULT_USER_STATUS
    const fallbackAgencyId = typeof auth.claims?.agencyId === 'string' && auth.claims.agencyId.length > 0
      ? auth.claims.agencyId
      : auth.uid

    const convexToken = await withTimeout(
      fetchConvexTokenFromRequest(req),
      5000,
      'fetchConvexToken'
    )

    if (!convexToken) {
      return {
        ok: true,
        role: fallbackRole,
        status: fallbackStatus,
        agencyId: fallbackAgencyId,
        created: false,
      }
    }

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
    if (!convexUrl) {
      throw new Error('Convex URL not configured')
    }

    const convex = new ConvexHttpClient(convexUrl)
    convex.setAuth(convexToken)

    const currentUser = await withTimeout(
      convex.query(api.auth.getCurrentUser, {}),
      10000,
      'getCurrentUser'
    ) as { id?: string; _id?: string; email?: string | null; name?: string | null } | null

    if (!currentUser) {
      throw new NotFoundError('User not found in Convex auth tables')
    }

    const email = currentUser.email ?? auth.email
    const name = currentUser.name ?? auth.name ?? email ?? 'User'
    const legacyId = (currentUser._id ?? currentUser.id ?? auth.uid) as string

    if (!email) {
      return {
        ok: true,
        role: fallbackRole,
        status: fallbackStatus,
        agencyId: fallbackAgencyId,
        created: false,
      }
    }

    const existingUser = await withTimeout(
      convex.query(api.users.getByLegacyIdSafe, { legacyId }),
      10000,
      'getByLegacyIdSafe'
    )

    const role = existingUser?.role ?? fallbackRole
    const status = existingUser?.status ?? fallbackStatus
    const agencyId = existingUser?.agencyId ?? fallbackAgencyId

    const bootstrapResult = await withTimeout(
      convex.mutation(api.users.bootstrapUpsert, {
        legacyId,
        email: email.toLowerCase(),
        name,
      }),
      10000,
      'bootstrapUpsert'
    )

    return {
      ok: true,
      role,
      status,
      agencyId,
      created: bootstrapResult.created,
    }
  }
)
