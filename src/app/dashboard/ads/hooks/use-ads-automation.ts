'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/components/ui/use-toast'

import type { IntegrationStatus, ProviderAutomationFormState } from '../components/types'
import { parseApiError } from '../components/types'
import {
  DEFAULT_SYNC_FREQUENCY_MINUTES,
  DEFAULT_TIMEFRAME_DAYS,
  normalizeFrequency,
  normalizeTimeframe,
  getErrorMessage,
  formatProviderName,
  retryFetch,
  getRetryableErrorMessage,
  NetworkError,
} from '../components/utils'
import { 
  API_ENDPOINTS, 
  HTTP_NO_CONTENT,
  ERROR_MESSAGES, 
  SUCCESS_MESSAGES, 
  TOAST_TITLES,
} from '../components/constants'

// =============================================================================
// TYPES
// =============================================================================

export interface UseAdsAutomationOptions {
  /** Integration statuses to sync draft state from */
  automationStatuses: IntegrationStatus[]
  /** Callback when a refresh is triggered */
  onRefresh?: () => void
}

export interface UseAdsAutomationReturn {
  // Draft state
  automationDraft: Record<string, ProviderAutomationFormState>
  
  // UI state
  savingSettings: Record<string, boolean>
  settingsErrors: Record<string, string>
  expandedProviders: Record<string, boolean>
  syncingProvider: string | null
  
  // Actions
  updateAutomationDraft: (providerId: string, updates: Partial<ProviderAutomationFormState>) => void
  handleSaveAutomation: (providerId: string) => Promise<void>
  toggleAdvanced: (providerId: string) => void
  runManualSync: (providerId: string) => Promise<void>
}

// =============================================================================
// HOOK
// =============================================================================

