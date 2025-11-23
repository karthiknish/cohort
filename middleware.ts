import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const API_RATE_LIMIT_MAX = parseInteger(process.env.API_RATE_LIMIT_MAX, 100)
const API_RATE_LIMIT_WINDOW_MS = parseInteger(process.env.API_RATE_LIMIT_WINDOW_MS, 60_000)

// Initialize Upstash Ratelimit if env vars are present
let ratelimit: Ratelimit | null = null

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(API_RATE_LIMIT_MAX, `${API_RATE_LIMIT_WINDOW_MS} ms`),
    analytics: true,
    prefix: '@upstash/ratelimit',
  })
}

// Fallback in-memory rate limiting for when Redis is not configured
type RateLimitBucket = {
  count: number
  resetAt: number
}

const rateLimitBuckets = new Map<string, RateLimitBucket>()

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
    const rateLimit = await consumeRateLimit(request)

    if (!rateLimit.allowed) {
      const response = NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        {
          status: 429,
          headers: buildRateLimitHeaders(rateLimit),
        },
      )
      return response
    }

    const response = NextResponse.next({ headers: buildRateLimitHeaders(rateLimit) })
    return response
  }
  const token = request.cookies.get(AUTH_COOKIE)?.value

  if (pathname.startsWith(AUTH_ROUTE_PREFIX)) {
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
    redirectUrl.pathname = '/auth'
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
  matcher: ['/dashboard/:path*', '/admin/:path*', '/auth/:path*', '/api/:path*'],
}

async function consumeRateLimit(request: NextRequest) {
  const key = getClientKey(request)
  
  // Use Upstash Redis if available
  if (ratelimit) {
    try {
      const { success, limit, remaining, reset } = await ratelimit.limit(key)
      return {
        allowed: success,
        limit,
        remaining,
        resetAt: reset,
      }
    } catch (error) {
      console.error('Rate limit check failed:', error)
      // Fallback to in-memory if Redis fails
    }
  }

  // In-memory fallback
  const now = Date.now()
  const bucket = rateLimitBuckets.get(key)
  const windowMs = API_RATE_LIMIT_WINDOW_MS
  const limit = API_RATE_LIMIT_MAX

  if (!bucket || now >= bucket.resetAt) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs })
    return {
      allowed: true,
      limit,
      remaining: Math.max(0, limit - 1),
      resetAt: now + windowMs,
    }
  }

  if (bucket.count < limit) {
    bucket.count += 1
    return {
      allowed: true,
      limit,
      remaining: Math.max(0, limit - bucket.count),
      resetAt: bucket.resetAt,
    }
  }

  return {
    allowed: false,
    limit,
    remaining: 0,
    resetAt: bucket.resetAt,
  }
}

function buildRateLimitHeaders(result: {
  limit: number
  remaining: number
  resetAt: number
}) {
  const headers = new Headers()
  headers.set('X-RateLimit-Limit', String(result.limit))
  headers.set('X-RateLimit-Remaining', String(Math.max(0, result.remaining)))
  headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)))
  const retryAfter = Math.max(0, Math.ceil((result.resetAt - Date.now()) / 1000))
  headers.set('Retry-After', String(retryAfter))
  return headers
}

function getClientKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const [first] = forwarded.split(',')
    if (first && first.trim().length > 0) {
      return first.trim()
    }
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp && realIp.length > 0) {
    return realIp
  }

  const geoIp = getGeoIp(request)
  if (geoIp && geoIp.length > 0) {
    return geoIp
  }

  return `anon:${request.headers.get('user-agent') ?? 'unknown'}`
}

function getGeoIp(request: NextRequest): string | undefined {
  const geo = (request as NextRequest & { geo?: { ip?: string | null } }).geo
  return geo?.ip ?? undefined
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
