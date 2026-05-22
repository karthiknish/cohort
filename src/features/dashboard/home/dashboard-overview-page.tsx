'use client'

import { useMemo } from 'react'

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

  const availability = useMemo(
    () => ({
      hasLiveMetrics,
      hasChartData,
      hasAdsData,
      hasAnalyticsData,
    }),
    [hasLiveMetrics, hasChartData, hasAdsData, hasAnalyticsData],
  )

  const loading = useMemo(
    () => ({
      isRefreshing,
      clientStatsLoading,
      metricsLoading,
      adsLoading,
      analyticsLoading,
      statsLoading,
    }),
    [isRefreshing, clientStatsLoading, metricsLoading, adsLoading, analyticsLoading, statsLoading],
  )

  return (
    <PageMotionShell reveal={false} className="mx-auto max-w-7xl pb-10">
      <BoneyardSkeletonBoundary name="dashboard-overview-page" loading={isInitialLoading}>
        <DashboardOverviewPageView
          clientName={clientName}
          isClientScoped={isClientScoped}
          teamMembersCount={teamMembersCount}
          accountManager={accountManager}
          availability={availability}
          loading={loading}
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
