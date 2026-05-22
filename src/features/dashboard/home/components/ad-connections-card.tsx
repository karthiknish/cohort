'use client'

import { memo, useCallback, useMemo, useReducer } from 'react'
import { RefreshCw, Check, Clock, AlertTriangle, Loader2, Unlink, Link2 } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Separator } from '@/shared/ui/separator'
import { Progress } from '@/shared/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'
import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme'
import { cn } from '@/lib/utils'
import { MotionCard } from '@/shared/ui/motion-primitives'
import {
  ConnectionDialog,
  DisconnectDialog,
  type ConnectionStep
} from '@/features/dashboard/ads/components/connection-dialog'
import { PROVIDER_INFO, type ProviderInfo } from '@/features/dashboard/ads/components/constants'

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
  onDisconnect: (providerId: string, options?: { clearHistoricalData?: boolean }) => Promise<void> | void
  onOauthRedirect?: (providerId: string) => Promise<void> | void
  onSyncNow?: (providerId: string) => Promise<void> | void
  onRefresh: () => void
  refreshing: boolean
  syncingProviders?: Record<string, boolean>
  /** Optional summary for connection progress (e.g. 2 of 4). */
  connectedCount?: number
  totalProviders?: number
  pendingSetupCount?: number
}

const EMPTY_INTEGRATION_STATUSES: Record<string, IntegrationStatusInfo> = {}
const EMPTY_SYNCING_PROVIDERS: Record<string, boolean> = {}

// Sync requests older than this are considered stale (not actively running).
const STALE_SYNC_THRESHOLD_MS = 30 * 60 * 1000

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function isSyncStale(statusInfo: IntegrationStatusInfo | undefined): boolean {
  if (statusInfo?.status !== 'pending') return false
  const requestedAt = statusInfo.lastSyncRequestedAt
  if (!requestedAt) return false
  return Date.now() - new Date(requestedAt).getTime() > STALE_SYNC_THRESHOLD_MS
}

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

function getStatusBadgeVariant(
  status: string | undefined,
  isConnected: boolean,
  stale?: boolean
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (!isConnected) return 'outline'
  if (status === 'error' || stale) return 'destructive'
  if (status === 'pending') return 'secondary'
  return 'default'
}

function getStatusLabel(
  status: string | undefined,
  isConnected: boolean,
  stale?: boolean
): string {
  if (!isConnected) return 'Not connected'
  if (status === 'error') return 'Sync failed'
  if (status === 'pending') return stale ? 'Sync stalled' : 'Syncing...'
  return 'Connected'
}

// =============================================================================
// DIALOG STATE
// =============================================================================

type AdConnectionsDialogState = {
  connectDialogOpen: boolean
  disconnectDialogOpen: boolean
  selectedProvider: ProviderConfig | null
  connectionStep: ConnectionStep
  isDisconnecting: boolean
}

type AdConnectionsDialogAction =
  | { type: 'openConnectDialog'; provider: ProviderConfig }
  | { type: 'openDisconnectDialog'; provider: ProviderConfig }
  | { type: 'setConnectDialogOpen'; value: boolean }
  | { type: 'setDisconnectDialogOpen'; value: boolean }
  | { type: 'setConnectionStep'; value: ConnectionStep }
  | { type: 'startDisconnect' }
  | { type: 'finishDisconnect' }

function createInitialDialogState(): AdConnectionsDialogState {
  return {
    connectDialogOpen: false,
    disconnectDialogOpen: false,
    selectedProvider: null,
    connectionStep: 'idle',
    isDisconnecting: false,
  }
}

