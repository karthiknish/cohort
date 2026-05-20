import type { NextResponse } from 'next/server'

/** Align with Better Auth session length (7 days) so cohorts_* cookies do not expire early. */
export const SESSION_COOKIE_MAX_AGE_SEC = 7 * 24 * 60 * 60

export const CSRF_COOKIE = 'cohorts_csrf'
export const CSRF_HEADER = 'x-csrf-token'

const SESSION_COOKIE_OPTIONS = {
  maxAge: SESSION_COOKIE_MAX_AGE_SEC,
  path: '/',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
}

export function generateCsrfToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function clearSessionCookies(response: NextResponse): void {
  response.cookies.delete('cohorts_role')
  response.cookies.delete('cohorts_status')
  response.cookies.delete('cohorts_agency_id')
  response.cookies.delete('cohorts_session_expires')
  response.cookies.delete(CSRF_COOKIE)
}

export type SessionCookieProfile = {
  role: string
  status: string
  agencyId: string
}

export function appendSessionCookies(
  response: NextResponse,
  profile: SessionCookieProfile,
): string {
  const csrfToken = generateCsrfToken()

  response.cookies.set('cohorts_role', profile.role, SESSION_COOKIE_OPTIONS)
  response.cookies.set('cohorts_status', profile.status, SESSION_COOKIE_OPTIONS)
  response.cookies.set('cohorts_agency_id', profile.agencyId, SESSION_COOKIE_OPTIONS)

  const expiresAt = Date.now() + SESSION_COOKIE_MAX_AGE_SEC * 1000
  response.cookies.set('cohorts_session_expires', expiresAt.toString(), SESSION_COOKIE_OPTIONS)

  response.cookies.set(CSRF_COOKIE, csrfToken, {
    maxAge: SESSION_COOKIE_MAX_AGE_SEC,
    path: '/',
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  })

  return csrfToken
}
