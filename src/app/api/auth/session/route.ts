import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import * as z from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { ForbiddenError, UnauthorizedError } from '@/lib/api-errors'

// CSRF token header must match a cookie value (double-submit pattern)
const CSRF_COOKIE = 'cohorts_csrf'
const CSRF_HEADER = 'x-csrf-token'

const COOKIE_OPTIONS = {
  maxAge: 2 * 60 * 60, // 2 hours in seconds
  path: '/',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
}

function generateCsrfToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

function validateCsrfToken(
  request: Request,
  cookieStore: Awaited<ReturnType<typeof cookies>>,
): boolean {
  const headerToken = request.headers.get(CSRF_HEADER)
  const cookieToken = cookieStore.get(CSRF_COOKIE)?.value

  // Header must match cookie (double-submit pattern)
  return Boolean(headerToken && cookieToken && headerToken === cookieToken)
}

function clearSessionCookies(response: NextResponse) {
  response.cookies.delete('cohorts_role')
  response.cookies.delete('cohorts_status')
  response.cookies.delete('cohorts_agency_id')
  response.cookies.delete('cohorts_session_expires')
  response.cookies.delete(CSRF_COOKIE)
}

/**
 * GET /api/auth/session
 * Returns current session info and generates a CSRF token
 */
export const GET = createApiHandler(
  {
    auth: 'optional',
    rateLimit: 'standard',
    skipIdempotency: true,
  },
  async () => {
    const cookieStore = await cookies()
    const role = cookieStore.get('cohorts_role')?.value ?? null
    const status = cookieStore.get('cohorts_status')?.value ?? null
    const agencyId = cookieStore.get('cohorts_agency_id')?.value ?? null
    const expiresAt = cookieStore.get('cohorts_session_expires')?.value ?? null

    const csrfToken = generateCsrfToken()
    const hasSession = Boolean(expiresAt && parseInt(expiresAt, 10) > Date.now())

    const response = NextResponse.json(
      {
        success: true,
        hasSession,
        role,
        status,
        agencyId,
        expiresAt: expiresAt ? parseInt(expiresAt, 10) : null,
        csrfToken,
      },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    )

    // Set CSRF cookie (httpOnly: false so JS can read it)
    response.cookies.set(CSRF_COOKIE, csrfToken, {
      maxAge: 2 * 60 * 60,
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })

    return response
  }
)

const postBodySchema = z.object({}).strict()

/**
 * POST /api/auth/session
 * Syncs session data with Better Auth and sets cookies
 */
export const POST = createApiHandler(
  {
    auth: 'optional',
    bodySchema: postBodySchema,
    rateLimit: 'standard',
    skipIdempotency: true,
  },
  async (req, { auth }) => {
    const cookieStore = await cookies()

    // Validate CSRF token (double-submit cookie pattern)
    if (!validateCsrfToken(req, cookieStore)) {
      throw new ForbiddenError('Security validation failed. Please refresh and try again.')
    }

    const response = NextResponse.json(
      { success: true },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    )

    if (!auth.uid) {
      clearSessionCookies(response)
      throw new UnauthorizedError('No active session')
    }

    const resolvedRole = typeof auth.claims?.role === 'string' ? auth.claims.role : 'client'
    const resolvedStatus = typeof auth.claims?.status === 'string' ? auth.claims.status : 'pending'
    const resolvedAgencyId = typeof auth.claims?.agencyId === 'string' && auth.claims.agencyId.length > 0
      ? auth.claims.agencyId
      : auth.uid

    // Set the role/status/agencyId cookies
    response.cookies.set('cohorts_role', resolvedRole, COOKIE_OPTIONS)
    response.cookies.set('cohorts_status', resolvedStatus, COOKIE_OPTIONS)
    if (resolvedAgencyId) {
      response.cookies.set('cohorts_agency_id', resolvedAgencyId, COOKIE_OPTIONS)
    }

    const expiresAt = Date.now() + COOKIE_OPTIONS.maxAge * 1000
    response.cookies.set('cohorts_session_expires', expiresAt.toString(), {
      ...COOKIE_OPTIONS,
    })

    const csrfToken = generateCsrfToken()
    response.cookies.set(CSRF_COOKIE, csrfToken, {
      maxAge: COOKIE_OPTIONS.maxAge,
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })

    return response
  }
)

/**
 * DELETE /api/auth/session
 * Clears session cookies (logout)
 */
export const DELETE = createApiHandler(
  {
    auth: 'optional',
    rateLimit: 'standard',
    skipIdempotency: true,
  },
  async (req) => {
    const cookieStore = await cookies()

    if (!validateCsrfToken(req, cookieStore)) {
      throw new ForbiddenError('Security validation failed. Please refresh and try again.')
    }

    const response = NextResponse.json(
      { success: true },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    )

    clearSessionCookies(response)

    return response
  }
)
