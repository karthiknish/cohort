'use client'

import Link from 'next/link'
import { formatDistanceToNowStrict } from 'date-fns'
import { useConvexAuth, useQuery } from 'convex/react'
import {
  ArrowUpRight,
  CheckSquare,
  FileText,
  LayoutDashboard,
  LoaderCircle,
  MessageSquare,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useMemo } from 'react'

import { AnalyticsSummaryCards } from '@/features/dashboard/analytics/components/analytics-summary-cards'
import { ProposalMetrics } from '@/features/dashboard/proposals/components/proposal-metrics'
import { TaskSummaryCards } from '@/features/dashboard/tasks/task-summary-cards'
import { DashboardWorkHub } from '@/features/dashboard/home/components/dashboard-work-hub'
import { OperationsPulseCard } from '@/features/dashboard/workforce/operations-pulse-card'
import { analyticsIntegrationsApi, projectsApi } from '@/lib/convex-api'
import { getPreviewProjects } from '@/lib/preview-data'
import { formatCurrency, getWorkspaceId } from '@/lib/utils'
import { useAuth } from '@/shared/contexts/auth-context'
import { useClientContext } from '@/shared/contexts/client-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { BoneyardSkeletonBoundary } from '@/shared/ui/boneyard-skeleton-boundary'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import type { MetricRecord } from '@/types/dashboard'
import { TASK_STATUSES, type TaskRecord, type TaskStatus } from '@/types/tasks'
import { PROJECT_STATUSES, type ProjectStatus } from '@/types/projects'

import { DashboardDailySnapshotCard } from './components/dashboard-daily-snapshot-card'
import { DashboardPageHeader } from './components/dashboard-page-header'
import { DashboardRoleBanner } from './components/dashboard-role-banner'
import { DashboardSkeleton } from './components/dashboard-skeleton'
import { StatsCards } from './components/stats-cards'
import { useDashboardData, useDashboardStats } from './hooks'

type AnalyticsStatusRow = {
  accountName: string | null
  lastSyncStatus: string | null
  lastSyncedAtMs: number | null
}

type ProjectRow = {
  status?: unknown
}

function isProjectStatus(value: unknown): value is ProjectStatus {
  return typeof value === 'string' && (PROJECT_STATUSES as readonly string[]).includes(value)
}

function normalizeTaskStatus(value: string | undefined): TaskStatus | null {
  if (typeof value !== 'string') return null
  return (TASK_STATUSES as readonly string[]).includes(value) ? (value as TaskStatus) : null
}

type SnapshotMetric = {
  label: string
  value: string
  helper: string
}

const EMPTY_TASK_COUNTS: Record<TaskStatus, number> = {
  todo: 0,
  'in-progress': 0,
  review: 0,
  completed: 0,
  archived: 0,
}

