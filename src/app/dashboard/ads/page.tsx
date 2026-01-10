'use client'

import { useEffect, useRef } from 'react'

import { FadeIn } from '@/components/ui/animate-in'
import { AdConnectionsCard } from '@/components/dashboard/ad-connections-card'
import { usePreview } from '@/contexts/preview-context'
import { useToast } from '@/components/ui/use-toast'
import { DateRangePicker } from './components/date-range-picker'

import {
  AdsSkeleton,
  CampaignManagementCard,
  CrossChannelOverviewCard,
  CustomInsightsCard,
  ComparisonViewCard,
  FormulaBuilderCard,
  PerformanceSummaryCard,
  MetricsTableCard,
  WorkflowCard,
  SetupAlerts,
  AlgorithmicInsightsCard,
  InsightsChartsCard,
} from './components'

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
    handleConnect,
    handleDisconnect,
    handleOauthRedirect,
    initializeMetaIntegration,
    initializeTikTokIntegration,
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

  const suppressMetricsErrors = !isPreviewMode && !hasAnyAdIntegration

  // Surface notable errors as toasts once
  useEffect(() => {
    const errors: string[] = [
      ...(suppressMetricsErrors ? [] : [metricError ?? '', loadMoreError ?? '']),
      ...Object.values(connectionErrors ?? {}),
    ].filter(Boolean)

    errors.forEach((error) => {
      if (shownErrorsRef.current.has(error)) return
      toast({
        variant: 'destructive',
        title: 'Ads error',
        description: error,
      })
      shownErrorsRef.current.add(error)
    })
  }, [connectionErrors, loadMoreError, metricError, suppressMetricsErrors, toast])

  // Loading state
  const isInitialLoading = initialMetricsLoading && !integrationStatuses
  if (isInitialLoading) return <AdsSkeleton />

  const showWorkflow =
    !isPreviewMode &&
    (!integrationStatuses ||
      automationStatuses.length === 0 ||
      automationStatuses.every((s) => s.status !== 'success'))

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Ads Hub</h1>
          <p className="text-sm text-muted-foreground">
            Connect paid media accounts, trigger data syncs, and review cross-channel performance in one place.
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
              onInitializeMeta={() => void initializeMetaIntegration()}
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
              <div className="mt-4 grid gap-4">
                {adPlatforms
                  .filter((p) => connectedProviders[p.id])
                  .map((platform) => (
                    <CampaignManagementCard
                      key={platform.id}
                      providerId={platform.id}
                      providerName={platform.name}
                      isConnected={connectedProviders[platform.id]}
                      dateRange={dateRange}
                      onRefresh={handleManualRefresh}
                    />
                  ))}
              </div>
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
        <AlgorithmicInsightsCard
          insights={algorithmicInsights.insights}
          globalEfficiencyScore={algorithmicInsights.globalEfficiencyScore}
          providerEfficiencyScores={algorithmicInsights.providerEfficiencyScores}
          loading={metricsLoading || initialMetricsLoading}
        />
      </FadeIn>

      <FadeIn>
        <InsightsChartsCard
          analysis={algorithmicInsights.analysis}
          loading={metricsLoading || initialMetricsLoading}
        />
      </FadeIn>

      <FadeIn>
        <ComparisonViewCard
          periodComparison={periodComparison}
          providerComparison={providerComparison}
          loading={metricsLoading || initialMetricsLoading}
        />
      </FadeIn>

      <FadeIn>
        <CustomInsightsCard
          derivedMetrics={hasMetricData ? derivedMetrics : null}
          processedMetrics={processedMetrics}
          loading={metricsLoading || initialMetricsLoading}
        />
      </FadeIn>

      <FadeIn>
        <FormulaBuilderCard
          formulaEditor={formulaEditor}
          metricTotals={hasMetricData ? derivedMetrics.totals : undefined}
          loading={metricsLoading || initialMetricsLoading}
        />
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
