'use client'

import Link from 'next/link'
import {
  Activity,
  ArrowUpRight,
  BriefcaseBusiness,
  FileText,
  ListTodo,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { DASHBOARD_THEME } from '@/lib/dashboard-theme'
import { FadeInItem, FadeInStagger } from '@/shared/ui/animate-in'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { MotionCard } from '@/shared/ui/motion-primitives'

type DashboardDailySnapshotCardProps = {
  openTasks: number
  pendingProposals: number
  activeProjects: number
  loading: boolean
}

const SNAPSHOT_LINKS = [
  { key: 'tasks', href: '/dashboard/tasks', icon: ListTodo, accent: 'border-l-primary from-primary/8' },
  { key: 'projects', href: '/dashboard/projects', icon: BriefcaseBusiness, accent: 'border-l-info from-info/8' },
  { key: 'proposals', href: '/dashboard/proposals', icon: FileText, accent: 'border-l-accent from-accent/8' },
] as const

export function DashboardDailySnapshotCard({
  openTasks,
  pendingProposals,
  activeProjects,
  loading,
}: DashboardDailySnapshotCardProps) {
  const values = {
    tasks: openTasks,
    projects: activeProjects,
    proposals: pendingProposals,
  }

  return (
    <Card
      id="tour-stats-cards"
      className={cn('overflow-hidden ring-1 ring-muted/20', DASHBOARD_THEME.cards.base)}
    >
      <CardHeader className={cn(DASHBOARD_THEME.cards.header, 'bg-muted/[0.02]')}>
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <Activity className="h-5 w-5" aria-hidden />
          </span>
          <div className="space-y-1">
            <CardTitle className="text-lg tracking-tight">Today&apos;s workload</CardTitle>
            <CardDescription className="max-w-xl text-pretty leading-relaxed">
              Open tasks, active delivery, and proposals awaiting action for this workspace.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <FadeInStagger className="grid gap-4 sm:grid-cols-3">
          <SnapshotMetric
            link={SNAPSHOT_LINKS[0]}
            label="Open tasks"
            value={values.tasks}
            loading={loading}
            hint="Todo · in progress · review"
          />
          <SnapshotMetric
            link={SNAPSHOT_LINKS[1]}
            label="Active projects"
            value={values.projects}
            loading={loading}
            hint="In motion"
          />
          <SnapshotMetric
            link={SNAPSHOT_LINKS[2]}
            label="Live proposals"
            value={values.proposals}
            loading={loading}
            hint="Draft through sent"
          />
        </FadeInStagger>
      </CardContent>
    </Card>
  )
}

function SnapshotMetric({
  link,
  label,
  value,
  loading,
  hint,
}: {
  link: (typeof SNAPSHOT_LINKS)[number]
  label: string
  value: number
  loading: boolean
  hint: string
}) {
  const Icon = link.icon

  return (
    <FadeInItem>
      <MotionCard>
        <Link
          href={link.href}
          className={cn(
            'group flex h-full flex-col rounded-xl border border-muted/50 border-l-[3px] bg-linear-to-br p-4 shadow-sm transition-[border-color,box-shadow] hover:border-accent/30 hover:shadow-md',
            link.accent,
          )}
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-background text-primary ring-1 ring-border/60">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">{label}</p>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-16 rounded-md" />
          ) : (
            <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-foreground md:text-3xl">{value}</p>
          )}
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">{hint}</p>
            <ArrowUpRight
              className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
              aria-hidden
            />
          </div>
        </Link>
      </MotionCard>
    </FadeInItem>
  )
}