export function DashboardOverviewPage() {
  const { user } = useAuth()
  const { selectedClient, selectedClientId } = useClientContext()
  const { isPreviewMode } = usePreview()
  const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth()

  const workspaceId = getWorkspaceId(user)
  const canQueryConvex = Boolean(workspaceId) && Boolean(user?.id) && isAuthenticated && !convexAuthLoading
  const userRole = user?.role ?? null

  const {
    metrics,
    metricsLoading,
    metricsError,
    rawTasks,
    taskSummary,
    tasksLoading,
    tasksError,
    proposals,
    proposalsLoading,
    proposalsError,
    handleRefresh,
    isRefreshing,
  } = useDashboardData({ selectedClientId })

  const { orderedStats } = useDashboardStats({
    metrics,
    taskSummary,
    userRole,
  })

  const analyticsStatus = useQuery(
    analyticsIntegrationsApi.getGoogleAnalyticsStatus,
    !isPreviewMode && canQueryConvex && workspaceId
      ? { workspaceId, clientId: selectedClientId ?? null }
      : 'skip',
  ) as AnalyticsStatusRow | null | undefined

  const projectRows = useQuery(
    projectsApi.list,
    !isPreviewMode && canQueryConvex && workspaceId
      ? {
          workspaceId,
          ...(selectedClientId ? { clientId: selectedClientId } : {}),
          limit: 200,
        }
      : 'skip',
  ) as ProjectRow[] | undefined

  const dashboardErrors = [metricsError, tasksError, proposalsError].filter(
    (value): value is string => typeof value === 'string' && value.trim().length > 0,
  )

  const selectedClientLabel = selectedClient?.name ?? 'current workspace'
  const teamMembersCount = selectedClient?.teamMembers.length ?? 0
  const managersCount = selectedClient?.accountManager ? 1 : 0

  const analyticsMetrics = useMemo(
    () => metrics.filter((metric) => metric.providerId === 'google-analytics'),
    [metrics],
  )

  const analyticsTotals = useMemo(
    () =>
      analyticsMetrics.reduce(
        (accumulator, metric) => {
          accumulator.users += metric.impressions || 0
          accumulator.sessions += metric.clicks || 0
          accumulator.conversions += metric.conversions || 0
          accumulator.revenue += metric.revenue || 0
          return accumulator
        },
        { users: 0, sessions: 0, conversions: 0, revenue: 0 },
      ),
    [analyticsMetrics],
  )

  const analyticsConversionRate = analyticsTotals.sessions > 0
    ? (analyticsTotals.conversions / analyticsTotals.sessions) * 100
    : 0

  const adMetrics = useMemo(
    () => metrics.filter((metric) => metric.providerId !== 'google-analytics'),
    [metrics],
  )

  const adsSummary = useMemo(() => buildAdsSummary(adMetrics), [adMetrics])

  const taskCounts = useMemo(() => buildTaskCounts(rawTasks), [rawTasks])
  const taskCompletionRate = useMemo(() => {
    const pipeline: TaskStatus[] = ['todo', 'in-progress', 'review', 'completed']
    const trackedTotal = pipeline.reduce((sum, key) => sum + taskCounts[key], 0)
    if (trackedTotal === 0) {
      return 0
    }
    return Math.round((taskCounts.completed / trackedTotal) * 100)
  }, [taskCounts])

  const projects = useMemo(() => {
    if (isPreviewMode) {
      return getPreviewProjects(selectedClientId ?? null)
    }
    return Array.isArray(projectRows) ? projectRows : []
  }, [isPreviewMode, projectRows, selectedClientId])

  const clientStats = useMemo(() => {
    const totalProjects = projects.length
    const activeProjects = projects.filter((project) => isProjectStatus(project.status) && project.status === 'active').length
    const planningProjects = projects.filter((project) => isProjectStatus(project.status) && project.status === 'planning').length
    const onHoldProjects = projects.filter((project) => isProjectStatus(project.status) && project.status === 'on_hold').length
    const openTasks = rawTasks.filter((task) => {
      if (task.deletedAt) return false
      const s = normalizeTaskStatus(task.status)
      return s === 'todo' || s === 'in-progress' || s === 'review'
    }).length
    const completedTasks = rawTasks.filter((task) => {
      if (task.deletedAt) return false
      return normalizeTaskStatus(task.status) === 'completed'
    }).length
    const pendingProposals = proposals.filter((proposal) => (
      proposal.status === 'draft' ||
      proposal.status === 'in_progress' ||
      proposal.status === 'ready' ||
      proposal.status === 'sent'
    )).length

    return {
      activeProjects,
      totalProjects,
      planningProjects,
      onHoldProjects,
      openTasks,
      completedTasks,
      pendingProposals,
    }
  }, [projects, rawTasks, proposals])

  const analyticsStatusLabel = useMemo(() => {
    if (isPreviewMode) return 'Preview sample'
    if (!analyticsStatus) return 'Setup required'
    switch (analyticsStatus.lastSyncStatus) {
      case 'success':
        return 'Synced'
      case 'pending':
        return 'Sync queued'
      case 'error':
        return 'Sync issue'
      default:
        return 'Connected'
    }
  }, [analyticsStatus, isPreviewMode])

  const adsMetricsList = useMemo<SnapshotMetric[]>(() => [
    {
      label: 'Ad spend',
      value: formatCurrency(adsSummary.spend),
      helper: adsSummary.providers.size > 0 ? `${adsSummary.providers.size} active channels` : 'Connect ad platforms to import spend',
    },
    {
      label: 'Clicks',
      value: formatCompactNumber(adsSummary.clicks),
      helper: `${formatCompactNumber(adsSummary.impressions)} impressions across ads`,
    },
    {
      label: 'Conversions',
      value: formatCompactNumber(adsSummary.conversions),
      helper: adsSummary.revenue > 0 ? `${formatCurrency(adsSummary.revenue)} revenue attributed` : 'Revenue attribution not available yet',
    },
  ], [adsSummary.clicks, adsSummary.conversions, adsSummary.impressions, adsSummary.providers, adsSummary.revenue, adsSummary.spend])

  const analyticsStatusDetail = useMemo(() => {
    if (isPreviewMode) return 'Using preview dashboard metrics.'
    if (!analyticsStatus) return 'Connect Google Analytics to unlock traffic and revenue totals.'
    if (analyticsStatus.lastSyncedAtMs) {
      return `Last sync ${formatDistanceToNowStrict(analyticsStatus.lastSyncedAtMs, { addSuffix: true })}`
    }
    return analyticsStatus.accountName ? `Connected to ${analyticsStatus.accountName}` : 'Google Analytics is connected.'
  }, [analyticsStatus, isPreviewMode])

  const statsLoading = metricsLoading || tasksLoading
  const clientStatsLoading = tasksLoading || proposalsLoading || (!isPreviewMode && canQueryConvex && projectRows === undefined)
  const analyticsLoading = metricsLoading && analyticsMetrics.length === 0
  const adsLoading = metricsLoading && adMetrics.length === 0
  const headerBadge = useMemo(() => ({
    label: selectedClient ? 'Selected client' : 'Workspace overview',
    variant: 'secondary' as const,
  }), [selectedClient])
  const isInternalTeamRole = userRole === 'admin' || userRole === 'team'
  const isInitialLoading =
    !isPreviewMode &&
    metrics.length === 0 &&
    rawTasks.length === 0 &&
    proposals.length === 0 &&
    statsLoading &&
    analyticsLoading &&
    adsLoading &&
    proposalsLoading &&
    clientStatsLoading
  const loadingContent = useMemo(() => <DashboardSkeleton />, [])

  return (
    <BoneyardSkeletonBoundary
      name="dashboard-overview-page"
      loading={isInitialLoading}
      loadingContent={loadingContent}
    >
      <div className="space-y-8 pb-10">
        <DashboardPageHeader
          title="Dashboard"
          description={`Team operations and ${selectedClientLabel} work in one place—tasks, projects, and agency tools at a glance.`}
          icon={LayoutDashboard}
          badge={headerBadge}
        />

        <DashboardRoleBanner userRole={userRole} userDisplayName={user?.name ?? null} />

        <DashboardDailySnapshotCard
          openTasks={clientStats.openTasks}
          pendingProposals={clientStats.pendingProposals}
          activeProjects={clientStats.activeProjects}
          loading={clientStatsLoading}
        />

        {isInternalTeamRole ? (
          <>
            <section className="space-y-4">
              <SectionHeading
                title="Team operations"
                description="Shortcuts to time, scheduling, forms, and time off. Agency tools stay in the sidebar."
              />
              <DashboardWorkHub userRole={userRole} />
            </section>
            <section className="space-y-4">
              <SectionHeading
                title="Operations pulse"
                description="Live attendance, coverage, checklist health, and time off at a glance."
              />
              <OperationsPulseCard />
            </section>
          </>
        ) : null}

        {dashboardErrors.length > 0 && (
          <Alert variant="destructive">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-1">
                <AlertTitle>Some dashboard data is unavailable</AlertTitle>
                <AlertDescription>{dashboardErrors.join(' ')}</AlertDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 border-destructive/40 bg-background hover:bg-destructive/10"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                Try again
              </Button>
            </div>
          </Alert>
        )}

        <section className="space-y-4">
          <SectionHeading
            title="Top summary"
            description={
              isInternalTeamRole
                ? 'Agency and delivery KPIs—after team ops shortcuts above.'
                : 'Primary KPI cards from analytics, ads, and your task flow.'
            }
          />
          <StatsCards stats={orderedStats} loading={statsLoading} primaryCount={4} />
        </section>
      </div>
    </BoneyardSkeletonBoundary>
  )
}

