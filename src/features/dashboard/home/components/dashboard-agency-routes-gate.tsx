'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useAuth } from '@/shared/contexts/auth-context'
import { Button } from '@/shared/ui/button'

/** Dashboard routes that match sidebar `roles: ['admin', 'team']` only. */
const AGENCY_ROUTE_PREFIXES = ['/dashboard/ads', '/dashboard/socials', '/dashboard/proposals'] as const

function isAgencyOnlyPath(pathname: string): boolean {
  return AGENCY_ROUTE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

export function DashboardAgencyRoutesGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, loading } = useAuth()

  if (!isAgencyOnlyPath(pathname)) {
    return <>{children}</>
  }

  if (loading) {
    return <>{children}</>
  }

  if (user?.role === 'client') {
    return (
      <div
        className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 py-12 text-center"
        role="status"
      >
        <h1 className="text-lg font-semibold text-foreground">This area is for agency team members</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Analytics-style tools here are not available in the client workspace view. Switch to a team account or ask
          your admin for access.
        </p>
        <Button asChild variant="default">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    )
  }

  return <>{children}</>
}
