'use client'

import { useEffect, useRef, Suspense, lazy } from 'react'

import { asErrorMessage, extractErrorCode, logError } from '@/lib/convex-errors'
import { DASHBOARD_THEME, PAGE_TITLES } from '@/lib/dashboard-theme'

function isAuthError(error: unknown): boolean {
  const code = extractErrorCode(error)
  return code === 'UNAUTHORIZED' || code === 'FORBIDDEN'
}

import { FadeIn } from '@/components/ui/animate-in'
import { AdConnectionsCard } from '@/components/dashboard/ad-connections-card'
import { usePreview } from '@/contexts/preview-context'
import { useToast } from '@/components/ui/use-toast'
import { DateRangePicker } from './components/date-range-picker'
import { Skeleton } from '@/components/ui/skeleton'

// Static imports for critical components
import {
  CrossChannelOverviewCard,
  PerformanceSummaryCard,
  MetricsTableCard,
  WorkflowCard,
  SetupAlerts,
} from './components'

// Lazy imports for heavy components
const CampaignManagementCard = lazy(() => import('./components/campaign-management-card').then(m => ({ default: m.CampaignManagementCard })))
const CustomInsightsCard = lazy(() => import('./components/custom-insights-card').then(m => ({ default: m.CustomInsightsCard })))
const ComparisonViewCard = lazy(() => import('./components/comparison-view-card').then(m => ({ default: m.ComparisonViewCard })))
const FormulaBuilderCard = lazy(() => import('./components/formula-builder-card').then(m => ({ default: m.FormulaBuilderCard })))
const AlgorithmicInsightsCard = lazy(() => import('./components/algorithmic-insights-card').then(m => ({ default: m.AlgorithmicInsightsCard })))
const InsightsChartsCard = lazy(() => import('./components/insights-charts-card').then(m => ({ default: m.InsightsChartsCard })))

import {
  useAdsMetrics,
  useAdsConnections,
  useDerivedMetrics,
  useFormulaEditor,
  useMetricsComparison,
  useAlgorithmicInsights,
} from './hooks'

/**
 * Ads Hub Page
 * 
 * Provides a unified dashboard for managing multiple ad platforms (Google, Meta, LinkedIn, TikTok).
 * Features include:
 * - Cross-channel performance overview
 * - Per-provider metric breakdown
 * - Automated sync configuration
 * - Manual data refresh and CSV export
 */
