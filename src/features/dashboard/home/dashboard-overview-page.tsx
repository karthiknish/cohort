'use client'

import { formatDistanceToNowStrict } from 'date-fns'
import { useConvexAuth, useQuery } from 'convex/react'
import { Info, LoaderCircle, Users } from 'lucide-react'
import { useMemo } from 'react'

import {
  aggregateMetricFinancials,
  formatAggregatedMoney,
  financialTotalsHelper,
} from '@/domain/ads/aggregate-financials'
import { buildChartData } from '@/features/dashboard/home/lib/dashboard-calculations'
import { PerformanceChart } from '@/features/dashboard/home/components/performance-chart'
import { DashboardDailySnapshotCard } from '@/features/dashboard/home/components/dashboard-daily-snapshot-card'
import { DashboardSkeleton } from '@/features/dashboard/home/components/dashboard-skeleton'
import { StatsCards } from '@/features/dashboard/home/components/stats-cards'
import { useDashboardData, useDashboardStats } from '@/features/dashboard/home/hooks'
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'
import type { MetricRecord } from '@/types/dashboard'
import { TASK_STATUSES, type TaskStatus } from '@/types/tasks'
import { PROJECT_STATUSES, type ProjectStatus } from '@/types/projects'

type AnalyticsStatusRow = {
  accountName: string | null
  lastSyncStatus: string | null
  lastSyncedAtMs: number | null
}

type ProjectRow = {
  status?: unknown
}

type SnapshotMetric = {
  label: string
  value: string
  helper: string
}

function isProjectStatus(value: unknown): value is ProjectStatus {
  return typeof value === 'string' && (PROJECT_STATUSES as readonly string[]).includes(value)
}

function normalizeTaskStatus(value: string | undefined): TaskStatus | null {
  if (typeof value !== 'string') return null
  return (TASK_STATUSES as readonly string[]).includes(value) ? (value as TaskStatus) : null
}

