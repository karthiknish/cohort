'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAction, useConvexAuth, useMutation, useQuery } from 'convex/react'

import { useAuth } from '@/shared/contexts/auth-context'
import { useClientContext } from '@/shared/contexts/client-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { normalizeAdsProviderId } from '@/domain/ads/provider'
import { adsIntegrationsApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { notifyFailure } from '@/lib/notifications'
import { getPreviewAdsIntegrationStatuses } from '@/lib/preview-data'
import { useToast } from '@/shared/ui/use-toast'

import type { AdPlatform, IntegrationStatus, IntegrationStatusResponse } from '../components/types'

import { formatProviderName } from '../components/utils'
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  TOAST_TITLES,
  PROVIDER_IDS,
} from '../components/constants'
import { PROVIDER_ICON_MAP } from '@/features/dashboard/ads/constants'

// Raw providerId values that are genuine ads platforms.
// This is checked against the raw DB value BEFORE normalization so that
// analytics-only providers like 'google-analytics' are excluded even though
// their canonical form is the same as the ads provider root.
const RAW_ADS_PROVIDER_IDS = new Set(['google', 'facebook', 'linkedin', 'tiktok'])


type ConvexIntegrationStatusRow = {
  providerId: string
  clientId: string | null
  accountId: string | null
  accountName: string | null
  currency: string | null
  lastSyncStatus: string | null
  lastSyncMessage: string | null
  lastSyncedAtMs: number | null
  lastSyncRequestedAtMs: number | null
  linkedAtMs: number | null
  autoSyncEnabled: boolean | null
  syncFrequencyMinutes: number | null
  scheduledTimeframeDays: number | null
}

type MetaAdAccountOption = {
  id: string
  name: string
  currency: string | null
  accountStatus: number | null
  isActive: boolean
}

type GoogleAdAccountOption = {
  id: string
  name: string
  currencyCode: string | null
  isManager: boolean
  loginCustomerId: string | null
  managerCustomerId: string | null
}

type DisconnectOptions = {
  clearHistoricalData?: boolean
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
  currency?: string | null
}

export interface UseAdsConnectionsReturn {
  // State
  connectedProviders: Record<string, boolean>
  connectingProvider: string | null
  connectionErrors: Record<string, string>
  integrationStatuses: IntegrationStatusResponse | null
  integrationStatusMap: Record<string, IntegrationStatusInfo>
  automationStatuses: IntegrationStatus[]
  syncingProviders: Record<string, boolean>

  // Setup messages
  googleSetupMessage: string | null
  metaSetupMessage: string | null
  tiktokSetupMessage: string | null
  initializingGoogle: boolean
  initializingMeta: boolean
  initializingTikTok: boolean
  googleNeedsAccountSelection: boolean
  metaNeedsAccountSelection: boolean
  tiktokNeedsAccountSelection: boolean
  googleAccountOptions: GoogleAdAccountOption[]
  selectedGoogleAccountId: string
  setSelectedGoogleAccountId: (accountId: string) => void
  loadingGoogleAccountOptions: boolean
  googleSetupDialogOpen: boolean
  setGoogleSetupDialogOpen: (open: boolean) => void
  metaAccountOptions: MetaAdAccountOption[]
  selectedMetaAccountId: string
  setSelectedMetaAccountId: (accountId: string) => void
  loadingMetaAccountOptions: boolean

