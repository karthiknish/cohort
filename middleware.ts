import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { 
  checkRateLimit, 
  getClientIdentifier, 
  buildRateLimitHeaders, 
  RATE_LIMITS 
} from '@/lib/rate-limiter'

const API_RATE_LIMIT_MAX = parseInteger(process.env.API_RATE_LIMIT_MAX, RATE_LIMITS.standard.maxRequests)
const API_RATE_LIMIT_WINDOW_MS = parseInteger(process.env.API_RATE_LIMIT_WINDOW_MS, RATE_LIMITS.standard.windowMs)

const PROTECTED_ROUTE_MATCHER = ['/dashboard', '/admin']
const ADMIN_ONLY_ROUTE_PREFIX = '/admin'
const AUTH_ROUTE_PREFIX = '/auth'
const AUTH_COOKIE = 'cohorts_token'
const ROLE_COOKIE = 'cohorts_role'
const SESSION_EXPIRES_COOKIE = 'cohorts_session_expires'

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTE_MATCHER.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

function isSessionExpired(request: NextRequest): boolean {
  const expiresAt = request.cookies.get(SESSION_EXPIRES_COOKIE)?.value
  if (!expiresAt) return false // No expiry cookie means we can't check - let API verify
  
  const expiryTime = parseInt(expiresAt, 10)
  if (isNaN(expiryTime)) return false
  
  // Add 30 second buffer to avoid race conditions
  return Date.now() > (expiryTime - 30000)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/api/')) {
    const identifier = getClientIdentifier(request)
    const rateLimit = checkRateLimit(`api:${identifier}`, {
      maxRequests: API_RATE_LIMIT_MAX,
      windowMs: API_RATE_LIMIT_WINDOW_MS,
    })

    console.log(`[Middleware] API Request: ${pathname} | ID: ${identifier} | Allowed: ${rateLimit.allowed}`)

    if (!rateLimit.allowed) {
      console.warn(`[Middleware] Rate limit exceeded for ${identifier} on ${pathname}`)
      return NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        {
          status: 429,
          headers: buildRateLimitHeaders(rateLimit),
        },
      )
    }

    const response = NextResponse.next()
    const headers = buildRateLimitHeaders(rateLimit)
    headers.forEach((value, key) => {
      response.headers.set(key, value)
    })
    return response
  }
  const token = request.cookies.get(AUTH_COOKIE)?.value
  const role = request.cookies.get(ROLE_COOKIE)?.value

  console.log(`[Middleware] Path: ${pathname} | Token present: ${!!token} (${token?.slice(0, 10)}...) | Role: ${role}`)

  // Public auth pages should always be reachable.
  // If a stale/invalid token cookie exists, forcing a redirect from `/` -> `/dashboard`
  // can create a loop when the client later determines the session is invalid and
  // navigates back to `/`.
  if (pathname === '/' || pathname.startsWith(AUTH_ROUTE_PREFIX)) {
    return NextResponse.next()
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next()
  }

  // Check if session cookie is missing or expired
  if (!token || isSessionExpired(request)) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/'
    // Preserve querystring so users land back exactly where they intended.
    redirectUrl.searchParams.set('redirect', `${pathname}${request.nextUrl.search}`)
    return NextResponse.redirect(redirectUrl)
  }

  if (pathname.startsWith(ADMIN_ONLY_ROUTE_PREFIX)) {
    const role = request.cookies.get(ROLE_COOKIE)?.value
    if (role !== 'admin') {
      const target = request.nextUrl.clone()
      target.pathname = '/dashboard'
      target.search = ''
      return NextResponse.redirect(target)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/admin/:path*', '/auth/:path*', '/api/:path*'],
}

function parseInteger(value: string | undefined, fallback: number): number {
  if (typeof value !== 'string') {
    return fallback
  }

  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback
  }

  return parsed
}
