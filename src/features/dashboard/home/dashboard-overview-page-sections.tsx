'use client';
import { formatDistanceToNowStrict } from 'date-fns';
import { useConvexAuth, useQuery } from 'convex/react';
import { Info } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { aggregateMetricFinancials, formatAggregatedMoney, financialTotalsHelper, } from '@/domain/ads/aggregate-financials';
import { buildChartData } from '@/features/dashboard/home/lib/dashboard-calculations';
import { useDashboardData, useDashboardStats } from '@/features/dashboard/home/hooks';
import { analyticsIntegrationsApi, projectsApi } from '@/lib/convex-api';
import { getPreviewProjects } from '@/lib/preview-data';
import { EN_US_COMPACT_NUMBER_FORMATTER } from '@/lib/intl/formatters';
import { formatCurrency, getWorkspaceId } from '@/lib/utils';
import { useAuth } from '@/shared/contexts/auth-context';
import { useClientContext } from '@/shared/contexts/client-context';
import { usePreview } from '@/shared/contexts/preview-context';
import { TASK_STATUSES, type TaskStatus } from '@/types/tasks';
import { PROJECT_STATUSES, type ProjectStatus } from '@/types/projects';
import { PerformanceChart } from '@/features/dashboard/home/components/performance-chart';
import { DashboardDailySnapshotCard } from '@/features/dashboard/home/components/dashboard-daily-snapshot-card';
import { DashboardEmptyPerformanceCard, DashboardSectionHeading, } from '@/features/dashboard/home/components/dashboard-empty-performance-card';
import { DashboardOverviewErrorsAlert } from '@/features/dashboard/home/components/dashboard-overview-errors-alert';
import { DashboardOverviewHeader } from '@/features/dashboard/home/components/dashboard-overview-header';
import { DashboardSnapshotMetricGrid, type DashboardSnapshotMetric, } from '@/features/dashboard/home/components/dashboard-snapshot-metric-grid';
import { QuickActions } from '@/features/dashboard/home/components/quick-actions';
import { StatsCards } from '@/features/dashboard/home/components/stats-cards';
import type { SummaryStat } from '@/types/dashboard';
import { FadeIn } from '@/shared/ui/animate-in';
import { Button } from '@/shared/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle, } from '@/shared/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from '@/shared/ui/tooltip';
export function DashboardOverviewSpendRevenueChart({ chartMetrics, metricsLoading, displayCurrency, }: {
    chartMetrics: ReturnType<typeof buildChartData>;
    metricsLoading: boolean;
    displayCurrency: string | null;
}) {
    if (chartMetrics.length === 0) {
        return null;
    }
    return (<FadeIn id="tour-performance-chart">
      <Card className="overflow-hidden border-muted/40 bg-card shadow-sm ring-1 ring-muted/20">
        <CardHeader className="border-b border-muted/40 bg-muted/[0.02] pb-4">
          <CardDescription className="text-xs font-medium uppercase tracking-wider text-muted-foreground/80">Performance</CardDescription>
          <CardTitle className="text-lg tracking-tight">Spend &amp; revenue</CardTitle>
          <CardAction>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground">
                    <Info className="size-4 cursor-help"/>
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  Daily ad spend and revenue from synced platforms for the current client.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardAction>
        </CardHeader>
        <CardContent className="h-[320px] pt-6 sm:h-[340px]">
          <PerformanceChart metrics={chartMetrics} loading={metricsLoading} currency={displayCurrency ?? undefined} dataSource="ads" showDetailLink={false} hideHeader/>
        </CardContent>
      </Card>
    </FadeIn>);
}
export function DashboardOverviewSnapshotGrids({ hasAdsData, hasAnalyticsData, adsMetricsList, analyticsMetricsList, adsLoading, analyticsLoading, }: {
    hasAdsData: boolean;
    hasAnalyticsData: boolean;
    adsMetricsList: DashboardSnapshotMetric[];
    analyticsMetricsList: DashboardSnapshotMetric[];
    adsLoading: boolean;
    analyticsLoading: boolean;
}) {
    if (!hasAdsData && !hasAnalyticsData) {
        return null;
    }
    return (<div className="grid gap-8 lg:grid-cols-2">
      {hasAdsData ? (<FadeIn>
          <div className="space-y-4">
            <DashboardSectionHeading eyebrow="Paid media" title="Ad platforms" description="Spend, delivery, and conversions from synced channels."/>
            <DashboardSnapshotMetricGrid metrics={adsMetricsList} loading={adsLoading}/>
          </div>
        </FadeIn>) : null}
      {hasAnalyticsData ? (<FadeIn>
          <div className="space-y-4">
            <DashboardSectionHeading eyebrow="Site traffic" title="Analytics" description="Users, sessions, and conversion rate for the selected period."/>
            <DashboardSnapshotMetricGrid metrics={analyticsMetricsList} loading={analyticsLoading}/>
          </div>
        </FadeIn>) : null}
    </div>);
}
export function DashboardOverviewPerformanceSection({ hasChartData, hasAdsData, hasAnalyticsData, metricsLoading, chartMetrics, displayCurrency, adsMetricsList, analyticsMetricsList, adsLoading, analyticsLoading, }: {
    hasChartData: boolean;
    hasAdsData: boolean;
    hasAnalyticsData: boolean;
    metricsLoading: boolean;
    chartMetrics: ReturnType<typeof buildChartData>;
    displayCurrency: string | null;
    adsMetricsList: DashboardSnapshotMetric[];
    analyticsMetricsList: DashboardSnapshotMetric[];
    adsLoading: boolean;
    analyticsLoading: boolean;
}) {
    const showSnapshotGrids = (hasAdsData || hasAnalyticsData) && !hasChartData;
    const showEmpty = !hasChartData && !hasAdsData && !hasAnalyticsData && !metricsLoading;
    return (<section className="space-y-5" aria-label="Performance metrics">
      <DashboardOverviewSpendRevenueChart chartMetrics={chartMetrics} metricsLoading={metricsLoading} displayCurrency={displayCurrency}/>

      {showSnapshotGrids ? (<DashboardOverviewSnapshotGrids hasAdsData={hasAdsData} hasAnalyticsData={hasAnalyticsData} adsMetricsList={adsMetricsList} analyticsMetricsList={analyticsMetricsList} adsLoading={adsLoading} analyticsLoading={analyticsLoading}/>) : null}

      {showEmpty ? (<FadeIn>
          <DashboardEmptyPerformanceCard />
        </FadeIn>) : null}
    </section>);
}
export function DashboardOverviewSummarySection({ displayStats, statsLoading, }: {
    displayStats: SummaryStat[];
    statsLoading: boolean;
}) {
    if (displayStats.length === 0) {
        return null;
    }
    return (<FadeIn>
      <section className="space-y-4" aria-label="Summary statistics">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Signals</p>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Summary</h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">Cross-channel KPIs rolled up for this workspace.</p>
          </div>
        </div>
        <StatsCards stats={displayStats} loading={statsLoading} primaryCount={4} linkless/>
      </section>
    </FadeIn>);
}
export type DashboardOverviewStat = {
    label: string;
    value: string;
    helper?: string;
    accent?: string;
    href?: string;
    featureLabel?: string;
};
type AnalyticsStatusRow = {
    accountName: string | null;
    lastSyncStatus: string | null;
    lastSyncedAtMs: number | null;
};
type ProjectRow = {
    status?: unknown;
};
function isProjectStatus(value: unknown): value is ProjectStatus {
    return typeof value === 'string' && (PROJECT_STATUSES as readonly string[]).includes(value);
}
function normalizeTaskStatus(value: string | undefined): TaskStatus | null {
    if (typeof value !== 'string')
        return null;
    return (TASK_STATUSES as readonly string[]).includes(value) ? (value as TaskStatus) : null;
}
function formatCompactNumber(value: number): string {
    return EN_US_COMPACT_NUMBER_FORMATTER.format(value);
}
export function useDashboardOverviewPage() {
    const { user } = useAuth();
    const { selectedClient, selectedClientId } = useClientContext();
    const { isPreviewMode } = usePreview();
    const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth();
    const workspaceId = getWorkspaceId(user);
    const canQueryConvex = Boolean(workspaceId) && Boolean(user?.id) && isAuthenticated && !convexAuthLoading;
    const { metrics, metricsLoading, metricsError, rawTasks, taskSummary, tasksLoading, tasksError, proposals, proposalsLoading, proposalsError, handleRefresh, isRefreshing, } = useDashboardData({ selectedClientId });
    const { orderedStats, displayCurrency } = useDashboardStats({
        metrics,
        taskSummary,
        userRole: user?.role ?? null,
    });
    const analyticsStatus = useQuery(analyticsIntegrationsApi.getGoogleAnalyticsStatus, !isPreviewMode && canQueryConvex && workspaceId
        ? { workspaceId, clientId: selectedClientId ?? null }
        : 'skip') as AnalyticsStatusRow | null | undefined;
    const projectRows = useQuery(projectsApi.list, !isPreviewMode && canQueryConvex && workspaceId
        ? {
            workspaceId,
            ...(selectedClientId ? { clientId: selectedClientId } : {}),
            limit: 200,
        }
        : 'skip') as ProjectRow[] | undefined;
    const dashboardErrors = [metricsError, tasksError, proposalsError].filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
    const clientName = selectedClient?.name ?? 'Workspace';
    const teamMembersCount = selectedClient?.teamMembers.length ?? 0;
    const accountManager = selectedClient?.accountManager?.trim() || null;
    const isClientScoped = Boolean(selectedClient);
    const chartMetrics = buildChartData(metrics);
    const analyticsMetrics = metrics.filter((metric) => metric.providerId === 'google-analytics');
    const analyticsTotals = analyticsMetrics.reduce((accumulator, metric) => {
        accumulator.users += metric.impressions || 0;
        accumulator.sessions += metric.clicks || 0;
        accumulator.conversions += metric.conversions || 0;
        accumulator.revenue += metric.revenue || 0;
        return accumulator;
    }, { users: 0, sessions: 0, conversions: 0, revenue: 0 });
    const analyticsConversionRate = analyticsTotals.sessions > 0 ? (analyticsTotals.conversions / analyticsTotals.sessions) * 100 : 0;
    const adMetrics = metrics.filter((metric) => metric.providerId !== 'google-analytics');
    const adsFinancial = aggregateMetricFinancials(adMetrics);
    const adsSummary = (() => {
        const providerIds = new Set(adMetrics.map((metric) => metric.providerId));
        return {
            spend: adsFinancial.financialTotals.spend ?? 0,
            revenue: adsFinancial.financialTotals.revenue ?? 0,
            clicks: adsFinancial.deliveryTotals.clicks,
            impressions: adsFinancial.deliveryTotals.impressions,
            conversions: adsFinancial.deliveryTotals.conversions,
            providers: providerIds,
            financialTotals: adsFinancial.financialTotals,
        };
    })();
    const projects = (() => {
        if (isPreviewMode) {
            return getPreviewProjects(selectedClientId ?? null);
        }
        return Array.isArray(projectRows) ? projectRows : [];
    })();
    const clientStats = (() => {
        const activeProjects = projects.filter((project) => isProjectStatus(project.status) && project.status === 'active').length;
        const openTasks = rawTasks.filter((task) => {
            if (task.deletedAt)
                return false;
            const status = normalizeTaskStatus(task.status);
            return status === 'todo' || status === 'in-progress' || status === 'review';
        }).length;
        const pendingProposals = proposals.filter((proposal) => proposal.status === 'draft' ||
            proposal.status === 'in_progress' ||
            proposal.status === 'ready' ||
            proposal.status === 'sent').length;
        return { activeProjects, openTasks, pendingProposals };
    })();
    const analyticsStatusDetail = (() => {
        if (isPreviewMode)
            return 'Preview metrics';
        if (!analyticsStatus)
            return 'Analytics not connected';
        if (analyticsStatus.lastSyncedAtMs) {
            return `Synced ${formatDistanceToNowStrict(analyticsStatus.lastSyncedAtMs, { addSuffix: true })}`;
        }
        return analyticsStatus.accountName
            ? `Connected to ${analyticsStatus.accountName}`
            : 'Google Analytics connected';
    })();
    const adsMetricsList: DashboardSnapshotMetric[] = (() => {
        const formatMoney = (amount: number | null) => formatAggregatedMoney(amount, adsSummary.financialTotals, formatCurrency);
        return [
            {
                label: 'Ad spend',
                value: formatMoney(adsSummary.financialTotals.spend),
                helper: financialTotalsHelper(adsSummary.financialTotals, adsSummary.providers.size > 0
                    ? `${adsSummary.providers.size} active channels`
                    : 'No ad spend in this period'),
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
                helper: adsSummary.financialTotals.revenue !== null && adsSummary.financialTotals.revenue > 0
                    ? `${formatMoney(adsSummary.financialTotals.revenue)} revenue`
                    : 'No attributed revenue',
                accent: 'success',
            },
        ];
    })();
    const analyticsMetricsList: DashboardSnapshotMetric[] = [
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
    ];
    const statsLoading = metricsLoading || tasksLoading;
    const clientStatsLoading = tasksLoading || proposalsLoading || (!isPreviewMode && canQueryConvex && projectRows === undefined);
    const analyticsLoading = metricsLoading && analyticsMetrics.length === 0;
    const adsLoading = metricsLoading && adMetrics.length === 0;
    const hasChartData = chartMetrics.length > 0;
    const hasAdsData = adMetrics.length > 0 ||
        (adsSummary.financialTotals.spend ?? 0) > 0 ||
        adsSummary.impressions > 0;
    const hasAnalyticsData = analyticsMetrics.length > 0 || analyticsTotals.sessions > 0;
    const hasLiveMetrics = hasChartData || hasAdsData || hasAnalyticsData;
    const isInitialLoading = !isPreviewMode &&
        (convexAuthLoading ||
            (!!user?.id && !canQueryConvex) ||
            (canQueryConvex &&
                (metricsLoading || tasksLoading || proposalsLoading || clientStatsLoading)));
    const displayStats = orderedStats.map((stat) => ({
        ...stat,
        href: undefined,
        featureLabel: undefined,
    }));
    const handleRefreshClick = () => {
        void handleRefresh();
    };
    return {
        isInitialLoading,
        clientName,
        isClientScoped,
        teamMembersCount,
        accountManager,
        hasLiveMetrics,
        isRefreshing,
        handleRefreshClick,
        dashboardErrors,
        clientStats,
        clientStatsLoading,
        hasChartData,
        hasAdsData,
        hasAnalyticsData,
        metricsLoading,
        chartMetrics,
        displayCurrency,
        adsMetricsList,
        analyticsMetricsList,
        adsLoading,
        analyticsLoading,
        displayStats,
        statsLoading,
    };
}
export type DashboardOverviewAvailabilityFlags = {
    hasLiveMetrics: boolean;
    hasChartData: boolean;
    hasAdsData: boolean;
    hasAnalyticsData: boolean;
};
export type DashboardOverviewLoadingFlags = {
    isRefreshing: boolean;
    clientStatsLoading: boolean;
    metricsLoading: boolean;
    adsLoading: boolean;
    analyticsLoading: boolean;
    statsLoading: boolean;
};
export type DashboardOverviewPageViewProps = {
    clientName: string;
    isClientScoped: boolean;
    teamMembersCount: number;
    accountManager: string | null;
    availability: DashboardOverviewAvailabilityFlags;
    loading: DashboardOverviewLoadingFlags;
    onRefresh: () => void;
    dashboardErrors: string[];
    clientStats: {
        openTasks: number;
        pendingProposals: number;
        activeProjects: number;
    };
    chartMetrics: ReturnType<typeof buildChartData>;
    displayCurrency: string | null;
    adsMetricsList: DashboardSnapshotMetric[];
    analyticsMetricsList: DashboardSnapshotMetric[];
    displayStats: SummaryStat[];
};
export function DashboardOverviewPageView({ clientName, isClientScoped, teamMembersCount, accountManager, availability, loading, onRefresh, dashboardErrors, clientStats, chartMetrics, displayCurrency, adsMetricsList, analyticsMetricsList, displayStats, }: DashboardOverviewPageViewProps) {
    const { hasLiveMetrics, hasChartData, hasAdsData, hasAnalyticsData, } = availability;
    const { isRefreshing, clientStatsLoading, metricsLoading, adsLoading, analyticsLoading, statsLoading, } = loading;
    return (<div className="space-y-8">
      <DashboardOverviewHeader clientName={clientName} isClientScoped={isClientScoped} teamMembersCount={teamMembersCount} accountManager={accountManager} hasLiveMetrics={hasLiveMetrics} isRefreshing={isRefreshing} onRefresh={onRefresh}/>

      <DashboardOverviewErrorsAlert errors={dashboardErrors} isRefreshing={isRefreshing} onRetry={onRefresh}/>

      <FadeIn>
        <DashboardDailySnapshotCard openTasks={clientStats.openTasks} pendingProposals={clientStats.pendingProposals} activeProjects={clientStats.activeProjects} loading={clientStatsLoading}/>
      </FadeIn>

      <DashboardOverviewPerformanceSection hasChartData={hasChartData} hasAdsData={hasAdsData} hasAnalyticsData={hasAnalyticsData} metricsLoading={metricsLoading} chartMetrics={chartMetrics} displayCurrency={displayCurrency} adsMetricsList={adsMetricsList} analyticsMetricsList={analyticsMetricsList} adsLoading={adsLoading} analyticsLoading={analyticsLoading}/>

      <FadeIn id="tour-quick-actions">
        <QuickActions compact/>
      </FadeIn>

      <DashboardOverviewSummarySection displayStats={displayStats} statsLoading={statsLoading}/>
    </div>);
}
