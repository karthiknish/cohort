'use client';
import { notifyFailure, notifySuccess } from '@/lib/notifications';
import { useCallback, useMemo, useState } from 'react';
import { useMutation } from 'convex/react';
import { useAuth } from '@/shared/contexts/auth-context';
import { adsIntegrationsApi } from '@/lib/convex-api';
import { asErrorMessage, logError } from '@/lib/convex-errors';
import type { IntegrationStatus, ProviderAutomationFormState } from '../components/types';
import { DEFAULT_SYNC_FREQUENCY_MINUTES, DEFAULT_TIMEFRAME_DAYS, normalizeFrequency, normalizeTimeframe, formatProviderName, } from '../components/utils';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, TOAST_TITLES, } from '../components/constants';
// =============================================================================
// TYPES
// =============================================================================
export interface UseAdsAutomationOptions {
    /** Integration statuses to sync draft state from */
    automationStatuses: IntegrationStatus[];
    /** Callback when a refresh is triggered */
    onRefresh?: () => void;
}
export interface UseAdsAutomationReturn {
    // Draft state
    automationDraft: Record<string, ProviderAutomationFormState>;
    // UI state
    savingSettings: Record<string, boolean>;
    settingsErrors: Record<string, string>;
    expandedProviders: Record<string, boolean>;
    syncingProvider: string | null;
    // Actions
    updateAutomationDraft: (providerId: string, updates: Partial<ProviderAutomationFormState>) => void;
    handleSaveAutomation: (providerId: string) => Promise<void>;
    toggleAdvanced: (providerId: string) => void;
    runManualSync: (providerId: string) => Promise<void>;
}
// =============================================================================
// HOOK
// =============================================================================
export function useAdsAutomation(options: UseAdsAutomationOptions): UseAdsAutomationReturn {
    const { automationStatuses, onRefresh } = options;
    const { user } = useAuth();
    const updateAutomationSettings = useMutation(adsIntegrationsApi.updateAutomationSettings);
    const requestManualSync = useMutation(adsIntegrationsApi.requestManualSync);
    // State — only local edits; server values are derived below
    const [automationDraftEdits, setAutomationDraftEdits] = useState<{
        key: string;
        draft: Record<string, ProviderAutomationFormState>;
    } | null>(null);
    const [savingSettings, setSavingSettings] = useState<Record<string, boolean>>({});
    const [settingsErrors, setSettingsErrors] = useState<Record<string, string>>({});
    const [expandedProviders, setExpandedProviders] = useState<Record<string, boolean>>({});
    const [syncingProvider, setSyncingProvider] = useState<string | null>(null);
    // Sync automation draft with server state
    // Use JSON key to avoid infinite loops when automationStatuses array reference changes
    const automationStatusesKey = JSON.stringify(automationStatuses.map(s => ({
        id: s.providerId,
        enabled: s.autoSyncEnabled,
        freq: s.syncFrequencyMinutes,
        days: s.scheduledTimeframeDays,
        async: s.metaUseAsyncInsights,
    })));
    const automationDraftFromServer = (() => {
        if (automationStatuses.length === 0) {
            return {} as Record<string, ProviderAutomationFormState>;
        }
        const nextDraft: Record<string, ProviderAutomationFormState> = {};
        automationStatuses.forEach((status) => {
            nextDraft[status.providerId] = {
                autoSyncEnabled: status.autoSyncEnabled !== false,
                syncFrequencyMinutes: normalizeFrequency(status.syncFrequencyMinutes ?? null),
                scheduledTimeframeDays: normalizeTimeframe(status.scheduledTimeframeDays ?? null),
                metaUseAsyncInsights: status.metaUseAsyncInsights === true,
            };
        });
        return nextDraft;
    })();
    const automationDraft = (() => {
        if (automationDraftEdits?.key === automationStatusesKey) {
            return automationDraftEdits.draft;
        }
        return automationDraftFromServer;
    })();
    // Handlers
    const updateAutomationDraft = (providerId: string, updates: Partial<ProviderAutomationFormState>) => {
        setAutomationDraftEdits((prev) => {
            const base = prev?.key === automationStatusesKey ? prev.draft : automationDraftFromServer;
            const current = base[providerId] ?? {
                autoSyncEnabled: true,
                syncFrequencyMinutes: DEFAULT_SYNC_FREQUENCY_MINUTES,
                scheduledTimeframeDays: DEFAULT_TIMEFRAME_DAYS,
            };
            return {
                key: automationStatusesKey,
                draft: { ...base, [providerId]: { ...current, ...updates } },
            };
        });
        setSettingsErrors((prev) => {
            if (!prev[providerId])
                return prev;
            const next = { ...prev };
            delete next[providerId];
            return next;
        });
    };
    const handleSaveAutomation = async (providerId: string) => {
        const draft = automationDraft[providerId];
        if (!draft) {
            notifyFailure({
                message: 'Connect an integration before adjusting automation.',
            });
            return;
        }
        if (!user?.id) {
            notifyFailure({
                message: 'Please sign in again to update your preferences.',
            });
            return;
        }
        setSavingSettings((prev) => ({ ...prev, [providerId]: true }));
        setSettingsErrors((prev) => ({ ...prev, [providerId]: '' }));
        try {
            if (!user?.agencyId) {
                throw new Error('Missing workspace id');
            }
            await updateAutomationSettings({
                workspaceId: String(user.agencyId),
                providerId,
                clientId: null,
                autoSyncEnabled: draft.autoSyncEnabled,
                syncFrequencyMinutes: draft.syncFrequencyMinutes,
                scheduledTimeframeDays: draft.scheduledTimeframeDays,
                metaUseAsyncInsights: providerId === 'facebook' ? draft.metaUseAsyncInsights === true : undefined,
            });
            notifySuccess({
                title: TOAST_TITLES.AUTOMATION_UPDATED,
                message: SUCCESS_MESSAGES.AUTOMATION_UPDATED(formatProviderName(providerId)),
            });
            onRefresh?.();
        }
        catch (error: unknown) {
            logError(error, 'useAdsAutomation:handleSaveAutomation');
            const message = asErrorMessage(error);
            setSettingsErrors((prev) => ({ ...prev, [providerId]: message }));
            notifyFailure({
                message: message,
            });
        }
        finally {
            setSavingSettings((prev) => ({ ...prev, [providerId]: false }));
        }
    };
    const toggleAdvanced = (providerId: string) => {
        setExpandedProviders((prev) => ({ ...prev, [providerId]: !prev[providerId] }));
    };
    const runManualSync = async (providerId: string) => {
        if (!user?.id) {
            notifyFailure({
                title: TOAST_TITLES.UNABLE_TO_SYNC,
                message: ERROR_MESSAGES.SIGN_IN_REQUIRED,
            });
            return;
        }
        setSyncingProvider(providerId);
        try {
            if (!user?.agencyId) {
                throw new Error('Missing workspace id');
            }
            // Queue sync job in Convex.
            await requestManualSync({
                workspaceId: String(user.agencyId),
                providerId,
                clientId: null,
            });
            const providerName = formatProviderName(providerId);
            const successMessage = SUCCESS_MESSAGES.SYNC_COMPLETE(providerName);
            notifySuccess({ title: TOAST_TITLES.SYNC_COMPLETE, message: successMessage });
            onRefresh?.();
        }
        catch (error: unknown) {
            logError(error, 'useAdsAutomation:runManualSync');
            const message = asErrorMessage(error);
            notifyFailure({
                message: message,
            });
        }
        finally {
            setSyncingProvider(null);
        }
    };
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
    };
}
