'use client'

import Link from 'next/link'
import { Activity, ArrowUpRight, BriefcaseBusiness, FileText, ListTodo, type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { DASHBOARD_THEME } from '@/lib/dashboard-theme'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'

type DashboardDailySnapshotCardProps = {
  openTasks: number
  pendingProposals: number
  activeProjects: number
  loading: boolean
}

/**
 * Lightweight “daily activity” strip—mirrors Connecteam-style awareness tiles without a full feed backend.
 * Deep link to For You / tasks / proposals for detail.
 */
export function DashboardDailySnapshotCard({
  openTasks,
  pendingProposals,
  activeProjects,
  loading,
}: DashboardDailySnapshotCardProps) {
  return (
    <Card className={cn(DASHBOARD_THEME.cards.base)}>
      <CardHeader className="flex flex-col gap-4 border-b border-muted/40 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground ring-1 ring-border">
              <Activity className="h-4 w-4" aria-hidden />
            </span>
            <CardTitle className="text-lg tracking-tight">Today&apos;s snapshot</CardTitle>
          </div>
          <CardDescription className="max-w-xl text-pretty">
            Quick counts for what usually needs a glance before standups—open execution, pipeline, and client-facing
            work.
          </CardDescription>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0 gap-1.5">
          <Link href="/for-you">
            Open For You
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <SnapshotMetric
            icon={ListTodo}
            label="Open tasks"
            value={openTasks}
            loading={loading}
            href="/dashboard/tasks"
            hint="Todo + in progress"
          />
          <SnapshotMetric
            icon={BriefcaseBusiness}
            label="Active projects"
            value={activeProjects}
            loading={loading}
            href="/dashboard/projects"
            hint="In motion"
          />
          <SnapshotMetric
            icon={FileText}
            label="Live proposals"
            value={pendingProposals}
            loading={loading}
            href="/dashboard/proposals"
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
  href,
  hint,
}: {
  icon: LucideIcon
  label: string
  value: number
  loading: boolean
  href: string
  hint: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        'rounded-xl border border-muted/50 bg-muted/10 p-4 transition hover:border-primary/25 hover:bg-background',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-background text-primary ring-1 ring-border">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground" aria-hidden />
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      {loading ? (
        <Skeleton className="mt-2 h-8 w-16 rounded-md" />
      ) : (
        <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-foreground">{value}</p>
      )}
      <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
    </Link>
  )
}
