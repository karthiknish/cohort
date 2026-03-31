'use client'

import { lazy, Suspense, useCallback, useEffect, useMemo, useRef } from 'react'

import { extractErrorCode, logError } from '@/lib/convex-errors'
import { DASHBOARD_THEME, PAGE_TITLES } from '@/lib/dashboard-theme'

function isAuthError(error: unknown): boolean {
  const code = extractErrorCode(error)
  return code === 'UNAUTHORIZED' || code === 'FORBIDDEN'
}

import { FadeIn } from '@/shared/ui/animate-in'
import { AdConnectionsCard } from '@/features/dashboard/home/components/ad-connections-card'
import { usePreview } from '@/shared/contexts/preview-context'
import { useToast } from '@/shared/ui/use-toast'
import { DateRangePicker } from './components/date-range-picker'
import { Skeleton } from '@/shared/ui/skeleton'

// Static imports for critical components
import {
  CrossChannelOverviewCard,
  PerformanceSummaryCard,
  MetricsTableCard,
  WorkflowCard,
  SetupAlerts,
} from './components'
import { GoogleSetupDialog } from './components/google-setup-dialog'

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

const ADS_SKELETON_200 = <Skeleton className="h-[200px] w-full" />
const ADS_SKELETON_250 = <Skeleton className="h-[250px] w-full" />
const ADS_SKELETON_300 = <Skeleton className="h-[300px] w-full" />

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
    processedMetrics,
    providerSummaries,
    serverSideSummary,
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

  // 2. Manage provider connections and integration statuses
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
    // Derive display currency from the V2 currency-aware summary.
    // Only expose a single currency total when all rows are on the same currency.
    // For mixed-currency selections, consumers receive null and show "Mixed currencies".
    const financialTotals = adsInsightsSummary?.financialTotals
    const primaryCurrency =
      financialTotals?.comparability === 'single_currency'
        ? (financialTotals.primaryCurrency ?? null)
        : null

    // Build per-provider currency map from the V2 provider summaries.
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
        (s) => s.status === 'success' || Boolean(s.linkedAt)
      )
    )

  const suppressMetricsErrors =
    !isPreviewMode &&
    !hasAnyAdIntegration &&
    !isAuthError(metricError) &&
    !isAuthError(loadMoreError)

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

  // Components expect currency?: string (undefined = not yet known / mixed).
  // null from the V2 summary means mixed or unknown — pass undefined so components show fallback.
  const activeCurrency = displayCurrency ?? undefined

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

          {/* Campaign Management Cards for each connected provider */}
          {adPlatforms.filter((p) => connectedProviders[p.id]).length > 0 && (
            <FadeIn>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold">Campaign Management</h2>
                <DateRangePicker value={dateRange} onChange={setDateRange} />
              </div>
              <Suspense fallback={ADS_SKELETON_200}>
                <div className="mt-4 grid gap-4">
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
              </Suspense>
            </FadeIn>
          )}
        </>
      )}

      <FadeIn>
        <CrossChannelOverviewCard
          processedMetrics={processedMetrics}
          serverSideSummary={serverSideSummary}
          currency={activeCurrency}
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
          currency={activeCurrency}
          providerCurrencies={providerCurrencyMap}
          hasMetrics={hasMetricData}
          initialMetricsLoading={initialMetricsLoading}
          metricsLoading={metricsLoading}
          metricError={suppressMetricsErrors ? null : metricError}
          onRefresh={handleManualRefresh}
          onExport={handleExport}
        />
      </FadeIn>

      <FadeIn>
        <Suspense fallback={ADS_SKELETON_200}>
          <AlgorithmicInsightsCard
            insights={algorithmicInsights.insights}
            globalEfficiencyScore={algorithmicInsights.globalEfficiencyScore}
            providerEfficiencyScores={algorithmicInsights.providerEfficiencyScores}
            loading={metricsLoading || initialMetricsLoading}
          />
        </Suspense>
      </FadeIn>

      <FadeIn>
        <Suspense fallback={ADS_SKELETON_300}>
          <InsightsChartsCard
            analysis={algorithmicInsights.analysis}
            currency={activeCurrency}
            loading={metricsLoading || initialMetricsLoading}
          />
        </Suspense>
      </FadeIn>

      <FadeIn>
        <Suspense fallback={ADS_SKELETON_250}>
          <ComparisonViewCard
            periodComparison={periodComparison}
            providerComparison={providerComparison}
            currency={activeCurrency}
            loading={metricsLoading || initialMetricsLoading}
          />
        </Suspense>
      </FadeIn>

      <FadeIn>
        <Suspense fallback={ADS_SKELETON_200}>
          <CustomInsightsCard
            derivedMetrics={hasMetricData ? derivedMetrics : null}
            processedMetrics={processedMetrics}
            currency={activeCurrency}
            loading={metricsLoading || initialMetricsLoading}
          />
        </Suspense>
      </FadeIn>

      <FadeIn>
        <Suspense fallback={ADS_SKELETON_300}>
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
    </div>
  )
}
