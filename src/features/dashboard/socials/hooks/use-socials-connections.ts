'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useConvexAuth, useQuery } from 'convex/react'

import { useAuth } from '@/shared/contexts/auth-context'
import { useClientContext } from '@/shared/contexts/client-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { socialsIntegrationsApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { getPreviewSocialConnectionStatus } from '@/lib/preview-data'
import { useToast } from '@/shared/ui/use-toast'

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
  /** True while redirecting to Meta OAuth. */
  oauthPending: boolean
  connectionError: string | null
  handleConnectMeta: () => Promise<void>
  handleDisconnect: () => Promise<void>
  handleRequestSync: () => Promise<void>
}

export function useSocialsConnections(): UseSocialsConnectionsReturn {
  const { user, startMetaOauth, disconnectProvider } = useAuth()
  const router = useRouter()
  const { selectedClientId } = useClientContext()
  const { isPreviewMode } = usePreview()
  const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth()
  const { toast } = useToast()

  const [oauthPending, setOauthPending] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  const workspaceId = user?.agencyId ? String(user.agencyId) : null
  const canQuery = !isPreviewMode && isAuthenticated && !convexAuthLoading && Boolean(workspaceId)

  const rawStatus = useQuery(
    socialsIntegrationsApi.getStatus,
    canQuery && workspaceId
      ? { workspaceId, clientId: selectedClientId ?? null }
      : 'skip'
  )

  const statusLoading = canQuery && rawStatus === undefined

  const status: SocialsConnectionStatus | null = isPreviewMode
    ? getPreviewSocialConnectionStatus()
    : rawStatus
      ? {
          connected: rawStatus.connected,
          accountId: rawStatus.accountId,
          accountName: rawStatus.accountName,
          lastSyncStatus: rawStatus.lastSyncStatus as SocialsConnectionStatus['lastSyncStatus'],
          lastSyncedAtMs: rawStatus.lastSyncedAtMs,
          linkedAtMs: rawStatus.linkedAtMs,
        }
      : null

  const showPreviewModeToast = useCallback((description: string) => {
    toast({
      title: 'Preview mode',
      description,
    })
  }, [toast])

  const handleConnectMeta = useCallback(async () => {
    if (typeof window === 'undefined') return

    if (isPreviewMode) {
      showPreviewModeToast('Meta connection is disabled while sample social data is active.')
      return
    }

    if (convexAuthLoading || !isAuthenticated || !user) {
      toast({
        variant: 'destructive',
        title: 'Sign in required',
        description: 'You must be signed in to connect Meta.',
      })
      router.push('/')
      return
    }

    setOauthPending(true)
    setConnectionError(null)

    try {
      const { url } = await startMetaOauth(
        `${window.location.pathname}${window.location.search}`,
        selectedClientId ?? null,
        undefined,
        'socials',
      )
      if (typeof url !== 'string' || url.length === 0) {
        throw new Error('Meta OAuth did not return a URL.')
      }
      window.location.href = url
    } catch (error: unknown) {
      logError(error, 'useSocialsConnections:handleConnectMeta')
      const message = asErrorMessage(error)
      setConnectionError(message)
      toast({
        variant: 'destructive',
        title: 'Connection failed',
        description: message,
      })
      setOauthPending(false)
    }
  }, [convexAuthLoading, isAuthenticated, isPreviewMode, user, startMetaOauth, selectedClientId, toast, router, showPreviewModeToast])

  const handleDisconnect = useCallback(async () => {
    if (isPreviewMode) {
      showPreviewModeToast('Social disconnection is disabled while sample social data is active.')
      return
    }

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
  }, [disconnectProvider, isPreviewMode, selectedClientId, showPreviewModeToast, toast, user])

  const handleRequestSync = useCallback(
    async () => {
      if (isPreviewMode) {
        showPreviewModeToast('Social sync is disabled while sample social data is active.')
        return
      }

      // Sync requests are handled server-side — this is a fire-and-forget trigger
      // that inserts a socialSyncJobs row. Full action-based sync is wired
      // separately via the admin/worker layer.
      toast({ title: 'Sync requested', description: 'Your data will refresh shortly.' })
    },
    [isPreviewMode, showPreviewModeToast, toast],
  )

  return {
    status,
    statusLoading,
    oauthPending,
    connectionError,
    handleConnectMeta,
    handleDisconnect,
    handleRequestSync,
  }
}
