'use client'

import { useState } from 'react'

import { DASHBOARD_THEME } from '@/lib/dashboard-theme'
import { FadeIn } from '@/shared/ui/animate-in'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { SocialsHeader } from './components/socials-header'
import { SocialsConnectionPanel } from './components/socials-connection-panel'
import { SocialSurfacePanel } from './components/social-surface-panel'
import { useSocialsPageController } from './hooks/use-socials-page-controller'

export default function SocialsPage() {
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

  return (
    <div className={DASHBOARD_THEME.layout.container}>
      <SocialsHeader
        selectedClientName={selectedClient?.name ?? null}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

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
            onRequestSync={() => void connections.handleRequestSync()}
          />
        </div>
      </FadeIn>

      <FadeIn>
        <Tabs
          value={activeSurface}
          onValueChange={(value) => setActiveSurface(value as 'facebook' | 'instagram')}
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
              overviewLoading={metrics.overviewLoading}
              connected={connected}
            />
          </TabsContent>

          <TabsContent value="instagram" className="mt-0">
            <SocialSurfacePanel
              surface="instagram"
              kpis={instagramKpis}
              overviewLoading={metrics.overviewLoading}
              connected={connected}
            />
          </TabsContent>
        </Tabs>
      </FadeIn>
    </div>
  )
}
