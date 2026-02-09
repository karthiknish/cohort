import { z } from 'zod'
import { ConvexHttpClient } from 'convex/browser'

import { createApiHandler } from '@/lib/api-handler'
import { UnauthorizedError, NotFoundError, ValidationError } from '@/lib/api-errors'
import { getToken, isAuthenticated } from '@/lib/auth-server'
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

/**
 * Bootstrap route - creates/updates user in Convex users table
 *
 * Flow:
 * 1. Check Better Auth session via cookies
 * 2. Get Convex JWT using getToken utility
 * 3. Get Better Auth user from Convex
 * 4. Upsert user in custom users table
 */
export const POST = createApiHandler(
  {
    auth: 'optional',
    bodySchema,
    rateLimit: 'sensitive',
    skipIdempotency: true,
  },
  async () => {
    // 1. Check if user is authenticated via Better Auth
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      throw new UnauthorizedError('Not authenticated')
    }

    // 2. Get Convex token using the auth utility
    const convexToken = await withTimeout(getToken(), 5000, 'getToken')

    if (!convexToken) {
      throw new UnauthorizedError('No Convex token')
    }

    // 3. Create Convex client with token and get Better Auth user
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
    if (!convexUrl) {
      throw new Error('Convex URL not configured')
    }

    const convex = new ConvexHttpClient(convexUrl)
    convex.setAuth(convexToken)

    const currentUser = await withTimeout(
      convex.query(api.auth.getCurrentUser, {}),
      10000,
      'convex query'
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

    // 4. Upsert user in custom users table
    await withTimeout(
      convex.mutation(api.users.bootstrapUpsert, {
        legacyId,
        email: email.toLowerCase(),
        name,
        role: 'admin', // Default to admin for new users
        status: 'active',
        agencyId: legacyId,
      }),
      10000,
      'convex mutation'
    )

    return {
      ok: true,
      role: 'admin',
      status: 'active',
      agencyId: legacyId,
    }
  }
)
