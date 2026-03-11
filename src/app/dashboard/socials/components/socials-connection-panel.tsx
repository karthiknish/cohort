'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, CopyPlus, RefreshCw, Sparkles, Unplug } from 'lucide-react'
import { SiFacebook, SiInstagram } from 'react-icons/si'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

type MetaAccountOption = {
  id: string
  name: string
  currency: string | null
  accountStatus: number | null
  isActive: boolean
}

type SocialsConnectionPanelProps = {
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
  onConnect: () => Promise<void>
  onDisconnect: () => Promise<void>
  onRefresh: () => void
  onReloadAccounts: () => Promise<MetaAccountOption[]>
  onSelectAccount: (accountId: string) => void
  onInitialize: () => Promise<void>
  facebookPages: Array<{ id: string; name: string; tasks: string[] }>
  instagramProfiles: Array<{ id: string; name: string; username: string | null }>
  surfaceActorsLoading: boolean
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
  onConnect,
  onDisconnect,
  onRefresh,
  onReloadAccounts,
  onSelectAccount,
  onInitialize,
  facebookPages,
  instagramProfiles,
  surfaceActorsLoading,
}: SocialsConnectionPanelProps) {
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

  return (
    <Card className="overflow-hidden border-muted/60 shadow-sm">
      <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(10,102,194,0.35),_transparent_40%),linear-gradient(135deg,_rgba(7,23,64,1),_rgba(12,54,110,0.98)_52%,_rgba(24,112,153,0.94))] px-6 py-6 text-white">
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
                Connect Meta once, then keep Pages, Instagram business profiles, trend signals,
                and AI recommendations in a single social workspace.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={() => void onConnect()}
                disabled={connectingProvider === 'facebook'}
                className="h-11 rounded-2xl bg-white px-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-950 hover:bg-white/90"
              >
                {connected ? 'Reconnect Meta Login' : 'Continue with Facebook'}
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

          {metaNeedsAccountSelection ? (
            <div className="rounded-3xl border border-dashed border-primary/25 bg-primary/[0.03] p-5">
              <div className="mb-4 space-y-1">
                <h3 className="text-base font-semibold">Choose the Meta source behind these social insights</h3>
                <p className="text-sm text-muted-foreground">
                  The social login is complete. Meta still requires one background source selection
                  before Facebook and Instagram insights can populate here.
                </p>
              </div>
              <div className="flex flex-col gap-3 md:flex-row">
                <div className="min-w-0 flex-1">
                  <Select value={selectedMetaAccountId} onValueChange={onSelectAccount}>
                    <SelectTrigger aria-label="Select Meta source" className="h-11 rounded-2xl">
                      <SelectValue placeholder={loadingMetaAccountOptions ? 'Loading Meta sources…' : 'Select Meta source'} />
                    </SelectTrigger>
                    <SelectContent>
                      {metaAccountOptions.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                          {account.currency ? ` · ${account.currency}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void onReloadAccounts()}
                  disabled={loadingMetaAccountOptions}
                  className="h-11 rounded-2xl"
                >
                  Reload accounts
                </Button>
                <Button
                  type="button"
                  onClick={() => void onInitialize()}
                  disabled={!selectedMetaAccountId || initializingMeta}
                  className="h-11 rounded-2xl"
                >
                  {initializingMeta ? 'Preparing account…' : 'Prepare account'}
                </Button>
              </div>
            </div>
          ) : null}

          {!connected ? (
            <div className="rounded-3xl border border-dashed border-muted/60 bg-muted/20 p-5 text-sm text-muted-foreground">
              Start with the Meta login. That single authorization unlocks Facebook Pages,
              Instagram business profiles, and the AI suggestion loop for this workspace.
            </div>
          ) : null}

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-3xl border border-muted/50 bg-background p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Facebook Pages</p>
                <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[10px]">
                  {surfaceActorsLoading ? 'Loading…' : `${facebookPages.length} connected`}
                </Badge>
              </div>
              <div className="space-y-2">
                {facebookPages.length > 0 ? (
                  facebookPages.slice(0, 3).map((page) => (
                    <div key={page.id} className="rounded-2xl border border-muted/50 bg-muted/[0.04] px-3 py-2">
                      <p className="truncate text-sm font-medium text-foreground">{page.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {page.tasks.length > 0 ? page.tasks.join(', ') : 'Publishing and insight access enabled'}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {connected ? 'No Facebook Pages surfaced yet from Meta.' : 'Connect Meta to load Pages.'}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-muted/50 bg-background p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Instagram Profiles</p>
                <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[10px]">
                  {surfaceActorsLoading ? 'Loading…' : `${instagramProfiles.length} connected`}
                </Badge>
              </div>
              <div className="space-y-2">
                {instagramProfiles.length > 0 ? (
                  instagramProfiles.slice(0, 3).map((profile) => (
                    <div key={profile.id} className="rounded-2xl border border-muted/50 bg-muted/[0.04] px-3 py-2">
                      <p className="truncate text-sm font-medium text-foreground">{profile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {profile.username ? `@${profile.username}` : 'Business profile linked through Meta'}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {connected ? 'No Instagram business profiles surfaced yet from Meta.' : 'Connect Meta to load Instagram profiles.'}
                  </p>
                )}
              </div>
            </div>
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
