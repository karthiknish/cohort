import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { api } from '../../../../../convex/_generated/api'
import { ConvexHttpClient } from 'convex/browser'

const payloadSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
  })
  .optional()

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
 * Uses direct Convex client with session cookie
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const baseUrl = getBaseUrl(req)
  console.log('[Bootstrap] Using base URL:', baseUrl)

  try {
    // 1. Get all cookies from request and forward them
    // Better Auth uses 'better-auth.session_token' or '__Secure-better-auth.session_token' in production
    const allCookies = req.cookies.getAll()
    console.log('[Bootstrap] Available cookies:', allCookies.map(c => c.name))
    
    // Build the full cookie string to forward to internal API calls
    const cookieHeader = allCookies.map(c => `${c.name}=${c.value}`).join('; ')
    
    // Check if we have a session cookie (with or without __Secure- prefix)
    const hasSessionCookie = allCookies.some(c => 
      c.name === 'better-auth.session_token' || 
      c.name === '__Secure-better-auth.session_token' ||
      c.name.includes('session_token')
    )
    
    if (!hasSessionCookie) {
      console.log('[Bootstrap] No session cookie found in:', allCookies.map(c => c.name))
      return NextResponse.json(
        { success: false, error: 'No session cookie' },
        { status: 401 }
      )
    }

    console.log('[Bootstrap] Session cookie found, forwarding all cookies...')

    // 2. Call Better Auth's get-session endpoint to get the user
    // Forward ALL cookies from the original request
    console.log('[Bootstrap] Getting user from Better Auth session...')
    const sessionRes = await withTimeout(
      fetch(`${baseUrl}/api/auth/get-session`, {
        headers: {
          'Cookie': cookieHeader,
        },
      }),
      5000,
      'get-session fetch'
    )

    if (!sessionRes.ok) {
      console.log('[Bootstrap] get-session failed with status:', sessionRes.status)
      return NextResponse.json(
        { success: false, error: 'Failed to get session' },
        { status: 401 }
      )
    }

    const sessionData = await sessionRes.json()
    console.log('[Bootstrap] Session data:', JSON.stringify(sessionData, null, 2))
    
    // Better Auth returns session in different formats depending on version
    const user = sessionData?.user || sessionData?.data?.user || sessionData

    if (!user || !user.email) {
      console.log('[Bootstrap] No valid user in session data')
      return NextResponse.json(
        { success: false, error: 'No user in session' },
        { status: 401 }
      )
    }

    const email = user.email
    const name = user.name || email || 'User'
    const legacyId = user.id

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'User email missing' },
        { status: 400 }
      )
    }

    // 3. Get Convex token for authenticated requests
    console.log('[Bootstrap] Getting Convex token...')
    const tokenRes = await withTimeout(
      fetch(`${baseUrl}/api/auth/convex/token`, {
        headers: {
          'Cookie': cookieHeader,
        },
      }),
      5000,
      'convex-token fetch'
    )

    if (!tokenRes.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to get Convex token' },
        { status: 401 }
      )
    }

    const tokenData = await tokenRes.json()
    console.log('[Bootstrap] Token response:', JSON.stringify(tokenData, null, 2))
    
    // Handle different response formats
    const convexToken = tokenData?.token || tokenData?.data?.token || tokenData

    if (!convexToken || typeof convexToken !== 'string') {
      console.log('[Bootstrap] Invalid Convex token:', convexToken)
      return NextResponse.json(
        { success: false, error: 'No Convex token' },
        { status: 401 }
      )
    }

    console.log('[Bootstrap] Got Convex token:', convexToken.substring(0, 20) + '...')

    // 4. Create Convex client with token and get user data
    console.log('[Bootstrap] Getting user from Convex...')
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
    if (!convexUrl) {
      return NextResponse.json(
        { success: false, error: 'Convex URL not configured' },
        { status: 500 }
      )
    }

    const convex = new ConvexHttpClient(convexUrl, { auth: convexToken })
    const currentUser = await withTimeout(
      convex.query(api.auth.getCurrentUser, {}),
      10000,
      'convex query'
    )

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'User not found in Convex' },
        { status: 404 }
      )
    }

    // 5. Upsert user in custom users table
    console.log('[Bootstrap] Upserting user...')
    await withTimeout(
      convex.mutation(api.users.bootstrapUpsert, {
        legacyId: currentUser._id as unknown as string,
        email: email.toLowerCase(),
        name,
        role: 'admin', // Default to admin for development
        status: 'active',
        agencyId: currentUser._id as unknown as string,
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
      agencyId: currentUser._id,
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
