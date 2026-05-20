'use client'

import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react'

import { extractErrorCode, logError } from '@/lib/convex-errors'
import { DASHBOARD_THEME } from '@/lib/dashboard-theme'

function isAuthError(error: unknown): boolean {
  const code = extractErrorCode(error)
  return code === 'UNAUTHORIZED' || code === 'FORBIDDEN'
}

import { FadeIn } from '@/shared/ui/animate-in'
import { BoneyardSkeletonBoundary } from '@/shared/ui/boneyard-skeleton-boundary'
import { AdConnectionsCard } from '@/features/dashboard/home/components/ad-connections-card'
import { usePreview } from '@/shared/contexts/preview-context'
import { useToast } from '@/shared/ui/use-toast'
import { Skeleton } from '@/shared/ui/skeleton'
import { RevealTransition, RevealTransitionFallback } from '@/shared/ui/page-transition'

import {
  AdsSkeleton,
  CrossChannelOverviewCard,
  PerformanceSummaryCard,
  MetricsTableCard,
  WorkflowCard,
  SetupAlerts,
} from './components'
import { AdsPageHeader } from './components/ads-page-header'
import { AdsPageLayout } from './components/ads-page-shell-sections'
import { GoogleSetupDialog } from './components/google-setup-dialog'

const CampaignManagementCard = lazy(() =>
  import('./components/campaign-management-card').then((m) => ({ default: m.CampaignManagementCard })),
)
const CustomInsightsCard = lazy(() =>
  import('./components/custom-insights-card').then((m) => ({ default: m.CustomInsightsCard })),
)
const ComparisonViewCard = lazy(() =>
  import('./components/comparison-view-card').then((m) => ({ default: m.ComparisonViewCard })),
)
const FormulaBuilderCard = lazy(() =>
  import('./components/formula-builder-card').then((m) => ({ default: m.FormulaBuilderCard })),
)
const AlgorithmicInsightsCard = lazy(() =>
  import('./components/algorithmic-insights-card').then((m) => ({ default: m.AlgorithmicInsightsCard })),
)
const InsightsChartsCard = lazy(() =>
  import('./components/insights-charts-card').then((m) => ({ default: m.InsightsChartsCard })),
)

import {
  useAdsMetrics,
  useAdsConnections,
  useDerivedMetrics,
  useFormulaEditor,
  useMetricsComparison,
  useAlgorithmicInsights,
} from './hooks'

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

