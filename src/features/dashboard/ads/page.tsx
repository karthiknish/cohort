'use client'

import { reportConvexFailure } from '@/lib/handle-convex-error'
import { useCallback, useEffect, useMemo, useRef } from 'react'

import { extractErrorCode, logError } from '@/lib/convex-errors'
import { normalizeAdsProviderId } from '@/domain/ads/provider'
import { DASHBOARD_THEME } from '@/lib/dashboard-theme'

import { FadeIn } from '@/shared/ui/animate-in'
import { QueryErrorAlert } from '@/shared/ui/query-error-alert'
import { BoneyardSkeletonBoundary } from '@/shared/ui/boneyard-skeleton-boundary'
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

import {
  useAdsMetrics,
  useAdsConnections,
  useDerivedMetrics,
  useFormulaEditor,
  useMetricsComparison,
  useAlgorithmicInsights,
} from './hooks'

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
    const primaryCurrency =
      financialTotals?.comparability === 'single_currency'
        ? (financialTotals.primaryCurrency ?? null)
        : null

    const map: Record<string, string> = {}
    if (metrics.adsInsightsSummary?.providers) {
      for (const p of metrics.adsInsightsSummary.providers) {
        const providerId = normalizeAdsProviderId(p.providerId) ?? p.providerId
        if (p.financialTotals.primaryCurrency) {
          map[providerId] = p.financialTotals.primaryCurrency
        }
      }
    }

    return { displayCurrency: primaryCurrency, providerCurrencyMap: map }
  }, [metrics.adsInsightsSummary])

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
  const activeCurrency = displayCurrency ?? undefined

  const showWorkflow =
    !isPreviewMode &&
    (!connections.integrationStatuses ||
      connections.automationStatuses.length === 0 ||
      connections.automationStatuses.every((s) => s.status !== 'success'))

  return (
    <BoneyardSkeletonBoundary name="dashboard-ads-page" loading={isInitialLoading}>
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
            setup={
              <AdsPageSetupSection
                isPreviewMode={isPreviewMode}
                showWorkflow={showWorkflow}
                connectedAccountCount={connectedAccountCount}
                hasSuccessfulSync={hasSuccessfulSync}
                hasPendingSetup={hasPendingSetup}
                connections={connections}
                metrics={metrics}
                dateRange={metrics.dateRange}
                openGoogleCampaignSetup={openGoogleCampaignSetup}
                handleInitializeMeta={handleInitializeMeta}
                handleInitializeTikTok={handleInitializeTikTok}
              />
            }
            analytics={
              <AdsPageAnalyticsSection
                metrics={metrics}
                algorithmicInsights={algorithmicInsights}
                activeCurrency={activeCurrency}
                connectedProviderIds={connectedProviderIds}
                connectedAccountCount={connectedAccountCount}
                suppressMetricsErrors={suppressMetricsErrors}
                dateRange={metrics.dateRange}
                providerCurrencyMap={providerCurrencyMap}
              />
            }
            advancedAnalytics={
              <AdsPageAdvancedAnalyticsSection
                metrics={metrics}
                derivedMetrics={derivedMetrics}
                formulaEditor={formulaEditor}
                comparison={comparison}
                activeCurrency={activeCurrency}
                suppressMetricsErrors={suppressMetricsErrors}
                handleLoadMoreMetrics={handleLoadMoreMetrics}
              />
            }
            showSetup={!isPreviewMode}
            connectedAccountCount={connectedAccountCount}
            hasPendingSetup={hasPendingSetup}
            hasMetricData={metrics.hasMetricData}
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
          onReloadAccounts={() => {
            void connections.reloadGoogleAccountOptions()
          }}
          onInitialize={() => {
            void connections.initializeGoogleIntegration(
              undefined,
              connections.selectedGoogleAccountId || null,
            )
          }}
        />
      ) : null}
    </BoneyardSkeletonBoundary>
  )
}
