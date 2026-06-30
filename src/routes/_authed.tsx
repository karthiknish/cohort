import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import {
  accountStatusRedirect,
  shouldBypassAuthForDemo,
} from '@/lib/auth-guard'
import { resolveUserStatus } from '@/lib/auth-session.server'
import { getToken } from '@/lib/auth-server'
import { Button } from '@/shared/ui/button'
import { DashboardLoading } from '@/shared/ui/route-boundaries/dashboard-loading'

/**
 * Pathless layout — auth gate for workspace routes.
 * Uses the official Convex Better Auth `getToken` for SSR auth checks.
 */
export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ location }) => {
    const pathname = location.pathname

    if (shouldBypassAuthForDemo(pathname)) return

    // SSR: check auth via Better Auth token
    // On the client, the ConvexBetterAuthProvider handles auth reactively
    if (typeof document !== 'undefined') return

    const token = await getToken()
    if (!token) {
      throw redirect({
        to: '/auth',
        search: { redirect: `${pathname}${location.searchStr}` },
      })
    }

    // Resolve the domain status server-side.
    // On any failure, fall through — the client-side ProtectedRoute gate still
    // enforces status redirects reactively once Convex auth settles.
    const status = await resolveUserStatus()
    const statusTarget = accountStatusRedirect(status, pathname)
    if (statusTarget) {
      throw redirect(statusTarget)
    }
  },
  component: () => <Outlet />,
  errorComponent: AuthGateError,
  pendingComponent: DashboardLoading,
})

function AuthGateError({ error, reset }: ErrorComponentProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <p className="text-sm text-muted-foreground">
        Something went wrong while loading this page.
      </p>
      <Button onClick={reset} variant="outline" size="sm">
        Try again
      </Button>
      {process.env.NODE_ENV === 'development' && (
        <pre className="max-w-lg overflow-auto rounded-md bg-muted p-4 text-xs text-muted-foreground">
          {error.message}
        </pre>
      )}
    </div>
  )
}
