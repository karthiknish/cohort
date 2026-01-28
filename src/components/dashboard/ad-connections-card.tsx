'use client'

import { memo, useCallback, useMemo, useState } from 'react'
import { type LucideIcon, RefreshCw, Check, Clock, AlertTriangle, Loader2, Unlink } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import {
  ConnectionDialog,
  DisconnectDialog,
  type ConnectionStep
} from '@/app/dashboard/ads/components/connection-dialog'
import { PROVIDER_INFO, type ProviderInfo } from '@/app/dashboard/ads/components/constants'

// =============================================================================
// TYPES
// =============================================================================

interface ProviderConfig {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  connect?: () => Promise<void>
  mode?: 'direct' | 'oauth'
}

interface IntegrationStatusInfo {
  lastSyncedAt?: string | null
  lastSyncRequestedAt?: string | null
  status?: string
  accountId?: string | null
  accountName?: string | null
}

interface AdConnectionsCardProps {
  providers: ProviderConfig[]
  connectedProviders: Record<string, boolean>
  connectingProvider: string | null
  connectionErrors: Record<string, string>
  integrationStatuses?: Record<string, IntegrationStatusInfo>
  onConnect: (providerId: string, connect: () => Promise<void>) => Promise<void> | void
  onDisconnect: (providerId: string) => Promise<void> | void
  onOauthRedirect?: (providerId: string) => Promise<void> | void
  onRefresh: () => void
  refreshing: boolean
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatLastSync(dateString: string | null | undefined): string {
  if (!dateString) return 'Never synced'

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString()
}

function getStatusBadgeVariant(status: string | undefined, isConnected: boolean): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (!isConnected) return 'outline'
  if (status === 'error') return 'destructive'
  if (status === 'pending') return 'secondary'
  return 'default'
}

function getStatusLabel(status: string | undefined, isConnected: boolean): string {
  if (!isConnected) return 'Not connected'
  if (status === 'error') return 'Sync failed'
  if (status === 'pending') return 'Syncing...'
  return 'Connected'
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function AdConnectionsCard({
  providers,
  connectedProviders,
  connectingProvider,
  connectionErrors,
  integrationStatuses = {},
  onConnect,
  onDisconnect,
  onOauthRedirect,
  onRefresh,
  refreshing,
}: AdConnectionsCardProps) {
  // Dialog state
  const [connectDialogOpen, setConnectDialogOpen] = useState(false)
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<ProviderConfig | null>(null)
  const [connectionStep, setConnectionStep] = useState<ConnectionStep>('idle')
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const providerStates = useMemo(
    () =>
      providers.map((provider) => ({
        provider,
        isConnecting: connectingProvider === provider.id,
        isConnected: Boolean(connectedProviders[provider.id]),
        error: connectionErrors[provider.id],
        statusInfo: integrationStatuses[provider.id],
      })),
    [connectedProviders, connectionErrors, connectingProvider, providers, integrationStatuses]
  )

  // Handle opening connection dialog
  const handleOpenConnectDialog = useCallback((provider: ProviderConfig) => {
    setSelectedProvider(provider)
    setConnectionStep('idle')
    setConnectDialogOpen(true)
  }, [])

  // Handle connection from dialog
  const handleDialogConnect = useCallback(async () => {
    if (!selectedProvider) return

    setConnectionStep('redirecting')

    try {
      if (selectedProvider.mode === 'oauth') {
        // For OAuth redirect flow, we just need to start the redirect
        await onOauthRedirect?.(selectedProvider.id)
        // The page will redirect, so we don't need to update state
      } else if (selectedProvider.connect) {
        // For popup flow, show progress through steps
        setConnectionStep('authenticating')
        await onConnect(selectedProvider.id, selectedProvider.connect)
        setConnectionStep('fetching')
        // Small delay to show the fetching step before completion
        await new Promise((resolve) => setTimeout(resolve, 500))
        setConnectionStep('complete')
      }
    } catch {
      // Error will be shown in the dialog via connectionErrors prop
      setConnectionStep('error')
    }
  }, [selectedProvider, onConnect, onOauthRedirect])

  // Handle retry
  const handleRetry = useCallback(() => {
    setConnectionStep('idle')
  }, [])

  // Handle opening disconnect dialog
  const handleOpenDisconnectDialog = useCallback((provider: ProviderConfig) => {
    setSelectedProvider(provider)
    setDisconnectDialogOpen(true)
  }, [])

  // Handle disconnect confirmation
  const handleConfirmDisconnect = useCallback(async () => {
    if (!selectedProvider) return

    setIsDisconnecting(true)
    try {
      await onDisconnect(selectedProvider.id)
    } finally {
      setIsDisconnecting(false)
      setDisconnectDialogOpen(false)
      setSelectedProvider(null)
    }
  }, [selectedProvider, onDisconnect])

  // Handle quick reconnect (no dialog)
  const handleQuickReconnect = useCallback(
    (provider: ProviderConfig) => {
      if (provider.mode === 'oauth') {
        void onOauthRedirect?.(provider.id)
      } else if (provider.connect) {
        void onConnect(provider.id, provider.connect)
      }
    },
    [onConnect, onOauthRedirect]
  )

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-lg">Ad platform connections</CardTitle>
            <CardDescription>
              Connect your paid media accounts to import spend, conversions, and creative performance.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2"
          >
            <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {providerStates.map((state) => (
              <ProviderCard
                key={state.provider.id}
                state={state}
                onConnect={handleOpenConnectDialog}
                onReconnect={handleQuickReconnect}
                onDisconnect={handleOpenDisconnectDialog}
              />
            ))}
          </div>

          <div className="space-y-2 text-xs text-muted-foreground">
            <Separator />
            <p>
              After connecting, we&apos;ll sync your last 90 days of performance data automatically.
              Future syncs happen daily to keep your data fresh.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Connection Dialog */}
      <ConnectionDialog
        open={connectDialogOpen}
        onOpenChange={setConnectDialogOpen}
        providerId={selectedProvider?.id ?? null}
        providerIcon={selectedProvider?.icon}
        onConnect={handleDialogConnect}
        isConnecting={connectingProvider === selectedProvider?.id}
        connectionStep={connectionStep}
        error={selectedProvider ? (connectionErrors[selectedProvider.id] ?? null) : null}
        onRetry={handleRetry}
      />

      {/* Disconnect Confirmation Dialog */}
      <DisconnectDialog
        open={disconnectDialogOpen}
        onOpenChange={setDisconnectDialogOpen}
        providerName={selectedProvider?.name ?? ''}
        onConfirm={handleConfirmDisconnect}
        isDisconnecting={isDisconnecting}
      />
    </>
  )
}

