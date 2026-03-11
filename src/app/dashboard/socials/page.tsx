'use client'

import { useState } from 'react'

import { FadeIn } from '@/components/ui/animate-in'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSocialsPageController } from './hooks/use-socials-page-controller'
import { SocialsHeader } from './components/socials-header'
import { SocialsConnectionPanel } from './components/socials-connection-panel'
import { SocialSurfacePanel } from './components/social-surface-panel'
import { DASHBOARD_THEME } from '@/lib/dashboard-theme'
import { PROVIDER_IDS } from '@/lib/themes'

export default function SocialsPage() {
  const {
    selectedClient,
    metrics,
    connections,
    metaConnected,
    metaStatus,
    lastSyncedAt,
    surfaceData,
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
            onConnect={() => connections.handleOauthRedirect(PROVIDER_IDS.FACEBOOK)}
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
            surfaceActorsLoading={surfaceActorsLoading}
          />
        </div>
      </FadeIn>

      <FadeIn>
        <Tabs value={activeSurface} onValueChange={(value) => setActiveSurface(value as 'facebook' | 'instagram')} className="space-y-6">
          <TabsList className="h-auto rounded-2xl bg-muted/40 p-1.5">
            <TabsTrigger value="facebook" className="rounded-xl px-4 py-2.5 text-sm font-semibold">
              Facebook
            </TabsTrigger>
            <TabsTrigger value="instagram" className="rounded-xl px-4 py-2.5 text-sm font-semibold">
              Instagram
            </TabsTrigger>
          </TabsList>

          <TabsContent value="facebook" className="mt-0">
            <SocialSurfacePanel
              surface="facebook"
              items={facebookSurfaceItems}
              itemsLoading={surfaceActorsLoading}
              itemsError={surfaceActorsError}
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
              itemsLoading={surfaceActorsLoading}
              itemsError={surfaceActorsError}
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
