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

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTE_MATCHER.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/api/')) {
    const identifier = getClientIdentifier(request)
    const rateLimit = checkRateLimit(`api:${identifier}`, {
      maxRequests: API_RATE_LIMIT_MAX,
      windowMs: API_RATE_LIMIT_WINDOW_MS,
    })

    if (!rateLimit.allowed) {
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

  // Handle auth routes (including root which is now the sign-in page)
  if (pathname === '/' || pathname.startsWith(AUTH_ROUTE_PREFIX)) {
    if (token) {
      const target = request.nextUrl.clone()
      target.pathname = '/dashboard'
      target.search = ''
      return NextResponse.redirect(target)
    }
    return NextResponse.next()
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next()
  }

  if (!token) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/'
    redirectUrl.searchParams.set('redirect', pathname)
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
