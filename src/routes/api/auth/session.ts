import { createFileRoute } from '@tanstack/react-router'
import { adaptApiHandler } from '@/lib/api-handler-start'
import * as z from 'zod'
import { ForbiddenError, UnauthorizedError } from '@/lib/api-errors'
import {
  CSRF_COOKIE,
  CSRF_HEADER,
  SESSION_COOKIE_MAX_AGE_SEC,
  appendSessionCookies,
  clearSessionCookies,
  generateCsrfToken,
} from '@/lib/session-cookies'
import type { NextRequest } from '@/lib/http-server-types'
import { NextResponse } from '@/lib/http-server-types'

function validateCsrfToken(request: Request, req: NextRequest): boolean {
  const headerToken = request.headers.get(CSRF_HEADER)
  const cookieToken = req.cookies.get(CSRF_COOKIE)?.value
  return Boolean(headerToken && cookieToken && headerToken === cookieToken)
}

const GET = adaptApiHandler(
  { auth: 'optional', rateLimit: 'standard', skipIdempotency: true },
  async (req) => {
    const role = req.cookies.get('cohorts_role')?.value ?? null
    const status = req.cookies.get('cohorts_status')?.value ?? null
    const agencyId = req.cookies.get('cohorts_agency_id')?.value ?? null
    const expiresAt = req.cookies.get('cohorts_session_expires')?.value ?? null
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
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    )
    response.cookies.set(CSRF_COOKIE, csrfToken, {
      maxAge: SESSION_COOKIE_MAX_AGE_SEC,
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })
    return response
  },
)

const postBodySchema = z.strictObject({})

const POST = adaptApiHandler(
  { auth: 'optional', bodySchema: postBodySchema, rateLimit: 'standard', skipIdempotency: true },
  async (req, { auth }) => {
    if (!validateCsrfToken(req, req)) {
      throw new ForbiddenError('Security validation failed. Please refresh and try again.')
    }
    const response = NextResponse.json(
      { success: true },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    )
    if (!auth.uid) {
      clearSessionCookies(response)
      throw new UnauthorizedError('No active session')
    }
    const role = typeof auth.claims?.role === 'string' ? auth.claims.role : null
    const status = typeof auth.claims?.status === 'string' ? auth.claims.status : null
    const agencyId =
      typeof auth.claims?.agencyId === 'string' && auth.claims.agencyId.length > 0
        ? auth.claims.agencyId
        : auth.uid
    if (!role || !status) {
      throw new UnauthorizedError(
        'Profile not synced. Complete sign-in bootstrap before syncing the session.',
      )
    }
    appendSessionCookies(response, { role, status, agencyId })
    return response
  },
)

const DELETE = adaptApiHandler(
  { auth: 'optional', rateLimit: 'standard', skipIdempotency: true },
  async (req) => {
    if (!validateCsrfToken(req, req)) {
      throw new ForbiddenError('Security validation failed. Please refresh and try again.')
    }
    const response = NextResponse.json(
      { success: true },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    )
    clearSessionCookies(response)
    return response
  },
)

export const Route = createFileRoute('/api/auth/session')({
  server: {
    handlers: {
      GET: GET.GET,
      POST: POST.POST,
      DELETE: DELETE.DELETE,
    },
  },
})
