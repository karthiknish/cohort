'use client'

import { FadeIn } from '@/components/ui/animate-in'
import { AdConnectionsCard } from '@/components/dashboard/ad-connections-card'
import { usePreview } from '@/contexts/preview-context'

import {
  AdsSkeleton,
  AutomationControlsCard,
  CampaignManagementCard,
  CrossChannelOverviewCard,
  PerformanceSummaryCard,
  MetricsTableCard,
  WorkflowCard,
  SetupAlerts,
} from './components'

import {
  useAdsMetrics,
  useAdsConnections,
  useAdsAutomation,
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

  // 1. Manage metrics, filters, and data loading
  const {
    metrics,
    processedMetrics,
    providerSummaries,
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

  // 2. Manage provider connections and integration statuses
  const {
    connectedProviders,
    connectingProvider,
    connectionErrors,
    integrationStatuses,
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

  // 3. Manage automation settings and manual sync triggers
  const {
    automationDraft,
    savingSettings,
    settingsErrors,
    expandedProviders,
    syncingProvider,
    updateAutomationDraft,
    handleSaveAutomation,
    toggleAdvanced,
    runManualSync,
  } = useAdsAutomation({
    automationStatuses,
    onRefresh: triggerMetricsRefresh,
  })

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
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                onOauthRedirect={handleOauthRedirect}
                onRefresh={handleManualRefresh}
                refreshing={metricsLoading}
              />
            </div>
          </FadeIn>

          <FadeIn>
            <AutomationControlsCard
              automationStatuses={automationStatuses}
              automationDraft={automationDraft}
              savingSettings={savingSettings}
              settingsErrors={settingsErrors}
              expandedProviders={expandedProviders}
              syncingProvider={syncingProvider}
              onUpdateDraft={updateAutomationDraft}
              onSaveAutomation={(id) => void handleSaveAutomation(id)}
              onToggleAdvanced={toggleAdvanced}
              onRunManualSync={(id) => void runManualSync(id)}
            />
          </FadeIn>

          {/* Campaign Management Cards for each connected provider */}
          {adPlatforms.filter((p) => connectedProviders[p.id]).length > 0 && (
            <FadeIn>
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Campaign Management</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {adPlatforms
                    .filter((p) => connectedProviders[p.id])
                    .map((platform) => (
                      <CampaignManagementCard
                        key={platform.id}
                        providerId={platform.id}
                        providerName={platform.name}
                        isConnected={connectedProviders[platform.id]}
                        onRefresh={handleManualRefresh}
                      />
                    ))}
                </div>
              </div>
            </FadeIn>
          )}
        </>
      )}

      <FadeIn>
        <CrossChannelOverviewCard
          processedMetrics={processedMetrics}
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
          metricError={metricError}
          onRefresh={handleManualRefresh}
          onExport={handleExport}
        />
      </FadeIn>

      <FadeIn>
        <MetricsTableCard
          processedMetrics={processedMetrics}
          hasMetrics={hasMetricData}
          initialMetricsLoading={initialMetricsLoading}
          metricsLoading={metricsLoading}
          metricError={metricError}
          nextCursor={nextCursor}
          loadingMore={loadingMore}
          loadMoreError={loadMoreError}
          onRefresh={handleManualRefresh}
          onLoadMore={() => void handleLoadMore()}
        />
      </FadeIn>
    </div>
  )
}
