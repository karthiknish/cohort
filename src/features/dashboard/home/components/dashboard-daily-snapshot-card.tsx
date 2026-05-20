'use client'

import { Activity, BriefcaseBusiness, FileText, ListTodo, type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { DASHBOARD_THEME } from '@/lib/dashboard-theme'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'

type DashboardDailySnapshotCardProps = {
  openTasks: number
  pendingProposals: number
  activeProjects: number
  loading: boolean
}

export function DashboardDailySnapshotCard({
  openTasks,
  pendingProposals,
  activeProjects,
  loading,
}: DashboardDailySnapshotCardProps) {
  return (
    <Card className={cn(DASHBOARD_THEME.cards.base)}>
      <CardHeader className="border-b border-muted/40 pb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground ring-1 ring-border">
            <Activity className="h-4 w-4" aria-hidden />
          </span>
          <div className="space-y-1">
            <CardTitle className="text-lg tracking-tight">Activity</CardTitle>
            <CardDescription className="max-w-xl text-pretty">
              Open work, active delivery, and proposals in progress for this client.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <SnapshotMetric
            icon={ListTodo}
            label="Open tasks"
            value={openTasks}
            loading={loading}
            hint="Todo + in progress"
          />
          <SnapshotMetric
            icon={BriefcaseBusiness}
            label="Active projects"
            value={activeProjects}
            loading={loading}
            hint="In motion"
          />
          <SnapshotMetric
            icon={FileText}
            label="Live proposals"
            value={pendingProposals}
            loading={loading}
            hint="Draft through sent"
          />
        </div>
      </CardContent>
    </Card>
  )
}

function SnapshotMetric({
  icon: Icon,
  label,
  value,
  loading,
  hint,
}: {
  icon: LucideIcon
  label: string
  value: number
  loading: boolean
  hint: string
}) {
  return (
    <div className="rounded-xl border border-muted/50 bg-muted/10 p-4">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-background text-primary ring-1 ring-border">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      {loading ? (
        <Skeleton className="mt-2 h-8 w-16 rounded-md" />
      ) : (
        <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-foreground">{value}</p>
      )}
      <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
    </div>
  )
}
