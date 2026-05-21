'use client'

import Link from 'next/link'
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Facebook,
  Instagram,
  LoaderCircle,
  RefreshCw,
  Shield,
  Unplug,
} from 'lucide-react'
import { useCallback, useMemo } from 'react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { DASHBOARD_THEME, getBadgeClasses, getButtonClasses } from '@/lib/dashboard-theme'
import { cn } from '@/lib/utils'

type SocialsConnectionPanelProps = {
  panelId?: string
  selectedClientName: string | null
  connected: boolean
  setupComplete: boolean
  accountName: string | null | undefined
  lastSyncedAtMs: number | null | undefined
  lastSyncStatus: 'never' | 'pending' | 'success' | 'error' | null | undefined
  oauthPending: boolean
  syncPending: boolean
  connectionError: string | null
  onConnectMeta: () => Promise<void>
  onDisconnect: () => Promise<void>
  onRequestSync: () => void
}

const SETUP_STEPS = [
  { id: 'connect', label: 'Connect Meta' },
  { id: 'page', label: 'Pick a Page' },
  { id: 'sync', label: 'Sync metrics' },
] as const

function formatLastSync(ms: number | null | undefined): string {
  if (!ms) return 'No sync yet'
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(ms))
}

function ConnectionStatusBadge({
  connected,
  setupComplete,
  syncPending,
  lastSyncStatus,
}: {
  connected: boolean
  setupComplete: boolean
  syncPending: boolean
  lastSyncStatus: SocialsConnectionPanelProps['lastSyncStatus']
}) {
  if (!connected) {
    return <Badge className={getBadgeClasses('secondary')}>Not connected</Badge>
  }

  if (syncPending || lastSyncStatus === 'pending') {
    return <Badge className={getBadgeClasses('primary')}>Syncing…</Badge>
  }

  if (!setupComplete) {
    return <Badge className={getBadgeClasses('warning')}>Page setup required</Badge>
  }

  if (lastSyncStatus === 'error') {
    return <Badge className={getBadgeClasses('destructive')}>Sync failed</Badge>
  }

  return <Badge className={getBadgeClasses('success')}>Connected</Badge>
}

