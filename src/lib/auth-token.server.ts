/**
 * Server-side token fetch.
 *
 * This file is server-only — it imports from @tanstack/react-start/server
 * which cannot be bundled into client code. Keep it in a separate module
 * from auth-server.ts which is imported by client-side routes.
 *
 * The default getToken from convexBetterAuthReactStart calls the Convex site
 * URL directly (https://*.convex.site/api/auth/convex/token). But session
 * cookies are scoped to the app origin (Vercel domain), so the Convex backend
 * never sees them and returns 401.
 *
 * Instead, we call the token endpoint through our own proxy
 * (/api/auth/convex/token) which forwards the browser's cookies to Convex.
 *
 * Returns the token string directly (or null) for compatibility with all callers.
 */
import { getRequestHeaders } from '@tanstack/react-start/server'
import { getSiteUrl } from '@/lib/convex-env'
import { proxyAuthToConvex } from '@/lib/auth-server'

export async function getToken(): Promise<string | null> {
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
  const data = (await response.json().catch(() => null)) as
    | { token?: unknown }
    | null
  const token = data?.token
  return typeof token === 'string' && token.length > 0 ? token : null
}
