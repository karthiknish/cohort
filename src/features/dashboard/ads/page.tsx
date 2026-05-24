'use client'

import { reportConvexFailure } from '@/lib/handle-convex-error'
import { useCallback, useEffect, useMemo, useRef } from 'react'

import { extractErrorCode, logError } from '@/lib/convex-errors'
import { normalizeAdsProviderId } from '@/domain/ads/provider'
import {
  buildProviderCurrencyMapFromMetrics,
  resolveCurrencyFromProcessedMetrics,
} from './components/insights-chart-utils'
import { DASHBOARD_THEME } from '@/lib/dashboard-theme'

import { PageMotionShell } from '@/shared/components/page-motion-shell'
import { FadeIn } from '@/shared/ui/animate-in'
import { QueryErrorAlert } from '@/shared/ui/query-error-alert'
import { PageSkeletonBoundary } from '@/shared/ui/page-skeleton-boundary'
import { AdsSkeleton } from './components/ads-skeleton'
import { usePreview } from '@/shared/contexts/preview-context'
import { useToast } from '@/shared/ui/use-toast'
import { AdsPageHeader } from './components/ads-page-header'
import { AdsPageLayout } from './components/ads-page-shell-sections'
import { GoogleSetupDialog } from './components/google-setup-dialog'
import {
  AdsPageAdvancedAnalyticsSection,
  AdsPageAnalyticsSection,
  AdsPageSetupSection,
} from './components/ads-page-sections'

import { useAdsMetrics } from './hooks/use-ads-metrics'
import { useAdsConnections } from './hooks/use-ads-connections'
import { useDerivedMetrics } from './hooks/use-derived-metrics'
import { useFormulaEditor } from './hooks/use-formula-editor'
import { useMetricsComparison } from './hooks/use-metrics-comparison'
import { useAlgorithmicInsights } from './hooks/use-algorithmic-insights'

function isAuthError(error: unknown): boolean {
  const code = extractErrorCode(error)
  return code === 'UNAUTHORIZED' || code === 'FORBIDDEN'
}

