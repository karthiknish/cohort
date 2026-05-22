'use client'

import dynamic from 'next/dynamic'
import { useCallback } from 'react'
import { BarChart3, CheckCircle2, Link2, LoaderCircle, RotateCw, Unlink } from 'lucide-react'

import { DisconnectDialog } from '../../ads/components/connection-dialog'
import { asErrorMessage } from '@/lib/convex-errors'
import {
  DASHBOARD_THEME,
  PAGE_TITLES,
  getBadgeClasses,
  getButtonClasses,
  getIconContainerClasses,
} from '@/lib/dashboard-theme'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { BoneyardSkeletonBoundary } from '@/shared/ui/boneyard-skeleton-boundary'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'

import { AnalyticsBreakdownSection } from './analytics-breakdown-section'
import { AnalyticsDateRangePicker } from './analytics-date-range-picker'
import { AnalyticsDeepDiveSection } from './analytics-deep-dive-section'
import { AnalyticsExportButton } from './analytics-export-button'
import { AnalyticsInsightsSection } from './analytics-insights-section'
import { AnalyticsMetricCards } from './analytics-metric-cards'
import { useAnalyticsPageContext } from './analytics-page-provider'
import { AnalyticsSummaryCards } from './analytics-summary-cards'
import { GoogleAnalyticsSetupDialog } from './google-analytics-setup-dialog'

const AnalyticsCharts = dynamic(
  () => import('./analytics-charts').then((mod) => ({ default: mod.AnalyticsCharts })),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[360px] w-full rounded-lg" />
        ))}
      </div>
    ),
  },
)

export function AnalyticsPageShell() {
  const { initialMetricsLoading } = useAnalyticsPageContext()
  return (
    <BoneyardSkeletonBoundary
      name="dashboard-analytics-page"
      loading={initialMetricsLoading}
    >
      <div className={DASHBOARD_THEME.layout.container}>
        <div className="space-y-8 pb-10">
          <AnalyticsHeaderSection />
          <GoogleAnalyticsConnectionSection />
          <AnalyticsDialogs />
          <AnalyticsErrorAlert />
          <AnalyticsBodySection />
        </div>
      </div>
    </BoneyardSkeletonBoundary>
  )
}

function AnalyticsHeaderSection() {
  const { dateRange, handleDateRangeChange } = useAnalyticsPageContext()

  return (
    <div className={DASHBOARD_THEME.layout.header}>
      <div>
        <div className="mb-2 flex items-center gap-3">
          <div className={getIconContainerClasses('medium')}>
            <BarChart3 className="size-6" />
          </div>
          <h1 className={DASHBOARD_THEME.layout.title}>{PAGE_TITLES.analytics?.title ?? 'Analytics'}</h1>
        </div>
        <p className={cn(DASHBOARD_THEME.layout.subtitle, 'max-w-2xl text-sm')}>
          {PAGE_TITLES.analytics?.description ??
            'Performance insights and data visualization for your connected properties.'}
        </p>
      </div>
      <AnalyticsDateRangePicker value={dateRange} onChange={handleDateRangeChange} />
    </div>
  )
}

