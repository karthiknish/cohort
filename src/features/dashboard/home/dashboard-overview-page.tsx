'use client'

import { PageMotionShell } from '@/shared/components/page-motion-shell'
import { BoneyardSkeletonBoundary } from '@/shared/ui/boneyard-skeleton-boundary'

import {
  DashboardOverviewPageView,
  useDashboardOverviewPage,
} from './dashboard-overview-page-sections'

export function DashboardOverviewPage() {
  const {
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
  } = useDashboardOverviewPage()

  return (
    <PageMotionShell reveal={false} className="mx-auto max-w-7xl pb-10">
      <BoneyardSkeletonBoundary name="dashboard-overview-page" loading={isInitialLoading}>
        <DashboardOverviewPageView
          clientName={clientName}
          isClientScoped={isClientScoped}
          teamMembersCount={teamMembersCount}
          accountManager={accountManager}
          availability={{
            hasLiveMetrics,
            hasChartData,
            hasAdsData,
            hasAnalyticsData,
          }}
          loading={{
            isRefreshing,
            clientStatsLoading,
            metricsLoading,
            adsLoading,
            analyticsLoading,
            statsLoading,
          }}
          onRefresh={handleRefreshClick}
          dashboardErrors={dashboardErrors}
          clientStats={clientStats}
          chartMetrics={chartMetrics}
          displayCurrency={displayCurrency}
          adsMetricsList={adsMetricsList}
          analyticsMetricsList={analyticsMetricsList}
          displayStats={displayStats}
        />
      </BoneyardSkeletonBoundary>
    </PageMotionShell>
  )
}
