/**
 * Convex Better Auth utilities for the TanStack Start shell.
 *
 * Uses `convexBetterAuthReactStart` from `@convex-dev/better-auth/react-start`.
 * OAuth URL rewriting (so browsers never navigate to *.convex.site) is
 * preserved from the legacy Next.js proxy implementation.
 *
 * Env is resolved lazily so importing this module on the client does not throw
 * at bundle evaluation time (only server handlers call into Convex auth).
 */
import { convexBetterAuthReactStart } from '@convex-dev/better-auth/react-start'
import {
  assertConvexDeploymentsAligned,
  getConvexSiteUrl,
  getConvexUrl,
  getSiteUrl,
} from '@/lib/convex-env'

type AuthUtilities = ReturnType<typeof convexBetterAuthReactStart>

let authUtilities: AuthUtilities | null = null

function getAuthUtilities(): AuthUtilities {
  if (!authUtilities) {
    // Guard against the split-brain deployment misconfiguration before any auth
    // proxying happens: a mismatch here means every minted JWT is rejected by
    // the data deployment, surfacing as inscrutable 401s + infinite loading.
    assertConvexDeploymentsAligned()
    authUtilities = convexBetterAuthReactStart({
      convexUrl: getConvexUrl(),
      convexSiteUrl: getConvexSiteUrl(),
    })
  }
  return authUtilities
}

function getConvexOrigin(): string {
  return new URL(getConvexSiteUrl()).origin
}

function rewriteConvexAuthUrls(value: string): string {
  return value.split(getConvexOrigin()).join(getSiteUrl())
}

async function rewriteConvexAuthResponse(response: Response): Promise<Response> {
  const headers = new Headers(response.headers)
  const location = headers.get('location')
  if (location) {
    headers.set('location', rewriteConvexAuthUrls(location))
  }

  // Pass Set-Cookie headers through. The cookies are set without a Domain
  // attribute, so the browser scopes them to the app origin (Vercel domain).
  // No rewriting needed — the proxy response origin is the app origin.
  const contentType = headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  }
  const body = await response.text()
  return new Response(rewriteConvexAuthUrls(body), {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

/** Proxy /api/auth/* to Convex with app-origin URL rewriting for OAuth. */
export async function proxyAuthToConvex(request: Request): Promise<Response> {
  const siteUrl = getSiteUrl()
  const appUrl = new URL(siteUrl)
  const requestUrl = new URL(request.url)
  const authPath = requestUrl.pathname.replace(/^\/api\/auth/, '')
  const hasCookie = Boolean(request.headers.get('cookie'))
  // Better Auth default cookie prefix is "better-auth" — session cookie is
  // "better-auth.session_token" and JWT cookie is "convex_jwt".
  const hasSessionCookie = Boolean(
    request.headers.get('cookie')?.includes('better-auth.session_token')
  )
  // Forward the app origin so Better Auth (with trustedProxyHeaders) sees the
  // correct base URL instead of the Convex site URL from the host header.
  const forwardedHeaders = new Headers(request.headers)
  forwardedHeaders.set('x-forwarded-host', appUrl.host)
  forwardedHeaders.set('x-forwarded-proto', appUrl.protocol.replace(':', ''))
  forwardedHeaders.set('x-forwarded-origin', siteUrl)
  const forwardedRequest = new Request(request.url, {
    method: request.method,
    headers: forwardedHeaders,
    body: request.body,
    redirect: 'manual',
    // @ts-expect-error - duplex is required for streaming request bodies
    duplex: 'half',
  })
  const upstream = await getAuthUtilities().handler(forwardedRequest)
  // Log 401s with enough context to diagnose cookie/proxy issues without
  // leaking secret values. This is the primary signal for auth polling loops.
  if (upstream.status === 401) {
    console.warn('[auth-proxy] 401', {
      path: authPath,
      method: request.method,
      hasCookie,
      hasSessionCookie,
      origin: request.headers.get('origin'),
    })
  }
  return rewriteConvexAuthResponse(upstream)
}

/**
 * Handler object shape (GET/POST) kept for parity with the legacy Next.js
 * export and the `@convex-dev/better-auth` surface.
 */
export const handler = {
  GET: proxyAuthToConvex,
  POST: proxyAuthToConvex,
}
