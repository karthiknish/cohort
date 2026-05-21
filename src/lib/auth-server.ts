import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

function requireEnv(name: string, value: string | undefined | null): string {
  if (typeof value === 'string' && value.length > 0) return value
  throw new Error(`[auth-server] Missing required env var: ${name}`)
}

const convexUrl = requireEnv(
  'NEXT_PUBLIC_CONVEX_URL',
  process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.CONVEX_URL
)

// Convex Better Auth utilities need to *.convex.site URL.
// Many projects store this as NEXT_PUBLIC_CONVEX_HTTP_URL, so accept either.
export const convexSiteUrl = requireEnv(
  'NEXT_PUBLIC_CONVEX_SITE_URL (or NEXT_PUBLIC_CONVEX_HTTP_URL)',
  process.env.NEXT_PUBLIC_CONVEX_SITE_URL ??
  process.env.NEXT_PUBLIC_CONVEX_HTTP_URL
)

/** Next.js app origin — OAuth callbacks and redirects must use this, not *.convex.site. */
const appOrigin = (
  process.env.NEXT_PUBLIC_SITE_URL
  ?? process.env.NEXT_PUBLIC_APP_URL
  ?? 'http://localhost:3000'
).replace(/\/$/, '')

const convexOrigin = new URL(convexSiteUrl).origin

const authUtilities = convexBetterAuthNextJs({
  convexUrl,
  convexSiteUrl,
});

function rewriteConvexAuthUrls(value: string): string {
  return value.split(convexOrigin).join(appOrigin)
}

/**
 * Convex Better Auth runs on *.convex.site but OAuth must use the Next.js app URL.
 * Rewrite Location headers and JSON bodies so the browser never navigates to Convex for auth.
 */
async function rewriteConvexAuthResponse(response: Response): Promise<Response> {
  const headers = new Headers(response.headers)
  const location = headers.get('location')
  if (location) {
    headers.set('location', rewriteConvexAuthUrls(location))
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

/**
 * Proxy /api/auth to Convex but preserve the Next.js app origin for OAuth.
 * @see https://labs.convex.dev/better-auth/framework-guides/next
 */
async function proxyAuthToConvex(request: Request): Promise<Response> {
  const requestUrl = new URL(request.url)
  const targetUrl = `${convexSiteUrl}${requestUrl.pathname}${requestUrl.search}`
  const headers = new Headers(request.headers)
  headers.set('accept-encoding', 'application/json')
  headers.set('host', new URL(convexSiteUrl).host)
  headers.set('x-forwarded-host', requestUrl.host)
  headers.set('x-forwarded-proto', requestUrl.protocol.replace(':', ''))

  const init: RequestInit & { duplex?: 'half' } = {
    method: request.method,
    headers,
    redirect: 'manual',
  }
  if (request.method !== 'GET' && request.method !== 'HEAD' && request.body != null) {
    init.body = request.body
    // Node/undici requires duplex when forwarding a streaming request body.
    init.duplex = 'half'
  }

  const response = await fetch(targetUrl, init)
  return rewriteConvexAuthResponse(response)
}

export const handler = {
  GET: proxyAuthToConvex,
  POST: proxyAuthToConvex,
}

export const {
  preloadAuthQuery,
  isAuthenticated,
  getToken,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
} = authUtilities
