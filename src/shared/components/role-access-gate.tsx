'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import {
  accessDeniedContentForCapability,
  accessDeniedContentForPath,
  can,
  canAccessPath,
  normalizeAuthRole,
  type DashboardCapability,
} from '@/lib/access-control/dashboard-access'
import { useAuth } from '@/shared/contexts/auth-context'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'

type RoleAccessGateProps = {
  children: ReactNode
  /** Check a specific capability instead of deriving from pathname. */
  capability?: DashboardCapability
  /** When set, only applies the gate when pathname matches (exact or nested). */
  pathnamePrefix?: string
  fallback?: ReactNode
}

function AccessDeniedPanel({
  title,
  message,
  actionLabel,
  actionHref,
}: {
  title: string
  message: string
  actionLabel: string
  actionHref: string
}) {
  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 py-12 text-center"
      role="status"
      aria-live="polite"
    >
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      <Button asChild variant="default">
        <Link href={actionHref}>{actionLabel}</Link>
      </Button>
    </div>
  )
}

function RoleAccessLoadingState() {
  return (
    <div
      className="mx-auto w-full max-w-3xl space-y-4 py-10"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Skeleton className="h-24 w-full rounded-lg" />
      <Skeleton className="h-32 w-full rounded-lg" />
      <span className="sr-only">Checking access permissions…</span>
    </div>
  )
}

export function RoleAccessGate({
  children,
  capability,
  pathnamePrefix,
  fallback,
}: RoleAccessGateProps) {
  const pathname = usePathname()
  const { user, loading } = useAuth()

  const appliesToPath =
    !pathnamePrefix ||
    pathname === pathnamePrefix ||
    pathname.startsWith(`${pathnamePrefix}/`)

  if (!appliesToPath && !capability) {
    return <>{children}</>
  }

  if (loading) {
    return <RoleAccessLoadingState />
  }

  const role = normalizeAuthRole(user?.role)
  const deniedByPath = capability ? null : accessDeniedContentForPath(pathname, role)
  const deniedByCapability =
    capability && !can(role, capability)
      ? accessDeniedContentForCapability(capability, role)
      : null

  const denied =
    deniedByCapability ??
    deniedByPath ??
    (capability === undefined && !canAccessPath(role, pathname) ? accessDeniedContentForPath(pathname, role) : null)

  if (denied) {
    if (fallback) {
      return <>{fallback}</>
    }
    return (
      <AccessDeniedPanel
        title={denied.title}
        message={denied.message}
        actionLabel={denied.actionLabel}
        actionHref={denied.actionHref}
      />
    )
  }

  return <>{children}</>
}
