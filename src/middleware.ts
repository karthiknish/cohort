import { NextRequest, NextResponse } from 'next/server'

// Rate limiting store (in-memory for simplicity)
const rateLimit = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10 // per minute per IP

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

/**
 * Middleware to protect API routes from unnecessary calls
 * Blocks monitoring bots and rate limits by IP
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Only apply to /api/auth/* routes
  if (!pathname.startsWith('/api/auth/')) {
    return NextResponse.next()
  }

  const userAgent = request.headers.get('user-agent')?.toLowerCase() ?? ''

  // Block common monitoring/crawling user-agents
  if (BLOCKED_USER_AGENTS.some(bot => userAgent.includes(bot))) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Middleware] Blocked ${userAgent} from ${pathname}`)
    }
    return NextResponse.json(
      { success: false, error: 'Not allowed' },
      { status: 403 }
    )
  }

  // Rate limit auth endpoints by IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ??
               request.headers.get('x-real-ip') ??
               'unknown'

  const now = Date.now()
  const limit = rateLimit.get(ip)

  if (!limit || now > limit.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return NextResponse.next()
  }

  if (limit.count >= RATE_LIMIT_MAX_REQUESTS) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Middleware] Rate limited ${ip} from ${pathname}`)
    }
    return NextResponse.json(
      { success: false, error: 'Too many requests' },
      { status: 429 }
    )
  }

  limit.count++
  return NextResponse.next()
}

export const config = {
  matcher: '/api/auth/:path*',
}
