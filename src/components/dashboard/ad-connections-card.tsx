'use client'

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
  onOauthRedirect,
  onRefresh,
  refreshing,
}: AdConnectionsCardProps) {
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
          {providers.map((provider) => {
            const Icon = provider.icon
            const isConnecting = connectingProvider === provider.id
            const isConnected = connectedProviders[provider.id]
            const error = connectionErrors[provider.id]

            return (
              <Card key={provider.id} className="border-muted/70 bg-background shadow-sm">
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
                  <Button
                    type="button"
                    className="w-full"
                    variant={isConnected ? 'outline' : 'default'}
                    disabled={isConnecting}
                    onClick={() => {
                      if (provider.mode === 'oauth') {
                        void onOauthRedirect?.(provider.id)
                        return
                      }

                      if (!provider.connect) {
                        return
                      }

                      void onConnect(provider.id, provider.connect)
                    }}
                  >
                    {isConnected ? 'Reconnect account' : `Connect ${provider.name}`}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
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