export default function AdsPage() {
  const { isPreviewMode } = usePreview()
  const { toast } = useToast()
  const shownErrorsRef = useRef<Set<string>>(new Set())

  // 1. Manage metrics, filters, and data loading
  const {
    metrics,
    processedMetrics,
    providerSummaries,
    serverSideSummary,
    hasMetricData,
    metricsLoading,
    initialMetricsLoading,
    loadingMore,
    metricError,
    loadMoreError,
    nextCursor,
    dateRange,
    setDateRange,
    handleManualRefresh,
    handleLoadMore,
    handleExport,
    triggerRefresh: triggerMetricsRefresh,
  } = useAdsMetrics()

  const derivedMetrics = useDerivedMetrics({ metrics: processedMetrics })
  const formulaEditor = useFormulaEditor()
  const { periodComparison, providerComparison } = useMetricsComparison({
    metrics: processedMetrics,
    dateRange,
  })
  const algorithmicInsights = useAlgorithmicInsights({
    metrics: processedMetrics,
    providerSummaries,
    loading: metricsLoading,
  })

  // 2. Manage provider connections and integration statuses
  const {
    connectedProviders,
    connectingProvider,
    connectionErrors,
    integrationStatuses,
    integrationStatusMap,
    automationStatuses,
    metaSetupMessage,
    tiktokSetupMessage,
    initializingMeta,
    initializingTikTok,
    metaNeedsAccountSelection,
    tiktokNeedsAccountSelection,
    metaAccountOptions,
    selectedMetaAccountId,
    setSelectedMetaAccountId,
    loadingMetaAccountOptions,
    handleConnect,
    handleDisconnect,
    handleOauthRedirect,
    initializeMetaIntegration,
    initializeTikTokIntegration,
    reloadMetaAccountOptions,
    adPlatforms,
  } = useAdsConnections({
    onRefresh: triggerMetricsRefresh,
  })

  const hasAnyAdIntegration =
    !isPreviewMode &&
    Boolean(
      integrationStatuses?.statuses?.some(
        (s) => s.status === 'success' || Boolean(s.linkedAt)
      )
    )

  const suppressMetricsErrors =
    !isPreviewMode &&
    !hasAnyAdIntegration &&
    !isAuthError(metricError) &&
    !isAuthError(loadMoreError)

  // Surface notable errors as toasts once
  useEffect(() => {
    const errors: string[] = [
      ...(suppressMetricsErrors ? [] : [metricError ?? '', loadMoreError ?? '']),
      ...Object.values(connectionErrors ?? {}),
    ].filter(Boolean)

    errors.forEach((error) => {
      if (shownErrorsRef.current.has(error)) return
      logError(error, 'AdsPage:Effect')
      toast({
        variant: 'destructive',
        title: 'Ads error',
        description: error,
      })
      shownErrorsRef.current.add(error)
    })
  }, [connectionErrors, loadMoreError, metricError, suppressMetricsErrors, toast])

  // Loading state - let the loading.tsx handle the skeleton UI
  const isInitialLoading = initialMetricsLoading && !integrationStatuses
  if (isInitialLoading) return <div className={DASHBOARD_THEME.layout.container}><Skeleton className="h-8 w-48" /></div>

  const showWorkflow =
    !isPreviewMode &&
    (!integrationStatuses ||
      automationStatuses.length === 0 ||
      automationStatuses.every((s) => s.status !== 'success'))

  return (
    <div className={DASHBOARD_THEME.layout.container}>
      <FadeIn>
        <div className="space-y-2">
          <h1 className={DASHBOARD_THEME.layout.title}>{PAGE_TITLES.ads?.title ?? 'Ads Hub'}</h1>
          <p className={DASHBOARD_THEME.layout.subtitle}>
            {PAGE_TITLES.ads?.description ?? 'Connect paid media accounts, trigger data syncs, and review cross-channel performance in one place.'}
          </p>
        </div>
      </FadeIn>

      {showWorkflow && (
        <FadeIn>
          <WorkflowCard />
        </FadeIn>
      )}

      {!isPreviewMode && (
        <>
          <FadeIn>
            <SetupAlerts
              metaSetupMessage={metaSetupMessage}
              metaNeedsAccountSelection={metaNeedsAccountSelection}
              initializingMeta={initializingMeta}
              onInitializeMeta={() => void initializeMetaIntegration(undefined, selectedMetaAccountId || null)}
              metaAccountOptions={metaAccountOptions}
              selectedMetaAccountId={selectedMetaAccountId}
              onMetaAccountSelectionChange={setSelectedMetaAccountId}
              loadingMetaAccountOptions={loadingMetaAccountOptions}
              onReloadMetaAccountOptions={() => void reloadMetaAccountOptions()}
              tiktokSetupMessage={tiktokSetupMessage}
              tiktokNeedsAccountSelection={tiktokNeedsAccountSelection}
              initializingTikTok={initializingTikTok}
              onInitializeTikTok={() => void initializeTikTokIntegration()}
            />
          </FadeIn>

          <FadeIn>
            <div id="connect-ad-platforms">
              <AdConnectionsCard
                providers={adPlatforms}
                connectedProviders={connectedProviders}
                connectingProvider={connectingProvider}
                connectionErrors={connectionErrors}
                integrationStatuses={integrationStatusMap}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                onOauthRedirect={handleOauthRedirect}
                onRefresh={handleManualRefresh}
                refreshing={metricsLoading}
              />
            </div>
          </FadeIn>

          {/* Campaign Management Cards for each connected provider */}
          {adPlatforms.filter((p) => connectedProviders[p.id]).length > 0 && (
            <FadeIn>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold">Campaign Management</h2>
                <DateRangePicker value={dateRange} onChange={setDateRange} />
              </div>
              <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
                <div className="mt-4 grid gap-4">
                  {adPlatforms
                    .filter((p) => connectedProviders[p.id])
                    .map((platform) => (
                      <CampaignManagementCard
                        key={platform.id}
                        providerId={platform.id}
                        providerName={platform.name}
                        isConnected={connectedProviders[platform.id]!}
                        dateRange={dateRange}
                        onRefresh={handleManualRefresh}
                      />
                    ))}
                </div>
              </Suspense>
            </FadeIn>
          )}
        </>
      )}

      <FadeIn>
        <CrossChannelOverviewCard
          processedMetrics={processedMetrics}
          serverSideSummary={serverSideSummary}
          hasMetricData={hasMetricData}
          initialMetricsLoading={initialMetricsLoading}
          metricsLoading={metricsLoading}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onExport={handleExport}
        />
      </FadeIn>

      <FadeIn>
        <PerformanceSummaryCard
          providerSummaries={providerSummaries}
          hasMetrics={hasMetricData}
          initialMetricsLoading={initialMetricsLoading}
          metricsLoading={metricsLoading}
          metricError={suppressMetricsErrors ? null : metricError}
          onRefresh={handleManualRefresh}
          onExport={handleExport}
        />
      </FadeIn>

      <FadeIn>
        <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
          <AlgorithmicInsightsCard
            insights={algorithmicInsights.insights}
            globalEfficiencyScore={algorithmicInsights.globalEfficiencyScore}
            providerEfficiencyScores={algorithmicInsights.providerEfficiencyScores}
            loading={metricsLoading || initialMetricsLoading}
          />
        </Suspense>
      </FadeIn>

      <FadeIn>
        <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
          <InsightsChartsCard
            analysis={algorithmicInsights.analysis}
            loading={metricsLoading || initialMetricsLoading}
          />
        </Suspense>
      </FadeIn>

      <FadeIn>
        <Suspense fallback={<Skeleton className="h-[250px] w-full" />}>
          <ComparisonViewCard
            periodComparison={periodComparison}
            providerComparison={providerComparison}
            loading={metricsLoading || initialMetricsLoading}
          />
        </Suspense>
      </FadeIn>

      <FadeIn>
        <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
          <CustomInsightsCard
            derivedMetrics={hasMetricData ? derivedMetrics : null}
            processedMetrics={processedMetrics}
            loading={metricsLoading || initialMetricsLoading}
          />
        </Suspense>
      </FadeIn>

      <FadeIn>
        <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
          <FormulaBuilderCard
            formulaEditor={formulaEditor}
            metricTotals={hasMetricData ? derivedMetrics.totals : undefined}
            loading={metricsLoading || initialMetricsLoading}
          />
        </Suspense>
      </FadeIn>

      <FadeIn>
        <MetricsTableCard
          processedMetrics={processedMetrics}
          hasMetrics={hasMetricData}
          initialMetricsLoading={initialMetricsLoading}
          metricsLoading={metricsLoading}
          metricError={suppressMetricsErrors ? null : metricError}
          nextCursor={nextCursor}
          loadingMore={loadingMore}
          loadMoreError={suppressMetricsErrors ? null : loadMoreError}
          onRefresh={handleManualRefresh}
          onLoadMore={() => void handleLoadMore()}
        />
      </FadeIn>
    </div>
  )
}
