'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAction, useConvexAuth, useMutation, useQuery } from 'convex/react'
import { Facebook, Linkedin, Music, Search } from 'lucide-react'

import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
import { usePreview } from '@/contexts/preview-context'
import { useToast } from '@/components/ui/use-toast'
import { getPreviewAdsIntegrationStatuses } from '@/lib/preview-data'
import { adsIntegrationsApi } from '@/lib/convex-api'
import { asErrorMessage } from '@/lib/convex-errors'


import type { AdPlatform, IntegrationStatus, IntegrationStatusResponse } from '../components/types'

import { formatProviderName } from '../components/utils'
  import {
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    TOAST_TITLES,
    PROVIDER_IDS,
  } from '../components/constants'


type ConvexIntegrationStatusRow = {
  providerId: string
  clientId: string | null
  accountId: string | null
  accountName: string | null
  lastSyncStatus: string | null
  lastSyncMessage: string | null
  lastSyncedAtMs: number | null
  lastSyncRequestedAtMs: number | null
  linkedAtMs: number | null
  autoSyncEnabled: boolean | null
  syncFrequencyMinutes: number | null
  scheduledTimeframeDays: number | null
}

// =============================================================================
// TYPES
// =============================================================================

export interface UseAdsConnectionsOptions {
  /** Callback when a refresh is triggered */
  onRefresh?: () => void
}

export interface IntegrationStatusInfo {
  lastSyncedAt?: string | null
  lastSyncRequestedAt?: string | null
  status?: string
  accountId?: string | null
  accountName?: string | null
}

export interface UseAdsConnectionsReturn {
  // State
  connectedProviders: Record<string, boolean>
  connectingProvider: string | null
  connectionErrors: Record<string, string>
  integrationStatuses: IntegrationStatusResponse | null
  integrationStatusMap: Record<string, IntegrationStatusInfo>
  automationStatuses: IntegrationStatus[]

  // Setup messages
  metaSetupMessage: string | null
  tiktokSetupMessage: string | null
  initializingMeta: boolean
  initializingTikTok: boolean
  metaNeedsAccountSelection: boolean
  tiktokNeedsAccountSelection: boolean

  // Actions
  handleConnect: (providerId: string, action: () => Promise<void>) => Promise<void>
  handleDisconnect: (providerId: string) => Promise<void>
  handleOauthRedirect: (providerId: string) => Promise<void>
  initializeMetaIntegration: (clientIdOverride?: string | null) => Promise<void>
  initializeTikTokIntegration: (clientIdOverride?: string | null) => Promise<void>

  // Platform definitions
  adPlatforms: AdPlatform[]

  // Trigger refresh
  triggerRefresh: () => void
}

// =============================================================================
// HOOK
// =============================================================================

