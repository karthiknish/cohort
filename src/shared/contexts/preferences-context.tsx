'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { useMutation, useQuery } from 'convex/react'

import { asErrorMessage } from '@/lib/convex-errors'
import { useAuth } from '@/shared/contexts/auth-context'
import { DEFAULT_CURRENCY, type CurrencyCode } from '@/constants/currencies'
import { settingsApi } from '@/lib/convex-api'

interface UserPreferences {
  currency: CurrencyCode
  timezone: string | null
  locale: string | null
}

interface PreferencesContextValue {
  preferences: UserPreferences
  loading: boolean
  error: string | null
  clearError: () => void
  updateCurrency: (currency: CurrencyCode) => Promise<void>
  updatePreferences: (updates: Partial<Omit<UserPreferences, 'updatedAt'>>) => Promise<void>
  refreshPreferences: () => Promise<void>
}

const DEFAULT_PREFERENCES: UserPreferences = {
  currency: DEFAULT_CURRENCY,
  timezone: null,
  locale: null,
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined)

interface PreferencesProviderProps {
  children: ReactNode
}

export function PreferencesProvider({ children }: PreferencesProviderProps) {
  const { user } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [optimisticPreferences, setOptimisticPreferences] = useState<Partial<UserPreferences> | null>(null)

  const regional = useQuery(settingsApi.getMyRegionalPreferences) as
    | { currency?: string | null; timezone?: string | null; locale?: string | null }
    | null
    | undefined

  const updateRegional = useMutation(settingsApi.updateMyRegionalPreferences)

  const loading = Boolean(user && regional === undefined)

  const basePreferences = useMemo<UserPreferences>(() => {
    if (!user || regional === undefined || regional === null) {
      return DEFAULT_PREFERENCES
    }

    return {
      currency: (regional.currency as CurrencyCode) ?? DEFAULT_CURRENCY,
      timezone: regional.timezone ?? null,
      locale: regional.locale ?? null,
    }
  }, [regional, user])

  const preferences = useMemo<UserPreferences>(() => {
    if (!user || !optimisticPreferences) {
      return basePreferences
    }

    return {
      ...basePreferences,
      ...optimisticPreferences,
    }
  }, [basePreferences, optimisticPreferences, user])

  const fetchPreferences = useCallback(async () => {
    // Backwards-compat shim: keep signature used by callers.
    // Convex `useQuery` already keeps this data fresh.
    return
  }, [])

  // Convex query drives preferences; no manual fetch needed.

  const updatePreferences = useCallback(
    async (updates: Partial<Omit<UserPreferences, 'updatedAt'>>) => {
      if (!user) {
        throw new Error('Must be logged in to update preferences')
      }

      try {
        setError(null)

        const optimisticUpdate: Partial<UserPreferences> = {}
        if (updates.currency !== undefined) {
          optimisticUpdate.currency = updates.currency
        }
        if (updates.timezone !== undefined) {
          optimisticUpdate.timezone = updates.timezone
        }
        if (updates.locale !== undefined) {
          optimisticUpdate.locale = updates.locale
        }

        setOptimisticPreferences((current) => ({
          ...(current ?? {}),
          ...optimisticUpdate,
        }))

        await updateRegional({
          currency: updates.currency,
          timezone: updates.timezone,
          locale: updates.locale,
        })
      } catch (err) {
        console.error('Failed to update preferences:', err)
        setOptimisticPreferences(null)
        setError(asErrorMessage(err))
        throw err
      }
    },
    [updateRegional, user]
  )

  const updateCurrency = useCallback(
    async (currency: CurrencyCode) => {
      await updatePreferences({ currency })
    },
    [updatePreferences]
  )

  const refreshPreferences = useCallback(async () => {
    await fetchPreferences()
  }, [fetchPreferences])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const contextValue = useMemo(
    () => ({
      preferences,
      loading,
      error,
      clearError,
      updateCurrency,
      updatePreferences,
      refreshPreferences,
    }),
    [clearError, error, loading, preferences, refreshPreferences, updateCurrency, updatePreferences],
  )

  return (
    <PreferencesContext.Provider value={contextValue}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider')
  }
  return context
}

/**
 * Hook to get just the currency for formatting
 * Returns the user's preferred currency or USD as default
 */
export function useCurrency(): CurrencyCode {
  const context = useContext(PreferencesContext)
  return context?.preferences.currency ?? DEFAULT_CURRENCY
}
