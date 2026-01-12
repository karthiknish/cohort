import { cookies, headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { ConvexHttpClient } from 'convex/browser'
import { betterFetch } from '@better-fetch/fetch'

// CSRF token header must match a cookie value (double-submit pattern)
const CSRF_COOKIE = 'cohorts_csrf'
const CSRF_HEADER = 'x-csrf-token'

export const GET = async () => {
  const cookieStore = await cookies()
  const role = cookieStore.get('cohorts_role')?.value ?? null
  const status = cookieStore.get('cohorts_status')?.value ?? null
  const agencyId = cookieStore.get('cohorts_agency_id')?.value ?? null
  const expiresAt = cookieStore.get('cohorts_session_expires')?.value ?? null

  // Generate a new CSRF token for the client to use in subsequent requests
  const csrfToken = generateCsrfToken()

  const response = NextResponse.json(
    {
      success: true,
      hasSession: Boolean(expiresAt && parseInt(expiresAt, 10) > Date.now()),
      role,
      status,
      agencyId,
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

function validateCsrfToken(
  request: NextRequest,
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  isCreatingSession: boolean
): boolean {
  const headerToken = request.headers.get(CSRF_HEADER)
  const cookieToken = cookieStore.get(CSRF_COOKIE)?.value

  // If no cookie exists yet (first session creation), allow the request
  // This handles the initial auth flow where no CSRF cookie exists
  if (!cookieToken) {
    return true
  }

  // When creating a new session (login), be more lenient:
  // - If header is provided and matches, great
  // - If header is not provided but we're creating a fresh session, allow it
  //   (the old CSRF token from a previous session shouldn't block new logins)
  if (isCreatingSession && !headerToken) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[SessionRoute] Allowing session creation without CSRF header (new login)')
    }
    return true
  }

  // Header must match cookie (double-submit pattern)
  return Boolean(headerToken && cookieToken && headerToken === cookieToken)
}

import { isAuthenticated, getToken } from '@/lib/auth-server'
import { api } from '../../../../../convex/_generated/api'


export async function POST(request: NextRequest) {
  const cookieStore = await cookies()

  if (process.env.NODE_ENV !== 'production') {
    console.log('[SessionRoute][POST] Starting session sync')
  }

  // Validate CSRF token (double-submit cookie pattern)
  if (!validateCsrfToken(request, cookieStore, true)) {
    console.warn('[SessionRoute] CSRF validation failed')
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid CSRF token',
        code: 'CSRF_VALIDATION_FAILED',
        message: 'Security validation failed. Please refresh and try again.'
      },
      { status: 403 }
    )
  }

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

  try {
    // 1. Check authentication using official helper
    const isAuth = await isAuthenticated()
    if (!isAuth) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[SessionRoute][POST] Not authenticated, clearing session cookies')
      }
      response.cookies.delete('cohorts_role')
      response.cookies.delete('cohorts_status')
      response.cookies.delete('cohorts_agency_id')
      response.cookies.delete('cohorts_session_expires')
      response.cookies.delete(CSRF_COOKIE)
      return response
    }

    // 2. Get Convex token
    const convexToken = await getToken()
    if (!convexToken) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[SessionRoute][POST] No Convex token, clearing session cookies')
      }
      response.cookies.delete('cohorts_role')
      response.cookies.delete('cohorts_status')
      response.cookies.delete('cohorts_agency_id')
      response.cookies.delete('cohorts_session_expires')
      response.cookies.delete(CSRF_COOKIE)
      return response
    }

    // 3. Query Convex for user info
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
    if (!convexUrl) throw new Error('Missing CONVEX_URL')

    const convex = new ConvexHttpClient(convexUrl)
    convex.setAuth(convexToken)

    const user = await convex.query(api.auth.getCurrentUser, {}).catch(() => null) as { id?: string; email?: string | null } | null
    const email = user?.email ? String(user.email) : null

    if (!email) {
      response.cookies.delete('cohorts_role')
      response.cookies.delete('cohorts_status')
      response.cookies.delete('cohorts_agency_id')
      response.cookies.delete('cohorts_session_expires')
      response.cookies.delete(CSRF_COOKIE)
      return response
    }

    const normalizedEmail = email.toLowerCase()

    // Get role/status/agencyId from our users table
    let resolvedRole: string | null = null
    let resolvedStatus: string | null = null
    let resolvedAgencyId: string | null = null

    try {
      const convexUser = await convex.query(api.users.getByEmail, {
        email: normalizedEmail,
      }).catch(() => null) as { role?: string | null; status?: string | null; agencyId?: string | null; legacyId?: string | null } | null

      resolvedRole = typeof convexUser?.role === 'string' ? convexUser.role : null
      resolvedStatus = typeof convexUser?.status === 'string' ? convexUser.status : null
      resolvedAgencyId = typeof convexUser?.agencyId === 'string' ? convexUser.agencyId : (convexUser?.legacyId ?? null)
    } catch {
      // Ignore lookup failures
    }

    // Check admin whitelist
    const admins = (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)

    const isAdminEmail = admins.includes(normalizedEmail)

    // If this email is an admin, always treat it as such.
    if (!resolvedRole || isAdminEmail) {
      resolvedRole = isAdminEmail ? 'admin' : 'client'
    }

    if (!resolvedStatus) {
      resolvedStatus = 'active'
    }

    // Use Better Auth user id as fallback for agencyId
    if (!resolvedAgencyId && user?.id) {
      resolvedAgencyId = String(user.id)
    }

    // Set the role/status/agencyId cookies
    response.cookies.set('cohorts_role', resolvedRole, cookieOptions)
    response.cookies.set('cohorts_status', resolvedStatus, cookieOptions)
    if (resolvedAgencyId) {
      response.cookies.set('cohorts_agency_id', resolvedAgencyId, cookieOptions)
    }

    const expiresAt = Date.now() + maxAge * 1000
    response.cookies.set('cohorts_session_expires', expiresAt.toString(), {
      ...cookieOptions,
      httpOnly: false,
      sameSite: 'strict',
    })

    const csrfToken = generateCsrfToken()
    response.cookies.set(CSRF_COOKIE, csrfToken, {
      maxAge,
      path: '/',
      httpOnly: false,
      secure: isProduction,
      sameSite: 'strict',
    })

    if (process.env.NODE_ENV !== 'production') {
      console.log('[SessionRoute][POST] Session synced successfully:', { email: normalizedEmail, role: resolvedRole, status: resolvedStatus })
    }

    return response
  } catch (error) {
    console.error('[SessionRoute][POST] Unexpected error:', error)
    response.cookies.delete('cohorts_role')
    response.cookies.delete('cohorts_status')
    response.cookies.delete('cohorts_agency_id')
    response.cookies.delete('cohorts_session_expires')
    response.cookies.delete(CSRF_COOKIE)
    return response
  }
}

export async function DELETE(request: NextRequest) {
  const cookieStore = await cookies()

  // Validate CSRF token for logout (not creating session, so stricter validation)
  if (!validateCsrfToken(request, cookieStore, false)) {
    console.warn('[SessionRoute] CSRF validation failed on DELETE')
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid CSRF token',
        code: 'CSRF_VALIDATION_FAILED',
        message: 'Security validation failed. Please refresh and try again.'
      },
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
  response.cookies.delete('cohorts_role')
  response.cookies.delete('cohorts_status')
  response.cookies.delete('cohorts_agency_id')
  response.cookies.delete('cohorts_session_expires')
  response.cookies.delete(CSRF_COOKIE)

  return response
}