export function DashboardOverviewPage() {
  const { user } = useAuth()
  const { selectedClient, selectedClientId } = useClientContext()
  const { isPreviewMode } = usePreview()
  const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth()

  const workspaceId = getWorkspaceId(user)
  const canQueryConvex = Boolean(workspaceId) && Boolean(user?.id) && isAuthenticated && !convexAuthLoading

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

  const { orderedStats, displayCurrency } = useDashboardStats({
    metrics,
    taskSummary,
    userRole: user?.role ?? null,
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

  const clientName = selectedClient?.name ?? 'Workspace'
  const teamMembersCount = selectedClient?.teamMembers.length ?? 0
  const accountManager = selectedClient?.accountManager?.trim() || null

  const chartMetrics = useMemo(() => buildChartData(metrics), [metrics])

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

  const analyticsConversionRate =
    analyticsTotals.sessions > 0 ? (analyticsTotals.conversions / analyticsTotals.sessions) * 100 : 0

  const adMetrics = useMemo(
    () => metrics.filter((metric) => metric.providerId !== 'google-analytics'),
    [metrics],
  )

  const adsFinancial = useMemo(() => aggregateMetricFinancials(adMetrics), [adMetrics])

  const adsSummary = useMemo(() => {
    const providerIds = new Set(adMetrics.map((metric) => metric.providerId))
    return {
      spend: adsFinancial.financialTotals.spend ?? 0,
      revenue: adsFinancial.financialTotals.revenue ?? 0,
      clicks: adsFinancial.deliveryTotals.clicks,
      impressions: adsFinancial.deliveryTotals.impressions,
      conversions: adsFinancial.deliveryTotals.conversions,
      providers: providerIds,
      financialTotals: adsFinancial.financialTotals,
    }
  }, [adMetrics, adsFinancial])

  const projects = useMemo(() => {
    if (isPreviewMode) {
      return getPreviewProjects(selectedClientId ?? null)
    }
    return Array.isArray(projectRows) ? projectRows : []
  }, [isPreviewMode, projectRows, selectedClientId])

  const clientStats = useMemo(() => {
    const activeProjects = projects.filter(
      (project) => isProjectStatus(project.status) && project.status === 'active',
    ).length
    const openTasks = rawTasks.filter((task) => {
      if (task.deletedAt) return false
      const status = normalizeTaskStatus(task.status)
      return status === 'todo' || status === 'in-progress' || status === 'review'
    }).length
    const pendingProposals = proposals.filter(
      (proposal) =>
        proposal.status === 'draft' ||
        proposal.status === 'in_progress' ||
        proposal.status === 'ready' ||
        proposal.status === 'sent',
    ).length

    return { activeProjects, openTasks, pendingProposals }
  }, [projects, rawTasks, proposals])

  const analyticsStatusDetail = useMemo(() => {
    if (isPreviewMode) return 'Preview metrics'
    if (!analyticsStatus) return 'Analytics not connected'
    if (analyticsStatus.lastSyncedAtMs) {
      return `Synced ${formatDistanceToNowStrict(analyticsStatus.lastSyncedAtMs, { addSuffix: true })}`
    }
    return analyticsStatus.accountName
      ? `Connected to ${analyticsStatus.accountName}`
      : 'Google Analytics connected'
  }, [analyticsStatus, isPreviewMode])

  const adsMetricsList = useMemo<SnapshotMetric[]>(() => {
    const formatMoney = (amount: number | null) =>
      formatAggregatedMoney(amount, adsSummary.financialTotals, formatCurrency)

    return [
      {
        label: 'Ad spend',
        value: formatMoney(adsSummary.financialTotals.spend),
        helper: financialTotalsHelper(
          adsSummary.financialTotals,
          adsSummary.providers.size > 0
            ? `${adsSummary.providers.size} active channels`
            : 'No ad spend in this period',
        ),
      },
      {
        label: 'Clicks',
        value: formatCompactNumber(adsSummary.clicks),
        helper: `${formatCompactNumber(adsSummary.impressions)} impressions`,
      },
      {
        label: 'Conversions',
        value: formatCompactNumber(adsSummary.conversions),
        helper:
          adsSummary.financialTotals.revenue !== null && adsSummary.financialTotals.revenue > 0
            ? `${formatMoney(adsSummary.financialTotals.revenue)} revenue`
            : 'No attributed revenue',
      },
    ]
  }, [adsSummary])

  const analyticsMetricsList = useMemo<SnapshotMetric[]>(
    () => [
      {
        label: 'Users',
        value: formatCompactNumber(analyticsTotals.users),
        helper: analyticsStatusDetail,
      },
      {
        label: 'Sessions',
        value: formatCompactNumber(analyticsTotals.sessions),
        helper: 'Site visits in range',
      },
      {
        label: 'Conv. rate',
        value: `${analyticsConversionRate.toFixed(2)}%`,
        helper: `${formatCompactNumber(analyticsTotals.conversions)} conversions`,
      },
    ],
    [analyticsConversionRate, analyticsStatusDetail, analyticsTotals],
  )

  const statsLoading = metricsLoading || tasksLoading
  const clientStatsLoading =
    tasksLoading || proposalsLoading || (!isPreviewMode && canQueryConvex && projectRows === undefined)
  const analyticsLoading = metricsLoading && analyticsMetrics.length === 0
  const adsLoading = metricsLoading && adMetrics.length === 0
  const hasChartData = chartMetrics.length > 0
  const hasAdsData =
    adMetrics.length > 0 ||
    (adsSummary.financialTotals.spend ?? 0) > 0 ||
    adsSummary.impressions > 0
  const hasAnalyticsData = analyticsMetrics.length > 0 || analyticsTotals.sessions > 0

  const isInitialLoading =
    !isPreviewMode &&
    metrics.length === 0 &&
    rawTasks.length === 0 &&
    proposals.length === 0 &&
    statsLoading &&
    clientStatsLoading

  const displayStats = useMemo(
    () =>
      orderedStats.map((stat) => ({
        ...stat,
        href: undefined,
        featureLabel: undefined,
      })),
    [orderedStats],
  )

  return (
    <BoneyardSkeletonBoundary
      name="dashboard-overview-page"
      loading={isInitialLoading}
      loadingContent={<DashboardSkeleton />}
    >
      <div className="mx-auto max-w-7xl space-y-8 pb-10">
        <header className="space-y-3 border-b border-muted/40 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {clientName}
            </h1>
            {selectedClient ? (
              <Badge variant="secondary" className="font-normal">
                Client
              </Badge>
            ) : (
              <Badge variant="outline" className="font-normal">
                All clients
              </Badge>
            )}
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground text-pretty">
            {selectedClient
              ? 'Summary of delivery, paid media, and site performance for the selected client.'
              : 'Workspace-wide summary. Select a client in the sidebar for a focused view.'}
          </p>
          {selectedClient ? (
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {teamMembersCount > 0 ? (
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4" aria-hidden />
                  {teamMembersCount} team {teamMembersCount === 1 ? 'member' : 'members'}
                </span>
              ) : null}
              {accountManager ? <span>Account manager: {accountManager}</span> : null}
            </div>
          ) : null}
        </header>

        {dashboardErrors.length > 0 ? (
          <Alert variant="destructive">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-1">
                <AlertTitle>Some data could not be loaded</AlertTitle>
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
        ) : null}

        <DashboardDailySnapshotCard
          openTasks={clientStats.openTasks}
          pendingProposals={clientStats.pendingProposals}
          activeProjects={clientStats.activeProjects}
          loading={clientStatsLoading}
        />

        {hasChartData ? (
          <Card className="border-muted/40 bg-card shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">Spend & revenue</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 cursor-help text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      Daily ad spend and revenue from synced platforms for the current client.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <CardDescription>Trend over the synced reporting window</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <PerformanceChart
                metrics={chartMetrics}
                loading={metricsLoading}
                currency={displayCurrency ?? undefined}
                dataSource="ads"
                showDetailLink={false}
                hideHeader
              />
            </CardContent>
          </Card>
        ) : null}

        {(hasAdsData || hasAnalyticsData) && !hasChartData ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {hasAdsData ? (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-foreground">Paid media</h2>
                <SnapshotMetricGrid metrics={adsMetricsList} loading={adsLoading} />
              </section>
            ) : null}
            {hasAnalyticsData ? (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-foreground">Site analytics</h2>
                <SnapshotMetricGrid metrics={analyticsMetricsList} loading={analyticsLoading} />
              </section>
            ) : null}
          </div>
        ) : null}

        {!hasChartData && !hasAdsData && !hasAnalyticsData && !metricsLoading ? (
          <Card className="border-dashed border-muted/60 bg-muted/5">
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              No performance data yet for this view. Connect ad or analytics integrations to see
              metrics and charts here.
            </CardContent>
          </Card>
        ) : null}

        {displayStats.length > 0 ? (
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Summary</h2>
            <StatsCards stats={displayStats} loading={statsLoading} primaryCount={4} linkless />
          </section>
        ) : null}
      </div>
    </BoneyardSkeletonBoundary>
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
    <div className="grid gap-4 sm:grid-cols-3">
      {metrics.map((metric) => (
        <Card key={metric.label} className="border-muted/60 bg-card shadow-sm">
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
