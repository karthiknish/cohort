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
  const upstream = await getAuthUtilities().handler(request)
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
