import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import {
  accountStatusRedirect,
  shouldBypassAuthForDemo,
} from '@/lib/auth-guard'
import { getToken } from '@/lib/auth-server'
import { decodeJwtSubject } from '@/lib/jwt-utils'
import { getSystemConvexClient } from '@/lib/convex-system-client'
import { internal } from '@convex/_generated/api'
import type { FunctionReference } from 'convex/server'
import { Button } from '@/shared/ui/button'
import { DashboardLoading } from '@/shared/ui/route-boundaries/dashboard-loading'

const checkAuthAndStatus = createServerFn({ method: 'GET' })
  .validator((data: unknown) => {
    if (data && typeof data === 'object' && 'pathname' in data) {
      return { pathname: String((data as { pathname: unknown }).pathname) }
    }
    return { pathname: '/' }
  })
  .handler(async ({ data }) => {
    const pathname = data.pathname
    if (shouldBypassAuthForDemo(pathname)) {
      return { authenticated: true, redirect: null }
    }

    const token = await getToken()
    if (!token) {
      return {
        authenticated: false,
        redirect: {
          to: '/auth',
          search: { redirect: pathname },
        },
      }
    }

    // Resolve user status server-side
    let statusTarget: ReturnType<typeof accountStatusRedirect> = null
    try {
      const legacyId = decodeJwtSubject(token)
      if (legacyId) {
        const client = getSystemConvexClient()
        if (client) {
          const result = await client.query(
            internal.users.getStatusByLegacyId as unknown as FunctionReference<'query'>,
            { legacyId },
          )
          if (result) {
            statusTarget = accountStatusRedirect(result.status, pathname)
          }
        }
      }
    } catch {
      // Fall through — client gate handles it
    }

    if (statusTarget) {
      return { authenticated: true, redirect: statusTarget }
    }

    return { authenticated: true, redirect: null }
  },
)

/**
 * Pathless layout — auth gate for workspace routes.
 * Uses the official Convex Better Auth `getToken` for SSR auth checks.
 */
export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ location }) => {
    const pathname = location.pathname

    // On client navigation, skip SSR auth check — ConvexBetterAuthProvider handles it
    if (typeof document !== 'undefined') return

    const result = await checkAuthAndStatus({ data: { pathname } })
    if (!result.authenticated && result.redirect) {
      throw redirect(result.redirect)
    }
    if (result.redirect) {
      throw redirect(result.redirect)
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
