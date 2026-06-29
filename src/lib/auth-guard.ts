/**
 * Auth gating ported from `proxy.ts` for TanStack Router `beforeLoad`.
 *
 * Pure utility functions only — no server-only imports. hasValidSession lives
 * in auth-session.server.ts to keep this file client-bundle-safe.
 */
import {
  isPreviewRouteRequest,
  isScreenRecordingAuthBypassEnabled,
} from '@/lib/preview-data'

const PROTECTED_ROUTE_PREFIXES = ['/dashboard', '/for-you', '/admin', '/settings'] as const

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )
}

/**
 * Resolves the SSR redirect target for a non-active account.
 *
 * Previously this read the `cohorts_status` cookie; with the official Convex
 * + Better Auth structure there are no custom session cookies, so the caller
 * resolves the status server-side (via the Convex domain `users` table) and
 * passes it in. `null` (unknown / not yet resolved) means "no redirect" — the
 * client-side `ProtectedRoute` gate handles the remaining cases.
 */
export function accountStatusRedirect(
  status: string | null,
  pathname: string,
): { to: string; search?: Record<string, string> } | null {
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
      pathname.startsWith('/for-you'))
  )
}
