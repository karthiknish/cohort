'use client';
import { PageMotionShell } from '@/shared/components/page-motion-shell';
import { DashboardOverviewPageView, useDashboardOverviewPage, } from './dashboard-overview-page-sections';
export function DashboardOverviewPage() {
    const { isInitialLoading, clientName, isClientScoped, teamMembersCount, accountManager, hasLiveMetrics, isRefreshing, handleRefreshClick, dashboardErrors, clientStats, clientStatsLoading, hasChartData, hasAdsData, hasAnalyticsData, metricsLoading, chartMetrics, displayCurrency, adsMetricsList, analyticsMetricsList, adsLoading, analyticsLoading, displayStats, statsLoading, } = useDashboardOverviewPage();
    const availability = ({
        hasLiveMetrics,
        hasChartData,
        hasAdsData,
        hasAnalyticsData,
    });
    const loading = ({
        isRefreshing,
        clientStatsLoading,
        metricsLoading,
        adsLoading,
        analyticsLoading,
        statsLoading,
    });
    return (<PageMotionShell reveal={false} className="mx-auto max-w-7xl pb-10">
      <DashboardOverviewPageView isInitialLoading={isInitialLoading} clientName={clientName} isClientScoped={isClientScoped} teamMembersCount={teamMembersCount} accountManager={accountManager} availability={availability} loading={loading} onRefresh={handleRefreshClick} dashboardErrors={dashboardErrors} clientStats={clientStats} chartMetrics={chartMetrics} displayCurrency={displayCurrency} adsMetricsList={adsMetricsList} analyticsMetricsList={analyticsMetricsList} displayStats={displayStats}/>
    </PageMotionShell>);
}
