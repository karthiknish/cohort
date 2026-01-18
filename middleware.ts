import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import {
  getClientIdentifier,
  buildRateLimitHeaders,
  RATE_LIMITS
} from '@/lib/rate-limiter'
import { checkConvexRateLimit } from '@/lib/rate-limiter-convex'
import { getToken } from '@convex-dev/better-auth/utils'
import { convexSiteUrl } from '@/lib/auth-server'

const API_RATE_LIMIT_MAX = parseInteger(process.env.API_RATE_LIMIT_MAX, RATE_LIMITS.standard.maxRequests)
const API_RATE_LIMIT_WINDOW_MS = parseInteger(process.env.API_RATE_LIMIT_WINDOW_MS, RATE_LIMITS.standard.windowMs)

const PROTECTED_ROUTE_MATCHER = ['/dashboard', '/admin']
const ADMIN_ONLY_ROUTE_PREFIX = '/admin'
const AUTH_ROUTE_PREFIX = '/auth'

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTE_MATCHER.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

async function hasValidSession(request: NextRequest): Promise<boolean> {
  try {
    const tokenResult = await getToken(convexSiteUrl, request.headers)
    return !!tokenResult?.token
  } catch (err) {
    console.error('[Middleware] session check error:', err)
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/api/')) {
    const identifier = getClientIdentifier(request)
    const rateLimit = await checkConvexRateLimit(`api:${identifier}`, {
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

  const hasSession = await hasValidSession(request)

  console.log(`[Middleware] Path: ${pathname} | Has valid session: ${hasSession}`)

  // Public auth pages should always be reachable without redirection.
  if (pathname.startsWith(AUTH_ROUTE_PREFIX)) {
    return NextResponse.next()
  }

  // For the home page (/), redirect authenticated users to dashboard
  // This eliminates the brief flash of home page before client-side redirect
  if (pathname === '/') {
    if (hasSession) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/dashboard'
      return NextResponse.redirect(redirectUrl)
    }
    // No valid session - allow access to home/login page
    return NextResponse.next()
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next()
  }

  // Check if session is missing or expired
  if (!hasSession) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/'
    // Preserve querystring so users land back exactly where they intended.
    redirectUrl.searchParams.set('redirect', `${pathname}${request.nextUrl.search}`)
    return NextResponse.redirect(redirectUrl)
  }

  // Admin route protection is now enforced server-side in API routes and page loaders,
  // not via a forgeable cookie. Middleware only checks authentication.

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
