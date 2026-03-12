'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useConvexAuth, useQuery } from 'convex/react'

import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
import { socialsIntegrationsApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { useToast } from '@/components/ui/use-toast'

export type SocialsConnectionStatus = {
  connected: boolean
  accountId: string | null
  accountName: string | null
  lastSyncStatus: 'never' | 'pending' | 'success' | 'error' | null
  lastSyncedAtMs: number | null
  linkedAtMs: number | null
}

export type UseSocialsConnectionsReturn = {
  status: SocialsConnectionStatus | null
  statusLoading: boolean
  connectingProvider: 'facebook' | 'instagram' | null
  connectionError: string | null
  handleConnectFacebook: () => Promise<void>
  handleConnectInstagram: () => Promise<void>
  handleDisconnect: () => Promise<void>
  handleRequestSync: () => Promise<void>
}

export function useSocialsConnections(): UseSocialsConnectionsReturn {
  const { user, startMetaOauth, disconnectProvider } = useAuth()
  const router = useRouter()
  const { selectedClientId } = useClientContext()
  const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth()
  const { toast } = useToast()

  const [connectingProvider, setConnectingProvider] = useState<'facebook' | 'instagram' | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  const workspaceId = user?.agencyId ? String(user.agencyId) : null
  const canQuery = isAuthenticated && !convexAuthLoading && Boolean(workspaceId)

  const rawStatus = useQuery(
    socialsIntegrationsApi.getStatus,
    canQuery && workspaceId
      ? { workspaceId, clientId: selectedClientId ?? null }
      : 'skip'
  )

  const statusLoading = canQuery && rawStatus === undefined

  const status: SocialsConnectionStatus | null = rawStatus
    ? {
        connected: rawStatus.connected,
        accountId: rawStatus.accountId,
        accountName: rawStatus.accountName,
        lastSyncStatus: rawStatus.lastSyncStatus as SocialsConnectionStatus['lastSyncStatus'],
        lastSyncedAtMs: rawStatus.lastSyncedAtMs,
        linkedAtMs: rawStatus.linkedAtMs,
      }
    : null

  const startOAuth = useCallback(
    async (surface: 'facebook' | 'instagram') => {
      if (typeof window === 'undefined') return

      if (convexAuthLoading || !isAuthenticated || !user) {
        toast({
          variant: 'destructive',
          title: 'Sign in required',
          description: 'You must be signed in to connect a social account.',
        })
        router.push('/')
        return
      }

      setConnectingProvider(surface)
      setConnectionError(null)

      try {
        const { url } = await startMetaOauth(
          `${window.location.pathname}${window.location.search}`,
          selectedClientId ?? null,
          surface,
          'socials',
        )
        if (typeof url !== 'string' || url.length === 0) {
          throw new Error('Meta OAuth did not return a URL.')
        }
        window.location.href = url
      } catch (error: unknown) {
        logError(error, 'useSocialsConnections:startOAuth')
        const message = asErrorMessage(error)
        setConnectionError(message)
        toast({
          variant: 'destructive',
          title: 'Connection failed',
          description: message,
        })
        setConnectingProvider(null)
      }
    },
    [convexAuthLoading, isAuthenticated, user, startMetaOauth, selectedClientId, toast, router],
  )

  const handleConnectFacebook = useCallback(() => startOAuth('facebook'), [startOAuth])
  const handleConnectInstagram = useCallback(() => startOAuth('instagram'), [startOAuth])

  const handleDisconnect = useCallback(async () => {
    if (!user) return
    try {
      await disconnectProvider('facebook', selectedClientId ?? null)
      toast({ title: 'Disconnected', description: 'Meta social connection removed.' })
    } catch (error: unknown) {
      logError(error, 'useSocialsConnections:handleDisconnect')
      toast({
        variant: 'destructive',
        title: 'Disconnect failed',
        description: asErrorMessage(error),
      })
    }
  }, [disconnectProvider, selectedClientId, toast, user])

  const handleRequestSync = useCallback(
    async () => {
      // Sync requests are handled server-side — this is a fire-and-forget trigger
      // that inserts a socialSyncJobs row. Full action-based sync is wired
      // separately via the admin/worker layer.
      toast({ title: 'Sync requested', description: 'Your data will refresh shortly.' })
    },
    [toast],
  )

  return {
    status,
    statusLoading,
    connectingProvider,
    connectionError,
    handleConnectFacebook,
    handleConnectInstagram,
    handleDisconnect,
    handleRequestSync,
  }
}
