'use client'

import { useState } from 'react'

import { DASHBOARD_THEME } from '@/lib/dashboard-theme'
import { PROVIDER_IDS } from '@/lib/themes'
import { FadeIn } from '@/components/ui/animate-in'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SocialsHeader } from './components/socials-header'
import { SocialsConnectionPanel } from './components/socials-connection-panel'
import { SocialSurfacePanel } from './components/social-surface-panel'
import { useSocialsPageController } from './hooks/use-socials-page-controller'

export default function SocialsPage() {
  const {
    selectedClient,
    metrics,
    connections,
    metaConnected,
    metaStatus,
    lastSyncedAt,
    surfaceData,
    metaSetupState,
    surfaceAvailability,
    facebookSuggestions,
    instagramSuggestions,
    facebookPages,
    instagramProfiles,
    surfaceActorsLoading,
    surfaceActorsError,
    reloadSurfaceActors,
  } = useSocialsPageController()
  const [activeSurface, setActiveSurface] = useState<'facebook' | 'instagram'>('facebook')

  const facebookSurfaceItems = facebookPages.map((page) => ({
    id: page.id,
    name: page.name,
    subtitle: page.tasks.length > 0 ? page.tasks.join(', ') : 'Publishing and insight access enabled',
  }))

  const instagramSurfaceItems = instagramProfiles.map((profile) => ({
    id: profile.id,
    name: profile.name,
    subtitle: profile.username ? `@${profile.username}` : 'Business profile linked through Meta',
  }))

  return (
    <div className={DASHBOARD_THEME.layout.container}>
      <SocialsHeader
        selectedClientName={selectedClient?.name ?? null}
        dateRange={metrics.dateRange}
        onDateRangeChange={metrics.setDateRange}
      />

      <FadeIn>
        <div id="social-surfaces-setup">
          <SocialsConnectionPanel
            panelId="social-connections-panel"
            selectedClientName={selectedClient?.name ?? null}
            connected={metaConnected}
            accountName={metaStatus?.accountName}
            lastSyncedAt={lastSyncedAt}
            metaSetupMessage={connections.metaSetupMessage}
            metaNeedsAccountSelection={connections.metaNeedsAccountSelection}
            metaAccountOptions={connections.metaAccountOptions}
            selectedMetaAccountId={connections.selectedMetaAccountId}
            loadingMetaAccountOptions={connections.loadingMetaAccountOptions}
            connectingProvider={connections.connectingProvider}
            initializingMeta={connections.initializingMeta}
            onConnectFacebook={() => connections.handleOauthRedirect(PROVIDER_IDS.FACEBOOK)}
            onConnectInstagram={() => connections.handleOauthRedirect(PROVIDER_IDS.FACEBOOK)}
            onDisconnect={() => connections.handleDisconnect(PROVIDER_IDS.FACEBOOK)}
            onRefresh={metrics.handleManualRefresh}
            onReloadAccounts={() => connections.reloadMetaAccountOptions()}
            onSelectAccount={connections.setSelectedMetaAccountId}
            onInitialize={() =>
              connections.initializeMetaIntegration(
                undefined,
                connections.selectedMetaAccountId || null,
              )
            }
            facebookPages={facebookPages}
            instagramProfiles={instagramProfiles}
            metaSetupState={metaSetupState}
            surfaceAvailability={surfaceAvailability}
            surfaceActorsLoading={surfaceActorsLoading}
            surfaceActorsError={surfaceActorsError}
            onRetrySurfaceActors={reloadSurfaceActors}
          />
        </div>
      </FadeIn>

      <FadeIn>
        <Tabs value={activeSurface} onValueChange={(value) => setActiveSurface(value as 'facebook' | 'instagram')} className="space-y-6">
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
              items={facebookSurfaceItems}
              surfaceStatus={surfaceAvailability.facebook.status}
              itemsLoading={surfaceActorsLoading}
              itemsError={surfaceActorsError}
              emptyStateDescription={surfaceAvailability.facebook.emptyMessage}
              kpis={surfaceData.facebook.kpis}
              providerSummaries={surfaceData.facebook.providerSummaries}
              metrics={surfaceData.facebook.metrics}
              initialMetricsLoading={metrics.initialMetricsLoading}
              metricsLoading={metrics.metricsLoading}
              metricError={metrics.metricError}
              nextCursor={metrics.nextCursor}
              loadingMore={metrics.loadingMore}
              loadMoreError={metrics.loadMoreError}
              onRefresh={metrics.handleManualRefresh}
              onRetryItems={reloadSurfaceActors}
              onLoadMore={() => void metrics.handleLoadMore()}
              onExport={metrics.handleExport}
              suggestions={facebookSuggestions}
            />
          </TabsContent>

          <TabsContent value="instagram" className="mt-0">
            <SocialSurfacePanel
              surface="instagram"
              items={instagramSurfaceItems}
              surfaceStatus={surfaceAvailability.instagram.status}
              itemsLoading={surfaceActorsLoading}
              itemsError={surfaceActorsError}
              emptyStateDescription={surfaceAvailability.instagram.emptyMessage}
              kpis={surfaceData.instagram.kpis}
              providerSummaries={surfaceData.instagram.providerSummaries}
              metrics={surfaceData.instagram.metrics}
              initialMetricsLoading={metrics.initialMetricsLoading}
              metricsLoading={metrics.metricsLoading}
              metricError={metrics.metricError}
              nextCursor={metrics.nextCursor}
              loadingMore={metrics.loadingMore}
              loadMoreError={metrics.loadMoreError}
              onRefresh={metrics.handleManualRefresh}
              onRetryItems={reloadSurfaceActors}
              onLoadMore={() => void metrics.handleLoadMore()}
              onExport={metrics.handleExport}
              suggestions={instagramSuggestions}
            />
          </TabsContent>
        </Tabs>
      </FadeIn>
    </div>
  )
}
