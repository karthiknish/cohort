'use client'

import { ArrowRight, CheckCircle2, Link2, RefreshCw, Sparkles, Unplug } from 'lucide-react'
import Link from 'next/link'
import { SiFacebook, SiInstagram, SiMeta } from 'react-icons/si'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DASHBOARD_THEME, getBadgeClasses, getButtonClasses } from '@/lib/dashboard-theme'
import { cn } from '@/lib/utils'

import {
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
    <div id={panelId} className="space-y-4">
      {/* ── Social Platform Login Cards ── */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Facebook Login */}
        <Card className={cn('overflow-hidden', DASHBOARD_THEME.cards.base)}>
          <CardContent className="flex flex-col gap-4 p-5">
            <div className="flex items-center gap-3">
              <div className={cn(DASHBOARD_THEME.icons.container, 'h-10 w-10 bg-blue-500/10 text-blue-600 border-blue-500/20')}>
                <SiFacebook className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">Facebook</p>
                  {connected ? (
                    <Badge className={getBadgeClasses('success')}>Connected</Badge>
                  ) : (
                    <Badge className={getBadgeClasses('secondary')}>Not connected</Badge>
                  )}
                </div>
                <p className={DASHBOARD_THEME.stats.description}>
                  Connect to load Facebook Pages, placements, and audience insights.
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => void onConnectFacebook()}
              disabled={isConnectingMeta}
              className={cn(getButtonClasses('primary'), 'w-full')}
            >
              <SiFacebook className="mr-2 h-4 w-4" />
              {connected ? 'Reconnect Facebook' : 'Connect Facebook'}
              <ArrowRight className="ml-auto h-4 w-4" />
            </Button>
            {surfaceAvailability.facebook.status === 'ready' && facebookPages.length > 0 && (
              <p className={DASHBOARD_THEME.stats.description}>
                {facebookPages.length} {facebookPages.length === 1 ? 'Page' : 'Pages'} discovered
              </p>
            )}
          </CardContent>
        </Card>

        {/* Instagram Login */}
        <Card className={cn('overflow-hidden', DASHBOARD_THEME.cards.base)}>
          <CardContent className="flex flex-col gap-4 p-5">
            <div className="flex items-center gap-3">
              <div className={cn(DASHBOARD_THEME.icons.container, 'h-10 w-10 bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-500/20')}>
                <SiInstagram className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">Instagram</p>
                  {connected ? (
                    <Badge className={getBadgeClasses('success')}>Connected</Badge>
                  ) : (
                    <Badge className={getBadgeClasses('secondary')}>Not connected</Badge>
                  )}
                </div>
                <p className={DASHBOARD_THEME.stats.description}>
                  Connect to load Instagram business profiles and creative response data.
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => void onConnectInstagram()}
              disabled={isConnectingMeta}
              className={cn(getButtonClasses('primary'), 'w-full')}
            >
              <SiInstagram className="mr-2 h-4 w-4" />
              {connected ? 'Reconnect Instagram' : 'Connect Instagram'}
              <ArrowRight className="ml-auto h-4 w-4" />
            </Button>
            {surfaceAvailability.instagram.status === 'ready' && instagramProfiles.length > 0 && (
              <p className={DASHBOARD_THEME.stats.description}>
                {instagramProfiles.length} {instagramProfiles.length === 1 ? 'profile' : 'profiles'} discovered
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Meta Analytics Sync ── */}
      <Card className={cn('overflow-hidden', DASHBOARD_THEME.cards.base)}>
        <CardHeader className={DASHBOARD_THEME.cards.header}>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(DASHBOARD_THEME.icons.container, 'h-10 w-10')}>
                <SiMeta className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Meta Analytics Sync</CardTitle>
                <CardDescription>
                  Shared authorization that powers both Facebook and Instagram data.
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={connected ? getBadgeClasses('success') : getBadgeClasses('warning')}>
                {connected ? 'Syncing' : 'Needs setup'}
              </Badge>
              <Badge className={getBadgeClasses('secondary')}>
                {formatLastSync(lastSyncedAt)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={getBadgeClasses('primary')}>
              Workspace: {selectedClientName ?? 'All workspace data'}
            </Badge>
            {accountName ? (
              <Badge className={getBadgeClasses('primary')}>
                Source: {accountName}
              </Badge>
            ) : null}
          </div>

          {metaSetupMessage ? (
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertDescription>{metaSetupMessage}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className={getButtonClasses('outline')}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh data
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void onReloadAccounts()}
              className={getButtonClasses('outline')}
            >
              <Link2 className="mr-2 h-4 w-4" />
              Reload sources
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetrySurfaceActors}
              disabled={!connected}
              className={getButtonClasses('outline')}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry discovery
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void onDisconnect()}
              disabled={!connected}
              className={cn(getButtonClasses('outline'), 'text-destructive hover:text-destructive')}
            >
              <Unplug className="mr-2 h-4 w-4" />
              Disconnect
            </Button>
          </div>

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
        </CardContent>
      </Card>

      {/* ── Discovered Surfaces ── */}
      <div className="grid gap-4 md:grid-cols-2">
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

      {/* ── Quick link to Ads Hub ── */}
      <Link
        href="/dashboard/ads"
        className={cn(
          DASHBOARD_THEME.cards.base,
          'group flex items-center justify-between rounded-2xl border px-5 py-4 text-sm transition-[background-color,border-color,box-shadow] hover:border-primary/30 hover:bg-primary/[0.03] hover:shadow-sm',
        )}
      >
        <div>
          <p className="font-semibold text-foreground">Need full campaign management?</p>
          <p className="text-muted-foreground">Open Ads Hub for campaign controls, cross-channel views, and sync automation.</p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  )
}
