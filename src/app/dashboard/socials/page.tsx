'use client'

import { useState } from 'react'

import { DASHBOARD_THEME } from '@/lib/dashboard-theme'
import { PROVIDER_IDS } from '@/lib/themes'
import { FadeIn } from '@/components/ui/animate-in'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

  const handleScrollToSourceSwitcher = () => {
    document.getElementById('social-connections-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

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
          <div className="space-y-3">
            <TabsList className="h-auto rounded-2xl bg-muted/40 p-1.5">
            <TabsTrigger value="facebook" className="rounded-xl px-4 py-2.5 text-sm font-semibold">
              <span className="flex items-center gap-2">
                <span>Facebook</span>
                <Badge variant={surfaceAvailability.facebook.status === 'ready' ? 'secondary' : surfaceAvailability.facebook.status === 'loading' ? 'info' : 'outline'} className="rounded-full px-2 py-0.5 text-[10px]">{surfaceAvailability.facebook.status === 'ready' ? `${surfaceAvailability.facebook.count} ready` : surfaceAvailability.facebook.status === 'source_required' ? 'Source needed' : surfaceAvailability.facebook.status === 'error' ? 'Retry needed' : surfaceAvailability.facebook.status === 'disconnected' ? 'Connect Facebook' : 'Waiting'}</Badge>
              </span>
            </TabsTrigger>
            <TabsTrigger value="instagram" className="rounded-xl px-4 py-2.5 text-sm font-semibold">
              <span className="flex items-center gap-2">
                <span>Instagram</span>
                <Badge variant={surfaceAvailability.instagram.status === 'ready' ? 'secondary' : surfaceAvailability.instagram.status === 'loading' ? 'info' : 'outline'} className="rounded-full px-2 py-0.5 text-[10px]">{surfaceAvailability.instagram.status === 'ready' ? `${surfaceAvailability.instagram.count} ready` : surfaceAvailability.instagram.status === 'source_required' ? 'Source needed' : surfaceAvailability.instagram.status === 'error' ? 'Retry needed' : surfaceAvailability.instagram.status === 'disconnected' ? 'Connect Instagram' : 'Waiting'}</Badge>
              </span>
            </TabsTrigger>
            </TabsList>
            <div className="flex flex-col gap-3 rounded-2xl border border-muted/50 bg-muted/[0.03] p-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">{metaSetupState.title}</p>
                <p className="text-sm text-muted-foreground">{metaSetupState.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {metaSetupState.switchSourceRecommended ? (
                  <Button type="button" variant="outline" size="sm" onClick={handleScrollToSourceSwitcher}>
                    Switch source
                  </Button>
                ) : null}
                {metaConnected && metaSetupState.stage !== 'source_selection' ? (
                  <Button type="button" variant="outline" size="sm" onClick={reloadSurfaceActors}>
                    Retry discovery
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

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