function GoogleAnalyticsConnectionSection() {
  const {
    gaAccountLabel,
    gaConnected,
    gaInitializingProperty,
    gaLastRequestedLabel,
    gaLastSyncMessage,
    gaLastSyncStatus,
    gaLastSyncedLabel,
    gaLoading,
    gaLoadingProperties,
    gaNeedsPropertySelection,
    gaStatusLabel,
    handleConnectGoogleAnalytics,
    handleOpenGoogleAnalyticsSetup,
    handleSyncGoogleAnalytics,
    isPreviewMode,
    isSyncPending,
    setGaDisconnectDialogOpen,
  } = useAnalyticsPageContext()

  const handleConnectClick = useCallback(() => {
    void handleConnectGoogleAnalytics()
  }, [handleConnectGoogleAnalytics])

  const handleDisconnectClick = useCallback(() => {
    setGaDisconnectDialogOpen(true)
  }, [setGaDisconnectDialogOpen])

  const handleSyncClick = useCallback(() => {
    void handleSyncGoogleAnalytics()
  }, [handleSyncGoogleAnalytics])

  const statusBadgeClass = gaConnected
    ? gaLastSyncStatus === 'error'
      ? getBadgeClasses('destructive')
      : gaNeedsPropertySelection
        ? getBadgeClasses('warning')
        : isPreviewMode
          ? getBadgeClasses('success')
          : getBadgeClasses('primary')
    : getBadgeClasses('destructive')

  return (
    <Card className={DASHBOARD_THEME.cards.base}>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <GoogleAnalyticsIcon />
          <div>
            <CardTitle className="text-base font-semibold text-foreground">Google Analytics</CardTitle>
            <CardDescription className="mt-1 text-sm text-muted-foreground">
              Import users, sessions, and conversions into your dashboard.
            </CardDescription>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className={cn('inline-flex items-center', statusBadgeClass)}>
            {gaConnected ? (
              <>
                <CheckCircle2 className="mr-1 inline size-3.5" />
                {gaStatusLabel}
                {gaAccountLabel ? ` · ${gaAccountLabel}` : ''}
              </>
            ) : (
              <>
                <Link2 className="mr-1 inline size-3.5" />
                Not connected
              </>
            )}
          </span>
          {isPreviewMode ? (
            <span className={getBadgeClasses('success')}>Read-only sample data</span>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleConnectClick}
                disabled={gaLoading}
                className={getButtonClasses('outline')}
              >
                {gaLoading ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <Link2 className="mr-2 size-4" />}
                {gaConnected ? 'Reconnect' : 'Connect Google'}
              </Button>
              {gaConnected ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleOpenGoogleAnalyticsSetup}
                  disabled={gaLoadingProperties || gaInitializingProperty}
                  className={getButtonClasses('outline')}
                >
                  {gaNeedsPropertySelection ? 'Select property' : 'Change property'}
                </Button>
              ) : null}
              {gaConnected ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnectClick}
                  className={cn(getButtonClasses('outline'), 'text-destructive hover:text-destructive')}
                >
                  <Unlink className="mr-2 size-4" />
                  Disconnect
                </Button>
              ) : null}
              <Button
                type="button"
                size="sm"
                onClick={handleSyncClick}
                disabled={isSyncPending || gaLoading || !gaConnected || gaNeedsPropertySelection}
                className={getButtonClasses('primary')}
              >
                {isSyncPending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <RotateCw className="mr-2 size-4" />}
                Sync data
              </Button>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="border-t border-border/60 bg-muted/20 pt-4">
        {isPreviewMode ? (
          <p className="text-sm text-muted-foreground">
            Showing read-only Google Analytics preview metrics and insights for demos and screen recordings.
          </p>
        ) : (
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>
              Last successful sync: <span className="font-medium text-foreground">{gaLastSyncedLabel}</span>
              {' · '}
              Last sync request: <span className="font-medium text-foreground">{gaLastRequestedLabel}</span>
            </p>
            {gaNeedsPropertySelection ? (
              <p className="text-accent-foreground">Property selection is required before sync can run.</p>
            ) : null}
            {gaLastSyncStatus === 'error' && gaLastSyncMessage ? (
              <p className="text-destructive">{gaLastSyncMessage}</p>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function AnalyticsDialogs() {
  const {
    gaDisconnectDialogOpen,
    gaDisconnecting,
    gaInitializingProperty,
    gaLoadingProperties,
    gaProperties,
    gaSelectedPropertyId,
    gaSetupDialogOpen,
    gaSetupMessage,
    handleDisconnectGoogleAnalytics,
    handleFinalizeGoogleAnalyticsSetup,
    loadGoogleAnalyticsPropertyOptions,
    setGaDisconnectDialogOpen,
    setGaSelectedPropertyId,
    setGaSetupDialogOpen,
  } = useAnalyticsPageContext()

  const handleReloadProperties = useCallback(() => {
    void loadGoogleAnalyticsPropertyOptions()
  }, [loadGoogleAnalyticsPropertyOptions])

  const handleInitialize = useCallback(() => {
    void handleFinalizeGoogleAnalyticsSetup()
  }, [handleFinalizeGoogleAnalyticsSetup])

  return (
    <>
      <GoogleAnalyticsSetupDialog
        open={gaSetupDialogOpen}
        onOpenChange={setGaSetupDialogOpen}
        setupMessage={gaSetupMessage}
        properties={gaProperties}
        selectedPropertyId={gaSelectedPropertyId}
        onPropertySelectionChange={setGaSelectedPropertyId}
        loadingProperties={gaLoadingProperties}
        initializing={gaInitializingProperty}
        onReloadProperties={handleReloadProperties}
        onInitialize={handleInitialize}
      />

      <DisconnectDialog
        open={gaDisconnectDialogOpen}
        onOpenChange={setGaDisconnectDialogOpen}
        providerName="Google Analytics"
        onConfirm={handleDisconnectGoogleAnalytics}
        isDisconnecting={gaDisconnecting}
      />
    </>
  )
}

function AnalyticsErrorAlert() {
  const { metricsError } = useAnalyticsPageContext()

  if (!metricsError) return null

  return (
    <Alert variant="destructive">
      <AlertTitle>Unable to load analytics</AlertTitle>
      <AlertDescription>{asErrorMessage(metricsError)}</AlertDescription>
    </Alert>
  )
}

function AnalyticsBodySection() {
  const { gaConnected, isGaSelectedWithoutData, isSyncPending } = useAnalyticsPageContext()

  if (!gaConnected || isGaSelectedWithoutData) return <AnalyticsEmptyState />

  return (
    <div className="space-y-6">
      {isSyncPending ? <AnalyticsSyncingBanner /> : null}
      <AnalyticsPerformanceSection />
    </div>
  )
}

function AnalyticsEmptyState() {
  const {
    gaConnected,
    gaLoading,
    gaNeedsPropertySelection,
    handleConnectGoogleAnalytics,
    handleOpenGoogleAnalyticsSetup,
    handleSyncGoogleAnalytics,
    isSyncPending,
  } = useAnalyticsPageContext()

  const handleConnectClick = useCallback(() => {
    void handleConnectGoogleAnalytics()
  }, [handleConnectGoogleAnalytics])

  const handleSyncClick = useCallback(() => {
    void handleSyncGoogleAnalytics()
  }, [handleSyncGoogleAnalytics])

  return (
    <Card className={DASHBOARD_THEME.cards.base}>
      <CardContent className="flex flex-col items-center px-6 py-16 text-center">
        <div className={cn(getIconContainerClasses('large'), 'mb-6 size-20 rounded-full')}>
          <GoogleAnalyticsIcon className="size-10" />
        </div>
        <h3 className="mb-2 text-base font-semibold text-foreground">No analytics data yet</h3>
        <p className="mb-6 max-w-md text-sm text-muted-foreground">
          Connect your Google Analytics property and sync your data to view users, sessions, conversions, and revenue trends.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          {!gaConnected ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleConnectClick}
              disabled={gaLoading}
              className={getButtonClasses('outline')}
            >
              {gaLoading ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <Link2 className="mr-2 size-4" />}
              Link Google Analytics
            </Button>
          ) : gaNeedsPropertySelection ? (
            <Button type="button" size="sm" onClick={handleOpenGoogleAnalyticsSetup} className={getButtonClasses('primary')}>
              Select property
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={handleSyncClick}
              disabled={isSyncPending || gaLoading || !gaConnected}
              className={getButtonClasses('primary')}
            >
              {isSyncPending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <RotateCw className="mr-2 size-4" />}
              Sync data now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function AnalyticsSyncingBanner() {
  return (
    <Alert className="border-accent/40 bg-accent/5">
      <LoaderCircle className="size-4 animate-spin text-primary" />
      <AlertTitle className="text-sm font-semibold">Syncing analytics data</AlertTitle>
      <AlertDescription className="text-xs text-muted-foreground">
        Importing the latest Google Analytics metrics. Charts below may update as new data arrives.
      </AlertDescription>
    </Alert>
  )
}

function AnalyticsPerformanceSection() {
  const {
    algorithmic,
    avgSessionsPerDay,
    avgUsersPerDay,
    breakdowns,
    chartData,
    conversionRate,
    filteredMetrics,
    handleLoadMoreMetrics,
    handleRefreshInsights,
    handleRefreshMetrics,
    initialInsightsLoading,
    initialMetricsLoading,
    insights,
    insightsError,
    insightsLoading,
    insightsRefreshing,
    isPreviewMode,
    metricsLoading,
    metricsLoadingMore,
    metricsNextCursor,
    metricsRefreshing,
    formatRevenue,
    revenuePerSession,
    sessionsPerUser,
    story,
    totals,
  } = useAnalyticsPageContext()

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <h2 className="text-sm font-semibold text-foreground">Property performance</h2>
        <div className="flex flex-wrap items-center gap-2">
          {metricsNextCursor ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLoadMoreMetrics}
              disabled={metricsLoadingMore}
              className={getButtonClasses('outline')}
            >
              {metricsLoadingMore ? (
                <>
                  <LoaderCircle className="mr-2 size-3.5 animate-spin" />
                  Loading
                </>
              ) : (
                <>
                  <RotateCw className="mr-2 size-3.5" />
                  Load older data
                </>
              )}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRefreshMetrics}
            disabled={isPreviewMode || metricsLoading || metricsRefreshing}
            className={getButtonClasses('outline')}
            aria-label="Refresh metrics"
          >
            <RotateCw className={cn('mr-2 size-3.5', metricsRefreshing && 'animate-spin')} />
            Refresh
          </Button>
          <AnalyticsExportButton metrics={filteredMetrics} disabled={isPreviewMode} />
        </div>
      </div>

      <AnalyticsSummaryCards
        totals={totals}
        deltas={story.deltas}
        formatRevenue={formatRevenue}
        isLoading={initialMetricsLoading}
      />
      <AnalyticsMetricCards
        avgUsersPerDay={avgUsersPerDay}
        avgSessionsPerDay={avgSessionsPerDay}
        revenuePerSession={revenuePerSession}
        sessionsPerUser={sessionsPerUser}
        formatRevenue={formatRevenue}
        isLoading={initialMetricsLoading}
      />
      <AnalyticsDeepDiveSection story={story} formatRevenue={formatRevenue} />
      <AnalyticsBreakdownSection breakdowns={breakdowns} />
      <AnalyticsCharts
        chartData={chartData}
        formatRevenue={formatRevenue}
        isMetricsLoading={metricsLoading}
        initialMetricsLoading={initialMetricsLoading}
      />
      <AnalyticsInsightsSection
        insights={insights}
        algorithmic={algorithmic}
        insightsError={insightsError}
        insightsLoading={insightsLoading}
        insightsRefreshing={insightsRefreshing}
        initialInsightsLoading={initialInsightsLoading}
        onRefreshInsights={handleRefreshInsights}
      />
    </div>
  )
}

function GoogleAnalyticsIcon({ className = 'size-8' }: { className?: string }) {
  return (
    <div className={cn(getIconContainerClasses('small'), 'size-10 shrink-0 rounded-full')}>
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path
          d="M21.805 10.023H12v4.042h5.615c-.242 1.304-.967 2.409-2.056 3.147v2.617h3.33c1.948-1.793 3.076-4.434 3.076-7.564 0-.739-.067-1.449-.16-2.242Z"
          fill="currentColor"
        />
        <path
          d="M12 22c2.79 0 5.13-.925 6.84-2.51l-3.33-2.617c-.925.62-2.109.986-3.51.986-2.698 0-4.983-1.821-5.804-4.27H2.754v2.698A9.999 9.999 0 0 0 12 22Z"
          fill="currentColor"
        />
        <path
          d="M6.196 13.59A5.996 5.996 0 0 1 5.87 11.9c0-.587.105-1.155.326-1.69V7.512H2.754A9.998 9.998 0 0 0 2 11.9c0 1.61.386 3.131 1.07 4.388l3.126-2.698Z"
          fill="currentColor"
        />
        <path
          d="M12 5.94c1.517 0 2.88.522 3.95 1.547l2.96-2.96C17.125 2.865 14.786 2 12 2A9.999 9.999 0 0 0 2.754 7.512l3.442 2.698C7.017 7.761 9.302 5.94 12 5.94Z"
          fill="currentColor"
        />
      </svg>
    </div>
  )
}
