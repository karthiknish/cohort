'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

import { useAuth } from '@/contexts/auth-context'
import { DEFAULT_CURRENCY, type CurrencyCode } from '@/constants/currencies'

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
  const { user, getIdToken } = useAuth()
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  const fetchPreferences = useCallback(async () => {
    if (!user) {
      setPreferences(DEFAULT_PREFERENCES)
      setInitialized(true)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const token = await getIdToken()

      const response = await fetch('/api/settings/preferences', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch preferences')
      }

      const payload = await response.json() as { success?: boolean; data?: { preferences?: UserPreferences }; preferences?: UserPreferences }
      // Handle both new envelope { success, data: { preferences } } and legacy { preferences }
      const prefs = payload.data?.preferences ?? payload.preferences
      setPreferences({
        currency: prefs?.currency ?? DEFAULT_CURRENCY,
        timezone: prefs?.timezone ?? null,
        locale: prefs?.locale ?? null,
      })
    } catch (err) {
      console.error('Failed to fetch preferences:', err)
      setError(err instanceof Error ? err.message : 'Failed to load preferences')
      // Use defaults on error
      setPreferences(DEFAULT_PREFERENCES)
    } finally {
      setLoading(false)
      setInitialized(true)
    }
  }, [user, getIdToken])

  // Fetch preferences on mount and when user changes
  useEffect(() => {
    if (user && !initialized) {
      void fetchPreferences()
    } else if (!user) {
      setPreferences(DEFAULT_PREFERENCES)
      setInitialized(false)
    }
  }, [user, initialized, fetchPreferences])

  const updatePreferences = useCallback(
    async (updates: Partial<Omit<UserPreferences, 'updatedAt'>>) => {
      if (!user) {
        throw new Error('Must be logged in to update preferences')
      }

      try {
        setError(null)
        const token = await getIdToken()

        const response = await fetch('/api/settings/preferences', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        })

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}))
          throw new Error(payload.error || 'Failed to update preferences')
        }

        const payload = await response.json() as { success?: boolean; data?: { preferences?: UserPreferences }; preferences?: UserPreferences }
        // Handle both new envelope { success, data: { preferences } } and legacy { preferences }
        const prefs = payload.data?.preferences ?? payload.preferences
        setPreferences({
          currency: prefs?.currency ?? preferences.currency,
          timezone: prefs?.timezone ?? preferences.timezone,
          locale: prefs?.locale ?? preferences.locale,
        })
      } catch (err) {
        console.error('Failed to update preferences:', err)
        setError(err instanceof Error ? err.message : 'Failed to update preferences')
        throw err
      }
    },
    [user, getIdToken, preferences]
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