export default function AdsPage() {
  const { isPreviewMode } = usePreview()
  const { toast } = useToast()
  const shownErrorsRef = useRef<Set<string>>(new Set())

  const connections = useAdsConnections()
  const metrics = useAdsMetrics({ refreshTick: connections.refreshTick })
  const derivedMetrics = useDerivedMetrics({ metrics: metrics.processedMetrics })
  const formulaEditor = useFormulaEditor({ isPreviewMode })
  const comparison = useMetricsComparison({
    metrics: metrics.processedMetrics,
    dateRange: metrics.dateRange,
  })
  const algorithmicInsights = useAlgorithmicInsights({
    metrics: metrics.processedMetrics,
    providerSummaries: metrics.providerSummaries,
    loading: metrics.metricsLoading,
  })

  const { displayCurrency, providerCurrencyMap } = useMemo(() => {
    const financialTotals = metrics.adsInsightsSummary?.financialTotals
    const summaryCurrency =
      financialTotals?.comparability === 'single_currency'
        ? (financialTotals.primaryCurrency ?? null)
        : null

    const summaryMap: Record<string, string> = {}
    if (metrics.adsInsightsSummary?.providers) {
      for (const p of metrics.adsInsightsSummary.providers) {
        const providerId = normalizeAdsProviderId(p.providerId) ?? p.providerId
        const providerFinancial = p.financialTotals
        if (
          providerFinancial.comparability === 'single_currency' &&
          providerFinancial.primaryCurrency
        ) {
          summaryMap[providerId] = providerFinancial.primaryCurrency
        }
      }
    }

    const metricsMap = buildProviderCurrencyMapFromMetrics(metrics.processedMetrics)
    const metricsCurrency = resolveCurrencyFromProcessedMetrics(metrics.processedMetrics)

    return {
      displayCurrency: summaryCurrency ?? metricsCurrency,
      providerCurrencyMap: { ...metricsMap, ...summaryMap },
    }
  }, [metrics.adsInsightsSummary, metrics.processedMetrics])

  const hasAnyAdIntegration =
    !isPreviewMode &&
    Boolean(
      connections.integrationStatuses?.statuses?.some(
        (s) => s.status === 'success' || Boolean(s.linkedAt),
      ),
    )

  const suppressMetricsErrors =
    !isPreviewMode &&
    !hasAnyAdIntegration &&
    !isAuthError(metrics.metricError) &&
    !isAuthError(metrics.loadMoreError)

  const connectedAccountCount = useMemo(
    () => connections.adPlatforms.filter((p) => connections.connectedProviders[p.id]).length,
    [connections.adPlatforms, connections.connectedProviders],
  )

  const connectedProviderIds = useMemo(() => {
    const fromPlatforms = connections.adPlatforms.flatMap((p) =>
      connections.connectedProviders[p.id] ? [p.id] : [],
    )
    const fromStatuses = Object.entries(connections.connectedProviders).flatMap(([providerId, connected]) =>
      connected ? [providerId] : [],
    )
    return [...new Set([...fromPlatforms, ...fromStatuses])]
  }, [connections.adPlatforms, connections.connectedProviders])

  const pendingSetupCount = useMemo(
    () =>
      [
        connections.googleNeedsAccountSelection,
        connections.metaNeedsAccountSelection,
        connections.tiktokNeedsAccountSelection,
      ].filter(Boolean).length,
    [
      connections.googleNeedsAccountSelection,
      connections.metaNeedsAccountSelection,
      connections.tiktokNeedsAccountSelection,
    ],
  )

  const hasPendingSetup = pendingSetupCount > 0

  const hasSuccessfulSync = useMemo(
    () => connections.automationStatuses.some((s) => s.status === 'success'),
    [connections.automationStatuses],
  )

  const handleInitializeMeta = useCallback(() => {
    void connections.initializeMetaIntegration(undefined, connections.selectedMetaAccountId || null)
  }, [connections])

  const handleInitializeTikTok = useCallback(() => {
    void connections.initializeTikTokIntegration()
  }, [connections])

  const handleLoadMoreMetrics = useCallback(() => {
    void metrics.handleLoadMore()
  }, [metrics])

  const openGoogleCampaignSetup = useCallback(() => {
    connections.setGoogleSetupDialogOpen(true)

    if (connections.loadingGoogleAccountOptions || connections.googleAccountOptions.length > 0) {
      return
    }

    void connections.reloadGoogleAccountOptions()
  }, [connections])

  const handleReloadGoogleAccounts = useCallback(() => {
    void connections.reloadGoogleAccountOptions()
  }, [connections])

  const handleInitializeGoogle = useCallback(() => {
    void connections.initializeGoogleIntegration(
      undefined,
      connections.selectedGoogleAccountId || null,
    )
  }, [connections])

  const activeCurrency = displayCurrency ?? undefined

  const showWorkflow =
    !isPreviewMode &&
    (!connections.integrationStatuses ||
      connections.automationStatuses.length === 0 ||
      connections.automationStatuses.every((s) => s.status !== 'success'))

  const setupFlags = useMemo(
    () => ({
      isPreviewMode,
      showWorkflow,
      hasSuccessfulSync,
      hasPendingSetup,
    }),
    [isPreviewMode, showWorkflow, hasSuccessfulSync, hasPendingSetup],
  )

  const setupSection = useMemo(
    () => (
      <AdsPageSetupSection
        flags={setupFlags}
        connectedAccountCount={connectedAccountCount}
        connections={connections}
        metrics={metrics}
        dateRange={metrics.dateRange}
        openGoogleCampaignSetup={openGoogleCampaignSetup}
        handleInitializeMeta={handleInitializeMeta}
        handleInitializeTikTok={handleInitializeTikTok}
      />
    ),
    [
      setupFlags,
      connectedAccountCount,
      connections,
      metrics,
      openGoogleCampaignSetup,
      handleInitializeMeta,
      handleInitializeTikTok,
    ],
  )

  const analyticsSection = useMemo(
    () => (
      <AdsPageAnalyticsSection
        metrics={metrics}
        algorithmicInsights={algorithmicInsights}
        activeCurrency={activeCurrency}
        connectedProviderIds={connectedProviderIds}
        connectedAccountCount={connectedAccountCount}
        hasSuccessfulSync={hasSuccessfulSync}
        suppressMetricsErrors={suppressMetricsErrors}
        dateRange={metrics.dateRange}
        providerCurrencyMap={providerCurrencyMap}
      />
    ),
    [
      metrics,
      algorithmicInsights,
      activeCurrency,
      connectedProviderIds,
      connectedAccountCount,
      hasSuccessfulSync,
      suppressMetricsErrors,
      providerCurrencyMap,
    ],
  )

  const advancedAnalyticsSection = useMemo(
    () => (
      <AdsPageAdvancedAnalyticsSection
        metrics={metrics}
        derivedMetrics={derivedMetrics}
        formulaEditor={formulaEditor}
        comparison={comparison}
        activeCurrency={activeCurrency}
        suppressMetricsErrors={suppressMetricsErrors}
        handleLoadMoreMetrics={handleLoadMoreMetrics}
        providerCurrencyMap={providerCurrencyMap}
        automationStatuses={connections.automationStatuses}
        connectedAccountCount={connectedAccountCount}
        showWorkflow={showWorkflow}
      />
    ),
    [
      metrics,
      derivedMetrics,
      formulaEditor,
      comparison,
      activeCurrency,
      suppressMetricsErrors,
      handleLoadMoreMetrics,
      providerCurrencyMap,
      connections.automationStatuses,
      connectedAccountCount,
      showWorkflow,
    ],
  )

  useEffect(() => {
    const errors: string[] = [
      ...(suppressMetricsErrors ? [] : [metrics.metricError ?? '', metrics.loadMoreError ?? '']),
      ...Object.values(connections.connectionErrors ?? {}),
    ].filter(Boolean)

    errors.forEach((error) => {
      if (shownErrorsRef.current.has(error)) return
      reportConvexFailure({
        error: error,
        context: 'AdsPage:Effect',
        })
      shownErrorsRef.current.add(error)
    })
  }, [connections.connectionErrors, metrics.loadMoreError, metrics.metricError, suppressMetricsErrors, toast])

  const isInitialLoading = metrics.initialMetricsLoading && !connections.integrationStatuses

  return (
    <PageMotionShell reveal={false}>
    <PageSkeletonBoundary loading={isInitialLoading} loadingContent={<AdsSkeleton />}>
      <div className={DASHBOARD_THEME.layout.container}>
        <div className="space-y-6 pb-10">
          <FadeIn>
            <AdsPageHeader
              dateRange={metrics.dateRange}
              onDateRangeChange={metrics.setDateRange}
              onRefresh={metrics.handleManualRefresh}
              onExport={metrics.handleExport}
              refreshing={metrics.metricsLoading}
              canExport={metrics.hasMetricData}
              connectedCount={connectedAccountCount}
              totalProviders={connections.adPlatforms.length}
              pendingSetupCount={pendingSetupCount}
            />
          </FadeIn>

          <QueryErrorAlert
            error={connections.connectionsQueryError}
            title="Unable to load ad connections"
          />

          <AdsPageLayout
            setup={setupSection}
            analytics={analyticsSection}
            advancedAnalytics={advancedAnalyticsSection}
            showSetup={!isPreviewMode}
            connectedAccountCount={connectedAccountCount}
            hasPendingSetup={hasPendingSetup}
          />
        </div>
      </div>

      {!isPreviewMode ? (
        <GoogleSetupDialog
          open={connections.googleSetupDialogOpen}
          onOpenChange={connections.setGoogleSetupDialogOpen}
          setupMessage={connections.googleSetupMessage}
          accountOptions={connections.googleAccountOptions}
          selectedAccountId={connections.selectedGoogleAccountId}
          onAccountSelectionChange={connections.setSelectedGoogleAccountId}
          loadingAccounts={connections.loadingGoogleAccountOptions}
          initializing={connections.initializingGoogle}
          onReloadAccounts={handleReloadGoogleAccounts}
          onInitialize={handleInitializeGoogle}
        />
      ) : null}
    </PageSkeletonBoundary>
    </PageMotionShell>
  )
}
