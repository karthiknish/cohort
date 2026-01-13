'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMutation } from 'convex/react'

import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/components/ui/use-toast'
import { adsIntegrationsApi } from '@/lib/convex-api'

import type { IntegrationStatus, ProviderAutomationFormState } from '../components/types'
import { parseApiError } from '../components/types'
import {
  DEFAULT_SYNC_FREQUENCY_MINUTES,
  DEFAULT_TIMEFRAME_DAYS,
  normalizeFrequency,
  normalizeTimeframe,
  formatProviderName,
} from '../components/utils'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import {
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
  
  const { user } = useAuth()
  const { toast } = useToast()

  const updateAutomationSettings = useMutation(adsIntegrationsApi.updateAutomationSettings)
  const requestManualSync = useMutation(adsIntegrationsApi.requestManualSync)

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
        if (!user?.agencyId) {
          throw new Error('Missing workspace id')
        }

        await updateAutomationSettings({
          workspaceId: String(user.agencyId),
          providerId,
          clientId: null,
          autoSyncEnabled: draft.autoSyncEnabled,
          syncFrequencyMinutes: draft.syncFrequencyMinutes,
          scheduledTimeframeDays: draft.scheduledTimeframeDays,
        })
        toast({
          title: TOAST_TITLES.AUTOMATION_UPDATED,
          description: SUCCESS_MESSAGES.AUTOMATION_UPDATED(formatProviderName(providerId)),
        })
        onRefresh?.()
      } catch (error: unknown) {
        logError(error, 'useAdsAutomation:handleSaveAutomation')
        const message = asErrorMessage(error)
        setSettingsErrors((prev) => ({ ...prev, [providerId]: message }))
        toast({ variant: 'destructive', title: TOAST_TITLES.SAVE_FAILED, description: message })
      } finally {
        setSavingSettings((prev) => ({ ...prev, [providerId]: false }))
      }
    },
    [automationDraft, toast, user?.agencyId, updateAutomationSettings, onRefresh]
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

      try {
        if (!user?.agencyId) {
          throw new Error('Missing workspace id')
        }

        // Queue sync job in Convex.
        await requestManualSync({
          workspaceId: String(user.agencyId),
          providerId,
          clientId: null,
          force: true,
        })

        const providerName = formatProviderName(providerId)
        const successMessage = SUCCESS_MESSAGES.SYNC_COMPLETE(providerName)
        
        toast({ title: TOAST_TITLES.SYNC_COMPLETE, description: successMessage })
        onRefresh?.()
      } catch (error: unknown) {
        logError(error, 'useAdsAutomation:runManualSync')
        const message = asErrorMessage(error)

        toast({
          variant: 'destructive',
          title: TOAST_TITLES.SYNC_FAILED,
          description: message,
        })
      } finally {
        setSyncingProvider(null)
      }
    },
    [toast, user?.agencyId, requestManualSync, onRefresh]
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
