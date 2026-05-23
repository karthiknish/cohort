'use client'

import { lazy, Suspense, useCallback, useMemo, type ReactNode } from 'react'

import { FadeIn } from '@/shared/ui/animate-in'
import { Skeleton } from '@/shared/ui/skeleton'
import { RevealTransition, RevealTransitionFallback } from '@/shared/ui/page-transition'
import { AdConnectionsCard } from '@/features/dashboard/home/components/ad-connections-card'
import { CrossChannelOverviewCard } from '@/features/dashboard/ads/components/cross-channel-overview-card'
import { MetricsTableCard } from '@/features/dashboard/ads/components/metrics-table-card'
import { PerformanceSummaryCard } from '@/features/dashboard/ads/components/performance-summary-card'
import { WorkflowCard } from '@/features/dashboard/ads/components/workflow-card'
import { AdSetupPanel } from '@/features/dashboard/ads/components/ad-setup-panel'
import { resolveAdsMetricsDisplayState } from '@/features/dashboard/ads/components/ads-metrics-display-state'
import type { DateRange } from '@/features/dashboard/ads/components/date-range-picker'
import type {
  useAdsConnections,
  useAdsMetrics,
  useAlgorithmicInsights,
  useDerivedMetrics,
  useFormulaEditor,
  useMetricsComparison,
} from '@/features/dashboard/ads/hooks'

const CampaignManagementCard = lazy(() =>
  import('./campaign-management-card').then((m) => ({ default: m.CampaignManagementCard })),
)
const CustomInsightsCard = lazy(() =>
  import('./custom-insights-card').then((m) => ({ default: m.CustomInsightsCard })),
)
const ComparisonViewCard = lazy(() =>
  import('./comparison-view-card').then((m) => ({ default: m.ComparisonViewCard })),
)
const FormulaBuilderCard = lazy(() =>
  import('./formula-builder-card').then((m) => ({ default: m.FormulaBuilderCard })),
)
const AlgorithmicInsightsCard = lazy(() =>
  import('./algorithmic-insights-card').then((m) => ({ default: m.AlgorithmicInsightsCard })),
)
const InsightsChartsCard = lazy(() =>
  import('./insights-charts-card').then((m) => ({ default: m.InsightsChartsCard })),
)

const ADS_SKELETON_200 = <Skeleton className="h-[200px] w-full" />
const ADS_SKELETON_250 = <Skeleton className="h-[250px] w-full" />
const ADS_SKELETON_300 = <Skeleton className="h-[300px] w-full" />

