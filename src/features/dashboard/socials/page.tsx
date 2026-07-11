'use client';
import { useCallback, useMemo } from 'react';
import { DASHBOARD_THEME } from '@/lib/dashboard-theme';
import { cn } from '@/lib/utils';
import { usePersistedTab } from '@/shared/hooks/use-persisted-tab';
import { usePreview } from '@/shared/contexts/preview-context';
import { PageMotionShell } from '@/shared/components/page-motion-shell';
import { PageSkeletonBoundary } from '@/shared/ui/page-skeleton-boundary';
import { FadeIn } from '@/shared/ui/animate-in';
import { Tabs, TabsContent } from '@/shared/ui/tabs';
import { SocialsHeader } from './components/socials-header';
import { SocialsConnectionPanel } from './components/socials-connection-panel';
import { SocialsMetaSetupCard } from './components/socials-connection-panel-sections';
import { SocialsPagePicker } from './components/socials-page-picker';
import { SocialSurfacePanel } from './components/social-surface-panel';
import { SocialsPageLayout, SocialsSurfaceTabsList } from './components/socials-page-layout';
import { SocialsPageLoadingFallback } from './components/socials-page-loading-fallback';
import { useSocialsPageController } from './hooks/use-socials-page-controller';
export default function SocialsPage() {
    const { isPreviewMode } = usePreview();
    const { selectedClient, connections, setup, metrics, facebookKpis, instagramKpis, dateRange, setDateRange, overviewError, } = useSocialsPageController();
    const surfaceTab = usePersistedTab({
        defaultValue: 'facebook',
        allowedValues: ['facebook', 'instagram'] as const,
        param: 'surface',
        storageNamespace: 'dashboard:socials',
        syncToUrl: true,
    });
    const connected = connections.status?.connected ?? false;
    const setupComplete = connections.status?.setupComplete ?? false;
    const effectiveConnected = connected || isPreviewMode;
    const effectiveSetupComplete = setupComplete || isPreviewMode;
    const initialLoading = isPreviewMode ? false : connections.statusLoading && !connections.status;
    const handleRequestSync = () => {
        void connections.handleRequestSync();
    };
    const handleConfirmPage = () => {
        void setup.confirmSelectedPage();
    };
    const handleReloadSources = () => {
        void setup.loadPages();
    };
    const handleSurfaceChange = (value: string) => {
        if (value === 'facebook' || value === 'instagram') {
            surfaceTab.setValue(value);
        }
    };
    const facebookHasData = isPreviewMode || (metrics.facebookOverview?.rowCount ?? 0) > 0;
    const instagramHasData = isPreviewMode || (metrics.instagramOverview?.rowCount ?? 0) > 0;
    const setupSection = (<FadeIn>
    <div className="space-y-4">
      <SocialsConnectionPanel panelId="social-connections-panel" selectedClientName={selectedClient?.name ?? null} connected={connected} setupComplete={setupComplete} accountName={connections.status?.facebookPageName ?? connections.status?.accountName} lastSyncedAtMs={connections.status?.lastSyncedAtMs} lastSyncStatus={connections.status?.lastSyncStatus} oauthPending={connections.oauthPending} syncPending={connections.syncPending} connectionError={connections.connectionError} statusQueryError={connections.statusQueryError} onConnectMeta={connections.handleConnectMeta} onDisconnect={connections.handleDisconnect} onRequestSync={handleRequestSync}/>

      {connected ? (<div className={cn('space-y-5', DASHBOARD_THEME.cards.base, 'rounded-2xl border border-muted/50 bg-card/80 p-5 shadow-sm backdrop-blur-sm sm:p-6')}>
          <SocialsMetaSetupCard setupState={setup.setupState} selectedSourceLabel={setup.selectedPageLabel} sourceSelectionRequired={!setupComplete} loadingSources={setup.pagesLoading} facebookStatus={setup.facebookStatus} instagramStatus={setup.instagramStatus} facebookCount={setup.facebookCount} instagramCount={setup.instagramCount} onReloadSources={handleReloadSources}/>
          <SocialsPagePicker pages={setup.pages} selectedPageId={setup.selectedPageId} loading={setup.pagesLoading} confirming={setup.confirmingPage} error={setup.pagesError} setupComplete={setupComplete} instagramBusinessName={connections.status?.instagramBusinessName} onSelectPage={setup.setSelectedPageId} onConfirm={handleConfirmPage} onReload={handleReloadSources}/>
        </div>) : null}
    </div>
    </FadeIn>);
    const performanceSection = (<div className="space-y-6">
    <Tabs value={surfaceTab.value} onValueChange={handleSurfaceChange} className="space-y-6">
      <div className="sticky top-0 z-10 -mx-1 rounded-xl border border-muted/30 bg-card/90 px-1 py-2 shadow-sm backdrop-blur-md supports-backdrop-filter:bg-card/75">
        <SocialsSurfaceTabsList facebookStatus={setup.facebookStatus} instagramStatus={setup.instagramStatus}/>
      </div>

      <TabsContent value="facebook" className="mt-0 focus-visible:outline-none">
        <SocialSurfacePanel surface="facebook" kpis={facebookKpis} overview={metrics.facebookOverview} overviewLoading={metrics.overviewLoading} overviewError={overviewError} connected={effectiveConnected} setupComplete={effectiveSetupComplete} hasData={facebookHasData} onRequestSync={handleRequestSync}/>
      </TabsContent>

      <TabsContent value="instagram" className="mt-0 focus-visible:outline-none">
        <SocialSurfacePanel surface="instagram" kpis={instagramKpis} overview={metrics.instagramOverview} overviewLoading={metrics.overviewLoading} overviewError={overviewError} connected={effectiveConnected} setupComplete={effectiveSetupComplete} hasInstagramBinding={Boolean(connections.status?.instagramBusinessId) || isPreviewMode} hasData={instagramHasData} onRequestSync={handleRequestSync}/>
      </TabsContent>
    </Tabs>
    </div>);
    return (<PageMotionShell reveal={false} className={cn(DASHBOARD_THEME.layout.container, 'pb-10')}>
      <SocialsHeader selectedClientName={selectedClient?.name ?? null} dateRange={dateRange} onDateRangeChange={setDateRange} metricsReady={effectiveConnected && effectiveSetupComplete}/>

      <PageSkeletonBoundary loading={initialLoading} loadingContent={<SocialsPageLoadingFallback />}>
        <SocialsPageLayout showSetup={!isPreviewMode} connected={effectiveConnected} setupComplete={effectiveSetupComplete} setup={setupSection} performance={performanceSection}/>
      </PageSkeletonBoundary>
    </PageMotionShell>);
}
