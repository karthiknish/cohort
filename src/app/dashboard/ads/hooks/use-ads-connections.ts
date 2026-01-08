'use client'

import { useCallback, useEffect, useState } from 'react'
import { Facebook, Linkedin, Music, Search } from 'lucide-react'

import { useAuth } from '@/contexts/auth-context'
import { usePreview } from '@/contexts/preview-context'
import { useToast } from '@/components/ui/use-toast'
import { getPreviewAdsIntegrationStatuses } from '@/lib/preview-data'

import type { AdPlatform, IntegrationStatus, IntegrationStatusResponse } from '../components/types'
import { parseApiError } from '../components/types'
import { fetchIntegrationStatuses, getErrorMessage, formatProviderName } from '../components/utils'
import {
  API_ENDPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  TOAST_TITLES,
  PROVIDER_IDS,
} from '../components/constants'

// =============================================================================
// TYPES
// =============================================================================

export interface UseAdsConnectionsOptions {
  /** Callback when a refresh is triggered */
  onRefresh?: () => void
}

export interface UseAdsConnectionsReturn {
  // State
  connectedProviders: Record<string, boolean>
  connectingProvider: string | null
  connectionErrors: Record<string, string>
  integrationStatuses: IntegrationStatusResponse | null
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
  initializeMetaIntegration: () => Promise<void>
  initializeTikTokIntegration: () => Promise<void>

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
    disconnectProvider,
    getIdToken,
  } = useAuth()
  const { isPreviewMode } = usePreview()
  const { toast } = useToast()

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

  // Internal refresh trigger
  const [refreshTick, setRefreshTick] = useState(0)

  // Derived state
  const automationStatuses = integrationStatuses?.statuses ?? []

  const metaStatus = automationStatuses.find((s) => s.providerId === PROVIDER_IDS.FACEBOOK)
  const metaNeedsAccountSelection = Boolean(metaStatus?.linkedAt && !metaStatus.accountId)

  const tiktokStatus = automationStatuses.find((s) => s.providerId === PROVIDER_IDS.TIKTOK)
  const tiktokNeedsAccountSelection = Boolean(tiktokStatus?.linkedAt && !tiktokStatus.accountId)

  // Platform definitions
  const adPlatforms: AdPlatform[] = [
    {
      id: PROVIDER_IDS.GOOGLE,
      name: 'Google Ads',
      description: 'Import campaign performance, budgets, and ROAS insights directly from Google Ads.',
      icon: Search,
      connect: connectGoogleAdsAccount,
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
      connect: connectLinkedInAdsAccount,
    },
    {
      id: PROVIDER_IDS.TIKTOK,
      name: 'TikTok Ads',
      description: 'Bring in spend, engagement, and conversion insights from TikTok campaign flights.',
      icon: Music,
      mode: 'oauth',
    },
  ]

  // Initialize integration helpers
  const initializeGoogleIntegration = useCallback(async () => {
    const token = await getIdToken()
    const response = await fetch(API_ENDPOINTS.INTEGRATIONS.GOOGLE_INIT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}))
      throw new Error(parseApiError(payload) ?? ERROR_MESSAGES.GOOGLE_INIT_FAILED)
    }
    return response.json()
  }, [getIdToken])

  const initializeLinkedInIntegration = useCallback(async () => {
    const token = await getIdToken()
    const response = await fetch(API_ENDPOINTS.INTEGRATIONS.LINKEDIN_INIT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}))
      throw new Error(parseApiError(payload) ?? ERROR_MESSAGES.LINKEDIN_INIT_FAILED)
    }
    return response.json()
  }, [getIdToken])

  const initializeMetaIntegration = useCallback(async () => {
    setMetaSetupMessage(null)
    setInitializingMeta(true)
    try {
      const token = await getIdToken()
      const response = await fetch(API_ENDPOINTS.INTEGRATIONS.META_INIT, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const payload = (await response.json().catch(() => ({}))) as { accountName?: string; error?: string }
      if (!response.ok) {
        throw new Error(payload?.error ?? ERROR_MESSAGES.META_INIT_FAILED)
      }
      toast({
        title: SUCCESS_MESSAGES.META_CONNECTED,
        description: payload?.accountName
          ? `Syncing data from ${payload.accountName}.`
          : 'Default ad account linked successfully.',
      })
      triggerRefresh()
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Unable to complete Meta setup')
      setMetaSetupMessage(message)
      toast({ variant: 'destructive', title: TOAST_TITLES.META_SETUP_FAILED, description: message })
    } finally {
      setInitializingMeta(false)
    }
  }, [getIdToken, toast])

  const initializeTikTokIntegration = useCallback(async () => {
    setTiktokSetupMessage(null)
    setInitializingTikTok(true)
    try {
      const token = await getIdToken()
      const response = await fetch(API_ENDPOINTS.INTEGRATIONS.TIKTOK_INIT, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const payload = (await response.json().catch(() => ({}))) as { accountName?: string; error?: string }
      if (!response.ok) {
        throw new Error(payload?.error ?? ERROR_MESSAGES.TIKTOK_INIT_FAILED)
      }
      toast({
        title: SUCCESS_MESSAGES.TIKTOK_CONNECTED,
        description: payload?.accountName
          ? `Syncing data from ${payload.accountName}.`
          : 'Default ad account linked successfully.',
      })
      triggerRefresh()
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Unable to complete TikTok setup')
      setTiktokSetupMessage(message)
      toast({ variant: 'destructive', title: TOAST_TITLES.TIKTOK_SETUP_FAILED, description: message })
    } finally {
      setInitializingTikTok(false)
    }
  }, [getIdToken, toast])

  // Trigger refresh
  const triggerRefresh = useCallback(() => {
    setRefreshTick((tick) => tick + 1)
    onRefresh?.()
  }, [onRefresh])

  // Load integration statuses
  useEffect(() => {
    if (isPreviewMode) {
      const previewStatuses = getPreviewAdsIntegrationStatuses()
      setIntegrationStatuses({ statuses: previewStatuses })
      return
    }

    if (!user?.id) {
      setIntegrationStatuses(null)
      return
    }

    let isSubscribed = true
    const loadStatuses = async () => {
      try {
        const token = await getIdToken()
        const statusResponse = await fetchIntegrationStatuses(token, user.id)
        if (isSubscribed) {
          setIntegrationStatuses(statusResponse)
        }
      } catch {
        // Silently fail - metrics will still work
      }
    }
    void loadStatuses()
    return () => { isSubscribed = false }
  }, [user?.id, refreshTick, getIdToken, isPreviewMode])

  // Sync connected providers from statuses
  useEffect(() => {
    if (!integrationStatuses?.statuses) return
    const updatedConnected: Record<string, boolean> = {}
    integrationStatuses.statuses.forEach((status) => {
      updatedConnected[status.providerId] = status.status === 'success'
    })
    setConnectedProviders(updatedConnected)
  }, [integrationStatuses])

  // URL signaling handler
  useEffect(() => {
    if (typeof window === 'undefined') return

    const searchParams = new URLSearchParams(window.location.search)
    const oauthSuccess = searchParams.get('oauth_success') === 'true'
    const oauthError = searchParams.get('oauth_error')
    const provider = searchParams.get('provider')
    const message = searchParams.get('message')

    if (!oauthSuccess && !oauthError) return

    // Clean up URL immediately
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.delete('oauth_success')
    newUrl.searchParams.delete('oauth_error')
    newUrl.searchParams.delete('provider')
    newUrl.searchParams.delete('message')
    window.history.replaceState({}, '', newUrl.toString())

    if (oauthSuccess && provider) {
      console.log(`[useAdsConnections] Detected OAuth success for ${provider}`)
      if (provider === PROVIDER_IDS.FACEBOOK) {
        void initializeMetaIntegration()
      } else if (provider === PROVIDER_IDS.TIKTOK) {
        void initializeTikTokIntegration()
      } else if (provider === PROVIDER_IDS.GOOGLE) {
        void initializeGoogleIntegration().then(() => {
          toast({ title: SUCCESS_MESSAGES.GOOGLE_CONNECTED, description: 'Default account linked successfully.' })
          triggerRefresh()
        }).catch(err => {
          toast({ variant: 'destructive', title: TOAST_TITLES.CONNECTION_FAILED, description: getErrorMessage(err, 'Failed to initialize Google Ads') })
        })
      } else if (provider === PROVIDER_IDS.LINKEDIN) {
        void initializeLinkedInIntegration().then(() => {
          toast({ title: SUCCESS_MESSAGES.LINKEDIN_CONNECTED, description: 'Default account linked successfully.' })
          triggerRefresh()
        }).catch(err => {
          toast({ variant: 'destructive', title: TOAST_TITLES.CONNECTION_FAILED, description: getErrorMessage(err, 'Failed to initialize LinkedIn Ads') })
        })
      } else {
        toast({
          title: 'Connection successful',
          description: `${formatProviderName(provider)} has been linked.`
        })
        triggerRefresh()
      }
    } else if (oauthError) {
      const displayProvider = provider ? formatProviderName(provider) : 'OAuth'
      const errorMessage = message || 'An unknown error occurred during authentication.'

      console.error(`[useAdsConnections] Detected OAuth error for ${provider}:`, errorMessage)

      toast({
        variant: 'destructive',
        title: `${displayProvider} connection failed`,
        description: errorMessage,
      })

      if (provider) {
        setConnectionErrors((prev) => ({ ...prev, [provider]: errorMessage }))
      }
    }
  }, [initializeMetaIntegration, initializeTikTokIntegration, triggerRefresh, toast])

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
      const message = getErrorMessage(error, ERROR_MESSAGES.CONNECTION_FAILED)
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
      const redirectTarget = `${window.location.origin}/dashboard/ads`
      if (providerId === PROVIDER_IDS.FACEBOOK) {
        console.log('[Meta OAuth Debug] Starting Meta OAuth flow...')
        console.log('[Meta OAuth Debug] Redirect target:', redirectTarget)
        const { url } = await startMetaOauth(redirectTarget)
        console.log('[Meta OAuth Debug] Received OAuth URL:', url)
        console.log('[Meta OAuth Debug] URL parsed:', {
          origin: new URL(url).origin,
          pathname: new URL(url).pathname,
          params: Object.fromEntries(new URL(url).searchParams.entries())
        })
        window.location.href = url
        return
      }
      if (providerId === PROVIDER_IDS.TIKTOK) {
        const { url } = await startTikTokOauth(redirectTarget)
        window.location.href = url
        return
      }
      throw new Error('This provider does not support OAuth yet.')
    } catch (error: unknown) {
      const message = getErrorMessage(
        error,
        providerId === PROVIDER_IDS.FACEBOOK
          ? 'Unable to start Meta OAuth. Please try again.'
          : providerId === PROVIDER_IDS.TIKTOK
            ? 'Unable to start TikTok OAuth. Please try again.'
            : 'Unable to start OAuth. Please try again.'
      )
      setConnectionErrors((prev) => ({ ...prev, [providerId]: message }))
      if (providerId === PROVIDER_IDS.FACEBOOK && message.toLowerCase().includes('meta business login is not configured')) {
        setMetaSetupMessage('Meta business login is not configured. Add META_APP_ID, META_BUSINESS_CONFIG_ID, and META_OAUTH_REDIRECT_URI environment variables.')
      }
      if (providerId === PROVIDER_IDS.TIKTOK && message.toLowerCase().includes('tiktok oauth is not configured')) {
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
  }, [startMetaOauth, startTikTokOauth, toast])

  const handleDisconnect = useCallback(async (providerId: string) => {
    const providerName = formatProviderName(providerId)
    if (!confirm(`Are you sure you want to disconnect ${providerName}? This will stop all future syncs.`)) return

    setConnectingProvider(providerId)
    setConnectionErrors((prev) => ({ ...prev, [providerId]: '' }))
    try {
      await disconnectProvider(providerId)
      setConnectedProviders((prev) => ({ ...prev, [providerId]: false }))
      toast({ title: TOAST_TITLES.DISCONNECTED, description: SUCCESS_MESSAGES.DISCONNECTED(providerName) })
      triggerRefresh()
    } catch (error: unknown) {
      const message = getErrorMessage(error, ERROR_MESSAGES.DISCONNECT_FAILED)
      setConnectionErrors((prev) => ({ ...prev, [providerId]: message }))
      toast({ variant: 'destructive', title: TOAST_TITLES.DISCONNECT_FAILED, description: message })
    } finally {
      setConnectingProvider(null)
    }
  }, [disconnectProvider, toast, triggerRefresh])

  return {
    // State
    connectedProviders,
    connectingProvider,
    connectionErrors,
    integrationStatuses,
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
