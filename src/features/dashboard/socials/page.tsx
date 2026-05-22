'use client'

import { useCallback, useMemo } from 'react'

import { DASHBOARD_THEME } from '@/lib/dashboard-theme'
import { cn } from '@/lib/utils'
import { usePersistedTab } from '@/shared/hooks/use-persisted-tab'
import { usePreview } from '@/shared/contexts/preview-context'
import { PageMotionShell } from '@/shared/components/page-motion-shell'
import { FadeIn } from '@/shared/ui/animate-in'
import { Tabs, TabsContent } from '@/shared/ui/tabs'
import { SocialsHeader } from './components/socials-header'
import { SocialsConnectionPanel } from './components/socials-connection-panel'
import { SocialsMetaSetupCard } from './components/socials-connection-panel-sections'
import { SocialsPagePicker } from './components/socials-page-picker'
import { SocialSurfacePanel } from './components/social-surface-panel'
import { SocialsPageLayout, SocialsSurfaceTabsList } from './components/socials-page-layout'
import { SocialsPageLoadingFallback } from './components/socials-page-loading-fallback'
import { useSocialsPageController } from './hooks/use-socials-page-controller'

export default function SocialsPage() {
  const { isPreviewMode } = usePreview()
  const {
    selectedClient,
    connections,
    setup,
    metrics,
    facebookKpis,
    instagramKpis,
    dateRange,
    setDateRange,
  } = useSocialsPageController()

  const surfaceTab = usePersistedTab({
    defaultValue: 'facebook',
    allowedValues: useMemo(() => ['facebook', 'instagram'] as const, []),
    param: 'surface',
    storageNamespace: 'dashboard:socials',
    syncToUrl: true,
  })

  const connected = connections.status?.connected ?? false
  const setupComplete = connections.status?.setupComplete ?? false
  const initialLoading = connections.statusLoading

  const handleRequestSync = useCallback(() => {
    void connections.handleRequestSync()
  }, [connections])

  const handleConfirmPage = useCallback(() => {
    void setup.confirmSelectedPage()
  }, [setup])

  const handleReloadSources = useCallback(() => {
    void setup.loadPages()
  }, [setup])

  const handleSurfaceChange = useCallback(
    (value: string) => {
      if (value === 'facebook' || value === 'instagram') {
        surfaceTab.setValue(value)
      }
    },
    [surfaceTab],
  )

  const facebookHasData = (metrics.facebookOverview?.rowCount ?? 0) > 0
  const instagramHasData = (metrics.instagramOverview?.rowCount ?? 0) > 0

  const setupSection = useMemo(() => (
    <FadeIn>
    <div className="space-y-4">
      <SocialsConnectionPanel
        panelId="social-connections-panel"
        selectedClientName={selectedClient?.name ?? null}
        connected={connected}
        setupComplete={setupComplete}
        accountName={connections.status?.facebookPageName ?? connections.status?.accountName}
        lastSyncedAtMs={connections.status?.lastSyncedAtMs}
        lastSyncStatus={connections.status?.lastSyncStatus}
        oauthPending={connections.oauthPending}
        syncPending={connections.syncPending}
        connectionError={connections.connectionError}
        onConnectMeta={connections.handleConnectMeta}
        onDisconnect={connections.handleDisconnect}
        onRequestSync={handleRequestSync}
      />

      {connected ? (
        <div
          className={cn(
            'space-y-5',
            DASHBOARD_THEME.cards.base,
            'rounded-2xl border border-muted/50 bg-card/80 p-5 shadow-sm backdrop-blur-sm sm:p-6',
          )}
        >
          <SocialsMetaSetupCard
            setupState={setup.setupState}
            selectedSourceLabel={setup.selectedPageLabel}
            sourceSelectionRequired={!setupComplete}
            loadingSources={setup.pagesLoading}
            facebookStatus={setup.facebookStatus}
            instagramStatus={setup.instagramStatus}
            facebookCount={setup.facebookCount}
            instagramCount={setup.instagramCount}
            onReloadSources={handleReloadSources}
            onRetryDiscovery={handleReloadSources}
          />
          <SocialsPagePicker
            pages={setup.pages}
            selectedPageId={setup.selectedPageId}
            loading={setup.pagesLoading}
            confirming={setup.confirmingPage}
            error={setup.pagesError}
            setupComplete={setupComplete}
            instagramBusinessName={connections.status?.instagramBusinessName}
            onSelectPage={setup.setSelectedPageId}
            onConfirm={handleConfirmPage}
            onReload={handleReloadSources}
          />
        </div>
      ) : null}
    </div>
    </FadeIn>
  ), [
    connected,
    connections,
    handleConfirmPage,
    handleReloadSources,
    handleRequestSync,
    selectedClient?.name,
    setup,
    setupComplete,
  ])

  const performanceSection = useMemo(() => (
    <FadeIn>
    <Tabs value={surfaceTab.value} onValueChange={handleSurfaceChange} className="space-y-6">
      <div className="sticky top-0 z-10 -mx-1 rounded-xl border border-muted/30 bg-card/90 px-1 py-2 shadow-sm backdrop-blur-md supports-backdrop-filter:bg-card/75">
        <SocialsSurfaceTabsList
          facebookStatus={setup.facebookStatus}
          instagramStatus={setup.instagramStatus}
        />
      </div>

      <TabsContent value="facebook" className="mt-0 focus-visible:outline-none">
        <SocialSurfacePanel
          surface="facebook"
          kpis={facebookKpis}
          overview={metrics.facebookOverview}
          overviewLoading={metrics.overviewLoading}
          connected={connected || isPreviewMode}
          setupComplete={setupComplete || isPreviewMode}
          hasData={facebookHasData}
          onRequestSync={handleRequestSync}
        />
      </TabsContent>

      <TabsContent value="instagram" className="mt-0 focus-visible:outline-none">
        <SocialSurfacePanel
          surface="instagram"
          kpis={instagramKpis}
          overview={metrics.instagramOverview}
          overviewLoading={metrics.overviewLoading}
          connected={connected || isPreviewMode}
          setupComplete={setupComplete || isPreviewMode}
          hasInstagramBinding={Boolean(connections.status?.instagramBusinessId) || isPreviewMode}
          hasData={instagramHasData}
          onRequestSync={handleRequestSync}
        />
      </TabsContent>
    </Tabs>
    </FadeIn>
  ), [
    connected,
    facebookHasData,
    facebookKpis,
    handleRequestSync,
    handleSurfaceChange,
    instagramHasData,
    instagramKpis,
    isPreviewMode,
    metrics.facebookOverview,
    metrics.instagramOverview,
    metrics.overviewLoading,
    setup.facebookStatus,
    setup.instagramStatus,
    setupComplete,
    surfaceTab.value,
    connections.status?.instagramBusinessId,
  ])

  return (
    <PageMotionShell reveal={false} className={cn(DASHBOARD_THEME.layout.container, 'pb-10')}>
      <SocialsHeader
        selectedClientName={selectedClient?.name ?? null}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        metricsReady={connected && setupComplete}
      />

      {initialLoading ? (
        <SocialsPageLoadingFallback />
      ) : (
        <SocialsPageLayout
          showSetup={!isPreviewMode}
          connected={connected}
          setupComplete={setupComplete}
          setup={setupSection}
          performance={performanceSection}
        />
      )}
    </PageMotionShell>
  )
}
