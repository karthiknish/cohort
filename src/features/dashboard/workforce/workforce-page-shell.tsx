'use client'

import Link from 'next/link'
import { type ReactNode, useMemo } from 'react'
import { ArrowRight, Construction, type LucideIcon } from 'lucide-react'

import { DASHBOARD_THEME } from '@/lib/dashboard-theme'
import { cn } from '@/lib/utils'
import { WORKFORCE_ROUTE_MAP, WORKFORCE_ROUTES } from '@/lib/workforce-routes'
import type { WorkforceRouteId } from '@/types/workforce'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { DashboardPageHeader, StatsGrid, StatCard } from '@/features/dashboard/home/components/dashboard-page-header'

type WorkforcePageShellProps = {
  routeId: WorkforceRouteId
  title: string
  description: string
  icon: LucideIcon
  badgeLabel: string
  stats: Array<{
    label: string
    value: string
    description: string
    icon: LucideIcon
    variant?: 'default' | 'success' | 'warning' | 'destructive'
  }>
  children: ReactNode
  ctaHref?: string
  ctaLabel?: string
}

export function WorkforcePageShell({
  routeId,
  title,
  description,
  icon,
  badgeLabel,
  stats,
  children,
  ctaHref = '/dashboard/tasks',
  ctaLabel = 'Link this into task workflows',
}: WorkforcePageShellProps) {
  const currentRoute = WORKFORCE_ROUTE_MAP[routeId]
  const relatedRoutes = WORKFORCE_ROUTES.filter((route) => route.section === currentRoute.section && route.id !== routeId).slice(0, 3)
  const headerBadge = useMemo(() => ({ label: badgeLabel, variant: 'primary' as const }), [badgeLabel])
  const headerAction = useMemo(
    () => (
      <Button asChild variant="outline" className="rounded-xl">
        <Link href={ctaHref}>
          {ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    ),
    [ctaHref, ctaLabel],
  )

  return (
    <div className={DASHBOARD_THEME.layout.container}>
      <DashboardPageHeader
        title={title}
        description={description}
        icon={icon}
        badge={headerBadge}
        actions={headerAction}
      />

      <Card className="border-accent/20 bg-card shadow-xl shadow-primary/10">
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl space-y-2">
            <Badge className="border-accent/20 bg-accent/10 text-primary hover:bg-accent/10">Team operations</Badge>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Team work and agency tools in one workspace</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Run schedules, time, and checklists here; use Agency tools for analytics, paid media, and client-facing deliverables.
            </p>
          </div>
          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <Construction className="h-4 w-4" />
              Tip
            </div>
            <p className="mt-2 max-w-xs text-muted-foreground">
              Data is scoped to your agency workspace. Link clients or projects on records when that field exists.
            </p>
          </div>
        </CardContent>
      </Card>

      <StatsGrid columns={4}>
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            variant={stat.variant}
          />
        ))}
      </StatsGrid>

      {children}

      {relatedRoutes.length > 0 ? (
        <Card>
          <CardContent className="grid gap-4 p-6 md:grid-cols-3">
            {relatedRoutes.map((route) => (
              <Link
                key={route.id}
                href={route.href}
                className="rounded-2xl border border-muted/50 bg-muted/10 p-4 transition-colors hover:bg-muted/20"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-2xl bg-accent/10 p-3 text-primary">
                    <route.icon className="h-4 w-4" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="mt-4 font-medium text-foreground">{route.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{route.description}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

export function WorkforceStatusBadge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'success' | 'warning' | 'critical'
}) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]',
        tone === 'neutral' && 'border-muted/40 bg-muted/50 text-muted-foreground',
        tone === 'success' && 'border-success/20 bg-success/10 text-success',
        tone === 'warning' && 'border-warning/20 bg-warning/10 text-warning',
        tone === 'critical' && 'border-destructive/20 bg-destructive/10 text-destructive',
      )}
    >
      {children}
    </span>
  )
}