export function useAdsConnections(options: UseAdsConnectionsOptions = {}): UseAdsConnectionsReturn {
  const { onRefresh } = options

  const {
    user,
    connectGoogleAdsAccount,
    connectLinkedInAdsAccount,
    startMetaOauth,
    startTikTokOauth,
  } = useAuth()
  const { selectedClientId } = useClientContext()
  const { isPreviewMode } = usePreview()
  const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth()
  const { toast } = useToast()

  const workspaceId = user?.agencyId ? String(user.agencyId) : null
  const canQueryConvex = isAuthenticated && !convexAuthLoading && Boolean(user?.id)

  const convexStatuses = useQuery(
    adsIntegrationsApi.listStatuses,
    isPreviewMode || !workspaceId || !canQueryConvex
      ? 'skip'
      : { workspaceId, clientId: selectedClientId ?? null }
  ) as ConvexIntegrationStatusRow[] | undefined

  const mappedStatuses = useMemo<IntegrationStatusResponse | null>(() => {
    if (isPreviewMode) {
      return { statuses: getPreviewAdsIntegrationStatuses() }
    }

    if (!workspaceId || !canQueryConvex) return null

    const rows = Array.isArray(convexStatuses) ? convexStatuses : []

    const statuses = rows.map((row) => ({
      providerId: String(row.providerId),
      status: String(row.lastSyncStatus ?? 'never'),
      message: row.lastSyncMessage ?? null,
      lastSyncedAt: typeof row.lastSyncedAtMs === 'number' ? new Date(row.lastSyncedAtMs).toISOString() : null,
      lastSyncRequestedAt:
        typeof row.lastSyncRequestedAtMs === 'number'
          ? new Date(row.lastSyncRequestedAtMs).toISOString()
          : null,
      linkedAt: typeof row.linkedAtMs === 'number' ? new Date(row.linkedAtMs).toISOString() : null,
      accountId: row.accountId ?? null,
      accountName: row.accountName ?? null,
      autoSyncEnabled: row.autoSyncEnabled ?? null,
      syncFrequencyMinutes: row.syncFrequencyMinutes ?? null,
      scheduledTimeframeDays: row.scheduledTimeframeDays ?? null,
    }))

    return { statuses }
  }, [convexStatuses, isPreviewMode, canQueryConvex, workspaceId])

  // Connection state
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null)
  const [connectionErrors, setConnectionErrors] = useState<Record<string, string>>({})
  const [connectedProviders, setConnectedProviders] = useState<Record<string, boolean>>({})
  const [integrationStatuses, setIntegrationStatuses] = useState<IntegrationStatusResponse | null>(null)

  // Setup state
  const [metaSetupMessage, setMetaSetupMessage] = useState<string | null>(null)
  const [tiktokSetupMessage, setTiktokSetupMessage] = useState<string | null>(null)
  const [initializingMeta, setInitializingMeta] = useState(false)
  const [initializingTikTok, setInitializingTikTok] = useState(false)

  // Trigger refresh
  const triggerRefresh = useCallback(() => {
    onRefresh?.()
  }, [onRefresh])

  // Derived state
  const automationStatuses = integrationStatuses?.statuses ?? []

  // Create a map of provider status info for easier access
  const integrationStatusMap: Record<string, IntegrationStatusInfo> = {}
  automationStatuses.forEach((status) => {
    integrationStatusMap[status.providerId] = {
      lastSyncedAt: status.lastSyncedAt,
      lastSyncRequestedAt: status.lastSyncRequestedAt,
      status: status.status,
      accountId: status.accountId,
      accountName: status.accountName,
    }
  })

  const metaStatus = automationStatuses.find((s) => s.providerId === PROVIDER_IDS.FACEBOOK)
  const metaNeedsAccountSelection = Boolean(metaStatus?.linkedAt && !metaStatus.accountId)

  const tiktokStatus = automationStatuses.find((s) => s.providerId === PROVIDER_IDS.TIKTOK)
  const tiktokNeedsAccountSelection = Boolean(tiktokStatus?.linkedAt && !tiktokStatus.accountId)

  // Platform definitions with clientId passed to connect functions
   const adPlatforms: AdPlatform[] = [
     {
       id: PROVIDER_IDS.GOOGLE,
       name: 'Google Ads',
       description: 'Import campaign performance, budgets, and ROAS insights directly from Google Ads.',
       icon: Search,
       connect: () => connectGoogleAdsAccount(),
     },
    {
      id: PROVIDER_IDS.FACEBOOK,
      name: 'Meta Ads Manager',
      description: 'Pull spend, results, and creative breakdowns from Meta and Instagram campaigns.',
      icon: Facebook,
      mode: 'oauth',
    },
     {
       id: PROVIDER_IDS.LINKEDIN,
       name: 'LinkedIn Ads',
       description: 'Sync lead-gen form results and campaign analytics from LinkedIn.',
       icon: Linkedin,
       connect: () => connectLinkedInAdsAccount(),
     },
    {
      id: PROVIDER_IDS.TIKTOK,
      name: 'TikTok Ads',
      description: 'Bring in spend, engagement, and conversion insights from TikTok campaign flights.',
      icon: Music,
      mode: 'oauth',
    },
  ]

  const initializeAdAccount = useAction(adsIntegrationsApi.initializeAdAccount)
  const deleteAdIntegrationMutation = useMutation(adsIntegrationsApi.deleteAdIntegration)
  const deleteSyncJobsMutation = useMutation(adsIntegrationsApi.deleteSyncJobs)

  // Initialize integration helpers
  const initializeGoogleIntegration = useCallback(async () => {
    if (!workspaceId) {
      throw new Error(ERROR_MESSAGES.SIGN_IN_REQUIRED)
    }

    return await initializeAdAccount({
      workspaceId,
      providerId: 'google',
      clientId: selectedClientId ?? null,
    })
  }, [initializeAdAccount, selectedClientId, workspaceId])

  const initializeLinkedInIntegration = useCallback(async () => {
    if (!workspaceId) {
      throw new Error(ERROR_MESSAGES.SIGN_IN_REQUIRED)
    }

    return await initializeAdAccount({
      workspaceId,
      providerId: 'linkedin',
      clientId: selectedClientId ?? null,
    })
  }, [initializeAdAccount, selectedClientId, workspaceId])

  const initializeMetaIntegration = useCallback(async (clientIdOverride?: string | null) => {
    setMetaSetupMessage(null)
    setInitializingMeta(true)

    try {
      if (!workspaceId) {
        throw new Error(ERROR_MESSAGES.SIGN_IN_REQUIRED)
      }

      const payload = (await initializeAdAccount({
        workspaceId,
        providerId: 'facebook',
        clientId: clientIdOverride ?? selectedClientId ?? null,
      })) as { accountName?: string }

      toast({
        title: SUCCESS_MESSAGES.META_CONNECTED,
        description: payload?.accountName
          ? `Syncing data from ${payload.accountName}.`
          : 'Default ad account linked successfully.',
      })
      triggerRefresh()

    } catch (error: unknown) {
      const message = asErrorMessage(error)
      setMetaSetupMessage(message)
      toast({ variant: 'destructive', title: TOAST_TITLES.META_SETUP_FAILED, description: message })
    } finally {
      setInitializingMeta(false)
    }
  }, [initializeAdAccount, toast, selectedClientId, triggerRefresh, workspaceId])

  const initializeTikTokIntegration = useCallback(async (clientIdOverride?: string | null) => {
    setTiktokSetupMessage(null)
    setInitializingTikTok(true)

    try {
      if (!workspaceId) {
        throw new Error(ERROR_MESSAGES.SIGN_IN_REQUIRED)
      }

      const payload = (await initializeAdAccount({
        workspaceId,
        providerId: 'tiktok',
        clientId: clientIdOverride ?? selectedClientId ?? null,
      })) as { accountName?: string }

      toast({
        title: SUCCESS_MESSAGES.TIKTOK_CONNECTED,
        description: payload?.accountName
          ? `Syncing data from ${payload.accountName}.`
          : 'Default ad account linked successfully.',
      })
      triggerRefresh()

    } catch (error: unknown) {
      const message = asErrorMessage(error)
      setTiktokSetupMessage(message)
      toast({ variant: 'destructive', title: TOAST_TITLES.TIKTOK_SETUP_FAILED, description: message })
    } finally {
      setInitializingTikTok(false)
    }
  }, [initializeAdAccount, toast, selectedClientId, triggerRefresh, workspaceId])

  // Keep local state in sync with Convex/preview.
  useEffect(() => {
    setIntegrationStatuses(mappedStatuses)
  }, [mappedStatuses])

  // Sync connected providers from statuses
  useEffect(() => {
    if (!integrationStatuses?.statuses) return
    const updatedConnected: Record<string, boolean> = {}
    integrationStatuses.statuses.forEach((status) => {
      // `status.status` is derived from lastSyncStatus. Immediately after OAuth we store
      // integrations with lastSyncStatus = 'pending', so requiring 'success' makes the UI
      // look disconnected even though the account is linked.
      updatedConnected[status.providerId] = Boolean(status.linkedAt) || status.status === 'success'
    })
    setConnectedProviders(updatedConnected)
  }, [integrationStatuses])

  // URL signaling handler
  const oauthProcessedRef = useRef<Record<string, boolean>>({})

  useEffect(() => {
    if (typeof window === 'undefined') return

    const searchParams = new URLSearchParams(window.location.search)
    const oauthSuccess = searchParams.get('oauth_success') === 'true'
    const oauthError = searchParams.get('oauth_error')
    const providerId = searchParams.get('provider')
    const message = searchParams.get('message')
    const oauthClientId = searchParams.get('clientId')

    if (!oauthSuccess && !oauthError) return
    if (!providerId) return

    // Prevent re-processing if this provider was already handled in this mount cycle
    const processingKey = `${providerId}:${oauthSuccess ? 'success' : 'error'}`
    if (oauthProcessedRef.current[processingKey]) return
    oauthProcessedRef.current[processingKey] = true

    // Clean up URL immediately
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.delete('oauth_success')
    newUrl.searchParams.delete('oauth_error')
    newUrl.searchParams.delete('provider')
    newUrl.searchParams.delete('message')
    newUrl.searchParams.delete('clientId')
    window.history.replaceState({}, '', newUrl.toString())

    if (oauthSuccess) {
      console.log(`[useAdsConnections] Detected OAuth success for ${providerId}`)
      if (providerId === PROVIDER_IDS.FACEBOOK) {
        void initializeMetaIntegration(oauthClientId)
      } else if (providerId === PROVIDER_IDS.TIKTOK) {
        void initializeTikTokIntegration(oauthClientId)
       } else if (providerId === PROVIDER_IDS.GOOGLE) {
        void initializeGoogleIntegration().then(async () => {
          toast({ title: SUCCESS_MESSAGES.GOOGLE_CONNECTED, description: 'Syncing your ad data.' })
          triggerRefresh()
        }).catch(err => {
          toast({ variant: 'destructive', title: TOAST_TITLES.CONNECTION_FAILED, description: asErrorMessage(err) })
        })
       } else if (providerId === PROVIDER_IDS.LINKEDIN) {
        void initializeLinkedInIntegration().then(async () => {
          toast({ title: SUCCESS_MESSAGES.LINKEDIN_CONNECTED, description: 'Syncing your ad data.' })
          triggerRefresh()
        }).catch(err => {
          toast({ variant: 'destructive', title: TOAST_TITLES.CONNECTION_FAILED, description: asErrorMessage(err) })
        })
      } else {
        toast({
          title: 'Connection successful',
          description: `${formatProviderName(providerId)} has been linked.`
        })
        triggerRefresh()
      }
    } else if (oauthError) {
      const displayProvider = formatProviderName(providerId)
      const errorMessage = message || 'An unknown error occurred during authentication.'

      console.error(`[useAdsConnections] Detected OAuth error for ${providerId}:`, errorMessage)

      toast({
        variant: 'destructive',
        title: `${displayProvider} connection failed`,
        description: errorMessage,
      })

      setConnectionErrors((prev) => ({ ...prev, [providerId]: errorMessage }))
    }
  }, [initializeMetaIntegration, initializeTikTokIntegration, triggerRefresh, toast, initializeGoogleIntegration, initializeLinkedInIntegration])

  // Handlers
  const handleConnect = useCallback(async (providerId: string, action: () => Promise<void>) => {
    setConnectingProvider(providerId)
    setConnectionErrors((prev) => ({ ...prev, [providerId]: '' }))
    try {
      await action()
      if (providerId === PROVIDER_IDS.GOOGLE) await initializeGoogleIntegration()
      else if (providerId === PROVIDER_IDS.LINKEDIN) await initializeLinkedInIntegration()
      setConnectedProviders((prev) => ({ ...prev, [providerId]: true }))
      triggerRefresh()
    } catch (error: unknown) {
      const message = asErrorMessage(error)
      setConnectionErrors((prev) => ({ ...prev, [providerId]: message }))
      setConnectedProviders((prev) => ({ ...prev, [providerId]: false }))
      toast({
        variant: 'destructive',
        title: TOAST_TITLES.CONNECTION_FAILED,
        description: message,
      })
    } finally {
      setConnectingProvider(null)
    }
  }, [initializeGoogleIntegration, initializeLinkedInIntegration, triggerRefresh, toast])

  const handleOauthRedirect = useCallback(async (providerId: string) => {
    if (typeof window === 'undefined') return
    if (providerId === PROVIDER_IDS.FACEBOOK) setMetaSetupMessage(null)
    if (providerId === PROVIDER_IDS.TIKTOK) setTiktokSetupMessage(null)

    setConnectingProvider(providerId)
    setConnectionErrors((prev) => ({ ...prev, [providerId]: '' }))

    try {
      // Use a relative redirect path so it is always valid/safe across environments
      // (and passes `isValidRedirectUrl` which allows relative paths).
      const redirectTarget = `${window.location.pathname}${window.location.search}`
      if (providerId === PROVIDER_IDS.FACEBOOK) {
        console.log('[Meta OAuth Debug] Starting Meta OAuth flow...')
        console.log('[Meta OAuth Debug] Redirect target:', redirectTarget)
        const { url } = await startMetaOauth(redirectTarget, selectedClientId ?? null)
        console.log('[Meta OAuth Debug] Received OAuth URL:', url)
        if (typeof url !== 'string' || url.length === 0) {
          throw new Error('Meta OAuth did not return a URL. Check server logs and environment variables.')
        }
        console.log('[Meta OAuth Debug] URL parsed:', {
          origin: new URL(url).origin,
          pathname: new URL(url).pathname,
          params: Object.fromEntries(new URL(url).searchParams.entries())
        })
        window.location.href = url
        return
      }
      if (providerId === PROVIDER_IDS.TIKTOK) {
        const { url } = await startTikTokOauth(redirectTarget, selectedClientId ?? null)
        window.location.href = url
        return
      }
      throw new Error('This provider does not support OAuth yet.')
    } catch (error: unknown) {
      const rawMessage = error instanceof Error ? error.message : ''

      const isMetaConfigError =
        providerId === PROVIDER_IDS.FACEBOOK && /meta business login is not configured/i.test(rawMessage)

      const isTikTokConfigError =
        providerId === PROVIDER_IDS.TIKTOK && /tiktok oauth is not configured/i.test(rawMessage)

      // For known configuration errors, prefer the raw message so it doesn't get
      // replaced by a generic 5xx-friendly message.
      const message = (isMetaConfigError || isTikTokConfigError)
        ? rawMessage
        : asErrorMessage(error)

      setConnectionErrors((prev) => ({ ...prev, [providerId]: message }))
      if (providerId === PROVIDER_IDS.FACEBOOK && (isMetaConfigError || message.toLowerCase().includes('meta business login is not configured'))) {
        setMetaSetupMessage('Meta business login is not configured. Add META_APP_ID, META_BUSINESS_CONFIG_ID, and META_OAUTH_REDIRECT_URI environment variables.')
      }
      if (providerId === PROVIDER_IDS.TIKTOK && (isTikTokConfigError || message.toLowerCase().includes('tiktok oauth is not configured'))) {
        setTiktokSetupMessage('TikTok OAuth is not configured. Add TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, and TIKTOK_OAUTH_REDIRECT_URI environment variables.')
      }
      toast({
        variant: 'destructive',
        title: TOAST_TITLES.CONNECTION_FAILED,
        description: message,
      })
    } finally {
      setConnectingProvider(null)
    }
  }, [startMetaOauth, startTikTokOauth, toast, selectedClientId])

  const handleDisconnect = useCallback(async (providerId: string) => {
    const providerName = formatProviderName(providerId)

    if (!workspaceId) {
      toast({ variant: 'destructive', title: TOAST_TITLES.DISCONNECT_FAILED, description: ERROR_MESSAGES.SIGN_IN_REQUIRED })
      return
    }

    setConnectingProvider(providerId)
    setConnectionErrors((prev) => ({ ...prev, [providerId]: '' }))
    try {
      // Delete sync jobs first, then the integration
      await deleteSyncJobsMutation({ workspaceId, providerId, clientId: selectedClientId ?? null })
      await deleteAdIntegrationMutation({ workspaceId, providerId, clientId: selectedClientId ?? null })
      setConnectedProviders((prev) => ({ ...prev, [providerId]: false }))
      toast({ title: TOAST_TITLES.DISCONNECTED, description: SUCCESS_MESSAGES.DISCONNECTED(providerName) })
      triggerRefresh()
    } catch (error: unknown) {
      const message = asErrorMessage(error)
      setConnectionErrors((prev) => ({ ...prev, [providerId]: message }))
      toast({ variant: 'destructive', title: TOAST_TITLES.DISCONNECT_FAILED, description: message })
    } finally {
      setConnectingProvider(null)
    }
  }, [deleteAdIntegrationMutation, deleteSyncJobsMutation, toast, triggerRefresh, selectedClientId, workspaceId])

  return {
    // State
    connectedProviders,
    connectingProvider,
    connectionErrors,
    integrationStatuses,
    integrationStatusMap,
    automationStatuses,

    // Setup messages
    metaSetupMessage,
    tiktokSetupMessage,
    initializingMeta,
    initializingTikTok,
    metaNeedsAccountSelection,
    tiktokNeedsAccountSelection,

    // Actions
    handleConnect,
    handleDisconnect,
    handleOauthRedirect,
    initializeMetaIntegration,
    initializeTikTokIntegration,

    // Platform definitions
    adPlatforms,

    // Trigger refresh
    triggerRefresh,
  }
}
