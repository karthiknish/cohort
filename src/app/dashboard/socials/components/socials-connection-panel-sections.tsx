'use client'

import { AlertTriangle, ArrowRightLeft, CheckCircle2, CopyPlus, LoaderCircle, RefreshCw } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState, NetworkErrorEmptyState } from '@/components/ui/empty-state'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

import type { SocialsMetaSetupState, SocialsSurfaceStatus } from './socials-state'

function getSurfaceStatusLabel(status: SocialsSurfaceStatus, count: number) {
  if (status === 'ready') return `${count} ready`
  if (status === 'loading') return 'Loading…'
  if (status === 'source_required') return 'Source needed'
  if (status === 'error') return 'Retry needed'
  if (status === 'disconnected') return 'Not connected'
  return 'Waiting'
}

function getSurfaceStatusVariant(status: SocialsSurfaceStatus): 'outline' | 'secondary' | 'info' {
  if (status === 'ready') return 'secondary'
  if (status === 'loading') return 'info'
  return 'outline'
}

export function SocialsMetaSetupCard(props: {
  setupState: SocialsMetaSetupState
  selectedSourceLabel: string | null | undefined
  sourceSelectionRequired: boolean
  loadingSources: boolean
  facebookStatus: SocialsSurfaceStatus
  instagramStatus: SocialsSurfaceStatus
  facebookCount: number
  instagramCount: number
  onReloadSources: () => void
  onRetryDiscovery: () => void
}) {
  const {
    setupState,
    selectedSourceLabel,
    sourceSelectionRequired,
    loadingSources,
    facebookStatus,
    instagramStatus,
    facebookCount,
    instagramCount,
    onReloadSources,
    onRetryDiscovery,
  } = props

  return (
    <div className="rounded-3xl border border-muted/50 bg-muted/[0.04] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={setupState.stage === 'ready' ? 'secondary' : setupState.stage === 'discovering' ? 'info' : 'outline'} className="rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em]">
              {setupState.stage.replace('_', ' ')}
            </Badge>
            {selectedSourceLabel ? <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[10px]">Source: {selectedSourceLabel}</Badge> : null}
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">{setupState.title}</h3>
            <p className="text-sm text-muted-foreground">{setupState.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onReloadSources} disabled={loadingSources}>
            {loadingSources ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Reload sources
          </Button>
          {!sourceSelectionRequired ? (
            <Button type="button" variant="outline" size="sm" onClick={onRetryDiscovery}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry discovery
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-muted/50 bg-background px-3 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Meta source</p>
          <div className="mt-2 flex items-center gap-2 text-sm text-foreground">
            {sourceSelectionRequired ? <AlertTriangle className="h-4 w-4 text-amber-500" /> : <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
            <span>{sourceSelectionRequired ? 'Selection still required' : selectedSourceLabel ?? 'Source selected'}</span>
          </div>
        </div>
        <div className="rounded-2xl border border-muted/50 bg-background px-3 py-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Facebook Pages</p>
            <Badge variant={getSurfaceStatusVariant(facebookStatus)} className="rounded-full px-2 py-0.5 text-[10px]">{getSurfaceStatusLabel(facebookStatus, facebookCount)}</Badge>
          </div>
          <p className="mt-2 text-sm text-foreground">{facebookCount > 0 ? `${facebookCount} Pages discovered from the selected Meta source.` : sourceSelectionRequired ? 'Choose a source before Pages can load.' : 'Pages have not surfaced yet from this source.'}</p>
        </div>
        <div className="rounded-2xl border border-muted/50 bg-background px-3 py-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Instagram Profiles</p>
            <Badge variant={getSurfaceStatusVariant(instagramStatus)} className="rounded-full px-2 py-0.5 text-[10px]">{getSurfaceStatusLabel(instagramStatus, instagramCount)}</Badge>
          </div>
          <p className="mt-2 text-sm text-foreground">{instagramCount > 0 ? `${instagramCount} business profile${instagramCount === 1 ? '' : 's'} discovered from the selected Meta source.` : sourceSelectionRequired ? 'Choose a source before Instagram can load.' : 'Instagram profiles have not surfaced yet from this source.'}</p>
        </div>
      </div>

      {setupState.switchSourceRecommended && setupState.switchSourceMessage ? (
        <div className="mt-4 rounded-2xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-sm text-foreground">
          <div className="flex items-start gap-3">
            <ArrowRightLeft className="mt-0.5 h-4 w-4 text-amber-600" />
            <div className="space-y-1">
              <p className="font-medium">This may be the wrong Meta source for this workspace.</p>
              <p className="text-muted-foreground">{setupState.switchSourceMessage}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function SocialsMetaSourceSwitcherCard(props: {
  title: string
  description: string
  selectedMetaAccountId: string
  selectedSourceLabel: string | null | undefined
  metaAccountOptions: Array<{ id: string; name: string }>
  loadingMetaAccountOptions: boolean
  initializingMeta: boolean
  onReloadAccounts: () => void
  onSelectAccount: (accountId: string) => void
  onConfirmSource: () => void
  confirmationLabel: string
}) {
  const {
    title,
    description,
    selectedMetaAccountId,
    selectedSourceLabel,
    metaAccountOptions,
    loadingMetaAccountOptions,
    initializingMeta,
    onReloadAccounts,
    onSelectAccount,
    onConfirmSource,
    confirmationLabel,
  } = props

  const currentSourceLabel =
    metaAccountOptions.find((option) => option.id === selectedMetaAccountId)?.name ??
    selectedSourceLabel ??
    null

  return (
    <div className="rounded-3xl border border-dashed border-primary/25 bg-primary/[0.03] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.18em]">
              Meta source
            </Badge>
            {currentSourceLabel ? (
              <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-[10px]">
                Current: {currentSourceLabel}
              </Badge>
            ) : null}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onReloadAccounts} disabled={loadingMetaAccountOptions}>
          {loadingMetaAccountOptions ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Reload sources
        </Button>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select
          value={selectedMetaAccountId}
          onValueChange={onSelectAccount}
          disabled={loadingMetaAccountOptions || metaAccountOptions.length === 0}
        >
          <SelectTrigger className="w-full rounded-2xl border-muted/60 bg-background sm:max-w-md">
            <SelectValue placeholder={loadingMetaAccountOptions ? 'Loading sources…' : 'Choose a Meta source'} />
          </SelectTrigger>
          <SelectContent>
            {metaAccountOptions.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="button" size="sm" onClick={onConfirmSource} disabled={initializingMeta || !selectedMetaAccountId}>
          {initializingMeta ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRightLeft className="mr-2 h-4 w-4" />}
          {confirmationLabel}
        </Button>
      </div>
    </div>
  )
}

export function SocialsSurfaceInventoryCard(props: {
  title: string
  connected: boolean
  loading: boolean
  error: string | null
  count: number
  status: SocialsSurfaceStatus
  emptyConnectedMessage: string
  emptyDisconnectedMessage: string
  onRetry: () => void
  items: Array<{ id: string; name: string; subtitle: string }>
}) {
  const {
    title,
    connected,
    loading,
    error,
    count,
    status,
    emptyConnectedMessage,
    emptyDisconnectedMessage,
    onRetry,
    items,
  } = props

  return (
    <div className="rounded-3xl border border-muted/50 bg-background p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[10px]">
          {getSurfaceStatusLabel(status, count)}
        </Badge>
      </div>

      {error ? (
        <NetworkErrorEmptyState
          variant="card"
          title={`Unable to load ${title.toLowerCase()}`}
          description={error}
          action={{ label: 'Retry discovery', onClick: onRetry, icon: RefreshCw }}
          className="rounded-2xl px-4 py-6"
        />
      ) : items.length > 0 ? (
        <div className="space-y-2">
          {items.slice(0, 3).map((item) => (
            <div key={item.id} className="rounded-2xl border border-muted/50 bg-muted/[0.04] px-3 py-2">
              <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.subtitle}</p>
            </div>
          ))}
        </div>
      ) : loading ? (
        <div className="space-y-2">{[0, 1, 2].map((slot) => <Skeleton key={slot} className="h-14 w-full rounded-2xl" />)}</div>
      ) : (
        <EmptyState
          icon={connected ? CheckCircle2 : CopyPlus}
          title={status === 'source_required' ? `Choose a Meta source to load ${title.toLowerCase()}` : connected ? `No ${title.toLowerCase()} surfaced yet` : `Connect Meta to load ${title.toLowerCase()}`}
          description={connected ? emptyConnectedMessage : emptyDisconnectedMessage}
          action={connected && status !== 'source_required' ? { label: 'Retry discovery', onClick: onRetry, icon: RefreshCw } : undefined}
          variant="card"
          className="rounded-2xl px-4 py-6"
        />
      )}
    </div>
  )
}