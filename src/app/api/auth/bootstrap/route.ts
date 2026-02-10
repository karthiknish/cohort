import { z } from 'zod'
import { ConvexHttpClient } from 'convex/browser'

import { createApiHandler } from '@/lib/api-handler'
import { UnauthorizedError, NotFoundError, ValidationError } from '@/lib/api-errors'
import { api } from '../../../../../convex/_generated/api'

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
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const response = await fetch(`${siteUrl}/api/auth/convex/token`, {
      method: 'GET',
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

    const convexToken = await withTimeout(
      fetchConvexTokenFromRequest(req),
      5000,
      'fetchConvexToken'
    )

    if (!convexToken) {
      throw new UnauthorizedError('No Convex token')
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
    )

    if (!currentUser) {
      throw new NotFoundError('User not found in Convex auth tables')
    }

    const email = currentUser.email
    const name = currentUser.name || email || 'User'
    const legacyId = currentUser._id as unknown as string

    if (!email) {
      throw new ValidationError('User email missing')
    }

    await withTimeout(
      convex.mutation(api.users.bootstrapUpsert, {
        legacyId,
        email: email.toLowerCase(),
        name,
        role: 'admin',
        status: 'active',
        agencyId: legacyId,
      }),
      10000,
      'bootstrapUpsert'
    )

    return {
      ok: true,
      role: 'admin',
      status: 'active',
      agencyId: legacyId,
    }
  }
)
