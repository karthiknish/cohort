'use client';

import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { asErrorMessage, logError } from '@/lib/convex-errors';
import { useAuth } from '@/shared/contexts/auth-context';
import { DEFAULT_CURRENCY, type CurrencyCode } from '@/constants/currencies';
import { settingsApi } from '@/lib/convex-api';

interface UserPreferences {
  currency: CurrencyCode;
  timezone: string | null;
  locale: string | null;
}

interface PreferencesValue {
  preferences: UserPreferences;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  updateCurrency: (currency: CurrencyCode) => Promise<void>;
  updatePreferences: (updates: Partial<Omit<UserPreferences, 'updatedAt'>>) => Promise<void>;
  refreshPreferences: () => Promise<void>;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  currency: DEFAULT_CURRENCY,
  timezone: null,
  locale: null,
};

/**
 * Hook for user preferences — no provider needed.
 * Reads directly from Convex via `useQuery`.
 */
export function usePreferences(): PreferencesValue {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [optimisticPreferences, setOptimisticPreferences] = useState<Partial<UserPreferences> | null>(null);

  const regional = useQuery(settingsApi.getMyRegionalPreferences) as {
    currency?: string | null;
    timezone?: string | null;
    locale?: string | null;
  } | null | undefined;

  const updateRegional = useMutation(settingsApi.updateMyRegionalPreferences);

  const loading = Boolean(user && regional === undefined);

  const basePreferences = useMemo<UserPreferences>(() => {
    if (!user || regional === undefined || regional === null) {
      return DEFAULT_PREFERENCES;
    }
    return {
      currency: (regional.currency as CurrencyCode) ?? DEFAULT_CURRENCY,
      timezone: regional.timezone ?? null,
      locale: regional.locale ?? null,
    };
  }, [user, regional]);

  const preferences = useMemo<UserPreferences>(() => {
    if (!user || !optimisticPreferences) return basePreferences;
    return { ...basePreferences, ...optimisticPreferences };
  }, [user, optimisticPreferences, basePreferences]);

  const updatePreferences = useCallback(
    async (updates: Partial<Omit<UserPreferences, 'updatedAt'>>) => {
      if (!user) throw new Error('Must be logged in to update preferences');
      try {
        setError(null);
        const optimisticUpdate: Partial<UserPreferences> = {};
        if (updates.currency !== undefined) optimisticUpdate.currency = updates.currency;
        if (updates.timezone !== undefined) optimisticUpdate.timezone = updates.timezone;
        if (updates.locale !== undefined) optimisticUpdate.locale = updates.locale;
        setOptimisticPreferences((current) => ({ ...(current ?? {}), ...optimisticUpdate }));
        await updateRegional({
          currency: updates.currency,
          timezone: updates.timezone,
          locale: updates.locale,
        });
      } catch (err) {
        logError(err, 'usePreferences:updatePreferences');
        setOptimisticPreferences(null);
        setError(asErrorMessage(err));
        throw err;
      }
    },
    [user, updateRegional],
  );

  const updateCurrency = useCallback(
    async (currency: CurrencyCode) => {
      await updatePreferences({ currency });
    },
    [updatePreferences],
  );

  const refreshPreferences = useCallback(async () => {}, []);
  const clearError = useCallback(() => setError(null), []);

  return {
    preferences,
    loading,
    error,
    clearError,
    updateCurrency,
    updatePreferences,
    refreshPreferences,
  };
}

/**
 * Hook to get just the currency for formatting.
 * Returns the user's preferred currency or USD as default.
 */
export function useCurrency(): CurrencyCode {
  const { preferences } = usePreferences();
  return preferences.currency ?? DEFAULT_CURRENCY;
}
