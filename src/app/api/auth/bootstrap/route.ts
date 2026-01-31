import { NextRequest, NextResponse } from 'next/server'
import { api } from '../../../../../convex/_generated/api'
import { ConvexHttpClient } from 'convex/browser'
import { getToken, isAuthenticated, fetchAuthMutation } from '@/lib/auth-server'

// Helper to add timeout to promises
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    )
  ])
}

/**
 * Get the base URL for internal API calls.
 * Uses NEXT_PUBLIC_APP_URL env var or constructs from request headers.
 */
function getBaseUrl(req: NextRequest): string {
  // Prefer explicit env var for production
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  
  // Construct from request headers (works on Vercel)
  const proto = req.headers.get('x-forwarded-proto') || 'http'
  const host = req.headers.get('host') || process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '') || 'localhost:3000'
  return `${proto}://${host}`
}

/**
 * Bootstrap route - creates/updates user in Convex users table
 * 
 * Flow:
 * 1. Check Better Auth session via cookies
 * 2. Get Convex JWT using getToken utility
 * 3. Get Better Auth user from Convex
 * 4. Upsert user in custom users table
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const baseUrl = getBaseUrl(req)
  console.log('[Bootstrap] Using base URL:', baseUrl)

  try {
    // 1. Check if user is authenticated via Better Auth
    const authenticated = await isAuthenticated()
    console.log('[Bootstrap] isAuthenticated:', authenticated)
    
    if (!authenticated) {
      // Log cookies for debugging
      const allCookies = req.cookies.getAll()
      console.log('[Bootstrap] No auth session. Available cookies:', allCookies.map(c => c.name))
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // 2. Get Convex token using the auth utility
    console.log('[Bootstrap] Getting Convex token...')
    const convexToken = await withTimeout(
      getToken(),
      5000,
      'getToken'
    )
    
    if (!convexToken) {
      console.log('[Bootstrap] No Convex token returned')
      return NextResponse.json(
        { success: false, error: 'No Convex token' },
        { status: 401 }
      )
    }

    console.log('[Bootstrap] Got Convex token:', convexToken.substring(0, 20) + '...')

    // 3. Create Convex client with token and get Better Auth user
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
    if (!convexUrl) {
      return NextResponse.json(
        { success: false, error: 'Convex URL not configured' },
        { status: 500 }
      )
    }

    const convex = new ConvexHttpClient(convexUrl)
    convex.setAuth(convexToken)
    
    console.log('[Bootstrap] Getting Better Auth user from Convex...')
    const currentUser = await withTimeout(
      convex.query(api.auth.getCurrentUser, {}),
      10000,
      'convex query'
    )

    if (!currentUser) {
      console.log('[Bootstrap] No Better Auth user found in Convex')
      return NextResponse.json(
        { success: false, error: 'User not found in Convex auth tables' },
        { status: 404 }
      )
    }

    console.log('[Bootstrap] Better Auth user:', JSON.stringify({
      _id: currentUser._id,
      email: currentUser.email,
      name: currentUser.name,
    }, null, 2))

    const email = currentUser.email
    const name = currentUser.name || email || 'User'
    const legacyId = currentUser._id as unknown as string

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'User email missing' },
        { status: 400 }
      )
    }

    // 4. Upsert user in custom users table
    console.log('[Bootstrap] Upserting user in custom users table...')
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

    const duration = Date.now() - startTime
    console.log(`[Bootstrap] Completed in ${duration}ms for ${email}`)

    return NextResponse.json({
      ok: true,
      success: true,
      role: 'admin',
      status: 'active',
      agencyId: legacyId,
    })
  } catch (error) {
    console.error('[Bootstrap] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Bootstrap failed',
      },
      { status: 500 }
    )
  }
}
