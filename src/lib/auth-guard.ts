/**
 * Auth gating ported from `proxy.ts` for TanStack Router `beforeLoad`.
 */
import { getToken } from '@convex-dev/better-auth/utils'
import { getConvexSiteUrl } from '@/lib/convex-env'
import {
  isPreviewRouteRequest,
  isScreenRecordingAuthBypassEnabled,
} from '@/lib/preview-data'

const PROTECTED_ROUTE_PREFIXES = ['/dashboard', '/for-you', '/admin', '/settings'] as const

function parseCookieValue(cookieHeader: string, name: string): string | undefined {
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=')
    if (idx === -1) continue
    const key = part.slice(0, idx).trim()
    if (key === name) return part.slice(idx + 1).trim()
  }
  return undefined
}

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )
}

export async function hasValidSession(request: Request): Promise<boolean> {
  try {
    const tokenResult = await getToken(getConvexSiteUrl(), request.headers)
    return !!tokenResult?.token
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[auth-guard] session check error:', err)
    }
    return false
  }
}

export function accountStatusRedirect(
  request: Request,
  pathname: string,
): { to: string; search?: Record<string, string> } | null {
  const status = parseCookieValue(request.headers.get('cookie') ?? '', 'cohorts_status')
  if (!status) return null

  if (status === 'pending' || status === 'invited') {
    if (pathname.startsWith('/pending-approval') || pathname.startsWith('/auth')) return null
    return { to: '/pending-approval' }
  }

  if (status === 'disabled' || status === 'suspended') {
    if (pathname.startsWith('/auth')) return null
    return {
      to: '/auth',
      search: {
        error: status === 'disabled' ? 'account_disabled' : 'account_suspended',
      },
    }
  }

  return null
}

export function shouldAllowPreviewAccess(request: Request, pathname: string): boolean {
  if (isScreenRecordingAuthBypassEnabled()) return true
  const url = new URL(request.url)
  return isPreviewRouteRequest(pathname, url.searchParams)
}

export function shouldBypassAuthForDemo(pathname: string): boolean {
  return (
    isScreenRecordingAuthBypassEnabled() &&
    (pathname === '/dashboard' ||
      pathname.startsWith('/dashboard/') ||
      pathname.startsWith('/for-you') ||
      pathname.startsWith('/admin'))
  )
}
