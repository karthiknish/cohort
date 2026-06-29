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

  // Rewrite Set-Cookie domain from Convex origin to app origin so the browser
  // accepts the cookies. Without this, auth cookies set by Convex are rejected
  // because they're scoped to *.convex.site.
  const appHost = new URL(getSiteUrl()).host
  const setCookies = headers.getSetCookie?.() ?? []
  if (setCookies.length > 0) {
    headers.delete('set-cookie')
    for (const cookie of setCookies) {
      const rewritten = cookie
        .replace(/Domain=[^;]+;?/gi, `Domain=${appHost}; `)
        .replace(/SameSite=[^;]+;?/gi, 'SameSite=lax; ')
      headers.append('set-cookie', rewritten)
    }
  }

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
  // Without this, Better Auth treats the request as cross-domain and moves
  // Set-Cookie to Set-Better-Auth-Cookie, which the client doesn't read.
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

  // DEBUG: log upstream headers to see what Convex returns
  if (process.env.NODE_ENV === 'production') {
    const upstreamHeaders: Record<string, string> = {}
    upstream.headers.forEach((v, k) => { upstreamHeaders[k] = v.substring(0, 200) })
    const setCookies = upstream.headers.getSetCookie?.() ?? []
    console.log('[auth-proxy] upstream', {
      status: upstream.status,
      setCookieCount: setCookies.length,
      setCookies: setCookies.map(c => c.substring(0, 150)),
      betterAuthCookie: upstream.headers.get('set-better-auth-cookie'),
      allHeaders: upstreamHeaders,
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

export function getToken(
  ...args: Parameters<AuthUtilities['getToken']>
): ReturnType<AuthUtilities['getToken']> {
  return getAuthUtilities().getToken(...args)
}
