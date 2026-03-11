'use client'

import { ArrowRight, CheckCircle2, CopyPlus, RefreshCw, Sparkles, Unplug } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'
import { SiFacebook, SiInstagram } from 'react-icons/si'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import {
  SocialsMetaSetupCard,
  SocialsMetaSourceSwitcherCard,
  SocialsSurfaceInventoryCard,
} from './socials-connection-panel-sections'
import type { SocialsMetaSetupState, SocialsSurfaceAvailability } from './socials-state'

type MetaAccountOption = {
  id: string
  name: string
  currency: string | null
  accountStatus: number | null
  isActive: boolean
}

type SocialsConnectionPanelProps = {
  panelId?: string
  selectedClientName: string | null
  connected: boolean
  accountName: string | null | undefined
  lastSyncedAt: string | null
  metaSetupMessage: string | null
  metaNeedsAccountSelection: boolean
  metaAccountOptions: MetaAccountOption[]
  selectedMetaAccountId: string
  loadingMetaAccountOptions: boolean
  connectingProvider: string | null
  initializingMeta: boolean
  onConnectFacebook: () => Promise<void>
  onConnectInstagram: () => Promise<void>
  onDisconnect: () => Promise<void>
  onRefresh: () => void
  onReloadAccounts: () => Promise<MetaAccountOption[]>
  onSelectAccount: (accountId: string) => void
  onInitialize: () => Promise<void>
  facebookPages: Array<{ id: string; name: string; tasks: string[] }>
  instagramProfiles: Array<{ id: string; name: string; username: string | null }>
  metaSetupState: SocialsMetaSetupState
  surfaceAvailability: Record<'facebook' | 'instagram', SocialsSurfaceAvailability>
  surfaceActorsLoading: boolean
  surfaceActorsError: string | null
  onRetrySurfaceActors: () => void
}

