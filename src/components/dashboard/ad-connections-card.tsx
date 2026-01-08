'use client'

import { memo, useCallback, useMemo } from 'react'
import { type LucideIcon, RefreshCw } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface ProviderConfig {
  id: string
  name: string
  description: string
  icon: LucideIcon
  connect?: () => Promise<void>
  mode?: 'direct' | 'oauth'
}

interface AdConnectionsCardProps {
  providers: ProviderConfig[]
  connectedProviders: Record<string, boolean>
  connectingProvider: string | null
  connectionErrors: Record<string, string>
  onConnect: (providerId: string, connect: () => Promise<void>) => Promise<void> | void
  onDisconnect: (providerId: string) => Promise<void> | void
  onOauthRedirect?: (providerId: string) => Promise<void> | void
  onRefresh: () => void
  refreshing: boolean
}

export function AdConnectionsCard({
  providers,
  connectedProviders,
  connectingProvider,
  connectionErrors,
  onConnect,
  onDisconnect,
  onOauthRedirect,
  onRefresh,
  refreshing,
}: AdConnectionsCardProps) {
  const providerStates = useMemo(
    () =>
      providers.map((provider) => ({
        provider,
        isConnecting: connectingProvider === provider.id,
        isConnected: Boolean(connectedProviders[provider.id]),
        error: connectionErrors[provider.id],
      })),
    [connectedProviders, connectionErrors, connectingProvider, providers]
  )

  const handlePrimaryAction = useCallback(
    (provider: ProviderConfig, isConnected: boolean) => {
      if (isConnected) {
        if (provider.mode === 'oauth') {
          void onOauthRedirect?.(provider.id)
          return
        }
        if (provider.connect) {
          void onConnect(provider.id, provider.connect)
        }
        return
      }

      if (provider.mode === 'oauth') {
        void onOauthRedirect?.(provider.id)
        return
      }

      if (!provider.connect) {
        return
      }

      void onConnect(provider.id, provider.connect)
    },
    [onConnect, onOauthRedirect]
  )

  const handleDisconnect = useCallback(
    (providerId: string) => {
      void onDisconnect(providerId)
    },
    [onDisconnect]
  )

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-lg">Ad platform connections</CardTitle>
          <CardDescription>
            Connect your paid media accounts to import spend, conversions, and creative performance into Cohorts.
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
          <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} /> Refresh status
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {providerStates.map((state) => (
            <ProviderCard
              key={state.provider.id}
              state={state}
              onPrimaryAction={handlePrimaryAction}
              onDisconnect={handleDisconnect}
            />
          ))}
        </div>

        <div className="space-y-2 text-xs text-muted-foreground">
          <Separator />
          <p>
            After connecting, Cohorts will queue an initial data sync covering the last 90 days of performance. You can
            review sync status from the Integrations settings page.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

type ProviderState = {
  provider: ProviderConfig
  isConnected: boolean
  isConnecting: boolean
  error?: string
}

const ProviderCard = memo(function ProviderCard({
  state,
  onPrimaryAction,
  onDisconnect,
}: {
  state: ProviderState
  onPrimaryAction: (provider: ProviderConfig, isConnected: boolean) => void
  onDisconnect: (providerId: string) => void
}) {
  const { provider, isConnected, isConnecting, error } = state
  const Icon = provider.icon

  const handlePrimaryClick = useCallback(() => {
    onPrimaryAction(provider, isConnected)
  }, [isConnected, onPrimaryAction, provider])

  const handleDisconnectClick = useCallback(() => {
    onDisconnect(provider.id)
  }, [onDisconnect, provider.id])

  return (
    <Card className="border-muted/70 bg-background shadow-sm">
      <CardHeader className="space-y-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <CardTitle className="text-base">{provider.name}</CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            {provider.description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-xs">
          <Badge variant={isConnected ? 'default' : 'outline'} className="rounded-full">
            {isConnected ? 'Connected' : 'Not connected'}
          </Badge>
          {isConnecting && <span className="text-muted-foreground">Connecting…</span>}
        </div>
        {error && (
          <Alert variant="destructive" className="text-xs">
            <AlertTitle>Connection failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex gap-2">
          <Button
            type="button"
            className="flex-1"
            variant={isConnected ? 'outline' : 'default'}
            disabled={isConnecting}
            onClick={handlePrimaryClick}
          >
            {isConnected ? 'Reconnect' : `Connect ${provider.name}`}
          </Button>
          {isConnected && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              disabled={isConnecting}
              onClick={handleDisconnectClick}
              title="Disconnect account"
            >
              <span className="sr-only">Disconnect</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
})
