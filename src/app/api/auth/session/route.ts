import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createApiHandler } from '@/lib/api-handler'
import { adminAuth } from '@/lib/firebase-admin'

// CSRF token header must match a cookie value (double-submit pattern)
const CSRF_COOKIE = 'cohorts_csrf'
const CSRF_HEADER = 'x-csrf-token'

const SessionSchema = z.object({
  token: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
})

export const GET = async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get('cohorts_token')?.value
  const role = cookieStore.get('cohorts_role')?.value ?? null
  const status = cookieStore.get('cohorts_status')?.value ?? null
  const expiresAt = cookieStore.get('cohorts_session_expires')?.value ?? null

  // Generate a new CSRF token for the client to use in subsequent requests
  const csrfToken = generateCsrfToken()
  
  const response = NextResponse.json(
    {
      success: true,
      hasSession: Boolean(token),
      role,
      status,
      expiresAt: expiresAt ? parseInt(expiresAt, 10) : null,
      csrfToken,
    },
    {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    }
  )

  // Set CSRF cookie (httpOnly: false so JS can read it)
  const isProduction = process.env.NODE_ENV === 'production'
  response.cookies.set(CSRF_COOKIE, csrfToken, {
    maxAge: 2 * 60 * 60, // 2 hours
    path: '/',
    httpOnly: false, // Client needs to read this
    secure: isProduction,
    sameSite: 'strict',
  })

  return response
}

function generateCsrfToken(): string {
  // Generate a random token
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

function validateCsrfToken(request: Request, cookieStore: Awaited<ReturnType<typeof cookies>>): boolean {
  const headerToken = request.headers.get(CSRF_HEADER)
  const cookieToken = cookieStore.get(CSRF_COOKIE)?.value

  // If no cookie exists yet (first session creation), allow the request
  // This handles the initial auth flow where no CSRF cookie exists
  if (!cookieToken) {
    return true
  }

  // Header must match cookie (double-submit pattern)
  return Boolean(headerToken && cookieToken && headerToken === cookieToken)
}

export const POST = createApiHandler(
  {
    auth: 'none',
    rateLimit: 'sensitive', // Stricter rate limit for auth endpoints
    bodySchema: SessionSchema,
    skipIdempotency: true,
  },
  async (request, context) => {
    const cookieStore = await cookies()

    // Validate CSRF token (double-submit cookie pattern)
    if (!validateCsrfToken(request, cookieStore)) {
      console.warn('[SessionRoute] CSRF validation failed')
      return NextResponse.json(
        { success: false, error: 'Invalid CSRF token' },
        { status: 403 }
      )
    }

    const { token, role, status } = context.body
    const response = NextResponse.json(
      { success: true },
      { 
        headers: { 'Cache-Control': 'no-store, max-age=0' }
      }
    )

    const isProduction = process.env.NODE_ENV === 'production'
    const maxAge = 2 * 60 * 60 // 2 hours in seconds
    const cookieOptions = {
      maxAge,
      path: '/',
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const,
    }

    if (!token) {
      response.cookies.delete('cohorts_token')
      response.cookies.delete('cohorts_role')
      response.cookies.delete('cohorts_status')
      response.cookies.delete('cohorts_session_expires')
      response.cookies.delete(CSRF_COOKIE)
      return response
    }

    try {
      // Verify the ID token first to extract claims
      const decodedToken = await adminAuth.verifyIdToken(token)
      
      // Exchange the ID token for a session cookie
      const sessionCookie = await adminAuth.createSessionCookie(token, { 
        expiresIn: maxAge * 1000 
      })
      response.cookies.set('cohorts_token', sessionCookie, cookieOptions)
      
      // Use role/status from verified token claims, falling back to client values only if claims are missing
      const verifiedRole = (decodedToken.role as string) || role || 'client'
      const verifiedStatus = (decodedToken.status as string) || status || 'pending'
      
      response.cookies.set('cohorts_role', verifiedRole, cookieOptions)
      response.cookies.set('cohorts_status', verifiedStatus, cookieOptions)

      // Set session expiry timestamp (client-readable) for proactive refresh
      const expiresAt = Date.now() + (maxAge * 1000)
      response.cookies.set('cohorts_session_expires', expiresAt.toString(), {
        ...cookieOptions,
        httpOnly: false, // Client needs to read this for proactive refresh
        sameSite: 'strict',
      })

      // Generate and set new CSRF token
      const csrfToken = generateCsrfToken()
      response.cookies.set(CSRF_COOKIE, csrfToken, {
        maxAge,
        path: '/',
        httpOnly: false, // Client needs to read this
        secure: isProduction,
        sameSite: 'strict',
      })
    } catch (error) {
      console.error('[SessionRoute] Failed to create session cookie:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create secure session' },
        { status: 500 }
      )
    }

    return response
  }
)

export const DELETE = createApiHandler(
  {
    auth: 'none',
    rateLimit: 'standard',
  },
  async (request) => {
    const cookieStore = await cookies()

    // Validate CSRF token for logout as well
    if (!validateCsrfToken(request, cookieStore)) {
      console.warn('[SessionRoute] CSRF validation failed on DELETE')
      return NextResponse.json(
        { success: false, error: 'Invalid CSRF token' },
        { status: 403 }
      )
    }

    const response = NextResponse.json(
      { success: true },
      {
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      }
    )

    // Delete all session-related cookies
    response.cookies.delete('cohorts_token')
    response.cookies.delete('cohorts_role')
    response.cookies.delete('cohorts_status')
    response.cookies.delete('cohorts_session_expires')
    response.cookies.delete(CSRF_COOKIE)

    return response
  }
)
