/**
 * Convex Better Auth utilities for the TanStack Start shell.
 *
 * Uses `convexBetterAuthReactStart` from `@convex-dev/better-auth/react-start`.
 * OAuth URL rewriting (so browsers never navigate to *.convex.site) is
 * preserved from the legacy Next.js proxy implementation.
 */
import { convexBetterAuthReactStart } from '@convex-dev/better-auth/react-start'

function requireEnv(name: string, value: string | undefined | null): string {
  if (typeof value === 'string' && value.length > 0) return value
  throw new Error(`[auth-server] Missing required env var: ${name}`)
}

const convexUrl = requireEnv(
  'NEXT_PUBLIC_CONVEX_URL',
  process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.CONVEX_URL,
)

export const convexSiteUrl = requireEnv(
  'NEXT_PUBLIC_CONVEX_SITE_URL (or NEXT_PUBLIC_CONVEX_HTTP_URL)',
  process.env.NEXT_PUBLIC_CONVEX_SITE_URL ?? process.env.NEXT_PUBLIC_CONVEX_HTTP_URL,
)

function resolveAppOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return raw.trim().replace(/\/$/, '')
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      '[auth-server] NEXT_PUBLIC_SITE_URL (or NEXT_PUBLIC_APP_URL) is required in production',
    )
  }
  return 'http://localhost:3000'
}

const appOrigin = resolveAppOrigin()
const convexOrigin = new URL(convexSiteUrl).origin

const authUtilities = convexBetterAuthReactStart({
  convexUrl,
  convexSiteUrl,
})

function rewriteConvexAuthUrls(value: string): string {
  return value.split(convexOrigin).join(appOrigin)
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
  const upstream = await authUtilities.handler(request)
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

export const { getToken, fetchAuthQuery, fetchAuthMutation, fetchAuthAction } =
  authUtilities
