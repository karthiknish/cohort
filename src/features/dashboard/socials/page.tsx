'use client'

import { useCallback, useMemo } from 'react'

import { DASHBOARD_THEME } from '@/lib/dashboard-theme'
import { usePersistedTab } from '@/shared/hooks/use-persisted-tab'
import { usePreview } from '@/shared/contexts/preview-context'
import { FadeIn } from '@/shared/ui/animate-in'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { SocialsHeader } from './components/socials-header'
import { SocialsConnectionPanel } from './components/socials-connection-panel'
import { SocialSurfacePanel } from './components/social-surface-panel'
import { useSocialsPageController } from './hooks/use-socials-page-controller'

export default function SocialsPage() {
  const { isPreviewMode } = usePreview()
  const {
    selectedClient,
    connections,
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

  const handleRequestSync = useCallback(() => {
    void connections.handleRequestSync()
  }, [connections])

  const handleSurfaceChange = useCallback(
    (value: string) => {
      if (value === 'facebook' || value === 'instagram') {
        surfaceTab.setValue(value)
      }
    },
    [surfaceTab],
  )

  return (
    <div className={DASHBOARD_THEME.layout.container}>
      <SocialsHeader
        selectedClientName={selectedClient?.name ?? null}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      {!isPreviewMode ? (
        <FadeIn>
          <div>
            <SocialsConnectionPanel
              panelId="social-connections-panel"
              selectedClientName={selectedClient?.name ?? null}
              connected={connected}
              accountName={connections.status?.accountName}
              lastSyncedAtMs={connections.status?.lastSyncedAtMs}
              oauthPending={connections.oauthPending}
              connectionError={connections.connectionError}
              onConnectMeta={connections.handleConnectMeta}
              onDisconnect={connections.handleDisconnect}
              onRequestSync={handleRequestSync}
            />
          </div>
        </FadeIn>
      ) : null}

      <FadeIn>
        <Tabs
          value={surfaceTab.value}
          onValueChange={handleSurfaceChange}
          className="space-y-6"
        >
          <TabsList className={DASHBOARD_THEME.tabs.list}>
            <TabsTrigger value="facebook" className={DASHBOARD_THEME.tabs.trigger}>
              Facebook
            </TabsTrigger>
            <TabsTrigger value="instagram" className={DASHBOARD_THEME.tabs.trigger}>
              Instagram
            </TabsTrigger>
          </TabsList>

          <TabsContent value="facebook" className="mt-0">
            <SocialSurfacePanel
              surface="facebook"
              kpis={facebookKpis}
              overview={metrics.facebookOverview}
              overviewLoading={metrics.overviewLoading}
              connected={connected}
            />
          </TabsContent>

          <TabsContent value="instagram" className="mt-0">
            <SocialSurfacePanel
              surface="instagram"
              kpis={instagramKpis}
              overview={metrics.instagramOverview}
              overviewLoading={metrics.overviewLoading}
              connected={connected}
            />
          </TabsContent>
        </Tabs>
      </FadeIn>
    </div>
  )
}