  // Actions
  handleConnect: (providerId: string, action: () => Promise<void>) => Promise<void>
  handleDisconnect: (providerId: string, options?: DisconnectOptions) => Promise<void>
  handleOauthRedirect: (providerId: string) => Promise<void>
  handleSyncNow: (providerId: string) => Promise<void>
  initializeGoogleIntegration: (clientIdOverride?: string | null, accountIdOverride?: string | null) => Promise<void>
  initializeMetaIntegration: (clientIdOverride?: string | null, accountIdOverride?: string | null) => Promise<void>
  initializeTikTokIntegration: (clientIdOverride?: string | null) => Promise<void>
  reloadGoogleAccountOptions: (clientIdOverride?: string | null) => Promise<GoogleAdAccountOption[]>
  reloadMetaAccountOptions: (clientIdOverride?: string | null) => Promise<MetaAdAccountOption[]>

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
    connectLinkedInAdsAccount,
    startGoogleOauth,
    startMetaOauth,
    startTikTokOauth,
  } = useAuth()
  const router = useRouter()
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

    // Filter to genuine ads providers on the raw providerId BEFORE normalization.
    // normalizeAdsProviderId returns null for analytics-only providers (e.g. 'google-analytics'),
    // but we guard with RAW_ADS_PROVIDER_IDS to ensure only known ads platforms pass.
    const seenProviders = new Set<string>()
    const statuses = rows
      .filter((row) => RAW_ADS_PROVIDER_IDS.has(String(row.providerId).trim().toLowerCase()))
      .map((row) => ({
        providerId: normalizeAdsProviderId(String(row.providerId)) ?? String(row.providerId).trim().toLowerCase(),
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
        currency: row.currency ?? null,
        autoSyncEnabled: row.autoSyncEnabled ?? null,
        syncFrequencyMinutes: row.syncFrequencyMinutes ?? null,
        scheduledTimeframeDays: row.scheduledTimeframeDays ?? null,
      }))
      .filter((s) => RAW_ADS_PROVIDER_IDS.has(s.providerId))
      .filter((s) => {
        // Deduplicate by normalized provider ID, keeping the first entry.
        if (seenProviders.has(s.providerId)) return false
        seenProviders.add(s.providerId)
        return true
      })

    return { statuses }
  }, [convexStatuses, isPreviewMode, canQueryConvex, workspaceId])

  // Connection state
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null)
  const [connectionErrors, setConnectionErrors] = useState<Record<string, string>>({})
  const [connectedProviders, setConnectedProviders] = useState<Record<string, boolean>>({})
  const [integrationStatuses, setIntegrationStatuses] = useState<IntegrationStatusResponse | null>(null)
  const [syncingProviders, setSyncingProviders] = useState<Record<string, boolean>>({})

  // Setup state
  const [googleSetupMessage, setGoogleSetupMessage] = useState<string | null>(null)
  const [metaSetupMessage, setMetaSetupMessage] = useState<string | null>(null)
  const [tiktokSetupMessage, setTiktokSetupMessage] = useState<string | null>(null)
  const [initializingGoogle, setInitializingGoogle] = useState(false)
  const [initializingMeta, setInitializingMeta] = useState(false)
  const [initializingTikTok, setInitializingTikTok] = useState(false)
  const [googleAccountOptions, setGoogleAccountOptions] = useState<GoogleAdAccountOption[]>([])
  const [selectedGoogleAccountId, setSelectedGoogleAccountId] = useState('')
  const [loadingGoogleAccountOptions, setLoadingGoogleAccountOptions] = useState(false)
  const [googleSetupDialogOpen, setGoogleSetupDialogOpen] = useState(false)
  const [metaAccountOptions, setMetaAccountOptions] = useState<MetaAdAccountOption[]>([])
  const [selectedMetaAccountId, setSelectedMetaAccountId] = useState('')
  const [loadingMetaAccountOptions, setLoadingMetaAccountOptions] = useState(false)

  // Reset account selection state when the active client changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: selectedClientId is an intentional trigger; only stable setters are called inside
  useEffect(() => {
    setGoogleAccountOptions([])
    setSelectedGoogleAccountId('')
    setGoogleSetupDialogOpen(false)
    setMetaAccountOptions([])
    setSelectedMetaAccountId('')
  }, [selectedClientId])

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
      currency: status.currency,
    }
  })

  const metaStatus = automationStatuses.find((s) => s.providerId === PROVIDER_IDS.FACEBOOK)
  const metaNeedsAccountSelection = Boolean(metaStatus?.linkedAt && !metaStatus.accountId)

  const googleStatus = automationStatuses.find((s) => s.providerId === PROVIDER_IDS.GOOGLE)
  const googleNeedsAccountSelection = Boolean(googleStatus?.linkedAt && !googleStatus.accountId)

  const tiktokStatus = automationStatuses.find((s) => s.providerId === PROVIDER_IDS.TIKTOK)
  const tiktokNeedsAccountSelection = Boolean(tiktokStatus?.linkedAt && !tiktokStatus.accountId)

  // Platform definitions with clientId passed to connect functions
   const adPlatforms: AdPlatform[] = [
     {
       id: PROVIDER_IDS.GOOGLE,
       name: 'Google Ads',
       description: 'Import campaign performance, budgets, and ROAS insights directly from Google Ads.',
       icon: PROVIDER_ICON_MAP.google!,
       mode: 'oauth',
     },
    {
      id: PROVIDER_IDS.FACEBOOK,
      name: 'Meta Ads Manager',
      description: 'Pull spend, results, and creative breakdowns from Meta and Instagram campaigns.',
      icon: PROVIDER_ICON_MAP.facebook!,
      mode: 'oauth',
    },
     {
       id: PROVIDER_IDS.LINKEDIN,
       name: 'LinkedIn Ads',
       description: 'Sync lead-gen form results and campaign analytics from LinkedIn.',
       icon: PROVIDER_ICON_MAP.linkedin!,
       connect: () => connectLinkedInAdsAccount(),
     },
    {
      id: PROVIDER_IDS.TIKTOK,
      name: 'TikTok Ads',
      description: 'Bring in spend, engagement, and conversion insights from TikTok campaign flights.',
      icon: PROVIDER_ICON_MAP.tiktok!,
      mode: 'oauth',
    },
  ]

  const initializeAdAccount = useAction(adsIntegrationsApi.initializeAdAccount)
  const runManualSyncAction = useAction(adsIntegrationsApi.runManualSync)
  const listGoogleAdAccounts = useAction(adsIntegrationsApi.listGoogleAdAccounts)
  const listMetaAdAccounts = useAction(adsIntegrationsApi.listMetaAdAccounts)
  const deleteAdIntegrationMutation = useMutation(adsIntegrationsApi.deleteAdIntegration)
  const deleteSyncJobsMutation = useMutation(adsIntegrationsApi.deleteSyncJobs)
  const deleteProviderMetricsMutation = useMutation(adsIntegrationsApi.deleteProviderMetrics)

  const loadGoogleAdAccounts = useCallback(async (clientIdOverride?: string | null) => {
    if (!workspaceId) {
      throw new Error(ERROR_MESSAGES.SIGN_IN_REQUIRED)
    }

    setLoadingGoogleAccountOptions(true)

    try {
      const payload = (await listGoogleAdAccounts({
        workspaceId,
        providerId: 'google',
        clientId: clientIdOverride ?? selectedClientId ?? null,
      })) as GoogleAdAccountOption[]

      const options = Array.isArray(payload) ? payload : []
      setGoogleAccountOptions(options)
      setSelectedGoogleAccountId((currentValue) => {
        if (currentValue && options.some((option) => option.id === currentValue)) {
          return currentValue
        }

        const defaultOption = options.find((option) => !option.isManager) ?? options[0]
        return defaultOption?.id ?? ''
      })

      return options
    } catch (error) {
      setGoogleAccountOptions([])
      setSelectedGoogleAccountId('')
      throw error
    } finally {
      setLoadingGoogleAccountOptions(false)
    }
  }, [listGoogleAdAccounts, selectedClientId, workspaceId])

  const loadMetaAdAccounts = useCallback(async (clientIdOverride?: string | null) => {
    if (!workspaceId) {
      throw new Error(ERROR_MESSAGES.SIGN_IN_REQUIRED)
    }

    setLoadingMetaAccountOptions(true)

    try {
      const payload = (await listMetaAdAccounts({
        workspaceId,
        providerId: 'facebook',
        clientId: clientIdOverride ?? selectedClientId ?? null,
      })) as MetaAdAccountOption[]

      const options = Array.isArray(payload) ? payload : []
      setMetaAccountOptions(options)
      setSelectedMetaAccountId((currentValue) => {
        if (currentValue && options.some((option) => option.id === currentValue)) {
          return currentValue
        }

        const defaultOption = options.find((option) => option.isActive) ?? options[0]
        return defaultOption?.id ?? ''
      })
      return options
    } catch (error) {
      setMetaAccountOptions([])
      setSelectedMetaAccountId('')
      throw error
    } finally {
      setLoadingMetaAccountOptions(false)
    }
  }, [listMetaAdAccounts, selectedClientId, workspaceId])

  // Initialize integration helpers
  const initializeGoogleIntegration = useCallback(async (clientIdOverride?: string | null, accountIdOverride?: string | null) => {
    setGoogleSetupMessage(null)
    setInitializingGoogle(true)

    try {
      if (!workspaceId) {
        throw new Error(ERROR_MESSAGES.SIGN_IN_REQUIRED)
      }

      const accountId = (accountIdOverride ?? selectedGoogleAccountId).trim()
      if (!accountId) {
        throw new Error('Please select a Google Ads account to finish setup.')
      }

      const payload = (await initializeAdAccount({
        workspaceId,
        providerId: 'google',
        clientId: clientIdOverride ?? selectedClientId ?? null,
        accountId,
      })) as { accountName?: string }

      toast({
        title: SUCCESS_MESSAGES.GOOGLE_CONNECTED,
        description: payload?.accountName
          ? `Syncing data from ${payload.accountName}.`
          : 'Google Ads account linked successfully.',
      })

      setGoogleAccountOptions([])
      setSelectedGoogleAccountId('')
      setGoogleSetupDialogOpen(false)
      triggerRefresh()
    } catch (error: unknown) {
      logError(error, 'useAdsConnections:initializeGoogleIntegration')
      const message = asErrorMessage(error)
      setGoogleSetupMessage(message)
      notifyFailure({ title: TOAST_TITLES.CONNECTION_FAILED, message })
    } finally {
      setInitializingGoogle(false)
    }
  }, [initializeAdAccount, selectedClientId, selectedGoogleAccountId, toast, triggerRefresh, workspaceId])

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

  const initializeMetaIntegration = useCallback(async (clientIdOverride?: string | null, accountIdOverride?: string | null) => {
    setMetaSetupMessage(null)
    setInitializingMeta(true)

    try {
      if (!workspaceId) {
        throw new Error(ERROR_MESSAGES.SIGN_IN_REQUIRED)
      }

      let accountId = (accountIdOverride ?? selectedMetaAccountId).trim()

      if (!accountId) {
        const availableAccounts = await loadMetaAdAccounts(clientIdOverride)
        const defaultAccount = availableAccounts.find((option) => option.isActive) ?? availableAccounts[0]

        if (!defaultAccount) {
          throw new Error('No Meta ad accounts are available for this integration token.')
        }

        accountId = defaultAccount.id
        setSelectedMetaAccountId(defaultAccount.id)
      }

      const payload = (await initializeAdAccount({
        workspaceId,
        providerId: 'facebook',
        clientId: clientIdOverride ?? selectedClientId ?? null,
        accountId,
      })) as { accountName?: string }

      toast({
        title: SUCCESS_MESSAGES.META_CONNECTED,
        description: payload?.accountName
          ? `Syncing data from ${payload.accountName}.`
          : 'Meta ad account linked successfully.',
      })
      setMetaAccountOptions([])
      setSelectedMetaAccountId('')
      triggerRefresh()

    } catch (error: unknown) {
      logError(error, 'useAdsConnections:initializeMetaIntegration')
      const message = asErrorMessage(error)
      setMetaSetupMessage(message)
      notifyFailure({ title: TOAST_TITLES.META_SETUP_FAILED, message })
    } finally {
      setInitializingMeta(false)
    }
  }, [initializeAdAccount, loadMetaAdAccounts, selectedClientId, selectedMetaAccountId, toast, triggerRefresh, workspaceId])

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
      logError(error, 'useAdsConnections:initializeTikTokIntegration')
      const message = asErrorMessage(error)
      setTiktokSetupMessage(message)
      notifyFailure({ title: TOAST_TITLES.TIKTOK_SETUP_FAILED, message })
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
        setMetaSetupMessage(null)
        toast({
          title: SUCCESS_MESSAGES.META_CONNECTED,
          description: 'Meta connected. Select an ad account to finish setup.',
        })
        void loadMetaAdAccounts(oauthClientId)
          .then(() => {
            triggerRefresh()
          })
          .catch((error) => {
            logError(error, 'useAdsConnections:oauthSuccess:facebook')
            const message = asErrorMessage(error)
            setMetaSetupMessage(message)
            notifyFailure({ title: TOAST_TITLES.META_SETUP_FAILED, message })
          })
      } else if (providerId === PROVIDER_IDS.TIKTOK) {
        void initializeTikTokIntegration(oauthClientId)
      } else if (providerId === PROVIDER_IDS.GOOGLE) {
        setGoogleSetupMessage(null)
        setGoogleSetupDialogOpen(true)
        toast({
          title: SUCCESS_MESSAGES.GOOGLE_CONNECTED,
          description: 'Google connected. Select an ads account to finish setup.',
        })
        void loadGoogleAdAccounts(oauthClientId)
          .then(() => {
            triggerRefresh()
          })
          .catch((error) => {
            logError(error, 'useAdsConnections:oauthSuccess:google')
            const errorMessage = asErrorMessage(error)
            setGoogleSetupMessage(errorMessage)
            notifyFailure({ title: TOAST_TITLES.CONNECTION_FAILED, message: errorMessage })
          })
       } else if (providerId === PROVIDER_IDS.LINKEDIN) {
        void initializeLinkedInIntegration().then(async () => {
          toast({ title: SUCCESS_MESSAGES.LINKEDIN_CONNECTED, description: 'Syncing your ad data.' })
          triggerRefresh()
        }).catch(err => {
          logError(err, 'useAdsConnections:oauthSuccess:linkedin')
          notifyFailure({ title: TOAST_TITLES.CONNECTION_FAILED, error: err })
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

      logError(new Error(errorMessage), `useAdsConnections:oauthError:${providerId}`)

      notifyFailure({ title: `${displayProvider} connection failed`, message: errorMessage })

      setConnectionErrors((prev) => ({ ...prev, [providerId]: errorMessage }))
    }
  }, [initializeLinkedInIntegration, initializeTikTokIntegration, loadGoogleAdAccounts, loadMetaAdAccounts, toast, triggerRefresh])

  useEffect(() => {
    if (!googleNeedsAccountSelection) {
      return
    }

    if (!googleSetupDialogOpen) {
      setGoogleSetupDialogOpen(true)
    }

    if (loadingGoogleAccountOptions || googleAccountOptions.length > 0) {
      return
    }

    void loadGoogleAdAccounts()
      .catch((error) => {
        logError(error, 'useAdsConnections:autoLoadGoogleAccounts')
        setGoogleSetupMessage(asErrorMessage(error))
      })
  }, [
    googleAccountOptions.length,
    googleNeedsAccountSelection,
    googleSetupDialogOpen,
    loadGoogleAdAccounts,
    loadingGoogleAccountOptions,
  ])

  useEffect(() => {
    if (!metaNeedsAccountSelection) {
      return
    }

    if (loadingMetaAccountOptions || metaAccountOptions.length > 0) {
      return
    }

    void loadMetaAdAccounts()
      .catch((error) => {
        logError(error, 'useAdsConnections:autoLoadMetaAccounts')
        setMetaSetupMessage(asErrorMessage(error))
      })
  }, [loadMetaAdAccounts, loadingMetaAccountOptions, metaAccountOptions.length, metaNeedsAccountSelection])

  // Handlers
  const handleConnect = useCallback(async (providerId: string, action: () => Promise<void>) => {
    setConnectingProvider(providerId)
    setConnectionErrors((prev) => ({ ...prev, [providerId]: '' }))
    try {
      await action()
      if (providerId === PROVIDER_IDS.LINKEDIN) await initializeLinkedInIntegration()
      setConnectedProviders((prev) => ({ ...prev, [providerId]: true }))
      triggerRefresh()
    } catch (error: unknown) {
      logError(error, 'useAdsConnections:handleConnect')
      const message = asErrorMessage(error)
      setConnectionErrors((prev) => ({ ...prev, [providerId]: message }))
      setConnectedProviders((prev) => ({ ...prev, [providerId]: false }))
      notifyFailure({ title: TOAST_TITLES.CONNECTION_FAILED, message })
    } finally {
      setConnectingProvider(null)
    }
  }, [initializeLinkedInIntegration, triggerRefresh])

  const handleOauthRedirect = useCallback(async (providerId: string) => {
    if (typeof window === 'undefined') return
    if (providerId === PROVIDER_IDS.GOOGLE) setGoogleSetupMessage(null)
    if (providerId === PROVIDER_IDS.FACEBOOK) setMetaSetupMessage(null)
    if (providerId === PROVIDER_IDS.TIKTOK) setTiktokSetupMessage(null)

    if (convexAuthLoading || !isAuthenticated || !user) {
      const message = ERROR_MESSAGES.SIGN_IN_REQUIRED
      setConnectionErrors((prev) => ({ ...prev, [providerId]: message }))
      notifyFailure({ title: TOAST_TITLES.CONNECTION_FAILED, message })
      router.push('/')
      return
    }

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
      if (providerId === PROVIDER_IDS.GOOGLE) {
        const { url } = await startGoogleOauth(redirectTarget, selectedClientId ?? null)
        window.location.href = url
        return
      }
      throw new Error('This provider does not support OAuth yet.')
    } catch (error: unknown) {
      logError(error, 'useAdsConnections:handleOauthRedirect')
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
      notifyFailure({ title: TOAST_TITLES.CONNECTION_FAILED, message })
    } finally {
      setConnectingProvider(null)
    }
  }, [convexAuthLoading, isAuthenticated, router, selectedClientId, startGoogleOauth, startMetaOauth, startTikTokOauth, user])

  const handleDisconnect = useCallback(async (providerId: string, options?: DisconnectOptions) => {
    const providerName = formatProviderName(providerId)

    if (!workspaceId) {
      notifyFailure({ title: TOAST_TITLES.DISCONNECT_FAILED, message: ERROR_MESSAGES.SIGN_IN_REQUIRED })
      return
    }

    setConnectingProvider(providerId)
    setConnectionErrors((prev) => ({ ...prev, [providerId]: '' }))
    try {
      let deletedMetrics = 0

      if (options?.clearHistoricalData) {
        const result = (await deleteProviderMetricsMutation({
          workspaceId,
          providerId,
          clientId: selectedClientId ?? null,
        })) as { deleted?: number }
        deletedMetrics = typeof result?.deleted === 'number' ? result.deleted : 0
      }

      // Delete sync jobs first, then the integration
      await deleteSyncJobsMutation({ workspaceId, providerId, clientId: selectedClientId ?? null })
      await deleteAdIntegrationMutation({ workspaceId, providerId, clientId: selectedClientId ?? null })
      setConnectedProviders((prev) => ({ ...prev, [providerId]: false }))
      toast({
        title: TOAST_TITLES.DISCONNECTED,
        description: options?.clearHistoricalData
          ? `${SUCCESS_MESSAGES.DISCONNECTED(providerName)} Cleared ${deletedMetrics} historical metric row(s).`
          : SUCCESS_MESSAGES.DISCONNECTED(providerName),
      })
      triggerRefresh()
    } catch (error: unknown) {
      logError(error, 'useAdsConnections:handleDisconnect')
      const message = asErrorMessage(error)
      setConnectionErrors((prev) => ({ ...prev, [providerId]: message }))
      notifyFailure({ title: TOAST_TITLES.DISCONNECT_FAILED, message })
    } finally {
      setConnectingProvider(null)
    }
  }, [
    deleteAdIntegrationMutation,
    deleteProviderMetricsMutation,
    deleteSyncJobsMutation,
    toast,
    triggerRefresh,
    selectedClientId,
    workspaceId,
  ])

  const handleSyncNow = useCallback(async (providerId: string) => {
    if (!workspaceId) {
      notifyFailure({ title: 'Sync failed', message: ERROR_MESSAGES.SIGN_IN_REQUIRED })
      return
    }

    setSyncingProviders((prev) => ({ ...prev, [providerId]: true }))

    try {
      await runManualSyncAction({
        workspaceId,
        providerId,
        clientId: selectedClientId ?? null,
      })

      toast({ title: 'Sync complete', description: `${formatProviderName(providerId)} data has been refreshed.` })
      triggerRefresh()
    } catch (error: unknown) {
      logError(error, 'useAdsConnections:handleSyncNow')
      const message = asErrorMessage(error)
      notifyFailure({ title: 'Sync failed', message })
    } finally {
      setSyncingProviders((prev) => ({ ...prev, [providerId]: false }))
    }
  }, [runManualSyncAction, selectedClientId, toast, triggerRefresh, workspaceId])

  return {
    // State
    connectedProviders,
    connectingProvider,
    connectionErrors,
    integrationStatuses,
    integrationStatusMap,
    automationStatuses,
    syncingProviders,

    // Setup messages
    googleSetupMessage,
    metaSetupMessage,
    tiktokSetupMessage,
    initializingGoogle,
    initializingMeta,
    initializingTikTok,
    googleNeedsAccountSelection,
    metaNeedsAccountSelection,
    tiktokNeedsAccountSelection,
    googleAccountOptions,
    selectedGoogleAccountId,
    setSelectedGoogleAccountId,
    loadingGoogleAccountOptions,
    googleSetupDialogOpen,
    setGoogleSetupDialogOpen,
    metaAccountOptions,
    selectedMetaAccountId,
    setSelectedMetaAccountId,
    loadingMetaAccountOptions,

    // Actions
    handleConnect,
    handleDisconnect,
    handleOauthRedirect,
    handleSyncNow,
    initializeGoogleIntegration,
    initializeMetaIntegration,
    initializeTikTokIntegration,
    reloadGoogleAccountOptions: loadGoogleAdAccounts,
    reloadMetaAccountOptions: loadMetaAdAccounts,

    // Platform definitions
    adPlatforms,

    // Trigger refresh
    triggerRefresh,
  }
}
