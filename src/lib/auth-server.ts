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
import { getConvexSiteUrl, getConvexUrl, getSiteUrl } from '@/lib/convex-env'

type AuthUtilities = ReturnType<typeof convexBetterAuthReactStart>

let authUtilities: AuthUtilities | null = null

function getAuthUtilities(): AuthUtilities {
  if (!authUtilities) {
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

/**
 * Server-side token fetch.
 *
 * The default getToken from convexBetterAuthReactStart calls the Convex site
 * URL directly (https://*.convex.site/api/auth/convex/token). But session
 * cookies are scoped to the app origin (Vercel domain), so the Convex backend
 * never sees them and returns 401.
 *
 * Instead, we call the token endpoint through our own proxy (/api/auth/convex/token)
 * which forwards the browser's cookies to Convex via the handler.
 *
 * Returns the token string directly (or null) for compatibility with all callers.
 */
export async function getToken(): Promise<string | null> {
  const { getRequestHeaders } = await import('@tanstack/react-start/server')
  const headers = new Headers(getRequestHeaders())
  headers.delete('content-length')
  headers.delete('transfer-encoding')
  headers.set('accept-encoding', 'identity')

  const siteUrl = getSiteUrl()
  const appUrl = new URL(siteUrl)
  headers.set('x-forwarded-host', appUrl.host)
  headers.set('x-forwarded-proto', appUrl.protocol.replace(':', ''))
  headers.set('x-forwarded-origin', siteUrl)

  const tokenRequest = new Request(`${siteUrl}/api/auth/convex/token`, {
    method: 'GET',
    headers,
  })
  const response = await proxyAuthToConvex(tokenRequest)
  if (!response.ok) {
    return null
  }
  const data = await response.json().catch(() => null) as
    | { token?: unknown }
    | null
  const token = data?.token
  return typeof token === 'string' && token.length > 0 ? token : null
}
