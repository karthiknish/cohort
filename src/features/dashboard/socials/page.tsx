'use client'

import { useCallback, useMemo } from 'react'

import { DASHBOARD_THEME } from '@/lib/dashboard-theme'
import { cn } from '@/lib/utils'
import { usePersistedTab } from '@/shared/hooks/use-persisted-tab'
import { usePreview } from '@/shared/contexts/preview-context'
import { PageMotionShell } from '@/shared/components/page-motion-shell'
import { FadeIn } from '@/shared/ui/animate-in'
import { Badge } from '@/shared/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { SocialsHeader } from './components/socials-header'
import { SocialsConnectionPanel } from './components/socials-connection-panel'
import { SocialsMetaSetupCard } from './components/socials-connection-panel-sections'
import { SocialsPagePicker } from './components/socials-page-picker'
import { SocialSurfacePanel } from './components/social-surface-panel'
import { useSocialsPageController } from './hooks/use-socials-page-controller'
import type { SocialsSurfaceStatus } from './components/socials-state'

function surfaceTabBadge(status: SocialsSurfaceStatus): string {
  if (status === 'ready') return 'Ready'
  if (status === 'loading') return '…'
  if (status === 'source_required') return 'Setup'
  if (status === 'empty') return 'No IG'
  if (status === 'error') return 'Error'
  if (status === 'disconnected') return 'Off'
  return '—'
}

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

  return (
    <PageMotionShell reveal={false} className={DASHBOARD_THEME.layout.container}>
      <SocialsHeader
        selectedClientName={selectedClient?.name ?? null}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      {!isPreviewMode ? (
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
              <div className={cn('space-y-4', DASHBOARD_THEME.cards.base, 'rounded-2xl border border-muted/50 bg-card p-5 shadow-sm')}>
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
                  onSelectPage={setup.setSelectedPageId}
                  onConfirm={handleConfirmPage}
                  onReload={handleReloadSources}
                />
              </div>
            ) : null}
          </div>
        </FadeIn>
      ) : null}

      <FadeIn>
        <Tabs
          value={surfaceTab.value}
          onValueChange={handleSurfaceChange}
          className="space-y-6"
        >
          <div className="sticky top-0 z-10 -mx-1 border-b border-muted/40 bg-card/95 px-1 py-3 backdrop-blur-md supports-backdrop-filter:bg-card/80">
            <TabsList className={cn(DASHBOARD_THEME.tabs.list, 'w-full justify-start')}>
              <TabsTrigger value="facebook" className={DASHBOARD_THEME.tabs.trigger}>
                Facebook
                <Badge variant="outline" className="ml-2 text-[10px]">
                  {surfaceTabBadge(setup.facebookStatus)}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="instagram" className={DASHBOARD_THEME.tabs.trigger}>
                Instagram
                <Badge variant="outline" className="ml-2 text-[10px]">
                  {surfaceTabBadge(setup.instagramStatus)}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="facebook" className="mt-0">
            <SocialSurfacePanel
              surface="facebook"
              kpis={facebookKpis}
              overview={metrics.facebookOverview}
              overviewLoading={metrics.overviewLoading}
              connected={connected}
              setupComplete={setupComplete}
              hasData={facebookHasData}
              onRequestSync={handleRequestSync}
            />
          </TabsContent>

          <TabsContent value="instagram" className="mt-0">
            <SocialSurfacePanel
              surface="instagram"
              kpis={instagramKpis}
              overview={metrics.instagramOverview}
              overviewLoading={metrics.overviewLoading}
              connected={connected}
              setupComplete={setupComplete}
              hasInstagramBinding={Boolean(connections.status?.instagramBusinessId)}
              hasData={instagramHasData}
              onRequestSync={handleRequestSync}
            />
          </TabsContent>
        </Tabs>
      </FadeIn>
    </PageMotionShell>
  )
}
