'use client';
import { AlertTriangle, ArrowRightLeft, CheckCircle2, LoaderCircle, RefreshCw } from 'lucide-react';
import { DASHBOARD_THEME } from '@/lib/dashboard-theme';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { getSurfaceStatusLabel, getSurfaceStatusVariant, } from './socials-connection-panel-surface-status';
import type { SocialsMetaSetupState, SocialsSurfaceStatus } from './socials-state';
export function SocialsMetaSetupCard(props: {
    setupState: SocialsMetaSetupState;
    selectedSourceLabel: string | null | undefined;
    sourceSelectionRequired: boolean;
    loadingSources: boolean;
    facebookStatus: SocialsSurfaceStatus;
    instagramStatus: SocialsSurfaceStatus;
    facebookCount: number;
    instagramCount: number;
    onReloadSources: () => void;
}) {
    const { setupState, selectedSourceLabel, sourceSelectionRequired, loadingSources, facebookStatus, instagramStatus, facebookCount, instagramCount, onReloadSources, } = props;
    return (<div className="rounded-2xl border border-muted/40 bg-muted/[0.03] p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={setupState.stage === 'ready' ? 'secondary' : setupState.stage === 'discovering' ? 'info' : 'outline'} className={DASHBOARD_THEME.badges.base}>
              {setupState.stage.replaceAll('_', ' ')}
            </Badge>
            {selectedSourceLabel ? <Badge variant="outline" className={DASHBOARD_THEME.badges.base}>Source: {selectedSourceLabel}</Badge> : null}
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">{setupState.title}</h3>
            <p className="text-sm text-muted-foreground">{setupState.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onReloadSources} disabled={loadingSources}>
            {loadingSources ? <LoaderCircle className="mr-2 size-4 animate-spin"/> : <RefreshCw className="mr-2 size-4"/>}
            Reload sources
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-muted/50 bg-background p-3">
          <p className={DASHBOARD_THEME.stats.label}>Meta source</p>
          <div className="mt-2 flex items-center gap-2 text-sm text-foreground">
            {sourceSelectionRequired ? <AlertTriangle className="size-4 text-warning"/> : <CheckCircle2 className="size-4 text-success"/>}
            <span>{sourceSelectionRequired ? 'Selection still required' : selectedSourceLabel ?? 'Source selected'}</span>
          </div>
        </div>
        <div className="rounded-2xl border border-muted/50 bg-background p-3">
          <div className="flex items-center justify-between gap-3">
            <p className={DASHBOARD_THEME.stats.label}>Facebook Pages</p>
            <Badge variant={getSurfaceStatusVariant(facebookStatus)} className={DASHBOARD_THEME.badges.base}>{getSurfaceStatusLabel(facebookStatus, facebookCount)}</Badge>
          </div>
          <p className="mt-2 text-sm text-foreground">{facebookCount > 0 ? `${facebookCount} Pages discovered from the selected Meta source.` : sourceSelectionRequired ? 'Choose a source before Pages can load.' : 'Pages have not surfaced yet from this source.'}</p>
        </div>
        <div className="rounded-2xl border border-muted/50 bg-background p-3">
          <div className="flex items-center justify-between gap-3">
            <p className={DASHBOARD_THEME.stats.label}>Instagram Profiles</p>
            <Badge variant={getSurfaceStatusVariant(instagramStatus)} className={DASHBOARD_THEME.badges.base}>{getSurfaceStatusLabel(instagramStatus, instagramCount)}</Badge>
          </div>
          <p className="mt-2 text-sm text-foreground">{instagramCount > 0 ? `${instagramCount} business profile${instagramCount === 1 ? '' : 's'} discovered from the selected Meta source.` : sourceSelectionRequired ? 'Choose a source before Instagram can load.' : 'Instagram profiles have not surfaced yet from this source.'}</p>
        </div>
      </div>

      {setupState.switchSourceRecommended && setupState.switchSourceMessage ? (<div className="mt-4 rounded-2xl border border-warning/20 bg-warning/5 px-4 py-3 text-sm text-foreground">
          <div className="flex items-start gap-3">
            <ArrowRightLeft className="mt-0.5 size-4 text-warning"/>
            <div className="space-y-1">
              <p className="font-medium">This may be the wrong Meta source for this workspace.</p>
              <p className="text-muted-foreground">{setupState.switchSourceMessage}</p>
            </div>
          </div>
        </div>) : null}
    </div>);
}
