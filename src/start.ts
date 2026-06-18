import { createStart, createMiddleware } from '@tanstack/react-start'
import {
  buildRateLimitHeaders,
  createRateLimitConfig,
  RATE_LIMITS,
} from '@/lib/rate-limiter'
import { checkConvexRateLimit } from '@/lib/rate-limiter-convex'
import {
  isPreviewRouteRequest,
  PREVIEW_ROUTE_REQUEST_HEADER,
} from '@/lib/preview-data'

/**
 * Global TanStack Start instance — replaces `proxy.ts` (Next.js middleware).
 *
 * Responsibilities ported from proxy.ts + next.config.ts:
 *  - Security headers on every response (CSP, X-Frame-Options, HSTS, ...)
 *  - Blocked monitoring/crawler user-agents on /api/*
 *  - PostHog /ingest/* rewrite (was next.config rewrites())
 *  - Legacy redirect rules (was next.config redirects())
 *  - x-pathname request header for downstream server code
 *  - x-cohorts-preview-route header for preview-mode access (proxy.ts parity)
 *
 * Auth gating + account-status redirects live in the `_authed` layout route's
 * `beforeLoad` (src/routes/_authed.tsx) where they have access to the typed
 * router context, mirroring the Next.js matcher for protected routes.
 *
 * Rate limiting (Convex-backed) is wired in `apiRateLimitMiddleware`; see
 * the migration guide for the remaining hardening follow-ups.
 */

const BLOCKED_USER_AGENTS = [
  'uptimerobot',
  'pingdom',
  'statuscake',
  'site24x7',
  'uptrends',
  'healthchecks',
  'check-host',
  'monitor-us',
  'googlebot',
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

function parseInteger(value: string | undefined, fallback: number): number {
  if (typeof value !== 'string') return fallback
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return parsed
}

// Request-agnostic client IP (replaces proxy.ts getClientIdentifier).
function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp
  return `anon:${request.headers.get('user-agent') ?? 'unknown'}`
}

const isProduction = process.env.NODE_ENV === 'production'

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "form-action 'self'",
  [
    'script-src',
    "'self'",
    "'unsafe-inline'",
    ...(isProduction ? [] : ["'unsafe-eval'"]),
    'https://us.i.posthog.com',
  ].join(' '),
  "style-src 'self' 'unsafe-inline' https:",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "connect-src 'self' https: wss: blob:",
  "media-src 'self' blob: data: https:",
  [
    'frame-src',
    "'self'",
    'https://accounts.google.com',
    'https://*.google.com',
    'https://www.facebook.com',
    'https://*.facebook.com',
    'https://*.linkedin.com',
    'https://*.tiktok.com',
  ].join(' '),
  "worker-src 'self' blob:",
  'upgrade-insecure-requests',
].join('; ')

const SECURITY_HEADERS: Record<string, string> = {
  'Content-Security-Policy': CONTENT_SECURITY_POLICY,
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(self), microphone=(self), geolocation=(self), fullscreen=(self)',
}

function applySecurityHeaders(response: Response): Response {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value)
  }
  const forwardedProto = response.headers.get('x-forwarded-proto')
  if (response.url?.startsWith('https://') || forwardedProto === 'https') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload',
    )
  }
  return response
}

/** TanStack request middleware `next()` returns ctx with `.response`, not a bare Response. */
function resolveMiddlewareResponse(result: { response: Response } | Response): Response {
  if (result instanceof Response) return result
  return result.response
}

function finalizeMiddlewareResult<T extends { response: Response }>(
  result: T | Response,
  pathname: string,
  extraHeaders?: Record<string, string>,
): T | Response {
  const response = resolveMiddlewareResponse(result)
  response.headers.set('x-pathname', pathname)
  if (extraHeaders) {
    for (const [key, value] of Object.entries(extraHeaders)) {
      response.headers.set(key, value)
    }
  }
  applySecurityHeaders(response)
  return result
}

/** Legacy redirect rules ported from next.config.ts `redirects()`. */
function legacyRedirect(pathname: string): string | null {
  if (pathname === '/dashboard/activity') return '/for-you'
  if (pathname === '/dashboard/for-you') return '/for-you'
  return null
}

/** PostHog ingest reverse-proxy ported from next.config.ts `rewrites()`. */
async function proxyPostHog(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const target = new URL(`https://us.i.posthog.com${url.pathname.replace('/ingest', '')}${url.search}`)
  const headers = new Headers(request.headers)
  headers.set('host', target.host)
  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
    // @ts-expect-error duplex is required for streaming request bodies in undici
    duplex: 'half',
  })
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: upstream.headers,
  })
}

const securityMiddleware = createMiddleware().server(async ({ next, request }) => {
  const url = new URL(request.url)
  const { pathname } = url

  // PostHog reverse proxy (was next.config rewrites).
  if (pathname.startsWith('/ingest/')) {
    return applySecurityHeaders(await proxyPostHog(request))
  }

  // Legacy redirects (was next.config redirects).
  const target = legacyRedirect(pathname)
  if (target) {
    return applySecurityHeaders(Response.redirect(new URL(target, url.origin), 307))
  }

  // Preview-mode header (was proxy.ts isPreviewRouteRequest).
  if (isPreviewRouteRequest(pathname, url.searchParams)) {
    const response = await next()
    return finalizeMiddlewareResult(response, pathname, {
      [PREVIEW_ROUTE_REQUEST_HEADER]: '1',
    })
  }

  // API routes: block bad user-agents + Convex-backed rate limiting.
  if (pathname.startsWith('/api/')) {
    const userAgent = request.headers.get('user-agent')?.toLowerCase() ?? ''
    if (BLOCKED_USER_AGENTS.some((bot) => userAgent.includes(bot))) {
      return applySecurityHeaders(
        Response.json({ success: false, error: 'Not allowed' }, { status: 403 }),
      )
    }

    const clientIp = getClientIp(request)
    const rateLimit = await checkConvexRateLimit(
      `api:${clientIp}`,
      createRateLimitConfig(API_RATE_LIMIT_MAX, API_RATE_LIMIT_WINDOW_MS),
    )

    const rateLimitHeaders = buildRateLimitHeaders(rateLimit)

    if (!rateLimit.allowed) {
      return applySecurityHeaders(
        Response.json(
          { error: 'Too many requests. Please slow down.' },
          { status: 429, headers: rateLimitHeaders },
        ),
      )
    }

    // Rate-limit passed — attach headers to the actual response.
    const response = await next()
    const finalized = finalizeMiddlewareResult(response, pathname)
    if (!(finalized instanceof Response)) {
      rateLimitHeaders.forEach((value, key) => {
        finalized.response.headers.set(key, value)
      })
    }
    return finalized
  }

  const response = await next()
  return finalizeMiddlewareResult(response, pathname)
})

export const startInstance = createStart(() => ({
  requestMiddleware: [securityMiddleware],
}))