function formatLastSync(timestamp: string | null): string {
  if (!timestamp) return 'Waiting for first sync'
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return 'Waiting for first sync'

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function SocialsConnectionPanel({
  panelId,
  selectedClientName,
  connected,
  accountName,
  lastSyncedAt,
  metaSetupMessage,
  metaNeedsAccountSelection,
  metaAccountOptions,
  selectedMetaAccountId,
  loadingMetaAccountOptions,
  connectingProvider,
  initializingMeta,
  onConnectFacebook,
  onConnectInstagram,
  onDisconnect,
  onRefresh,
  onReloadAccounts,
  onSelectAccount,
  onInitialize,
  facebookPages,
  instagramProfiles,
  metaSetupState,
  surfaceAvailability,
  surfaceActorsLoading,
  surfaceActorsError,
  onRetrySurfaceActors,
}: SocialsConnectionPanelProps) {
  const isConnectingMeta = connectingProvider === 'facebook'
  const surfaceStates = useMemo(
    () => [
      {
        id: 'facebook',
        label: 'Facebook',
        description: 'Pages, placements, and audience response tied to your Meta surface.',
        icon: SiFacebook,
      },
      {
        id: 'instagram',
        label: 'Instagram',
        description: 'Business profile reach, placements, and creative response from the same login.',
        icon: SiInstagram,
      },
    ],
    [],
  )
  const shouldShowSourceSwitcher =
    connected &&
    (metaNeedsAccountSelection || (metaSetupState.switchSourceRecommended && metaAccountOptions.length > 1))
  const sourceSwitcherTitle = metaNeedsAccountSelection
    ? 'Choose the Meta source behind these social insights'
    : 'Switch Meta source for this workspace'
  const sourceSwitcherDescription = metaNeedsAccountSelection
    ? 'The social login is complete. Meta still requires one background source selection before Facebook and Instagram insights can populate here.'
    : metaSetupState.switchSourceMessage ??
      'If these surfaces look incomplete, switch to another Meta source and retry discovery.'
  const sourceConfirmationLabel = metaNeedsAccountSelection ? 'Prepare source' : 'Switch source'

  return (
    <Card id={panelId} className="overflow-hidden border-muted/60 shadow-sm">
      <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.12),_transparent_40%),linear-gradient(135deg,_rgba(15,23,42,1),_rgba(24,24,27,0.98)_52%,_rgba(39,39,42,0.96))] px-6 py-6 text-white">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white hover:bg-white/10">
                Native social intelligence
              </Badge>
              <Badge className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-50 hover:bg-emerald-400/10">
                {connected ? 'Connected' : 'Needs Meta login'}
              </Badge>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight text-balance">
                See Facebook and Instagram performance as social surfaces, not setup plumbing.
              </h2>
              <p className="max-w-xl text-sm text-white/72">
                Start with Facebook or Instagram, then complete the shared Meta authorization to keep
                Pages, Instagram business profiles, trend signals, and AI recommendations in one workspace.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={() => void onConnectFacebook()}
                disabled={isConnectingMeta}
                className="h-11 rounded-2xl bg-white px-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-950 hover:bg-white/90"
              >
                <SiFacebook className="mr-2 h-4 w-4" />
                {connected ? 'Reconnect Facebook' : 'Continue with Facebook'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => void onConnectInstagram()}
                disabled={isConnectingMeta}
                className="h-11 rounded-2xl border-white/20 bg-white/5 px-5 text-[11px] font-black uppercase tracking-[0.2em] text-white hover:bg-white/10"
              >
                <SiInstagram className="mr-2 h-4 w-4" />
                {connected ? 'Reconnect Instagram' : 'Continue with Instagram'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onRefresh}
                className="h-11 rounded-2xl border-white/20 bg-white/5 px-5 text-[11px] font-black uppercase tracking-[0.2em] text-white hover:bg-white/10"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh status
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => void onDisconnect()}
                disabled={!connected}
                className="h-11 rounded-2xl border-white/20 bg-transparent px-5 text-[11px] font-black uppercase tracking-[0.2em] text-white hover:bg-white/10"
              >
                <Unplug className="mr-2 h-4 w-4" />
                Disconnect
              </Button>
            </div>
            <p className="text-xs text-white/65">
              Both buttons complete the same Meta Business authorization today, but let you start from the social surface you care about.
            </p>
          </div>

          <div className="grid min-w-0 gap-3 sm:grid-cols-2">
            {surfaceStates.map((surface) => {
              const Icon = surface.icon

              return (
                <div
                  key={surface.id}
                  className="min-w-0 rounded-3xl border border-white/15 bg-white/8 p-4 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{surface.label}</p>
                        <p className="text-xs text-white/65">{surface.description}</p>
                      </div>
                    </div>
                    {connected ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" />
                    ) : (
                      <CopyPlus className="h-5 w-5 shrink-0 text-white/45" aria-hidden="true" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <CardContent className="grid gap-4 p-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
              Workspace: {selectedClientName ?? 'All workspace data'}
            </Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
              {accountName ? `Meta source: ${accountName}` : 'Meta source will be chosen during setup'}
            </Badge>
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
              Last sync: {formatLastSync(lastSyncedAt)}
            </Badge>
          </div>

          {metaSetupMessage ? (
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertDescription>{metaSetupMessage}</AlertDescription>
            </Alert>
          ) : null}

          <SocialsMetaSetupCard
            setupState={metaSetupState}
            selectedSourceLabel={accountName}
            sourceSelectionRequired={metaNeedsAccountSelection}
            loadingSources={loadingMetaAccountOptions}
            facebookStatus={surfaceAvailability.facebook.status}
            instagramStatus={surfaceAvailability.instagram.status}
            facebookCount={facebookPages.length}
            instagramCount={instagramProfiles.length}
            onReloadSources={() => void onReloadAccounts()}
            onRetryDiscovery={onRetrySurfaceActors}
          />

          {shouldShowSourceSwitcher ? (
            <SocialsMetaSourceSwitcherCard
              title={sourceSwitcherTitle}
              description={sourceSwitcherDescription}
              selectedMetaAccountId={selectedMetaAccountId}
              selectedSourceLabel={accountName}
              metaAccountOptions={metaAccountOptions.map((account) => ({ id: account.id, name: account.name }))}
              loadingMetaAccountOptions={loadingMetaAccountOptions}
              initializingMeta={initializingMeta}
              onReloadAccounts={() => void onReloadAccounts()}
              onSelectAccount={onSelectAccount}
              onConfirmSource={() => void onInitialize()}
              confirmationLabel={sourceConfirmationLabel}
            />
          ) : null}

          {!connected ? (
            <div className="rounded-3xl border border-dashed border-muted/60 bg-muted/20 p-5 text-sm text-muted-foreground">
              Start with Facebook or Instagram. Either button begins the same Meta Business authorization,
              then unlocks Facebook Pages, Instagram business profiles, and the AI suggestion loop for this workspace.
            </div>
          ) : null}

          <div className="grid gap-3 md:grid-cols-2">
            <SocialsSurfaceInventoryCard
              title="Facebook Pages"
              connected={connected}
              loading={surfaceActorsLoading}
              error={surfaceActorsError}
              count={facebookPages.length}
              status={surfaceAvailability.facebook.status}
              emptyConnectedMessage={surfaceAvailability.facebook.emptyMessage}
              emptyDisconnectedMessage="Use the Facebook login above to start loading Facebook Pages for this workspace."
              onRetry={onRetrySurfaceActors}
              items={facebookPages.map((page) => ({
                id: page.id,
                name: page.name,
                subtitle: page.tasks.length > 0 ? page.tasks.join(', ') : 'Publishing and insight access enabled',
              }))}
            />

            <SocialsSurfaceInventoryCard
              title="Instagram Profiles"
              connected={connected}
              loading={surfaceActorsLoading}
              error={surfaceActorsError}
              count={instagramProfiles.length}
              status={surfaceAvailability.instagram.status}
              emptyConnectedMessage={surfaceAvailability.instagram.emptyMessage}
              emptyDisconnectedMessage="Use the Instagram login above to start loading Instagram business profiles for this workspace."
              onRetry={onRetrySurfaceActors}
              items={instagramProfiles.map((profile) => ({
                id: profile.id,
                name: profile.name,
                subtitle: profile.username ? `@${profile.username}` : 'Business profile linked through Meta',
              }))}
            />
          </div>
        </div>

        <div className="grid gap-3">
          <Card className="border-muted/50 bg-muted/[0.04] shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">What this page handles</CardTitle>
              <CardDescription>
                A focused social intelligence surface built on the existing Meta data pipeline.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="rounded-2xl border border-muted/50 bg-background/80 p-3">
                Collects Facebook and Instagram performance from your connected Meta surfaces.
              </div>
              <div className="rounded-2xl border border-muted/50 bg-background/80 p-3">
                Surfaces AI recommendations around audience response, efficiency, and creative trends.
              </div>
              <div className="rounded-2xl border border-muted/50 bg-background/80 p-3">
                Keeps advanced campaign and budget controls separate in the full Ads workspace.
              </div>
            </CardContent>
          </Card>

          <Link
            href="/dashboard/ads"
            className={cn(
              'group flex items-center justify-between rounded-3xl border border-muted/50 bg-background px-5 py-4 text-sm transition-[background-color,border-color,transform,box-shadow] hover:border-primary/30 hover:bg-primary/[0.03] hover:shadow-sm',
            )}
          >
            <div>
              <p className="font-semibold text-foreground">Need full campaign management?</p>
              <p className="text-muted-foreground">Open Ads Hub for campaign controls, cross-channel views, and sync automation.</p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>

        </div>
      </CardContent>
    </Card>
  )
}