export default function AdsPage() {
  const { isPreviewMode } = usePreview()
  const { toast } = useToast()
  const shownErrorsRef = useRef<Set<string>>(new Set())

  const {
    processedMetrics,
    providerSummaries,
    effectiveServerSummary,
    adsInsightsSummary,
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
  const formulaEditor = useFormulaEditor({ isPreviewMode })
  const { periodComparison, providerComparison } = useMetricsComparison({
    metrics: processedMetrics,
    dateRange,
  })
  const algorithmicInsights = useAlgorithmicInsights({
    metrics: processedMetrics,
    providerSummaries,
    loading: metricsLoading,
  })

  const {
    connectedProviders,
    connectingProvider,
    connectionErrors,
    integrationStatuses,
    integrationStatusMap,
    automationStatuses,
    syncingProviders,
    metaSetupMessage,
    googleSetupMessage,
    tiktokSetupMessage,
    initializingGoogle,
    initializingMeta,
    initializingTikTok,
    googleNeedsAccountSelection,
    metaNeedsAccountSelection,
    tiktokNeedsAccountSelection,
    googleAccountOptions,
    selectedGoogleAccountId,
    setSelectedGoogleAccountId,
    loadingGoogleAccountOptions,
    googleSetupDialogOpen,
    setGoogleSetupDialogOpen,
    metaAccountOptions,
    selectedMetaAccountId,
    setSelectedMetaAccountId,
    loadingMetaAccountOptions,
    handleConnect,
    handleDisconnect,
    handleOauthRedirect,
    handleSyncNow,
    initializeGoogleIntegration,
    initializeMetaIntegration,
    initializeTikTokIntegration,
    reloadGoogleAccountOptions,
    reloadMetaAccountOptions,
    adPlatforms,
  } = useAdsConnections({
    onRefresh: triggerMetricsRefresh,
  })

  const { displayCurrency, providerCurrencyMap } = useMemo(() => {
    const financialTotals = adsInsightsSummary?.financialTotals
    const primaryCurrency =
      financialTotals?.comparability === 'single_currency'
        ? (financialTotals.primaryCurrency ?? null)
        : null

    const map: Record<string, string> = {}
    if (adsInsightsSummary?.providers) {
      for (const p of adsInsightsSummary.providers) {
        if (p.financialTotals.primaryCurrency) {
          map[p.providerId] = p.financialTotals.primaryCurrency
        }
      }
    }

    return { displayCurrency: primaryCurrency, providerCurrencyMap: map }
  }, [adsInsightsSummary])

  const hasAnyAdIntegration =
    !isPreviewMode &&
    Boolean(
      integrationStatuses?.statuses?.some(
        (s) => s.status === 'success' || Boolean(s.linkedAt),
      ),
    )

  const suppressMetricsErrors =
    !isPreviewMode &&
    !hasAnyAdIntegration &&
    !isAuthError(metricError) &&
    !isAuthError(loadMoreError)

  const connectedAccountCount = useMemo(
    () => adPlatforms.filter((p) => connectedProviders[p.id]).length,
    [adPlatforms, connectedProviders],
  )

  const scrollToSetupAlerts = useCallback(() => {
    document.getElementById('ads-setup-alerts')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const handleInitializeMeta = useCallback(() => {
    void initializeMetaIntegration(undefined, selectedMetaAccountId || null)
  }, [initializeMetaIntegration, selectedMetaAccountId])

  const handleReloadMetaAccountOptions = useCallback(() => {
    void reloadMetaAccountOptions()
  }, [reloadMetaAccountOptions])

  const handleInitializeTikTok = useCallback(() => {
    void initializeTikTokIntegration()
  }, [initializeTikTokIntegration])

  const handleReloadGoogleAccountOptions = useCallback(() => {
    void reloadGoogleAccountOptions()
  }, [reloadGoogleAccountOptions])

  const handleInitializeGoogle = useCallback(() => {
    void initializeGoogleIntegration(undefined, selectedGoogleAccountId || null)
  }, [initializeGoogleIntegration, selectedGoogleAccountId])

  const handleLoadMoreMetrics = useCallback(() => {
    void handleLoadMore()
  }, [handleLoadMore])

  const openGoogleCampaignSetup = useCallback(() => {
    setGoogleSetupDialogOpen(true)

    if (loadingGoogleAccountOptions || googleAccountOptions.length > 0) {
      return
    }

    void reloadGoogleAccountOptions()
  }, [googleAccountOptions.length, loadingGoogleAccountOptions, reloadGoogleAccountOptions, setGoogleSetupDialogOpen])

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

  const isInitialLoading = initialMetricsLoading && !integrationStatuses
  const loadingContent = useMemo(
    () => (
      <div className={DASHBOARD_THEME.layout.container}>
        <AdsSkeleton />
      </div>
    ),
    [],
  )

  const activeCurrency = displayCurrency ?? undefined

  const showWorkflow =
    !isPreviewMode &&
    (!integrationStatuses ||
      automationStatuses.length === 0 ||
      automationStatuses.every((s) => s.status !== 'success'))

  const renderSetup = () => (
    <>
      {showWorkflow ? (
        <FadeIn>
          <WorkflowCard />
        </FadeIn>
      ) : null}

      <FadeIn>
        <div id="ads-setup-alerts">
          <SetupAlerts
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
          />
        </div>
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
            onSyncNow={handleSyncNow}
            syncingProviders={syncingProviders}
            onRefresh={handleManualRefresh}
            refreshing={metricsLoading}
          />
        </div>
      </FadeIn>

      {connectedAccountCount > 0 ? (
        <FadeIn>
          <div className="space-y-4 border-t border-muted/40 pt-6">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">Campaigns</h3>
              <p className="text-sm text-muted-foreground">
                Per-provider lists for the date range selected above.
              </p>
            </div>
            <AdsSuspenseReveal fallback={ADS_SKELETON_200}>
              <div className="flex w-full flex-col gap-4">
                {adPlatforms
                  .filter((p) => connectedProviders[p.id])
                  .map((platform) => (
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
                          : platform.id === 'facebook' || platform.id === 'tiktok'
                            ? scrollToSetupAlerts
                            : undefined
                      }
                    />
                  ))}
              </div>
            </AdsSuspenseReveal>
          </div>
        </FadeIn>
      ) : null}
    </>
  )

  const renderAnalytics = () => (
    <>
      <FadeIn>
        <CrossChannelOverviewCard
          processedMetrics={processedMetrics}
          serverSideSummary={effectiveServerSummary}
          currency={activeCurrency}
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
            loading={metricsLoading || initialMetricsLoading}
            hasConnections={connectedAccountCount > 0}
          />
        </AdsSuspenseReveal>
      </FadeIn>
    </>
  )

  const renderAdvancedAnalytics = () => (
    <>
      <FadeIn>
        <AdsSuspenseReveal fallback={ADS_SKELETON_250}>
          <ComparisonViewCard
            periodComparison={periodComparison}
            providerComparison={providerComparison}
            currency={activeCurrency}
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
          processedMetrics={processedMetrics}
          currency={activeCurrency}
          hasMetrics={hasMetricData}
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

  return (
    <BoneyardSkeletonBoundary
      name="dashboard-ads-page"
      loading={isInitialLoading}
      loadingContent={loadingContent}
    >
      <div className={DASHBOARD_THEME.layout.container}>
        <div className="space-y-6 pb-10">
          <FadeIn>
            <AdsPageHeader
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              onRefresh={handleManualRefresh}
              onExport={handleExport}
              refreshing={metricsLoading}
              canExport={hasMetricData}
            />
          </FadeIn>

          <AdsPageLayout
            renderSetup={renderSetup}
            renderAnalytics={renderAnalytics}
            renderAdvancedAnalytics={renderAdvancedAnalytics}
            showSetup={!isPreviewMode}
            connectedAccountCount={connectedAccountCount}
            hasMetricData={hasMetricData}
          />
        </div>
      </div>

      {!isPreviewMode ? (
        <GoogleSetupDialog
          open={googleSetupDialogOpen}
          onOpenChange={setGoogleSetupDialogOpen}
          setupMessage={googleSetupMessage}
          accountOptions={googleAccountOptions}
          selectedAccountId={selectedGoogleAccountId}
          onAccountSelectionChange={setSelectedGoogleAccountId}
          loadingAccounts={loadingGoogleAccountOptions}
          initializing={initializingGoogle}
          onReloadAccounts={handleReloadGoogleAccountOptions}
          onInitialize={handleInitializeGoogle}
        />
      ) : null}
    </BoneyardSkeletonBoundary>
  )
}
