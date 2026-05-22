'use client'

import { formatDistanceToNowStrict } from 'date-fns'
import { useConvexAuth, useQuery } from 'convex/react'
import { Info, LoaderCircle, TrendingUp } from 'lucide-react'
import { useCallback, useMemo } from 'react'

import {
  aggregateMetricFinancials,
  formatAggregatedMoney,
  financialTotalsHelper,
} from '@/domain/ads/aggregate-financials'
import { buildChartData } from '@/features/dashboard/home/lib/dashboard-calculations'
import { PerformanceChart } from '@/features/dashboard/home/components/performance-chart'
import { DashboardDailySnapshotCard } from '@/features/dashboard/home/components/dashboard-daily-snapshot-card'
import {
  DashboardEmptyPerformanceCard,
  DashboardSectionHeading,
} from '@/features/dashboard/home/components/dashboard-empty-performance-card'
import { DashboardOverviewHeader } from '@/features/dashboard/home/components/dashboard-overview-header'
import {
  DashboardSnapshotMetricGrid,
  type DashboardSnapshotMetric,
} from '@/features/dashboard/home/components/dashboard-snapshot-metric-grid'
import { QuickActions } from '@/features/dashboard/home/components/quick-actions'
import { StatsCards } from '@/features/dashboard/home/components/stats-cards'
import { useDashboardData, useDashboardStats } from '@/features/dashboard/home/hooks'
import { analyticsIntegrationsApi, projectsApi } from '@/lib/convex-api'
import { getPreviewProjects } from '@/lib/preview-data'
import { formatCurrency, getWorkspaceId } from '@/lib/utils'
import { useAuth } from '@/shared/contexts/auth-context'
import { useClientContext } from '@/shared/contexts/client-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { PageMotionShell } from '@/shared/components/page-motion-shell'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { BoneyardSkeletonBoundary } from '@/shared/ui/boneyard-skeleton-boundary'
import { FadeIn } from '@/shared/ui/animate-in'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'
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

function isProjectStatus(value: unknown): value is ProjectStatus {
  return typeof value === 'string' && (PROJECT_STATUSES as readonly string[]).includes(value)
}

function normalizeTaskStatus(value: string | undefined): TaskStatus | null {
  if (typeof value !== 'string') return null
  return (TASK_STATUSES as readonly string[]).includes(value) ? (value as TaskStatus) : null
}

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
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
  const isClientScoped = Boolean(selectedClient)

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

  const adsMetricsList = useMemo<DashboardSnapshotMetric[]>(() => {
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
        accent: 'primary',
      },
      {
        label: 'Clicks',
        value: formatCompactNumber(adsSummary.clicks),
        helper: `${formatCompactNumber(adsSummary.impressions)} impressions`,
        accent: 'info',
      },
      {
        label: 'Conversions',
        value: formatCompactNumber(adsSummary.conversions),
        helper:
          adsSummary.financialTotals.revenue !== null && adsSummary.financialTotals.revenue > 0
            ? `${formatMoney(adsSummary.financialTotals.revenue)} revenue`
            : 'No attributed revenue',
        accent: 'success',
      },
    ]
  }, [adsSummary])

  const analyticsMetricsList = useMemo<DashboardSnapshotMetric[]>(
    () => [
      {
        label: 'Users',
        value: formatCompactNumber(analyticsTotals.users),
        helper: analyticsStatusDetail,
        accent: 'info',
      },
      {
        label: 'Sessions',
        value: formatCompactNumber(analyticsTotals.sessions),
        helper: 'Site visits in range',
        accent: 'primary',
      },
      {
        label: 'Conv. rate',
        value: `${analyticsConversionRate.toFixed(2)}%`,
        helper: `${formatCompactNumber(analyticsTotals.conversions)} conversions`,
        accent: 'success',
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
  const hasLiveMetrics = hasChartData || hasAdsData || hasAnalyticsData

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

  const handleRefreshClick = useCallback(() => {
    void handleRefresh()
  }, [handleRefresh])

  return (
    <PageMotionShell reveal={false} className="mx-auto max-w-7xl pb-10">
      <BoneyardSkeletonBoundary name="dashboard-overview-page" loading={isInitialLoading}>
        <div className="space-y-8">
          <DashboardOverviewHeader
            clientName={clientName}
            isClientScoped={isClientScoped}
            teamMembersCount={teamMembersCount}
            accountManager={accountManager}
            hasLiveMetrics={hasLiveMetrics}
            isRefreshing={isRefreshing}
            onRefresh={handleRefreshClick}
          />

          {dashboardErrors.length > 0 ? (
            <FadeIn>
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
                    onClick={handleRefreshClick}
                    disabled={isRefreshing}
                  >
                    {isRefreshing ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Try again
                  </Button>
                </div>
              </Alert>
            </FadeIn>
          ) : null}

          <FadeIn>
            <DashboardDailySnapshotCard
              openTasks={clientStats.openTasks}
              pendingProposals={clientStats.pendingProposals}
              activeProjects={clientStats.activeProjects}
              loading={clientStatsLoading}
            />
          </FadeIn>

          <section className="space-y-5" aria-label="Performance metrics">
            {hasChartData ? (
              <FadeIn id="tour-performance-chart">
                <Card className="overflow-hidden border-muted/40 bg-card shadow-sm ring-1 ring-muted/20">
                  <CardHeader className="border-b border-muted/40 bg-muted/[0.02] pb-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                            <TrendingUp className="h-4 w-4" aria-hidden />
                          </span>
                          <CardTitle className="text-lg tracking-tight">Spend & revenue</CardTitle>
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
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="h-[320px] pt-6 sm:h-[340px]">
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
              </FadeIn>
            ) : null}

            {(hasAdsData || hasAnalyticsData) && !hasChartData ? (
              <div className="grid gap-8 lg:grid-cols-2">
                {hasAdsData ? (
                  <FadeIn>
                    <div className="space-y-4">
                      <DashboardSectionHeading
                        eyebrow="Paid media"
                        title="Ad platforms"
                        description="Spend, delivery, and conversions from synced channels."
                      />
                      <DashboardSnapshotMetricGrid metrics={adsMetricsList} loading={adsLoading} />
                    </div>
                  </FadeIn>
                ) : null}
                {hasAnalyticsData ? (
                  <FadeIn>
                    <div className="space-y-4">
                      <DashboardSectionHeading
                        eyebrow="Site traffic"
                        title="Analytics"
                        description="Users, sessions, and conversion rate for the selected period."
                      />
                      <DashboardSnapshotMetricGrid metrics={analyticsMetricsList} loading={analyticsLoading} />
                    </div>
                  </FadeIn>
                ) : null}
              </div>
            ) : null}

            {!hasChartData && !hasAdsData && !hasAnalyticsData && !metricsLoading ? (
              <FadeIn>
                <DashboardEmptyPerformanceCard />
              </FadeIn>
            ) : null}
          </section>

          <FadeIn id="tour-quick-actions">
            <QuickActions compact />
          </FadeIn>

          {displayStats.length > 0 ? (
            <FadeIn>
              <section className="space-y-4" aria-label="Summary statistics">
                <DashboardSectionHeading
                  eyebrow="Signals"
                  title="Summary"
                  description="Cross-channel KPIs rolled up for this workspace."
                />
                <StatsCards stats={displayStats} loading={statsLoading} primaryCount={4} linkless />
              </section>
            </FadeIn>
          ) : null}
        </div>
      </BoneyardSkeletonBoundary>
    </PageMotionShell>
  )
}