export function useAdsAutomation(options: UseAdsAutomationOptions): UseAdsAutomationReturn {
  const { automationStatuses, onRefresh } = options
  
  const { user, getIdToken } = useAuth()
  const { toast } = useToast()

  // State
  const [automationDraft, setAutomationDraft] = useState<Record<string, ProviderAutomationFormState>>({})
  const [savingSettings, setSavingSettings] = useState<Record<string, boolean>>({})
  const [settingsErrors, setSettingsErrors] = useState<Record<string, string>>({})
  const [expandedProviders, setExpandedProviders] = useState<Record<string, boolean>>({})
  const [syncingProvider, setSyncingProvider] = useState<string | null>(null)

  // Sync automation draft with server state
  // Use JSON key to avoid infinite loops when automationStatuses array reference changes
  const automationStatusesKey = useMemo(
    () => JSON.stringify(automationStatuses.map(s => ({
      id: s.providerId,
      enabled: s.autoSyncEnabled,
      freq: s.syncFrequencyMinutes,
      days: s.scheduledTimeframeDays,
    }))),
    [automationStatuses]
  )

  useEffect(() => {
    if (automationStatuses.length === 0) {
      setAutomationDraft(prev => {
        // Only update if not already empty
        if (Object.keys(prev).length === 0) return prev
        return {}
      })
      return
    }
    const nextDraft: Record<string, ProviderAutomationFormState> = {}
    automationStatuses.forEach((status) => {
      nextDraft[status.providerId] = {
        autoSyncEnabled: status.autoSyncEnabled !== false,
        syncFrequencyMinutes: normalizeFrequency(status.syncFrequencyMinutes ?? null),
        scheduledTimeframeDays: normalizeTimeframe(status.scheduledTimeframeDays ?? null),
      }
    })
    setAutomationDraft(nextDraft)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [automationStatusesKey])

  // Handlers
  const updateAutomationDraft = useCallback(
    (providerId: string, updates: Partial<ProviderAutomationFormState>) => {
      setAutomationDraft((prev) => {
        const current = prev[providerId] ?? {
          autoSyncEnabled: true,
          syncFrequencyMinutes: DEFAULT_SYNC_FREQUENCY_MINUTES,
          scheduledTimeframeDays: DEFAULT_TIMEFRAME_DAYS,
        }
        return { ...prev, [providerId]: { ...current, ...updates } }
      })
      setSettingsErrors((prev) => {
        if (!prev[providerId]) return prev
        const next = { ...prev }
        delete next[providerId]
        return next
      })
    },
    []
  )

  const handleSaveAutomation = useCallback(
    async (providerId: string) => {
      const draft = automationDraft[providerId]
      if (!draft) {
        toast({
          variant: 'destructive',
          title: TOAST_TITLES.NO_SETTINGS,
          description: 'Connect an integration before adjusting automation.',
        })
        return
      }
      if (!user?.id) {
        toast({
          variant: 'destructive',
          title: TOAST_TITLES.SESSION_EXPIRED,
          description: 'Please sign in again to update your preferences.',
        })
        return
      }

      setSavingSettings((prev) => ({ ...prev, [providerId]: true }))
      setSettingsErrors((prev) => ({ ...prev, [providerId]: '' }))

      try {
        const token = await getIdToken()
        const response = await fetch(API_ENDPOINTS.INTEGRATIONS.SETTINGS, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            providerId,
            autoSyncEnabled: draft.autoSyncEnabled,
            syncFrequencyMinutes: draft.syncFrequencyMinutes,
            scheduledTimeframeDays: draft.scheduledTimeframeDays,
          }),
        })
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}))
          throw new Error(parseApiError(payload) ?? ERROR_MESSAGES.SAVE_SETTINGS_FAILED)
        }
        toast({
          title: TOAST_TITLES.AUTOMATION_UPDATED,
          description: SUCCESS_MESSAGES.AUTOMATION_UPDATED(formatProviderName(providerId)),
        })
        onRefresh?.()
      } catch (error: unknown) {
        const message = getErrorMessage(error, ERROR_MESSAGES.SAVE_SETTINGS_FAILED)
        setSettingsErrors((prev) => ({ ...prev, [providerId]: message }))
        toast({ variant: 'destructive', title: TOAST_TITLES.SAVE_FAILED, description: message })
      } finally {
        setSavingSettings((prev) => ({ ...prev, [providerId]: false }))
      }
    },
    [automationDraft, getIdToken, toast, user?.id, onRefresh]
  )

  const toggleAdvanced = useCallback((providerId: string) => {
    setExpandedProviders((prev) => ({ ...prev, [providerId]: !prev[providerId] }))
  }, [])

  const runManualSync = useCallback(
    async (providerId: string) => {
      if (!user?.id) {
        toast({ variant: 'destructive', title: TOAST_TITLES.UNABLE_TO_SYNC, description: ERROR_MESSAGES.SIGN_IN_REQUIRED })
        return
      }
      setSyncingProvider(providerId)
      let retryCount = 0

      try {
        const token = await getIdToken()
        
        // Schedule the sync with retry
        const scheduleResponse = await retryFetch(
          API_ENDPOINTS.INTEGRATIONS.MANUAL_SYNC,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ providerId, force: true }),
          },
          {
            maxRetries: 3,
            onRetry: (attempt: number, error: Error, delayMs: number) => {
              retryCount = attempt
              toast({
                title: `Retrying sync... (${attempt}/3)`,
                description: error instanceof NetworkError 
                  ? 'Connection issue. Retrying...' 
                  : `Server busy. Waiting ${Math.round(delayMs / 1000)}s...`,
              })
            },
          }
        )
        
        const schedulePayload = (await scheduleResponse.json().catch(() => ({}))) as { scheduled?: boolean; message?: string }
        if (!schedulePayload?.scheduled) {
          toast({
            title: TOAST_TITLES.NOTHING_TO_SYNC,
            description: schedulePayload?.message ?? 'A sync is already running for this provider.',
          })
          return
        }
        
        // Process the sync with retry
        const processResponse = await retryFetch(
          API_ENDPOINTS.INTEGRATIONS.PROCESS,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          },
          {
            maxRetries: 3,
            onRetry: (attempt: number, error: Error, delayMs: number) => {
              retryCount = attempt
              toast({
                title: `Processing sync... (retry ${attempt}/3)`,
                description: error instanceof NetworkError 
                  ? 'Connection issue. Retrying...' 
                  : `Server busy. Waiting ${Math.round(delayMs / 1000)}s...`,
              })
            },
          }
        )
        
        if (!processResponse.ok && processResponse.status !== HTTP_NO_CONTENT) {
          const payload = await processResponse.json().catch(() => ({}))
          throw new Error(parseApiError(payload) ?? ERROR_MESSAGES.PROCESS_SYNC_FAILED)
        }
        
        const providerName = formatProviderName(providerId)
        const successMessage = retryCount > 0 
          ? SUCCESS_MESSAGES.SYNC_COMPLETE_WITH_RETRIES(providerName, retryCount)
          : SUCCESS_MESSAGES.SYNC_COMPLETE(providerName)
        
        toast({ title: TOAST_TITLES.SYNC_COMPLETE, description: successMessage })
        onRefresh?.()
      } catch (error: unknown) {
        const message = getRetryableErrorMessage(error)
        const isNetworkIssue = error instanceof NetworkError
        
        toast({ 
          variant: 'destructive', 
          title: isNetworkIssue ? TOAST_TITLES.CONNECTION_FAILED : TOAST_TITLES.SYNC_FAILED, 
          description: message,
        })
      } finally {
        setSyncingProvider(null)
      }
    },
    [getIdToken, toast, user?.id, onRefresh]
  )

  return {
    // Draft state
    automationDraft,
    
    // UI state
    savingSettings,
    settingsErrors,
    expandedProviders,
    syncingProvider,
    
    // Actions
    updateAutomationDraft,
    handleSaveAutomation,
    toggleAdvanced,
    runManualSync,
  }
}
