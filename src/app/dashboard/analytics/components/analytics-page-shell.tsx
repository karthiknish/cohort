'use client'

import { CheckCircle2, Link2, LoaderCircle, RotateCw, TrendingUp, Unlink } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AutoRefreshControls } from '@/components/ui/auto-refresh-controls'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { useAnalyticsPageContext } from './analytics-page-provider'
import { AnalyticsSummaryCards } from './analytics-summary-cards'
import { GoogleAnalyticsSetupDialog } from './google-analytics-setup-dialog'

export function AnalyticsPageShell() {
  return (
    <div className={DASHBOARD_THEME.layout.container}>
      <div className="space-y-8 pb-10">
        <AnalyticsHeaderSection />
        <GoogleAnalyticsConnectionSection />
        <AnalyticsDialogs />
        <AnalyticsErrorAlert />
        <AnalyticsBodySection />
      </div>
    </div>
  )
}

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
    isSyncPending,
    setGaDisconnectDialogOpen,
  } = useAnalyticsPageContext()

  return (
    <Card className="overflow-hidden border-0 bg-white shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] hover:shadow-[0_1px_3px_0_rgba(60,64,67,0.3),0_2px_8px_4px_rgba(60,64,67,0.1)]">
      <CardHeader className="flex flex-col gap-4 border-b border-[#dadce0] bg-white py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <GoogleAnalyticsIcon />
          <div>
            <CardTitle className="text-sm font-medium tracking-normal text-[#202124]">Google Analytics</CardTitle>
            <CardDescription className="mt-0.5 text-xs leading-tight text-[#5f6368]">
              Import users, sessions, and conversions into your dashboard
            </CardDescription>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {gaConnected ? (
            <div
              className={cn(
                'inline-flex animate-in fade-in slide-in-from-right-2 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium duration-300',
                gaLastSyncStatus === 'error'
                  ? 'bg-[#fce8e6] text-[#c5221f]'
                  : gaNeedsPropertySelection
                    ? 'bg-[#fff8e1] text-[#8d6e00]'
                    : 'bg-[#e6f4ea] text-[#137333]'
              )}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {gaStatusLabel}{gaAccountLabel ? ` · ${gaAccountLabel}` : ''}
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#fce8e6] px-3 py-1.5 text-xs font-medium text-[#c5221f]">
              <Link2 className="h-3.5 w-3.5" />
              Not connected
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleConnectGoogleAnalytics()}
              disabled={gaLoading}
              className="h-9 rounded-md border-[#dadce0] bg-white text-[#1a73e8] text-sm font-medium transition-colors hover:border-[#dadce0] hover:bg-[#f8f9fa]"
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
                className="h-9 rounded-md border-[#dadce0] bg-white text-[#5f6368] text-sm font-medium transition-colors hover:border-[#dadce0] hover:bg-[#f8f9fa]"
              >
                {gaNeedsPropertySelection ? 'Select property' : 'Change property'}
              </Button>
            ) : null}
            {gaConnected ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setGaDisconnectDialogOpen(true)}
                className="h-9 rounded-md border-[#dadce0] bg-white text-[#c5221f] text-sm font-medium transition-colors hover:border-[#f5c6c4] hover:bg-[#fce8e6]"
              >
                <Unlink className="mr-2 h-4 w-4" />
                Disconnect
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              onClick={() => void handleSyncGoogleAnalytics()}
              disabled={isSyncPending || gaLoading || !gaConnected || gaNeedsPropertySelection}
              className="h-9 rounded-md bg-[#1a73e8] text-sm font-medium text-white shadow-none transition-colors hover:bg-[#1557b0]"
            >
              {isSyncPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <RotateCw className="mr-2 h-4 w-4" />}
              Sync data
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="bg-[#f8f9fa] px-4 py-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e8f0fe]">
              <TrendingUp className="h-3 w-3 text-[#1a73e8]" />
            </div>
            <p className="text-xs text-[#5f6368]">
              Last successful sync: <span className="font-medium text-[#202124]">{gaLastSyncedLabel}</span>
              {' · '}
              Last sync request: <span className="font-medium text-[#202124]">{gaLastRequestedLabel}</span>
            </p>
          </div>
          {gaNeedsPropertySelection ? (
            <p className="pl-7 text-xs text-[#8d6e00]">Property selection is required before sync can run.</p>
          ) : null}
          {gaLastSyncStatus === 'error' && gaLastSyncMessage ? (
            <p className="pl-7 text-xs text-[#c5221f]">{gaLastSyncMessage}</p>
          ) : null}
        </div>
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
        onReloadProperties={() => void loadGoogleAnalyticsPropertyOptions()}
        onInitialize={() => void handleFinalizeGoogleAnalyticsSetup()}
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
    return null
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

  return (
    <Card className="overflow-hidden border-0 bg-white shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)]">
      <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#f8f9fa]">
          <GoogleAnalyticsIcon className="h-12 w-12" />
        </div>
        <h3 className="mb-2 text-base font-medium text-[#202124]">No analytics data yet</h3>
        <p className="mb-6 max-w-md text-sm text-[#5f6368]">
          Connect your Google Analytics property and sync your data to view users, sessions, conversions, and revenue trends.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          {!gaConnected ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleConnectGoogleAnalytics()}
              disabled={gaLoading}
              className="rounded-md border-[#dadce0] bg-white text-[#1a73e8] hover:bg-[#f8f9fa]"
            >
              {gaLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}
              Link Google Analytics
            </Button>
          ) : gaNeedsPropertySelection ? (
            <Button type="button" size="sm" onClick={handleOpenGoogleAnalyticsSetup} className="rounded-md bg-[#1a73e8] text-white shadow-none hover:bg-[#1557b0]">
              Select property
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={() => void handleSyncGoogleAnalytics()}
              disabled={isSyncPending || gaLoading || !gaConnected}
              className="rounded-md bg-[#1a73e8] text-white shadow-none hover:bg-[#1557b0]"
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
    <Card className="overflow-hidden border-0 bg-white shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)]">
      <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#e8f0fe]">
          <LoaderCircle className="h-10 w-10 animate-spin text-[#1a73e8]" />
        </div>
        <h3 className="mb-2 text-base font-medium text-[#202124]">Syncing analytics data</h3>
        <p className="max-w-md text-sm text-[#5f6368]">Importing your Google Analytics data. This may take a moment...</p>
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
              className="group inline-flex items-center gap-2 rounded-xl border border-muted/30 bg-background px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 shadow-sm transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] hover:bg-muted/5 hover:text-foreground active:scale-[0.98] disabled:opacity-50"
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
    <div className="flex h-10 w-10 items-center justify-center">
      <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
        <path d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" fill="#F9AB00" />
        <path d="M12 2C6.477 2 2 6.477 2 12h10V2z" fill="#E37400" />
        <circle cx="12" cy="12" r="3" fill="#fff" />
      </svg>
    </div>
  )
}