function adConnectionsDialogReducer(
  state: AdConnectionsDialogState,
  action: AdConnectionsDialogAction,
): AdConnectionsDialogState {
  switch (action.type) {
    case 'openConnectDialog':
      return {
        ...state,
        selectedProvider: action.provider,
        connectionStep: 'idle',
        connectDialogOpen: true,
      }
    case 'openDisconnectDialog':
      return {
        ...state,
        selectedProvider: action.provider,
        disconnectDialogOpen: true,
      }
    case 'setConnectDialogOpen':
      return { ...state, connectDialogOpen: action.value }
    case 'setDisconnectDialogOpen':
      return { ...state, disconnectDialogOpen: action.value }
    case 'setConnectionStep':
      return { ...state, connectionStep: action.value }
    case 'startDisconnect':
      return { ...state, isDisconnecting: true }
    case 'finishDisconnect':
      return {
        ...state,
        isDisconnecting: false,
        disconnectDialogOpen: false,
        selectedProvider: null,
      }
    default:
      return state
  }
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function AdConnectionsCard({
  providers,
  connectedProviders,
  connectingProvider,
  connectionErrors,
  integrationStatuses = EMPTY_INTEGRATION_STATUSES,
  onConnect,
  onDisconnect,
  onOauthRedirect,
  onSyncNow,
  onRefresh,
  refreshing,
  syncingProviders = EMPTY_SYNCING_PROVIDERS,
  connectedCount,
  totalProviders,
  pendingSetupCount = 0,
}: AdConnectionsCardProps) {
  const [dialogState, dispatch] = useReducer(adConnectionsDialogReducer, undefined, createInitialDialogState)
  const {
    connectDialogOpen,
    disconnectDialogOpen,
    selectedProvider,
    connectionStep,
    isDisconnecting,
  } = dialogState

  const providerStates = useMemo(
    () =>
      providers.map((provider) => ({
        provider,
        isConnecting: connectingProvider === provider.id,
        isConnected: Boolean(connectedProviders[provider.id]),
        error: connectionErrors[provider.id],
        statusInfo: integrationStatuses[provider.id],
        isSyncingNow: Boolean(syncingProviders[provider.id]),
      })),
    [connectedProviders, connectionErrors, connectingProvider, providers, integrationStatuses, syncingProviders]
  )

  // Handle opening connection dialog
  const handleOpenConnectDialog = useCallback((provider: ProviderConfig) => {
    dispatch({ type: 'openConnectDialog', provider })
  }, [])

  const handleDialogConnect = useCallback((): Promise<void> => {
    if (!selectedProvider) return Promise.resolve()

    dispatch({ type: 'setConnectionStep', value: 'redirecting' })

    if (selectedProvider.mode === 'oauth') {
      // For OAuth redirect flow, we just need to start the redirect.
      return Promise.resolve(onOauthRedirect?.(selectedProvider.id))
        .catch(() => {
          // Error will be shown in the dialog via connectionErrors prop.
          dispatch({ type: 'setConnectionStep', value: 'error' })
        })
    }

    if (!selectedProvider.connect) {
      return Promise.resolve()
    }

    // For popup flow, show progress through steps.
    dispatch({ type: 'setConnectionStep', value: 'authenticating' })
    return Promise.resolve(onConnect(selectedProvider.id, selectedProvider.connect))
      .then(() => {
        dispatch({ type: 'setConnectionStep', value: 'fetching' })
        return new Promise<void>((resolve) => setTimeout(resolve, 500))
      })
      .then(() => {
        dispatch({ type: 'setConnectionStep', value: 'complete' })
      })
      .catch(() => {
        // Error will be shown in the dialog via connectionErrors prop.
        dispatch({ type: 'setConnectionStep', value: 'error' })
      })
  }, [selectedProvider, onConnect, onOauthRedirect])

  const handleRetry = useCallback(() => {
    dispatch({ type: 'setConnectionStep', value: 'idle' })
  }, [])

  const handleOpenDisconnectDialog = useCallback((provider: ProviderConfig) => {
    dispatch({ type: 'openDisconnectDialog', provider })
  }, [])

  const handleConfirmDisconnect = useCallback((options: { clearHistoricalData: boolean }): Promise<void> => {
    if (!selectedProvider) return Promise.resolve()

    dispatch({ type: 'startDisconnect' })

    return Promise.resolve(onDisconnect(selectedProvider.id, options))
      .finally(() => {
        dispatch({ type: 'finishDisconnect' })
      })
  }, [selectedProvider, onDisconnect])

  const handleConnectDialogOpenChange = useCallback((value: boolean) => {
    dispatch({ type: 'setConnectDialogOpen', value })
  }, [])

  const handleDisconnectDialogOpenChange = useCallback((value: boolean) => {
    dispatch({ type: 'setDisconnectDialogOpen', value })
  }, [])

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

  const handleSyncNow = useCallback(
    (provider: ProviderConfig) => {
      void onSyncNow?.(provider.id)
    },
    [onSyncNow]
  )

  return (
    <>
      <MotionCard className={ADS_PAGE_THEME.surfaceCard}>
        <CardHeader className="flex flex-col gap-4 border-b border-border/50 pb-5 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-1.5">
            <p className={ADS_PAGE_THEME.sectionEyebrow}>Integrations</p>
            <CardTitle className="text-lg font-semibold tracking-tight">Ad platform connections</CardTitle>
            <CardDescription className="max-w-xl text-pretty leading-relaxed">
              OAuth into each network to import spend, conversions, and creative performance into this workspace.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex h-10 items-center gap-2 rounded-xl border-border/70"
          >
            <RefreshCw className={cn('size-4', refreshing && 'animate-spin')} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {typeof connectedCount === 'number' && typeof totalProviders === 'number' && totalProviders > 0 ? (
            <div className="rounded-2xl border border-primary/15 bg-primary/[0.04] p-4 ring-1 ring-primary/10">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Link2 className="size-4 text-primary" aria-hidden />
                  <span>
                    {connectedCount} of {totalProviders} platforms connected
                  </span>
                  {pendingSetupCount > 0 ? (
                    <Badge variant="secondary" className="font-normal">
                      {pendingSetupCount} need setup
                    </Badge>
                  ) : connectedCount < totalProviders ? (
                    <Badge variant="outline" className="font-normal">
                      {totalProviders - connectedCount} available
                    </Badge>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  Secure OAuth redirect — pick accounts after you return.
                </p>
              </div>
              <Progress
                value={Math.round((connectedCount / totalProviders) * 100)}
                className="h-2"
                aria-label="Connected ad platforms"
              />
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {providerStates.map((state) => (
              <ProviderCard
                key={state.provider.id}
                state={state}
                onConnect={handleOpenConnectDialog}
                onReconnect={handleQuickReconnect}
                onDisconnect={handleOpenDisconnectDialog}
                onSyncNow={handleSyncNow}
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
      </MotionCard>

      {/* Connection Dialog */}
      <ConnectionDialog
        open={connectDialogOpen}
        onOpenChange={handleConnectDialogOpenChange}
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
        onOpenChange={handleDisconnectDialogOpenChange}
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
  isSyncingNow?: boolean
  error?: string
  statusInfo?: IntegrationStatusInfo
}

const ProviderCard = memo(function ProviderCard({
  state,
  onConnect,
  onReconnect,
  onDisconnect,
  onSyncNow,
}: {
  state: ProviderState
  onConnect: (provider: ProviderConfig) => void
  onReconnect: (provider: ProviderConfig) => void
  onDisconnect: (provider: ProviderConfig) => void
  onSyncNow: (provider: ProviderConfig) => void
}) {
  const { provider, isConnected, isConnecting, isSyncingNow = false, error, statusInfo } = state
  const Icon = provider.icon
  const providerInfo = PROVIDER_INFO[provider.id as keyof typeof PROVIDER_INFO]

  const stale = isSyncStale(statusInfo)

  const handleConnectClick = useCallback(() => {
    onConnect(provider)
  }, [onConnect, provider])

  const handleReconnectClick = useCallback(() => {
    onReconnect(provider)
  }, [onReconnect, provider])

  const handleDisconnectClick = useCallback(() => {
    onDisconnect(provider)
  }, [onDisconnect, provider])

  const handleSyncNowClick = useCallback(() => {
    onSyncNow(provider)
  }, [onSyncNow, provider])

  const statusVariant = getStatusBadgeVariant(statusInfo?.status, isConnected, stale)
  const statusLabel = getStatusLabel(statusInfo?.status, isConnected, stale)
  const lastSyncLabel = formatLastSync(statusInfo?.lastSyncedAt)
  const accountLabel =
    typeof statusInfo?.accountName === 'string' && statusInfo.accountName.length > 0
      ? statusInfo.accountName
      : typeof statusInfo?.accountId === 'string' && statusInfo.accountId.length > 0
        ? statusInfo.accountId
        : null

  const theme = (providerInfo as ProviderInfo | undefined)?.theme

  return (
    <Card
      className={cn(
        ADS_PAGE_THEME.providerTile,
        'motion-chromatic',
        isConnected && (theme?.border || 'border-primary/25 ring-1 ring-primary/10'),
        error && 'border-destructive/40',
        !isConnected && 'opacity-95 hover:border-border hover:opacity-100',
      )}
    >
      {/* Status indicator bar */}
      {isConnected && (
        <div className={cn(
          'absolute left-0 top-0 h-1 w-full',
          (statusInfo?.status === 'error' || stale) && 'bg-destructive',
          statusInfo?.status === 'pending' && !stale && 'bg-warning',
          statusInfo?.status !== 'error' && statusInfo?.status !== 'pending' && !stale && (theme?.indicator || 'bg-primary')
        )} />
      )}

      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between">
          <span className={cn(
            'flex size-12 items-center justify-center rounded-xl motion-chromatic shadow-sm',
            theme?.bg || (isConnected ? 'bg-accent/10' : 'bg-muted'),
            theme?.color || (isConnected ? 'text-primary' : 'text-muted-foreground')
          )}>
            <Icon className="size-6" />
          </span>
          {isConnecting && (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
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
            {statusInfo?.status === 'pending' && !stale && (
              <Loader2 className="mr-1 size-3 animate-spin" />
            )}
            {(statusInfo?.status === 'error' || stale) && (
              <AlertTriangle className="mr-1 size-3" />
            )}
            {isConnected && statusInfo?.status !== 'error' && statusInfo?.status !== 'pending' && !stale && (
              <Check className="mr-1 size-3" />
            )}
            {statusLabel}
          </Badge>
          {isConnected && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />
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
            <AlertTriangle className="size-3" />
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
            <AlertTriangle className="size-3" />
            <AlertDescription className="text-xs">
              Last sync failed. Click reconnect to retry.
            </AlertDescription>
          </Alert>
        )}

        {/* Stale sync alert */}
        {stale && (
          <Alert variant="destructive" className="py-2">
            <AlertTriangle className="size-3" />
            <AlertDescription className="text-xs">
              Sync is taking longer than expected.
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
                  <Loader2 className="mr-2 size-3 animate-spin" />
                  Connecting…
                </>
              ) : (
                'Connect'
              )}
            </Button>
          ) : (
            <>
              {(stale || statusInfo?.status === 'error') ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  disabled={isSyncingNow}
                  onClick={handleSyncNowClick}
                >
                  {isSyncingNow ? (
                    <>
                      <Loader2 className="mr-2 size-3 animate-spin" />
                      Syncing…
                    </>
                  ) : (
                    'Sync now'
                  )}
                </Button>
              ) : (
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
                      <Loader2 className="mr-2 size-3 animate-spin" />
                      Connecting…
                    </>
                  ) : (
                    'Reconnect'
                  )}
                </Button>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      disabled={isConnecting}
                      onClick={handleDisconnectClick}
                    >
                      <Unlink className="size-4" />
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
