'use client'

import { LayoutDashboard, LoaderCircle, RefreshCw, Users } from 'lucide-react'

import { DASHBOARD_THEME, getBadgeClasses } from '@/lib/dashboard-theme'
import { cn } from '@/lib/utils'
import { FadeIn } from '@/shared/ui/animate-in'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'

type DashboardOverviewHeaderProps = {
  clientName: string
  isClientScoped: boolean
  teamMembersCount: number
  accountManager: string | null
  hasLiveMetrics: boolean
  isRefreshing: boolean
  onRefresh: () => void
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function DashboardOverviewHeader({
  clientName,
  isClientScoped,
  teamMembersCount,
  accountManager,
  hasLiveMetrics,
  isRefreshing,
  onRefresh,
}: DashboardOverviewHeaderProps) {
  const greeting = getGreeting()

  return (
    <FadeIn>
      <header
        className={cn(
          'relative overflow-hidden rounded-2xl border border-muted/40 bg-linear-to-br from-primary/[0.07] via-background to-info/[0.05] p-5 shadow-sm sm:p-6',
        )}
      >
        <div
          className="pointer-events-none absolute -left-6 top-0 h-28 w-28 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-10 -bottom-6 h-36 w-36 rounded-full bg-info/10 blur-3xl"
          aria-hidden
        />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-4">
            <div className={cn(DASHBOARD_THEME.icons.container, 'bg-primary/10 text-primary border-primary/20')}>
              <LayoutDashboard className="h-6 w-6" aria-hidden />
            </div>
            <div className="min-w-0 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
                {greeting}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {clientName}
                </h1>
                <Badge
                  variant="outline"
                  className={cn(
                    'font-normal normal-case tracking-normal',
                    isClientScoped ? getBadgeClasses('primary') : getBadgeClasses('secondary'),
                  )}
                >
                  {isClientScoped ? 'Client view' : 'All clients'}
                </Badge>
                {hasLiveMetrics ? (
                  <Badge className={cn(getBadgeClasses('success'), 'font-normal normal-case tracking-normal')}>
                    Metrics synced
                  </Badge>
                ) : null}
              </div>
              <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                {isClientScoped
                  ? 'Delivery, paid media, and site performance at a glance for this workspace.'
                  : 'Workspace-wide pulse. Pick a client in the sidebar for a focused breakdown.'}
              </p>
              {isClientScoped ? (
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {teamMembersCount > 0 ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-4 w-4 shrink-0" aria-hidden />
                      {teamMembersCount} team {teamMembersCount === 1 ? 'member' : 'members'}
                    </span>
                  ) : null}
                  {accountManager ? <span>Account manager · {accountManager}</span> : null}
                </div>
              ) : null}
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 gap-2 self-start border-muted/50 bg-background/80 shadow-sm backdrop-blur-sm"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <RefreshCw className="h-4 w-4" aria-hidden />
            )}
            Refresh data
          </Button>
        </div>
      </header>
    </FadeIn>
  )
}
