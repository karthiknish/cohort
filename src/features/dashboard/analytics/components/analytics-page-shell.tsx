'use client'

import { useCallback, useMemo } from 'react'
import { CheckCircle2, Link2, LoaderCircle, RotateCw, TrendingUp, Unlink } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { AutoRefreshControls } from '@/shared/ui/auto-refresh-controls'
import { BoneyardSkeletonBoundary } from '@/shared/ui/boneyard-skeleton-boundary'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { asErrorMessage } from '@/lib/convex-errors'
import { DASHBOARD_THEME, PAGE_TITLES, getIconContainerClasses } from '@/lib/dashboard-theme'
import { cn } from '@/lib/utils'

import { DisconnectDialog } from '../../ads/components/connection-dialog'
import { AnalyticsCharts } from './analytics-charts'
import { AnalyticsDateRangePicker } from './analytics-date-range-picker'
import { AnalyticsDeepDiveSection } from './analytics-deep-dive-section'
import { AnalyticsExportButton } from './analytics-export-button'
import { AnalyticsInsightsSection } from './analytics-insights-section'
import { AnalyticsMetricCards } from './analytics-metric-cards'
import { AnalyticsPageSkeleton } from './analytics-page-skeleton'
import { useAnalyticsPageContext } from './analytics-page-provider'
import { AnalyticsSummaryCards } from './analytics-summary-cards'
import { GoogleAnalyticsSetupDialog } from './google-analytics-setup-dialog'

