'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { useMutation, useQuery } from 'convex/react'

import { useAuth } from '@/contexts/auth-context'
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
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  void initialized

  const regional = useQuery(settingsApi.getMyRegionalPreferences) as
    | { currency?: string | null; timezone?: string | null; locale?: string | null }
    | null
    | undefined

  const updateRegional = useMutation(settingsApi.updateMyRegionalPreferences)

  // Sync preferences from Convex
  useEffect(() => {
    if (!user) {
      setPreferences(DEFAULT_PREFERENCES)
      setInitialized(false)
      setLoading(false)
      setError(null)
      return
    }

    if (regional === undefined) {
      setLoading(true)
      return
    }

    setLoading(false)
    setInitialized(true)

    if (regional === null) {
      setPreferences(DEFAULT_PREFERENCES)
      return
    }

    setPreferences({
      currency: (regional.currency as CurrencyCode) ?? DEFAULT_CURRENCY,
      timezone: regional.timezone ?? null,
      locale: regional.locale ?? null,
    })
  }, [regional, user])

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

        await updateRegional({
          currency: updates.currency,
          timezone: updates.timezone,
          locale: updates.locale,
        })

        setPreferences({
          currency: updates.currency ?? preferences.currency,
          timezone: updates.timezone ?? preferences.timezone,
          locale: updates.locale ?? preferences.locale,
        })
      } catch (err) {
        console.error('Failed to update preferences:', err)
        setError(err instanceof Error ? err.message : 'Failed to update preferences')
        throw err
      }
    },
    [updateRegional, user, preferences]
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

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        loading,
        error,
        updateCurrency,
        updatePreferences,
        refreshPreferences,
      }}
    >
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
