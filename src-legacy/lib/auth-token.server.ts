/**
 * Server-side token fetch.
 *
 * This file is server-only — it imports from @tanstack/react-start/server
 * which cannot be bundled into client code. Keep it in a separate module
 * from auth-server.ts which is imported by client-side routes.
 *
 * The default getToken from convexBetterAuthReactStart calls the Convex site
 * URL directly (https://*.convex.site/api/auth/convex/token) with the
 * request headers (including cookies). We do the same here — the cookies
 * are in the request's `cookie` header and Convex can read them directly.
 *
 * Returns the token string directly (or null) for compatibility with all callers.
 */
import { getRequestHeaders } from '@tanstack/react-start/server'
import { getConvexSiteUrl } from '@/lib/convex-env'
import { fetchWithTimeout } from '@/lib/retry-utils'

const CONVEX_AUTH_TOKEN_TIMEOUT_MS = 8000

export async function getToken(): Promise<string | null> {
  const convexSiteUrl = getConvexSiteUrl()
  const tokenUrl = `${convexSiteUrl}/api/auth/convex/token`

  const headers = new Headers(getRequestHeaders())
  headers.delete('content-length')
  headers.delete('transfer-encoding')
  headers.set('accept-encoding', 'identity')
  // Better Auth on *.convex.site validates the session against the Host header.
  // The incoming request carries the app host (e.g. *.vercel.app); forwarding it
  // verbatim makes Convex reject a valid session (403/401). Rewrite Host to the
  // Convex site host — mirroring convexBetterAuthReactStart's own proxy handler.
  headers.set('host', new URL(convexSiteUrl).host)

  try {
    const response = await fetchWithTimeout(tokenUrl, {
      method: 'GET',
      headers,
      cache: 'no-store',
      timeoutMs: CONVEX_AUTH_TOKEN_TIMEOUT_MS,
      timeoutMessage: 'Timed out while checking the Convex auth token.',
    })
    if (!response.ok) {
      return null
    }
    const data = (await response.json().catch(() => null)) as
      | { token?: unknown }
      | null
    const token = data?.token
    return typeof token === 'string' && token.length > 0 ? token : null
  } catch {
    return null
  }
}