// =============================================================================
// PROVIDER CARD COMPONENT
// =============================================================================

type ProviderState = {
  provider: ProviderConfig
  isConnected: boolean
  isConnecting: boolean
  error?: string
  statusInfo?: IntegrationStatusInfo
}

const ProviderCard = memo(function ProviderCard({
  state,
  onConnect,
  onReconnect,
  onDisconnect,
}: {
  state: ProviderState
  onConnect: (provider: ProviderConfig) => void
  onReconnect: (provider: ProviderConfig) => void
  onDisconnect: (provider: ProviderConfig) => void
}) {
  const { provider, isConnected, isConnecting, error, statusInfo } = state
  const Icon = provider.icon
  const providerInfo = PROVIDER_INFO[provider.id as keyof typeof PROVIDER_INFO]

  const handleConnectClick = useCallback(() => {
    onConnect(provider)
  }, [onConnect, provider])

  const handleReconnectClick = useCallback(() => {
    onReconnect(provider)
  }, [onReconnect, provider])

  const handleDisconnectClick = useCallback(() => {
    onDisconnect(provider)
  }, [onDisconnect, provider])

  const statusVariant = getStatusBadgeVariant(statusInfo?.status, isConnected)
  const statusLabel = getStatusLabel(statusInfo?.status, isConnected)
  const lastSyncLabel = formatLastSync(statusInfo?.lastSyncedAt)
  const accountLabel =
    typeof statusInfo?.accountName === 'string' && statusInfo.accountName.length > 0
      ? statusInfo.accountName
      : typeof statusInfo?.accountId === 'string' && statusInfo.accountId.length > 0
        ? statusInfo.accountId
        : null

  const theme = (providerInfo as ProviderInfo | undefined)?.theme

  return (
    <Card className={cn(
      'relative overflow-hidden border-muted/70 bg-background shadow-sm transition-all',
      isConnected && (theme?.border || 'border-primary/20'),
      error && 'border-destructive/30',
      !isConnected && 'hover:border-muted-foreground/30 opacity-90 hover:opacity-100'
    )}>
      {/* Status indicator bar */}
      {isConnected && (
        <div className={cn(
          'absolute left-0 top-0 h-1 w-full',
          statusInfo?.status === 'error' && 'bg-destructive',
          statusInfo?.status === 'pending' && 'bg-amber-400',
          statusInfo?.status !== 'error' && statusInfo?.status !== 'pending' && (theme?.indicator || 'bg-primary')
        )} />
      )}

      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between">
          <span className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl transition-all shadow-sm',
            theme?.bg || (isConnected ? 'bg-primary/10' : 'bg-muted'),
            theme?.color || (isConnected ? 'text-primary' : 'text-muted-foreground')
          )}>
            <Icon className="h-6 w-6" />
          </span>
          {isConnecting && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        <div>
          <CardTitle className="text-base">{provider.name}</CardTitle>
          <CardDescription className="mt-1 line-clamp-2 text-xs">
            {providerInfo?.description ?? provider.description}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {/* Status badge and last sync */}
        <div className="flex items-center justify-between">
          <Badge variant={statusVariant} className="rounded-full text-xs">
            {statusInfo?.status === 'pending' && (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            )}
            {statusInfo?.status === 'error' && (
              <AlertTriangle className="mr-1 h-3 w-3" />
            )}
            {isConnected && statusInfo?.status !== 'error' && statusInfo?.status !== 'pending' && (
              <Check className="mr-1 h-3 w-3" />
            )}
            {statusLabel}
          </Badge>
          {isConnected && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {lastSyncLabel}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Last successful sync</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Error message */}
        {error && (
          <Alert variant="destructive" className="py-2">
            <AlertTriangle className="h-3 w-3" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {/* Connected account label */}
        {isConnected && accountLabel && (
          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground/80">Account:</span>{' '}
            <span className="truncate">{accountLabel}</span>
          </div>
        )}

        {/* Sync error message from status */}
        {statusInfo?.status === 'error' && !error && (
          <Alert variant="destructive" className="py-2">
            <AlertTriangle className="h-3 w-3" />
            <AlertDescription className="text-xs">
              Last sync failed. Click reconnect to retry.
            </AlertDescription>
          </Alert>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          {!isConnected ? (
            <Button
              type="button"
              className="flex-1"
              size="sm"
              disabled={isConnecting}
              onClick={handleConnectClick}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect'
              )}
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                disabled={isConnecting}
                onClick={handleReconnectClick}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Reconnect'
                )}
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      disabled={isConnecting}
                      onClick={handleDisconnectClick}
                    >
                      <Unlink className="h-4 w-4" />
                      <span className="sr-only">Disconnect</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Disconnect {provider.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
})
