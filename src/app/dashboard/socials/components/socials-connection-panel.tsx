'use client'

import { ArrowRight, RefreshCw, Unplug } from 'lucide-react'
import { SiFacebook, SiInstagram, SiMeta } from 'react-icons/si'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DASHBOARD_THEME, getBadgeClasses, getButtonClasses } from '@/lib/dashboard-theme'
import { cn } from '@/lib/utils'

type SocialsConnectionPanelProps = {
  panelId?: string
  selectedClientName: string | null
  connected: boolean
  accountName: string | null | undefined
  lastSyncedAtMs: number | null | undefined
  connectingProvider: 'facebook' | 'instagram' | null
  connectionError: string | null
  onConnectFacebook: () => Promise<void>
  onConnectInstagram: () => Promise<void>
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
  connectingProvider,
  connectionError,
  onConnectFacebook,
  onConnectInstagram,
  onDisconnect,
  onRequestSync,
}: SocialsConnectionPanelProps) {
  const isConnecting = connectingProvider !== null

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
                  <Badge className={connected ? getBadgeClasses('success') : getBadgeClasses('secondary')}>
                    {connected ? 'Connected' : 'Not connected'}
                  </Badge>
                </div>
                <p className={DASHBOARD_THEME.stats.description}>
                  Organic reach, engagement, and follower growth for Facebook Pages.
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => void onConnectFacebook()}
              disabled={isConnecting}
              className={cn(getButtonClasses('primary'), 'w-full')}
            >
              <SiFacebook className="mr-2 h-4 w-4" />
              {connected ? 'Reconnect Facebook' : 'Connect Facebook'}
              <ArrowRight className="ml-auto h-4 w-4" />
            </Button>
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
                  <Badge className={connected ? getBadgeClasses('success') : getBadgeClasses('secondary')}>
                    {connected ? 'Connected' : 'Not connected'}
                  </Badge>
                </div>
                <p className={DASHBOARD_THEME.stats.description}>
                  Organic reach, engagement, and follower growth for Instagram business profiles.
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => void onConnectInstagram()}
              disabled={isConnecting}
              className={cn(getButtonClasses('primary'), 'w-full')}
            >
              <SiInstagram className="mr-2 h-4 w-4" />
              {connected ? 'Reconnect Instagram' : 'Connect Instagram'}
              <ArrowRight className="ml-auto h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ── Shared Meta Authorization ── */}
      <Card className={cn('overflow-hidden', DASHBOARD_THEME.cards.base)}>
        <CardHeader className={DASHBOARD_THEME.cards.header}>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(DASHBOARD_THEME.icons.container, 'h-10 w-10')}>
                <SiMeta className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Meta Authorization</CardTitle>
                <CardDescription>
                  One shared token powers both Facebook and Instagram organic data.
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={connected ? getBadgeClasses('success') : getBadgeClasses('warning')}>
                {connected ? 'Active' : 'Needs setup'}
              </Badge>
              <Badge className={getBadgeClasses('secondary')}>
                {formatLastSync(lastSyncedAtMs)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-center gap-2">
            {selectedClientName ? (
              <Badge className={getBadgeClasses('primary')}>
                Workspace: {selectedClientName}
              </Badge>
            ) : null}
            {accountName ? (
              <Badge className={getBadgeClasses('primary')}>
                Authorized as: {accountName}
              </Badge>
            ) : null}
          </div>

          {connectionError ? (
            <p className="text-sm text-destructive">{connectionError}</p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRequestSync}
              disabled={!connected}
              className={getButtonClasses('outline')}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Request sync
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
        </CardContent>
      </Card>
    </div>
  )
}
