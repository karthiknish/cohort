import { NextRequest } from 'next/server'

export interface AuthResult {
  uid: string | null
  email: string | null
  name: string | null
  claims: Record<string, unknown>
  isCron: boolean
}

import { ApiError } from './api-errors'
import { adminAuth } from './firebase-admin'
import { DecodedIdToken } from 'firebase-admin/auth'

class AuthenticationError extends ApiError {
  constructor(message: string, status = 401) {
    super(message, status, 'UNAUTHORIZED')
  }
}

/**
 * Verifies a Firebase ID token (JWT).
 * Used for API requests coming from the client with an Authorization header.
 */
async function verifyIdToken(idToken: string): Promise<AuthResult> {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    return mapDecodedTokenToAuthResult(decodedToken)
  } catch (error) {
    console.error('[server-auth] ID token verification failed:', error)
    throw new AuthenticationError('Invalid or expired authentication token', 401)
  }
}

/**
 * Verifies a Firebase Session Cookie.
 * Used for server-side rendered pages and middleware using the cohorts_token cookie.
 */
async function verifySessionCookie(sessionCookie: string): Promise<AuthResult> {
  try {
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true)
    return mapDecodedTokenToAuthResult(decodedToken)
  } catch (error) {
    console.error('[server-auth] Session cookie verification failed:', error)
    throw new AuthenticationError('Invalid or expired session', 401)
  }
}

/**
 * Helper to map Firebase decoded tokens to our internal AuthResult type.
 */
function mapDecodedTokenToAuthResult(decodedToken: DecodedIdToken): AuthResult {
  return {
    uid: decodedToken.uid,
    email: decodedToken.email || null,
    name: (decodedToken.name as string) || null,
    claims: decodedToken as unknown as Record<string, unknown>,
    isCron: false,
  }
}

/**
 * Authenticates an incoming request.
 * Priority:
 * 1. System Cron Key (header)
 * 2. ID Token (Authorization header)
 * 3. Session Cookie (cohorts_token cookie)
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  // 1. Check for Cron Key
  const cronSecret = process.env.INTEGRATIONS_CRON_SECRET
  const cronKey = request.headers.get('x-cron-key')

  if (cronSecret && cronKey && cronKey === cronSecret) {
    return { uid: null, email: null, name: 'System Cron', claims: {}, isCron: true }
  }

  // 2. Check for Authorization Header (ID Token)
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    return await verifyIdToken(token)
  }

  // 3. Check for Cookie (Session Cookie)
  const sessionCookie = request.cookies.get('cohorts_token')?.value
  if (sessionCookie) {
    return await verifySessionCookie(sessionCookie)
  }

  throw new AuthenticationError('Authentication required', 401)
}

export function assertAdmin(auth: AuthResult) {
  if (auth.isCron) return

  // Check custom claims
  const role = auth.claims?.role
  if (role === 'admin') {
    return
  }

  // Fallback to email whitelist
  const admins = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  if (!auth.email || !admins.includes(auth.email.toLowerCase())) {
    throw new AuthenticationError('Admin access required', 403)
  }
}

export { AuthenticationError }