export function AnalyticsPageShell() {
  const { initialMetricsLoading } = useAnalyticsPageContext()
  const loadingContent = useMemo(() => <AnalyticsPageSkeleton />, [])

  return (
    <BoneyardSkeletonBoundary
      name="dashboard-analytics-page"
      loading={initialMetricsLoading}
      loadingContent={loadingContent}
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

const PREVIEW_CONNECTED_BADGE_CLASS = 'bg-success/10 text-success'
const PREVIEW_SAMPLE_BADGE_CLASS = 'rounded-full border border-success/20 bg-success/10 px-3 py-1.5 text-xs font-medium text-success'
const PREVIEW_SAMPLE_ICON_CLASS = 'flex h-5 w-5 items-center justify-center rounded-full bg-success/10 text-success'

function AnalyticsHeaderSection() {
  const { dateRange, handleDateRangeChange } = useAnalyticsPageContext()

  return (
    <div className={DASHBOARD_THEME.layout.header}>
      <div>
        <div className="mb-2 flex items-center gap-2">
          <div className={getIconContainerClasses('medium')}>
            <TrendingUp className="h-6 w-6" />
          </div>
          <h1 className={DASHBOARD_THEME.layout.title}>{PAGE_TITLES.analytics?.title ?? 'Analytics'}</h1>
        </div>
        <p className={cn(DASHBOARD_THEME.layout.subtitle, 'max-w-xl text-sm font-medium')}>
          {PAGE_TITLES.analytics?.description ?? 'Real-time performance metrics and cross-platform creative insights for your active campaigns.'}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <AnalyticsDateRangePicker value={dateRange} onChange={handleDateRangeChange} />
      </div>
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

  return (
    <Card className="overflow-hidden border border-border/60 bg-card shadow-sm motion-chromatic hover:shadow-md">
      <CardHeader className="flex flex-col gap-4 border-b border-border/60 bg-card py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <GoogleAnalyticsIcon />
          <div>
            <CardTitle className="text-sm font-medium tracking-normal text-foreground">Google Analytics</CardTitle>
            <CardDescription className="mt-0.5 text-xs leading-tight text-muted-foreground">
              Import users, sessions, and conversions into your dashboard
            </CardDescription>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {gaConnected ? (
            <div
              className={cn(
                'inline-flex animate-in fade-in slide-in-from-right-2 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium duration-300',
                isPreviewMode
                  ? PREVIEW_CONNECTED_BADGE_CLASS
                  : gaLastSyncStatus === 'error'
                  ? 'bg-destructive/10 text-destructive'
                  : gaNeedsPropertySelection
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-primary/10 text-primary'
              )}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {gaStatusLabel}{gaAccountLabel ? ` · ${gaAccountLabel}` : ''}
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive">
              <Link2 className="h-3.5 w-3.5" />
              Not connected
            </div>
          )}

          {isPreviewMode ? (
            <div className={PREVIEW_SAMPLE_BADGE_CLASS}>
              Read-only sample data
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleConnectClick}
                disabled={gaLoading}
                className="h-9 rounded-md border-border/60 bg-background text-primary text-sm font-medium transition-colors hover:bg-muted/40"
              >
                {gaLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}
                {gaConnected ? 'Reconnect account' : 'Connect Google'}
              </Button>
              {gaConnected ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleOpenGoogleAnalyticsSetup}
                  disabled={gaLoadingProperties || gaInitializingProperty}
                  className="h-9 rounded-md border-border/60 bg-background text-muted-foreground text-sm font-medium transition-colors hover:bg-muted/40"
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
                  className="h-9 rounded-md border-border/60 bg-background text-destructive text-sm font-medium transition-colors hover:bg-destructive/10"
                >
                  <Unlink className="mr-2 h-4 w-4" />
                  Disconnect
                </Button>
              ) : null}
              <Button
                type="button"
                size="sm"
                onClick={handleSyncClick}
                disabled={isSyncPending || gaLoading || !gaConnected || gaNeedsPropertySelection}
                className="h-9 rounded-md bg-primary text-sm font-medium text-primary-foreground shadow-none transition-colors hover:bg-primary/90"
              >
                {isSyncPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <RotateCw className="mr-2 h-4 w-4" />}
                Sync data
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="bg-muted/20 px-4 py-3">
        {isPreviewMode ? (
          <div className="flex items-center gap-2">
            <div className={PREVIEW_SAMPLE_ICON_CLASS}>
              <TrendingUp className="h-3 w-3" />
            </div>
            <p className="text-xs text-muted-foreground">
              Showing read-only Google Analytics preview metrics and insights for demos and screen recordings.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                <TrendingUp className="h-3 w-3 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">
                Last successful sync: <span className="font-medium text-foreground">{gaLastSyncedLabel}</span>
                {' · '}
                Last sync request: <span className="font-medium text-foreground">{gaLastRequestedLabel}</span>
              </p>
            </div>
            {gaNeedsPropertySelection ? (
              <p className="pl-7 text-xs text-accent-foreground">Property selection is required before sync can run.</p>
            ) : null}
            {gaLastSyncStatus === 'error' && gaLastSyncMessage ? (
              <p className="pl-7 text-xs text-destructive">{gaLastSyncMessage}</p>
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

  if (!metricsError) {
    return null
  }

  return (
    <Alert variant="destructive">
      <AlertTitle>Unable to load analytics</AlertTitle>
      <AlertDescription>{asErrorMessage(metricsError)}</AlertDescription>
    </Alert>
  )
}

function AnalyticsBodySection() {
  const { gaConnected, isGaSelectedWithoutData, isSyncPending } = useAnalyticsPageContext()

  if (isGaSelectedWithoutData) {
    return <AnalyticsEmptyState />
  }

  if (isSyncPending) {
    return <AnalyticsSyncingState />
  }

  if (!gaConnected) {
    return <AnalyticsEmptyState />
  }

  return <AnalyticsPerformanceSection />
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
    <Card className="overflow-hidden border border-border/60 bg-card shadow-sm">
      <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted/20">
          <GoogleAnalyticsIcon className="h-12 w-12" />
        </div>
        <h3 className="mb-2 text-base font-medium text-foreground">No analytics data yet</h3>
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
              className="rounded-md border-border/60 bg-background text-primary hover:bg-muted/40"
            >
              {gaLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}
              Link Google Analytics
            </Button>
          ) : gaNeedsPropertySelection ? (
            <Button type="button" size="sm" onClick={handleOpenGoogleAnalyticsSetup} className="rounded-md bg-primary text-primary-foreground shadow-none hover:bg-primary/90">
              Select property
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={handleSyncClick}
              disabled={isSyncPending || gaLoading || !gaConnected}
              className="rounded-md bg-primary text-primary-foreground shadow-none hover:bg-primary/90"
            >
              {isSyncPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <RotateCw className="mr-2 h-4 w-4" />}
              Sync data now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function AnalyticsSyncingState() {
  return (
    <Card className="overflow-hidden border border-border/60 bg-card shadow-sm">
      <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
        </div>
        <h3 className="mb-2 text-base font-medium text-foreground">Syncing analytics data</h3>
        <p className="max-w-md text-sm text-muted-foreground">Importing your Google Analytics data. This may take a moment...</p>
      </CardContent>
    </Card>
  )
}

function AnalyticsPerformanceSection() {
  const {
    algorithmic,
    avgSessionsPerDay,
    avgUsersPerDay,
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
    revenuePerSession,
    sessionsPerUser,
    story,
    totals,
  } = useAnalyticsPageContext()

  return (
    <>
      <div className="flex items-center justify-between border-b border-muted/10 pb-2">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">Property performance</h2>
        </div>
        <div className="flex items-center gap-1.5">
          {metricsNextCursor ? (
            <button
              type="button"
              onClick={handleLoadMoreMetrics}
              disabled={metricsLoadingMore}
              className="group inline-flex items-center gap-2 rounded-xl border border-muted/30 bg-background px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 shadow-sm motion-chromatic hover:bg-muted/5 hover:text-foreground active:scale-[0.98] disabled:opacity-50"
            >
              {metricsLoadingMore ? (
                <>
                  <LoaderCircle className="h-3 w-3 animate-spin" />
                  Loading
                </>
              ) : (
                <>
                  <RotateCw className="h-3 w-3 transition-transform duration-500 group-hover:rotate-180" />
                  Load older data
                </>
              )}
            </button>
          ) : null}
          <AutoRefreshControls
            onRefresh={handleRefreshMetrics}
            disabled={isPreviewMode || metricsLoading}
            isRefreshing={metricsRefreshing}
            defaultInterval="off"
          />
          <AnalyticsExportButton metrics={filteredMetrics} disabled={isPreviewMode} />
        </div>
      </div>

      <AnalyticsSummaryCards totals={totals} conversionRate={conversionRate} isLoading={initialMetricsLoading} />
      <AnalyticsMetricCards
        avgUsersPerDay={avgUsersPerDay}
        avgSessionsPerDay={avgSessionsPerDay}
        revenuePerSession={revenuePerSession}
        sessionsPerUser={sessionsPerUser}
        conversionRate={conversionRate}
        isLoading={initialMetricsLoading}
      />
      <AnalyticsDeepDiveSection story={story} />
      <AnalyticsCharts chartData={chartData} isMetricsLoading={metricsLoading} initialMetricsLoading={initialMetricsLoading} />
      <AnalyticsInsightsSection
        insights={insights}
        algorithmic={algorithmic}
        insightsError={insightsError}
        insightsLoading={insightsLoading}
        insightsRefreshing={insightsRefreshing}
        initialInsightsLoading={initialInsightsLoading}
        onRefreshInsights={handleRefreshInsights}
      />
    </>
  )
}

function GoogleAnalyticsIcon({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
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