function SetupStepper({
  connected,
  setupComplete,
  hasSynced,
}: {
  connected: boolean
  setupComplete: boolean
  hasSynced: boolean
}) {
  const activeIndex = !connected ? 0 : !setupComplete ? 1 : hasSynced ? 2 : 1

  return (
    <ol className="flex flex-wrap items-center gap-2 sm:gap-3" aria-label="Organic social setup steps">
      {SETUP_STEPS.map((step, index) => {
        const complete = index < activeIndex || (index === 2 && hasSynced)
        const current = index === activeIndex && !complete

        return (
          <li key={step.id} className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition-colors',
                  complete && 'border-success/30 bg-success/10 text-success',
                  current && 'border-primary/30 bg-primary/10 text-primary',
                  !complete && !current && 'border-muted/60 bg-muted/30 text-muted-foreground',
                )}
                aria-hidden
              >
                {complete ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-2 w-2 fill-current" />}
              </span>
              <span
                className={cn(
                  'text-xs font-medium sm:text-sm',
                  complete || current ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
            </div>
            {index < SETUP_STEPS.length - 1 ? (
              <span className="hidden h-px w-6 bg-border sm:block" aria-hidden />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

export function SocialsConnectionPanel({
  panelId,
  selectedClientName,
  connected,
  setupComplete,
  accountName,
  lastSyncedAtMs,
  lastSyncStatus,
  oauthPending,
  syncPending,
  connectionError,
  onConnectMeta,
  onDisconnect,
  onRequestSync,
}: SocialsConnectionPanelProps) {
  const handleConnectMeta = useCallback(() => {
    void onConnectMeta()
  }, [onConnectMeta])

  const handleDisconnect = useCallback(() => {
    void onDisconnect()
  }, [onDisconnect])

  const hasSynced = Boolean(lastSyncedAtMs)
  const syncLabel = useMemo(() => {
    if (syncPending || lastSyncStatus === 'pending') return 'Sync in progress…'
    return formatLastSync(lastSyncedAtMs)
  }, [lastSyncedAtMs, lastSyncStatus, syncPending])

  const canSync = connected && setupComplete && !oauthPending && !syncPending

  return (
    <div id={panelId} className="space-y-3">
      <Card className={cn('overflow-hidden border-muted/50 shadow-sm', DASHBOARD_THEME.cards.base)}>
        <CardContent className="space-y-5 p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 gap-4">
              <div className="flex shrink-0 flex-col gap-1.5 rounded-2xl border border-muted/40 bg-linear-to-br from-info/5 via-background to-accent/5 p-2.5">
                <div className={cn(DASHBOARD_THEME.icons.container, 'h-11 w-11 bg-info/10 text-info border-info/20')}>
                  <Facebook className="h-5 w-5" aria-hidden />
                </div>
                <div className={cn(DASHBOARD_THEME.icons.container, 'h-11 w-11 bg-accent/10 text-accent border-accent/20')}>
                  <Instagram className="h-5 w-5" aria-hidden />
                </div>
              </div>

              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">Organic social (Meta)</h2>
                  <ConnectionStatusBadge
                    connected={connected}
                    setupComplete={setupComplete}
                    syncPending={syncPending}
                    lastSyncStatus={lastSyncStatus}
                  />
                </div>
                <p className="max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
                  Pull organic reach and engagement from Facebook Pages and linked Instagram profiles. This is
                  separate from{' '}
                  <Link href="/dashboard/ads" className="font-medium text-primary underline-offset-4 hover:underline">
                    Meta Ads
                  </Link>{' '}
                  in Ad Manager.
                </p>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleConnectMeta}
              disabled={oauthPending}
              className={cn(getButtonClasses('primary'), 'w-full shrink-0 gap-2 shadow-sm lg:w-auto lg:min-w-[220px]')}
            >
              {oauthPending ? (
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Shield className="h-4 w-4" aria-hidden />
              )}
              {connected ? 'Reconnect with Meta' : 'Connect with Meta'}
            </Button>
          </div>

          <SetupStepper connected={connected} setupComplete={setupComplete} hasSynced={hasSynced} />

          <div className="flex flex-wrap gap-2">
            {selectedClientName ? (
              <Badge variant="outline" className={cn(DASHBOARD_THEME.badges.base, 'font-normal')}>
                Workspace · {selectedClientName}
              </Badge>
            ) : null}
            {accountName ? (
              <Badge variant="outline" className={cn(DASHBOARD_THEME.badges.base, 'font-normal')}>
                Authorized · {accountName}
              </Badge>
            ) : null}
            {connected ? (
              <Badge variant="outline" className={cn(DASHBOARD_THEME.badges.base, 'font-normal tabular-nums')}>
                {syncLabel}
              </Badge>
            ) : null}
          </div>

          {connectionError ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>{connectionError}</span>
            </div>
          ) : null}

          {connected && !setupComplete ? (
            <div className="flex items-start gap-2 rounded-xl border border-warning/20 bg-warning/5 px-3 py-2.5 text-sm text-foreground">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
              <p>
                Meta is connected. Choose a Facebook Page below to finish setup and unlock sync plus the Facebook and
                Instagram tabs.
              </p>
            </div>
          ) : null}

          {connected ? (
            <div className="flex flex-wrap items-center gap-2 border-t border-muted/40 pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRequestSync}
                disabled={!canSync}
                className={getButtonClasses('outline')}
              >
                <RefreshCw className={cn('mr-2 h-4 w-4', syncPending && 'animate-spin')} aria-hidden />
                Sync now
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                disabled={oauthPending}
                className={cn(getButtonClasses('outline'), 'text-destructive hover:bg-destructive/5 hover:text-destructive')}
              >
                <Unplug className="mr-2 h-4 w-4" aria-hidden />
                Disconnect
              </Button>
              {!setupComplete ? (
                <p className="w-full text-xs text-muted-foreground sm:w-auto sm:ml-auto">
                  Confirm a Page before syncing.
                </p>
              ) : null}
            </div>
          ) : (
            <p className="border-t border-muted/40 pt-4 text-xs text-muted-foreground">
              Connect with Meta to authorize Pages and start syncing organic metrics.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
