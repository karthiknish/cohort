'use client';
import { createContext, use, useCallback, useMemo, useState, type ReactNode } from 'react';
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
interface PreferencesContextValue {
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
const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);
interface PreferencesProviderProps {
    children: ReactNode;
}
export function PreferencesProvider({ children }: PreferencesProviderProps) {
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
    const basePreferences = (() => {
        if (!user || regional === undefined || regional === null) {
            return DEFAULT_PREFERENCES;
        }
        return {
            currency: (regional.currency as CurrencyCode) ?? DEFAULT_CURRENCY,
            timezone: regional.timezone ?? null,
            locale: regional.locale ?? null,
        };
    })();
    const preferences = (() => {
        if (!user || !optimisticPreferences) {
            return basePreferences;
        }
        return {
            ...basePreferences,
            ...optimisticPreferences,
        };
    })();
    const fetchPreferences = async () => {
        // Backwards-compat shim: keep signature used by callers.
        // Convex `useQuery` already keeps this data fresh.
        return;
    };
    // Convex query drives preferences; no manual fetch needed.
    const updatePreferences = async (updates: Partial<Omit<UserPreferences, 'updatedAt'>>) => {
        if (!user) {
            throw new Error('Must be logged in to update preferences');
        }
        try {
            setError(null);
            const optimisticUpdate: Partial<UserPreferences> = {};
            if (updates.currency !== undefined) {
                optimisticUpdate.currency = updates.currency;
            }
            if (updates.timezone !== undefined) {
                optimisticUpdate.timezone = updates.timezone;
            }
            if (updates.locale !== undefined) {
                optimisticUpdate.locale = updates.locale;
            }
            setOptimisticPreferences((current) => ({
                ...(current ?? {}),
                ...optimisticUpdate,
            }));
            await updateRegional({
                currency: updates.currency,
                timezone: updates.timezone,
                locale: updates.locale,
            });
        }
        catch (err) {
            logError(err, 'preferences-context:updatePreferences');
            setOptimisticPreferences(null);
            setError(asErrorMessage(err));
            throw err;
        }
    };
    const updateCurrency = async (currency: CurrencyCode) => {
        await updatePreferences({ currency });
    };
    const refreshPreferences = async () => {
        await fetchPreferences();
    };
    const clearError = useCallback(() => {
        setError(null);
    }, []);
    const contextValue = useMemo(() => ({
        preferences,
        loading,
        error,
        clearError,
        updateCurrency,
        updatePreferences,
        refreshPreferences,
    }), [preferences, loading, error, clearError, updateCurrency, updatePreferences, refreshPreferences]);
    return (<PreferencesContext.Provider value={contextValue}>
      {children}
    </PreferencesContext.Provider>);
}
export function usePreferences() {
    const context = use(PreferencesContext);
    if (context === undefined) {
        throw new Error('usePreferences must be used within a PreferencesProvider');
    }
    return context;
}
/**
 * Hook to get just the currency for formatting
 * Returns the user's preferred currency or USD as default
 */
export function useCurrency(): CurrencyCode {
    const context = use(PreferencesContext);
    return context?.preferences.currency ?? DEFAULT_CURRENCY;
}
