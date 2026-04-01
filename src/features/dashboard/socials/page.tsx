'use client'

import { useState } from 'react'
import { useCallback } from 'react'

import { DASHBOARD_THEME } from '@/lib/dashboard-theme'
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

  const [activeSurface, setActiveSurface] = useState<'facebook' | 'instagram'>('facebook')

  const connected = connections.status?.connected ?? false

  const handleRequestSync = useCallback(() => {
    void connections.handleRequestSync()
  }, [connections])

  const handleSurfaceChange = useCallback((value: string) => {
    setActiveSurface(value as 'facebook' | 'instagram')
  }, [])

  return (
    <div className={DASHBOARD_THEME.layout.container}>
      <SocialsHeader
        selectedClientName={selectedClient?.name ?? null}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      {!isPreviewMode ? (
        <FadeIn>
          <div id="social-connections-panel">
            <SocialsConnectionPanel
              panelId="social-connections-panel"
              selectedClientName={selectedClient?.name ?? null}
              connected={connected}
              accountName={connections.status?.accountName}
              lastSyncedAtMs={connections.status?.lastSyncedAtMs}
              connectingProvider={connections.connectingProvider}
              connectionError={connections.connectionError}
              onConnectFacebook={connections.handleConnectFacebook}
              onConnectInstagram={connections.handleConnectInstagram}
              onDisconnect={connections.handleDisconnect}
              onRequestSync={handleRequestSync}
            />
          </div>
        </FadeIn>
      ) : null}

      <FadeIn>
        <Tabs
          value={activeSurface}
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
