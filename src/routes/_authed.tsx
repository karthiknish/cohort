import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import {
  accountStatusRedirect,
  hasValidSession,
  shouldBypassAuthForDemo,
} from '@/lib/auth-guard'
import { getServerRequest } from '@/lib/server-request.server'
import { Button } from '@/shared/ui/button'
import { DashboardLoading } from '@/shared/ui/route-boundaries/dashboard-loading'

/**
 * Pathless layout — auth gate for workspace routes (replaces proxy.ts
 * matcher for /dashboard, /for-you, /admin, /settings).
 */
export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ location }) => {
    const pathname = location.pathname
    let request: Request | undefined
    try {
      request = getServerRequest()
    } catch {
      // SPA navigation — server request unavailable; client auth handles protection
    }
    if (!request) return

    if (shouldBypassAuthForDemo(pathname)) return

    const session = await hasValidSession(request)
    if (!session) {
      throw redirect({
        to: '/auth',
        search: { redirect: `${pathname}${location.searchStr}` },
      })
    }

    const statusTarget = accountStatusRedirect(request, pathname)
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
