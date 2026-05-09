'use client'

import { Facebook, Instagram, LoaderCircle, RefreshCw, Shield, Unplug } from 'lucide-react'
import { useCallback } from 'react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { DASHBOARD_THEME, getBadgeClasses, getButtonClasses } from '@/lib/dashboard-theme'
import { cn } from '@/lib/utils'

type SocialsConnectionPanelProps = {
  panelId?: string
  selectedClientName: string | null
  connected: boolean
  accountName: string | null | undefined
  lastSyncedAtMs: number | null | undefined
  oauthPending: boolean
  connectionError: string | null
  onConnectMeta: () => Promise<void>
  onDisconnect: () => Promise<void>
  onRequestSync: () => void
}

function formatLastSync(ms: number | null | undefined): string {
  if (!ms) return 'Waiting for first sync'
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(ms))
}

export function SocialsConnectionPanel({
  panelId,
  selectedClientName,
  connected,
  accountName,
  lastSyncedAtMs,
  oauthPending,
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

  return (
    <div id={panelId} className="space-y-4">
      <Card className={cn('overflow-hidden border-muted/50 shadow-sm', DASHBOARD_THEME.cards.base)}>
        <CardHeader className={DASHBOARD_THEME.cards.header}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex gap-4">
              <div className="flex shrink-0 gap-1 rounded-2xl border border-muted/40 bg-muted/20 p-2">
                <div className={cn(DASHBOARD_THEME.icons.container, 'h-10 w-10 bg-info/10 text-info border-info/20')}>
                  <Facebook className="h-5 w-5" aria-hidden />
                </div>
                <div className={cn(DASHBOARD_THEME.icons.container, 'h-10 w-10 bg-accent/10 text-accent border-accent/20')}>
                  <Instagram className="h-5 w-5" aria-hidden />
                </div>
              </div>
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-lg">Meta connection</CardTitle>
                  <Badge className={connected ? getBadgeClasses('success') : getBadgeClasses('secondary')}>
                    {connected ? 'Connected' : 'Not connected'}
                  </Badge>
                </div>
                <CardDescription className="text-pretty text-sm leading-relaxed">
                  One Meta Business login covers <span className="font-medium text-foreground">Facebook Pages</span> and{' '}
                  <span className="font-medium text-foreground">Instagram business</span> organic metrics for this workspace, no
                  separate sign-ins.
                </CardDescription>
              </div>
            </div>
            <Button
              type="button"
              onClick={handleConnectMeta}
              disabled={oauthPending}
              className={cn(getButtonClasses('primary'), 'w-full shrink-0 gap-2 shadow-md lg:w-auto lg:min-w-[200px]')}
            >
              {oauthPending ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : <Shield className="h-4 w-4" aria-hidden />}
              {connected ? 'Reconnect with Meta' : 'Connect with Meta'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-5 pt-0">
          <div className="flex flex-wrap items-center gap-2">
            {selectedClientName ? (
              <Badge className={getBadgeClasses('primary')}>Workspace: {selectedClientName}</Badge>
            ) : null}
            {accountName ? <Badge className={getBadgeClasses('primary')}>Authorized as: {accountName}</Badge> : null}
            <Badge className={getBadgeClasses('secondary')}>{formatLastSync(lastSyncedAtMs)}</Badge>
          </div>

          {connectionError ? <p className="text-sm text-destructive">{connectionError}</p> : null}

          <div className="flex flex-wrap gap-2 border-t border-muted/30 pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRequestSync}
              disabled={!connected || oauthPending}
              className={getButtonClasses('outline')}
            >
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
              Request sync
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
              disabled={!connected || oauthPending}
              className={cn(getButtonClasses('outline'), 'text-destructive hover:text-destructive')}
            >
              <Unplug className="mr-2 h-4 w-4" aria-hidden />
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