function AdsSuspenseReveal({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const suspenseFallback = useMemo(
    () => <RevealTransitionFallback>{fallback}</RevealTransitionFallback>,
    [fallback],
  )

  return (
    <Suspense fallback={suspenseFallback}>
      <RevealTransition>{children}</RevealTransition>
    </Suspense>
  )
}

export type AdsPageSetupFlags = {
  isPreviewMode: boolean
  showWorkflow: boolean
  hasSuccessfulSync: boolean
  hasPendingSetup: boolean
}

type AdsPageSectionsProps = {
  flags: AdsPageSetupFlags
  connectedAccountCount: number
  hasSuccessfulSync: boolean
  connections: ReturnType<typeof useAdsConnections>
  metrics: ReturnType<typeof useAdsMetrics>
  derivedMetrics: ReturnType<typeof useDerivedMetrics>
  formulaEditor: ReturnType<typeof useFormulaEditor>
  comparison: ReturnType<typeof useMetricsComparison>
  algorithmicInsights: ReturnType<typeof useAlgorithmicInsights>
  activeCurrency: string | undefined
  connectedProviderIds: string[]
  suppressMetricsErrors: boolean
  dateRange: DateRange
  openGoogleCampaignSetup: () => void
  handleInitializeMeta: () => void
  handleInitializeTikTok: () => void
  handleLoadMoreMetrics: () => void
}

export function AdsPageSetupSection({
  flags,
  connectedAccountCount,
  connections,
  metrics,
  dateRange,
  openGoogleCampaignSetup,
  handleInitializeMeta,
  handleInitializeTikTok,
}: Pick<
  AdsPageSectionsProps,
  | 'flags'
  | 'connectedAccountCount'
  | 'connections'
  | 'metrics'
  | 'dateRange'
  | 'openGoogleCampaignSetup'
  | 'handleInitializeMeta'
  | 'handleInitializeTikTok'
>) {
  const { isPreviewMode, showWorkflow, hasSuccessfulSync, hasPendingSetup } = flags
  const {
    adPlatforms,
    connectedProviders,
    connectingProvider,
    connectionErrors,
    integrationStatusMap,
    handleConnect,
    handleDisconnect,
    handleOauthRedirect,
    handleSyncNow,
    syncingProviders,
    googleNeedsAccountSelection,
    metaNeedsAccountSelection,
    tiktokNeedsAccountSelection,
    googleSetupMessage,
    metaSetupMessage,
    tiktokSetupMessage,
    initializingGoogle,
    initializingMeta,
    initializingTikTok,
    metaAccountOptions,
    selectedMetaAccountId,
    setSelectedMetaAccountId,
    loadingMetaAccountOptions,
    reloadMetaAccountOptions,
  } = connections
  const { handleManualRefresh } = metrics
  const handleReloadMetaAccountOptions = useCallback(() => {
    void reloadMetaAccountOptions()
  }, [reloadMetaAccountOptions])
  const pendingSetupCount = [
    googleNeedsAccountSelection,
    metaNeedsAccountSelection,
    tiktokNeedsAccountSelection,
  ].filter(Boolean).length

  if (isPreviewMode) return null

  return (
    <>
      {showWorkflow ? (
        <FadeIn>
          <WorkflowCard
            connectedCount={connectedAccountCount}
            hasSuccessfulSync={hasSuccessfulSync}
            hasPendingSetup={hasPendingSetup}
          />
        </FadeIn>
      ) : null}

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
            onSyncNow={handleSyncNow}
            syncingProviders={syncingProviders}
            onRefresh={handleManualRefresh}
            refreshing={metrics.metricsLoading}
            connectedCount={connectedAccountCount}
            totalProviders={adPlatforms.length}
            pendingSetupCount={pendingSetupCount}
          />
        </div>
      </FadeIn>

      <FadeIn>
        <AdSetupPanel
          connectedCount={connectedAccountCount}
          totalProviders={adPlatforms.length}
          googleNeedsAccountSelection={googleNeedsAccountSelection}
          googleSetupMessage={googleSetupMessage}
          onOpenGoogleSetup={openGoogleCampaignSetup}
          metaSetupMessage={metaSetupMessage}
          metaNeedsAccountSelection={metaNeedsAccountSelection}
          initializingMeta={initializingMeta}
          onInitializeMeta={handleInitializeMeta}
          metaAccountOptions={metaAccountOptions}
          selectedMetaAccountId={selectedMetaAccountId}
          onMetaAccountSelectionChange={setSelectedMetaAccountId}
          loadingMetaAccountOptions={loadingMetaAccountOptions}
          onReloadMetaAccountOptions={handleReloadMetaAccountOptions}
          tiktokSetupMessage={tiktokSetupMessage}
          tiktokNeedsAccountSelection={tiktokNeedsAccountSelection}
          initializingTikTok={initializingTikTok}
          onInitializeTikTok={handleInitializeTikTok}
          initializingGoogle={initializingGoogle}
        />
      </FadeIn>

      {connectedAccountCount > 0 ? (
        <FadeIn>
          <div className="space-y-4 border-t border-border/50 pt-6">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
                Campaign management
              </p>
              <h3 className="text-base font-semibold tracking-tight text-foreground">Per-platform campaigns</h3>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Drill into live campaigns for each linked account - filtered by the date range in the page header.
              </p>
            </div>
            <AdsSuspenseReveal fallback={ADS_SKELETON_200}>
              <div className="flex w-full flex-col gap-4">
                {adPlatforms.flatMap((platform) =>
                  connectedProviders[platform.id]
                    ? [(
                    <CampaignManagementCard
                      key={platform.id}
                      providerId={platform.id}
                      providerName={platform.name}
                      isConnected={Boolean(connectedProviders[platform.id])}
                      dateRange={dateRange}
                      onRefresh={handleManualRefresh}
                      setupRequired={
                        (platform.id === 'google' && googleNeedsAccountSelection) ||
                        (platform.id === 'facebook' && metaNeedsAccountSelection) ||
                        (platform.id === 'tiktok' && tiktokNeedsAccountSelection)
                      }
                      setupTitle={
                        platform.id === 'google'
                          ? 'Select a Google Ads account'
                          : platform.id === 'facebook'
                            ? 'Select a Meta ad account'
                            : platform.id === 'tiktok'
                              ? 'Finish TikTok account setup'
                              : undefined
                      }
                      setupDescription={
                        platform.id === 'google'
                          ? 'Choose the Google Ads account you want to manage before loading campaign data.'
                          : platform.id === 'facebook'
                            ? 'Choose the Meta ad account you want to manage before loading campaign data.'
                            : platform.id === 'tiktok'
                              ? 'Complete TikTok setup so the default ad account is assigned before loading campaign data.'
                              : undefined
                      }
                      setupActionLabel={platform.id === 'google' ? 'Select account' : 'Finish setup'}
                      onSetupAction={
                        platform.id === 'google'
                          ? openGoogleCampaignSetup
                          : platform.id === 'facebook'
                            ? handleInitializeMeta
                            : platform.id === 'tiktok'
                              ? handleInitializeTikTok
                              : undefined
                      }
                    />)]
                    : [],
                )}
              </div>
            </AdsSuspenseReveal>
          </div>
        </FadeIn>
      ) : null}
    </>
  )
}

export function AdsPageAnalyticsSection({
  metrics,
  algorithmicInsights,
  activeCurrency,
  connectedProviderIds,
  connectedAccountCount,
  hasSuccessfulSync,
  suppressMetricsErrors,
  dateRange,
  providerCurrencyMap,
}: Pick<
  AdsPageSectionsProps,
  | 'metrics'
  | 'algorithmicInsights'
  | 'activeCurrency'
  | 'connectedProviderIds'
  | 'connectedAccountCount'
  | 'hasSuccessfulSync'
  | 'suppressMetricsErrors'
  | 'dateRange'
> & { providerCurrencyMap: Record<string, string> }) {
  const {
    processedMetrics,
    effectiveServerSummary,
    providerSummaries,
    hasMetricData,
    initialMetricsLoading,
    metricsLoading,
    metricError,
    setDateRange,
    handleExport,
    handleManualRefresh,
  } = metrics

  const metricsDisplayState = resolveAdsMetricsDisplayState({
    metricsLoading: initialMetricsLoading || metricsLoading,
    connectedAccountCount,
    hasSuccessfulSync,
    hasMetricData,
  })

  const performanceEmptyMessage =
    metricsDisplayState === 'synced_no_delivery'
      ? 'This account synced successfully, but Meta returned no delivery metrics for the selected dates. Try widening the date range or confirm campaigns are active in Ads Manager.'
      : metricsDisplayState === 'needs_sync'
        ? 'Your ad account is connected. Run a sync to populate spend, clicks, and conversions for this date range.'
        : undefined

  return (
    <>
      <FadeIn>
        <CrossChannelOverviewCard
          processedMetrics={processedMetrics}
          serverSideSummary={effectiveServerSummary}
          currency={activeCurrency}
          connectedProviderIds={connectedProviderIds}
          connection={{
            hasConnectedAds: connectedAccountCount > 0,
            hasSuccessfulSync,
          }}
          hasMetricData={hasMetricData}
          initialMetricsLoading={initialMetricsLoading}
          metricsLoading={metricsLoading}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onExport={handleExport}
          showDateAndExport={false}
        />
      </FadeIn>

      <FadeIn>
        <PerformanceSummaryCard
          providerSummaries={providerSummaries}
          currency={activeCurrency}
          providerCurrencies={providerCurrencyMap}
          hasMetrics={hasMetricData}
          initialMetricsLoading={initialMetricsLoading}
          metricsLoading={metricsLoading}
          metricError={suppressMetricsErrors ? null : metricError}
          onRefresh={handleManualRefresh}
          onExport={handleExport}
          showActions={false}
          emptyMessage={performanceEmptyMessage}
          emptyCtaLabel={
            metricsDisplayState === 'synced_no_delivery' ? 'Adjust date range' : 'Run first sync'
          }
        />
      </FadeIn>

      <FadeIn>
        <AdsSuspenseReveal fallback={ADS_SKELETON_200}>
          <AlgorithmicInsightsCard
            insights={algorithmicInsights.insights}
            globalEfficiencyScore={algorithmicInsights.globalEfficiencyScore}
            providerEfficiencyScores={algorithmicInsights.providerEfficiencyScores}
            loading={metricsLoading || initialMetricsLoading}
          />
        </AdsSuspenseReveal>
      </FadeIn>

      <FadeIn>
        <AdsSuspenseReveal fallback={ADS_SKELETON_300}>
          <InsightsChartsCard
            analysis={algorithmicInsights.analysis}
            currency={activeCurrency}
            providerCurrencies={providerCurrencyMap}
            loading={metricsLoading || initialMetricsLoading}
            hasConnections={connectedAccountCount > 0}
            metricsDisplayState={metricsDisplayState}
          />
        </AdsSuspenseReveal>
      </FadeIn>
    </>
  )
}

export function AdsPageAdvancedAnalyticsSection({
  metrics,
  derivedMetrics,
  formulaEditor,
  comparison,
  activeCurrency,
  suppressMetricsErrors,
  handleLoadMoreMetrics,
}: Pick<
  AdsPageSectionsProps,
  | 'metrics'
  | 'derivedMetrics'
  | 'formulaEditor'
  | 'comparison'
  | 'activeCurrency'
  | 'suppressMetricsErrors'
  | 'handleLoadMoreMetrics'
>) {
  const {
    processedMetrics,
    hasMetricData,
    initialMetricsLoading,
    metricsLoading,
    metricError,
    nextCursor,
    loadingMore,
    loadMoreError,
    handleManualRefresh,
  } = metrics

  const { periodComparison, providerComparison } = comparison

  return (
    <>
      <FadeIn>
        <AdsSuspenseReveal fallback={ADS_SKELETON_250}>
          <ComparisonViewCard
            periodComparison={periodComparison}
            providerComparison={providerComparison}
            currency={activeCurrency}
            providerCurrencies={providerCurrencyMap}
            loading={metricsLoading || initialMetricsLoading}
          />
        </AdsSuspenseReveal>
      </FadeIn>

      <FadeIn>
        <AdsSuspenseReveal fallback={ADS_SKELETON_200}>
          <CustomInsightsCard
            derivedMetrics={hasMetricData ? derivedMetrics : null}
            processedMetrics={processedMetrics}
            currency={activeCurrency}
            loading={metricsLoading || initialMetricsLoading}
          />
        </AdsSuspenseReveal>
      </FadeIn>

      <FadeIn>
        <AdsSuspenseReveal fallback={ADS_SKELETON_300}>
          <FormulaBuilderCard
            formulaEditor={formulaEditor}
            metricTotals={hasMetricData ? derivedMetrics.totals : undefined}
            loading={metricsLoading || initialMetricsLoading}
          />
        </AdsSuspenseReveal>
      </FadeIn>

      <FadeIn>
        <MetricsTableCard
          visibleMetrics={metrics.metrics}
          processedMetrics={processedMetrics}
          currency={activeCurrency}
          hasMetrics={processedMetrics.length > 0}
          initialMetricsLoading={initialMetricsLoading}
          metricsLoading={metricsLoading}
          metricError={suppressMetricsErrors ? null : metricError}
          nextCursor={nextCursor}
          loadingMore={loadingMore}
          loadMoreError={suppressMetricsErrors ? null : loadMoreError}
          onRefresh={handleManualRefresh}
          onLoadMore={handleLoadMoreMetrics}
        />
      </FadeIn>
    </>
  )
}
