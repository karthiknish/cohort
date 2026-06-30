'use client';
import { dynamic } from '@/shared/ui/dynamic';
import { useCallback } from 'react';
import { BarChart3, CheckCircle2, Link2, LoaderCircle, RotateCw, Unlink } from 'lucide-react';
import { DisconnectDialog } from '../../ads/components/connection-dialog';
import { asErrorMessage } from '@/lib/convex-errors';
import { DASHBOARD_THEME, PAGE_TITLES, getBadgeClasses, getButtonClasses, getIconContainerClasses, } from '@/lib/dashboard-theme';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { PageSkeletonBoundary } from '@/shared/ui/page-skeleton-boundary';
import { AnalyticsPageSkeleton } from './analytics-page-skeleton';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { DashboardPageHero } from '@/shared/components/dashboard-page-hero';
import { Skeleton } from '@/shared/ui/skeleton';
import { SvglBrandLogo } from '@/shared/components/svgl-brand-logo';
import { AnalyticsBreakdownSection } from './analytics-breakdown-section';
import { AnalyticsDateRangePicker } from './analytics-date-range-picker';
import { AnalyticsDeepDiveSection } from './analytics-deep-dive-section';
import { AnalyticsExportButton } from './analytics-export-button';
import { AnalyticsInsightsSection } from './analytics-insights-section';
import { AnalyticsMetricCards } from './analytics-metric-cards';
import { useAnalyticsPageContext } from './analytics-page-provider';
import { AnalyticsSummaryCards } from './analytics-summary-cards';
import { GoogleAnalyticsSetupDialog } from './google-analytics-setup-dialog';
const ANALYTICS_CHART_SKELETON_KEYS = [
    'users-sessions',
    'revenue',
    'conversions',
    'conversion-rate',
] as const;
const AnalyticsCharts = dynamic(() => import('./analytics-charts').then((mod) => ({ default: mod.AnalyticsCharts })), {
    ssr: false,
    loading: () => (<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {ANALYTICS_CHART_SKELETON_KEYS.map((key) => (<Skeleton key={key} className="h-[360px] w-full rounded-lg"/>))}
      </div>),
});
export function AnalyticsPageShell() {
    const { initialMetricsLoading } = useAnalyticsPageContext();
    return (<PageSkeletonBoundary loading={initialMetricsLoading} loadingContent={<AnalyticsPageSkeleton />}>
      <div className={DASHBOARD_THEME.layout.container}>
        <div className="space-y-8 pb-10">
          <AnalyticsHeaderSection />
          <GoogleAnalyticsConnectionSection />
          <AnalyticsDialogs />
          <AnalyticsErrorAlert />
          <AnalyticsBodySection />
        </div>
      </div>
    </PageSkeletonBoundary>);
}
function AnalyticsHeaderSection() {
    const { dateRange, handleDateRangeChange } = useAnalyticsPageContext();
    return (<DashboardPageHero>
      <div>
        <div className="mb-2 flex items-center gap-3">
          <div className={getIconContainerClasses('medium')}>
            <BarChart3 className="size-6"/>
          </div>
          <h1 className={DASHBOARD_THEME.layout.title}>{PAGE_TITLES.analytics?.title ?? 'Analytics'}</h1>
        </div>
        <p className={cn(DASHBOARD_THEME.layout.subtitle, 'max-w-2xl text-sm')}>
          {PAGE_TITLES.analytics?.description ??
            'Performance insights and data visualization for your connected properties.'}
        </p>
      </div>
      <AnalyticsDateRangePicker value={dateRange} onChange={handleDateRangeChange}/>
    </DashboardPageHero>);
}
function GoogleAnalyticsConnectionSection() {
    const { gaAccountLabel, gaConnected, gaInitializingProperty, gaLastRequestedLabel, gaLastSyncMessage, gaLastSyncStatus, gaLastSyncedLabel, gaLoading, gaLoadingProperties, gaNeedsPropertySelection, gaStatusLabel, handleConnectGoogleAnalytics, handleOpenGoogleAnalyticsSetup, handleSyncGoogleAnalytics, isPreviewMode, isSyncPending, setGaDisconnectDialogOpen, } = useAnalyticsPageContext();
    const handleConnectClick = () => {
        void handleConnectGoogleAnalytics();
    };
    const handleDisconnectClick = () => {
        setGaDisconnectDialogOpen(true);
    };
    const handleSyncClick = () => {
        void handleSyncGoogleAnalytics();
    };
    const statusBadgeClass = gaConnected
        ? gaLastSyncStatus === 'error'
            ? getBadgeClasses('destructive')
            : gaNeedsPropertySelection
                ? getBadgeClasses('warning')
                : isPreviewMode
                    ? getBadgeClasses('success')
                    : getBadgeClasses('primary')
        : getBadgeClasses('destructive');
    return (<Card className={DASHBOARD_THEME.cards.base}>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className={cn(getIconContainerClasses('small'), 'flex size-10 shrink-0 items-center justify-center rounded-full')}>
            <SvglBrandLogo brand="google" className="size-8" labeled={false}/>
          </span>
          <div>
            <CardTitle className="text-base font-semibold text-foreground">Google Analytics</CardTitle>
            <CardDescription className="mt-1 text-sm text-muted-foreground">
              Import users, sessions, and conversions into your dashboard.
            </CardDescription>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className={cn('inline-flex items-center', statusBadgeClass)}>
            {gaConnected ? (<>
                <CheckCircle2 className="mr-1 inline size-3.5"/>
                {gaStatusLabel}
                {gaAccountLabel ? ` · ${gaAccountLabel}` : ''}
              </>) : (<>
                <Link2 className="mr-1 inline size-3.5"/>
                Not connected
              </>)}
          </span>
          {isPreviewMode ? (<span className={getBadgeClasses('success')}>Read-only sample data</span>) : (<>
              <Button type="button" variant="outline" size="sm" onClick={handleConnectClick} disabled={gaLoading} className={getButtonClasses('outline')}>
                {gaLoading ? <LoaderCircle className="mr-2 size-4 animate-spin"/> : <Link2 className="mr-2 size-4"/>}
                {gaConnected ? 'Reconnect' : 'Connect Google'}
              </Button>
              {gaConnected ? (<Button type="button" variant="outline" size="sm" onClick={handleOpenGoogleAnalyticsSetup} disabled={gaLoadingProperties || gaInitializingProperty} className={getButtonClasses('outline')}>
                  {gaNeedsPropertySelection ? 'Select property' : 'Change property'}
                </Button>) : null}
              {gaConnected ? (<Button type="button" variant="outline" size="sm" onClick={handleDisconnectClick} className={cn(getButtonClasses('outline'), 'text-destructive hover:text-destructive')}>
                  <Unlink className="mr-2 size-4"/>
                  Disconnect
                </Button>) : null}
              <Button type="button" size="sm" onClick={handleSyncClick} disabled={isSyncPending || gaLoading || !gaConnected || gaNeedsPropertySelection} className={getButtonClasses('primary')}>
                {isSyncPending ? <LoaderCircle className="mr-2 size-4 animate-spin"/> : <RotateCw className="mr-2 size-4"/>}
                Sync data
              </Button>
            </>)}
        </div>
      </CardHeader>

      <CardContent className="border-t border-border/60 bg-muted/20 pt-4">
        {isPreviewMode ? (<p className="text-sm text-muted-foreground">
            Showing read-only Google Analytics preview metrics and insights for demos and screen recordings.
          </p>) : (<div className="space-y-1 text-sm text-muted-foreground">
            <p>
              Last successful sync: <span className="font-medium text-foreground">{gaLastSyncedLabel}</span>
              {' · '}
              Last sync request: <span className="font-medium text-foreground">{gaLastRequestedLabel}</span>
            </p>
            {gaNeedsPropertySelection ? (<p className="text-accent-foreground">Property selection is required before sync can run.</p>) : null}
            {gaLastSyncStatus === 'error' && gaLastSyncMessage ? (<p className="text-destructive">{gaLastSyncMessage}</p>) : null}
          </div>)}
      </CardContent>
    </Card>);
}
function AnalyticsDialogs() {
    const { gaDisconnectDialogOpen, gaDisconnecting, gaInitializingProperty, gaLoadingProperties, gaProperties, gaSelectedPropertyId, gaSetupDialogOpen, gaSetupMessage, handleDisconnectGoogleAnalytics, handleFinalizeGoogleAnalyticsSetup, loadGoogleAnalyticsPropertyOptions, setGaDisconnectDialogOpen, setGaSelectedPropertyId, setGaSetupDialogOpen, } = useAnalyticsPageContext();
    const handleReloadProperties = () => {
        void loadGoogleAnalyticsPropertyOptions().catch(() => {
            // Error already handled by loadGoogleAnalyticsPropertyOptions catch block
        });
    };
    const handleInitialize = () => {
        void handleFinalizeGoogleAnalyticsSetup();
    };
    return (<>
      <GoogleAnalyticsSetupDialog open={gaSetupDialogOpen} onOpenChange={setGaSetupDialogOpen} setupMessage={gaSetupMessage} properties={gaProperties} selectedPropertyId={gaSelectedPropertyId} onPropertySelectionChange={setGaSelectedPropertyId} loadingProperties={gaLoadingProperties} initializing={gaInitializingProperty} onReloadProperties={handleReloadProperties} onInitialize={handleInitialize}/>

      <DisconnectDialog open={gaDisconnectDialogOpen} onOpenChange={setGaDisconnectDialogOpen} providerName="Google Analytics" onConfirm={handleDisconnectGoogleAnalytics} isDisconnecting={gaDisconnecting}/>
    </>);
}
function AnalyticsErrorAlert() {
    const { metricsError, breakdownsError, gaStatusError } = useAnalyticsPageContext();
    const errors = [metricsError, breakdownsError, gaStatusError].filter(Boolean) as Error[];
    if (errors.length === 0)
        return null;
    return (<div className="space-y-2">
      {errors.map((error) => (<Alert key={error.message} variant="destructive">
          <AlertTitle>Unable to load analytics</AlertTitle>
          <AlertDescription>{asErrorMessage(error)}</AlertDescription>
        </Alert>))}
    </div>);
}
function AnalyticsBodySection() {
    const { gaConnected, isGaSelectedWithoutData, isSyncPending } = useAnalyticsPageContext();
    if (!gaConnected || isGaSelectedWithoutData)
        return <AnalyticsEmptyState />;
    return (<div className="space-y-6">
      {isSyncPending ? <AnalyticsSyncingBanner /> : null}
      <AnalyticsPerformanceSection />
    </div>);
}
function AnalyticsEmptyState() {
    const { gaConnected, gaLoading, gaNeedsPropertySelection, handleConnectGoogleAnalytics, handleOpenGoogleAnalyticsSetup, handleSyncGoogleAnalytics, isSyncPending, } = useAnalyticsPageContext();
    const handleConnectClick = () => {
        void handleConnectGoogleAnalytics();
    };
    const handleSyncClick = () => {
        void handleSyncGoogleAnalytics();
    };
    return (<Card className={DASHBOARD_THEME.cards.base}>
      <CardContent className="flex flex-col items-center px-6 py-16 text-center">
        <div className={cn(getIconContainerClasses('large'), 'mb-6 flex size-20 items-center justify-center rounded-full')}>
          <SvglBrandLogo brand="google" className="size-10" labeled={false}/>
        </div>
        <h3 className="mb-2 text-base font-semibold text-foreground">No analytics data yet</h3>
        <p className="mb-6 max-w-md text-sm text-muted-foreground">
          Connect your Google Analytics property and sync your data to view users, sessions, conversions, and revenue trends.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          {!gaConnected ? (<Button type="button" variant="outline" size="sm" onClick={handleConnectClick} disabled={gaLoading} className={getButtonClasses('outline')}>
              {gaLoading ? <LoaderCircle className="mr-2 size-4 animate-spin"/> : <Link2 className="mr-2 size-4"/>}
              Link Google Analytics
            </Button>) : gaNeedsPropertySelection ? (<Button type="button" size="sm" onClick={handleOpenGoogleAnalyticsSetup} className={getButtonClasses('primary')}>
              Select property
            </Button>) : (<Button type="button" size="sm" onClick={handleSyncClick} disabled={isSyncPending || gaLoading || !gaConnected} className={getButtonClasses('primary')}>
              {isSyncPending ? <LoaderCircle className="mr-2 size-4 animate-spin"/> : <RotateCw className="mr-2 size-4"/>}
              Sync data now
            </Button>)}
        </div>
      </CardContent>
    </Card>);
}
function AnalyticsSyncingBanner() {
    return (<Alert className="border-accent/40 bg-accent/5">
      <LoaderCircle className="size-4 animate-spin text-primary"/>
      <AlertTitle className="text-sm font-semibold">Syncing analytics data</AlertTitle>
      <AlertDescription className="text-xs text-muted-foreground">
        Importing the latest Google Analytics metrics. Charts below may update as new data arrives.
      </AlertDescription>
    </Alert>);
}
function AnalyticsPerformanceSection() {
    const { algorithmic, avgSessionsPerDay, avgUsersPerDay, breakdowns, chartData, conversionRate, filteredMetrics, handleLoadMoreMetrics, handleRefreshInsights, handleRefreshMetrics, initialInsightsLoading, initialMetricsLoading, insights, insightsError, insightsLoading, insightsRefreshing, isPreviewMode, metricsLoading, metricsLoadingMore, metricsNextCursor, metricsRefreshing, formatRevenue, revenueComparable, revenuePerSession, sessionsPerUser, story, totals, } = useAnalyticsPageContext();
    const hasRevenue = revenueComparable && (totals.revenue ?? 0) > 0;
    return (<div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <h2 className="text-sm font-semibold text-foreground">Property performance</h2>
        <div className="flex flex-wrap items-center gap-2">
          {metricsNextCursor ? (<Button type="button" variant="outline" size="sm" onClick={handleLoadMoreMetrics} disabled={metricsLoadingMore} className={getButtonClasses('outline')}>
              {metricsLoadingMore ? (<>
                  <LoaderCircle className="mr-2 size-3.5 animate-spin"/>
                  Loading
                </>) : (<>
                  <RotateCw className="mr-2 size-3.5"/>
                  Load older data
                </>)}
            </Button>) : null}
          <Button type="button" variant="outline" size="sm" onClick={handleRefreshMetrics} disabled={isPreviewMode || metricsLoading || metricsRefreshing} className={getButtonClasses('outline')} aria-label="Refresh metrics">
            <RotateCw className={cn('mr-2 size-3.5', metricsRefreshing && 'animate-spin')}/>
            Refresh
          </Button>
          <AnalyticsExportButton metrics={filteredMetrics} breakdowns={breakdowns}/>
        </div>
      </div>

      <AnalyticsSummaryCards totals={totals} deltas={story.deltas} formatRevenue={formatRevenue} isLoading={initialMetricsLoading} hasRevenue={hasRevenue} conversionRate={conversionRate} sparklineData={chartData.length >= 2 ? {
        users: chartData.map((d) => d.users),
        sessions: chartData.map((d) => d.sessions),
        conversions: chartData.map((d) => d.conversions),
        revenue: chartData.map((d) => d.revenue),
        conversionRate: chartData.map((d) => d.conversionRate),
      } : undefined}/>
      <AnalyticsMetricCards avgUsersPerDay={avgUsersPerDay} avgSessionsPerDay={avgSessionsPerDay} revenuePerSession={revenuePerSession} sessionsPerUser={sessionsPerUser} conversionRate={conversionRate} hasRevenue={hasRevenue} formatRevenue={formatRevenue} isLoading={initialMetricsLoading}/>
      <AnalyticsDeepDiveSection story={story} formatRevenue={formatRevenue} hasRevenue={hasRevenue}/>
      <AnalyticsBreakdownSection breakdowns={breakdowns} formatRevenue={hasRevenue ? formatRevenue : undefined}/>
      <AnalyticsCharts chartData={chartData} formatRevenue={formatRevenue} isMetricsLoading={metricsLoading} initialMetricsLoading={initialMetricsLoading} hasRevenue={hasRevenue}/>
      <AnalyticsInsightsSection insights={insights} algorithmic={algorithmic} insightsError={insightsError} insightsLoading={insightsLoading} insightsRefreshing={insightsRefreshing} initialInsightsLoading={initialInsightsLoading} onRefreshInsights={handleRefreshInsights}/>
    </div>);
}