type SectionHeadingProps = {
  title: string
  description: string
  href?: string
  hrefLabel?: string
  badgeLabel?: string
}

function SectionHeading({ title, description, href, hrefLabel, badgeLabel }: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
          {badgeLabel ? <Badge variant="outline">{badgeLabel}</Badge> : null}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {href && hrefLabel ? (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary transition hover:text-primary/80"
        >
          {hrefLabel}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  )
}

function buildTaskCounts(tasks: TaskRecord[]): Record<TaskStatus, number> {
  return tasks.reduce((counts, task) => {
    if (task.deletedAt) {
      return counts
    }
    const status = normalizeTaskStatus(task.status)
    if (status) {
      counts[status] += 1
    }
    return counts
  }, { ...EMPTY_TASK_COUNTS })
}

function buildAdsSummary(metrics: MetricRecord[]) {
  return metrics.reduce(
    (accumulator, metric) => {
      accumulator.spend += metric.spend || 0
      accumulator.impressions += metric.impressions || 0
      accumulator.clicks += metric.clicks || 0
      accumulator.conversions += metric.conversions || 0
      accumulator.revenue += metric.revenue || 0
      accumulator.providers.add(metric.providerId)
      return accumulator
    },
    {
      spend: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
      providers: new Set<string>(),
    },
  )
}

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

function SnapshotMetricGrid({ metrics, loading }: { metrics: SnapshotMetric[]; loading: boolean }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {metrics.map((metric) => (
        <Card key={metric.label} className="border-muted/60 bg-background shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
              {metric.label}
            </CardDescription>
            {loading ? (
              <Skeleton className="h-8 w-28 rounded-md" />
            ) : (
              <CardTitle className="text-2xl tracking-tight">{metric.value}</CardTitle>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-4 w-40 rounded-md" />
            ) : (
              <p className="text-sm text-muted-foreground">{metric.helper}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
