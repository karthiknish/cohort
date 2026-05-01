import { getToken } from '@convex-dev/better-auth/utils'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { convexSiteUrl } from '@/lib/auth-server'
import {
  isPreviewRouteRequest,
  isScreenRecordingAuthBypassEnabled,
  PREVIEW_ROUTE_REQUEST_HEADER,
} from '@/lib/preview-data'
import {
  buildRateLimitHeaders,
  createRateLimitConfig,
  getClientIdentifier,
  RATE_LIMITS,
} from '@/lib/rate-limiter'
import { checkConvexRateLimit } from '@/lib/rate-limiter-convex'

// User-agents to block (monitoring bots, crawlers that don't respect auth)
const BLOCKED_USER_AGENTS = [
  'uptimerobot',
  'pingdom',
  'statuscake',
  'site24x7',
  'uptrends',
  'healthchecks',
  'check-host',
  'monitor-us',
  'googlebot', // Block Google bot from hitting auth endpoints
  'bingbot',
  'semrush',
  'bot-',
  'crawler',
  'spider',
  'curl',
  'wget',
  'python-requests',
  'axios',
  'node-fetch',
  'httpie',
  'insomnia',
  'postman',
]

const API_RATE_LIMIT_MAX = parseInteger(
  process.env.API_RATE_LIMIT_MAX,
  RATE_LIMITS.standard.maxRequests,
)
const API_RATE_LIMIT_WINDOW_MS = parseInteger(
  process.env.API_RATE_LIMIT_WINDOW_MS,
  RATE_LIMITS.standard.windowMs,
)

const PROTECTED_ROUTE_MATCHER = ['/dashboard', '/admin']
const AUTH_ROUTE_PREFIX = '/auth'
const CONTENT_SECURITY_POLICY = [
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "form-action 'self'",
  'upgrade-insecure-requests',
].join('; ')

function applySecurityHeaders(request: NextRequest, response: NextResponse): NextResponse {
  response.headers.set('Content-Security-Policy', CONTENT_SECURITY_POLICY)
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), geolocation=(), microphone=(), payment=(), usb=()'
  )

  const forwardedProto = request.headers.get('x-forwarded-proto')
  if (request.nextUrl.protocol === 'https:' || forwardedProto === 'https') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }

  return response
}

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTE_MATCHER.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )
}

async function hasValidSession(request: NextRequest): Promise<boolean> {
  try {
    const tokenResult = await getToken(convexSiteUrl, request.headers)
    return !!tokenResult?.token
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Proxy] session check error:', err)
    }
    return false
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const screenRecordingAuthBypassEnabled = isScreenRecordingAuthBypassEnabled()

  if (pathname.startsWith('/api/')) {
    // Block common monitoring/crawling user-agents from API routes
    const userAgent = request.headers.get('user-agent')?.toLowerCase() ?? ''
    if (BLOCKED_USER_AGENTS.some((bot) => userAgent.includes(bot))) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Proxy] Blocked ${userAgent} from ${pathname}`)
      }
      return applySecurityHeaders(
        request,
        NextResponse.json({ success: false, error: 'Not allowed' }, { status: 403 })
      )
    }
    const identifier = getClientIdentifier(request)
    const rateLimit = await checkConvexRateLimit(
      `api:${identifier}`,
      createRateLimitConfig(API_RATE_LIMIT_MAX, API_RATE_LIMIT_WINDOW_MS),
    )

    if (process.env.NODE_ENV !== 'production') {
      console.log(
        `[Proxy] API Request: ${pathname} | ID: ${identifier} | Allowed: ${rateLimit.allowed}`,
      )
    }

    if (!rateLimit.allowed) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[Proxy] Rate limit exceeded for ${identifier} on ${pathname}`)
      }
      return applySecurityHeaders(
        request,
        NextResponse.json(
          { error: 'Too many requests. Please slow down.' },
          {
            status: 429,
            headers: buildRateLimitHeaders(rateLimit),
          },
        ),
      )
    }

    const response = NextResponse.next()
    const headers = buildRateLimitHeaders(rateLimit)
    headers.forEach((value, key) => {
      response.headers.set(key, value)
    })
    return applySecurityHeaders(request, response)
  }

  if (isPreviewRouteRequest(pathname, request.nextUrl.searchParams)) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set(PREVIEW_ROUTE_REQUEST_HEADER, '1')

    return applySecurityHeaders(
      request,
      NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    )
  }

  if (screenRecordingAuthBypassEnabled && pathname === '/dashboard') {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard/for-you'
    return applySecurityHeaders(request, NextResponse.redirect(redirectUrl))
  }

  if (screenRecordingAuthBypassEnabled && pathname.startsWith('/dashboard/')) {
    return applySecurityHeaders(request, NextResponse.next())
  }

  const hasSession = await hasValidSession(request)

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Proxy] Path: ${pathname} | Has valid session: ${hasSession}`)
  }

  // Public auth pages should always be reachable without redirection.
  if (pathname.startsWith(AUTH_ROUTE_PREFIX)) {
    return applySecurityHeaders(request, NextResponse.next())
  }

  // For the home page (/), redirect authenticated users directly to their
  // personalized workspace instead of bouncing through /dashboard.
  if (pathname === '/') {
    if (hasSession) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/dashboard/for-you'
      return applySecurityHeaders(request, NextResponse.redirect(redirectUrl))
    }
    // No valid session - allow access to home/login page
    return applySecurityHeaders(request, NextResponse.next())
  }

  if (!isProtectedPath(pathname)) {
    return applySecurityHeaders(request, NextResponse.next())
  }

  // Check if session is missing or expired
  if (!hasSession) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth'
    // Preserve querystring so users land back exactly where they intended.
    redirectUrl.searchParams.set('redirect', `${pathname}${request.nextUrl.search}`)
    return applySecurityHeaders(request, NextResponse.redirect(redirectUrl))
  }

  // Preserve the legacy /dashboard entrypoint, but redirect it before the page
  // tree renders so dev profilers do not mount the redirect-only page.
  if (pathname === '/dashboard') {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard/for-you'
    return applySecurityHeaders(request, NextResponse.redirect(redirectUrl))
  }

  // Admin route protection is now enforced server-side in API routes and page loaders,
  // not via a forgeable cookie. Middleware only checks authentication.

  return applySecurityHeaders(request, NextResponse.next())
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
