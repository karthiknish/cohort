'use client';
import { useCallback, useEffect, useState } from 'react';
import { useAction } from 'convex/react';
import { adsIntegrationsApi } from '@/lib/convex-api';
import { convexErrorMessage, reportConvexFailure } from '@/lib/handle-convex-error';
import { notifySuccess } from '@/lib/notifications';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, TOAST_TITLES, } from '../components/constants';
import type { GoogleAdAccountOption, MetaAdAccountOption, LinkedInAdAccountOption, TikTokAdAccountOption, } from './ads-connections-types';
type UseAdsProviderSetupArgs = {
    workspaceId: string | null;
    selectedClientId: string | null;
    triggerRefresh: () => void;
};
export function useAdsProviderSetup({ workspaceId, selectedClientId, triggerRefresh, }: UseAdsProviderSetupArgs) {
    const initializeAdAccount = useAction(adsIntegrationsApi.initializeAdAccount);
    const listGoogleAdAccounts = useAction(adsIntegrationsApi.listGoogleAdAccounts);
    const listMetaAdAccounts = useAction(adsIntegrationsApi.listMetaAdAccounts);
    const listLinkedInAdAccounts = useAction(adsIntegrationsApi.listLinkedInAdAccounts);
    const listTikTokAdAccounts = useAction(adsIntegrationsApi.listTikTokAdAccounts);
    const [googleSetupUi, setGoogleSetupUi] = useState({
        message: null as string | null,
        dialogOpen: false,
    });
    const googleSetupMessage = googleSetupUi.message;
    const setGoogleSetupMessage = (message: string | null) => {
        setGoogleSetupUi((prev) => ({ ...prev, message }));
    };
    const setGoogleSetupDialogOpen = (dialogOpen: boolean) => {
        setGoogleSetupUi((prev) => ({ ...prev, dialogOpen }));
    };
    const [metaSetupMessage, setMetaSetupMessage] = useState<string | null>(null);
    const [tiktokSetupMessage, setTiktokSetupMessage] = useState<string | null>(null);
    const [linkedinSetupMessage, setLinkedinSetupMessage] = useState<string | null>(null);
    const [initializingGoogle, setInitializingGoogle] = useState(false);
    const [initializingMeta, setInitializingMeta] = useState(false);
    const [initializingTikTok, setInitializingTikTok] = useState(false);
    const [initializingLinkedIn, setInitializingLinkedIn] = useState(false);
    const [googleAccountOptions, setGoogleAccountOptions] = useState<GoogleAdAccountOption[]>([]);
    const [selectedGoogleAccountId, setSelectedGoogleAccountId] = useState('');
    const [loadingGoogleAccountOptions, setLoadingGoogleAccountOptions] = useState(false);
    const [metaAccountOptions, setMetaAccountOptions] = useState<MetaAdAccountOption[]>([]);
    const [selectedMetaAccountId, setSelectedMetaAccountId] = useState('');
    const [loadingMetaAccountOptions, setLoadingMetaAccountOptions] = useState(false);
    const [linkedinAccountOptions, setLinkedinAccountOptions] = useState<LinkedInAdAccountOption[]>([]);
    const [selectedLinkedInAccountId, setSelectedLinkedInAccountId] = useState('');
    const [loadingLinkedInAccountOptions, setLoadingLinkedInAccountOptions] = useState(false);
    const [tiktokAccountOptions, setTiktokAccountOptions] = useState<TikTokAdAccountOption[]>([]);
    const [selectedTikTokAccountId, setSelectedTikTokAccountId] = useState('');
    const [loadingTikTokAccountOptions, setLoadingTikTokAccountOptions] = useState(false);
    useEffect(() => {
        setGoogleAccountOptions([]);
        setSelectedGoogleAccountId('');
        setGoogleSetupDialogOpen(false);
        setMetaAccountOptions([]);
        setSelectedMetaAccountId('');
        setLinkedinAccountOptions([]);
        setSelectedLinkedInAccountId('');
        setTiktokAccountOptions([]);
        setSelectedTikTokAccountId('');
    }, [selectedClientId]);
    const loadGoogleAdAccounts = async (clientIdOverride?: string | null) => {
        if (!workspaceId) {
            throw new Error(ERROR_MESSAGES.SIGN_IN_REQUIRED);
        }
        setLoadingGoogleAccountOptions(true);
        try {
            const payload = (await listGoogleAdAccounts({
                workspaceId,
                providerId: 'google',
                clientId: clientIdOverride ?? selectedClientId ?? null,
            })) as GoogleAdAccountOption[];
            const options = Array.isArray(payload) ? payload : [];
            setGoogleAccountOptions(options);
            setSelectedGoogleAccountId((currentValue) => {
                if (currentValue && options.some((option) => option.id === currentValue && !option.isManager)) {
                    return currentValue;
                }
                const defaultOption = options.find((option) => !option.isManager) ?? options[0];
                return defaultOption?.id ?? '';
            });
            return options;
        }
        catch (error) {
            setGoogleAccountOptions([]);
            setSelectedGoogleAccountId('');
            throw error;
        }
        finally {
            setLoadingGoogleAccountOptions(false);
        }
    };
    const loadMetaAdAccounts = async (clientIdOverride?: string | null) => {
        if (!workspaceId) {
            throw new Error(ERROR_MESSAGES.SIGN_IN_REQUIRED);
        }
        setLoadingMetaAccountOptions(true);
        try {
            const payload = (await listMetaAdAccounts({
                workspaceId,
                providerId: 'facebook',
                clientId: clientIdOverride ?? selectedClientId ?? null,
            })) as MetaAdAccountOption[];
            const options = Array.isArray(payload) ? payload : [];
            setMetaAccountOptions(options);
            setSelectedMetaAccountId((currentValue) => {
                if (currentValue && options.some((option) => option.id === currentValue)) {
                    return currentValue;
                }
                const defaultOption = options.find((option) => option.isActive) ?? options[0];
                return defaultOption?.id ?? '';
            });
            return options;
        }
        catch (error) {
            setMetaAccountOptions([]);
            setSelectedMetaAccountId('');
            throw error;
        }
        finally {
            setLoadingMetaAccountOptions(false);
        }
    };
    const loadLinkedInAdAccounts = async (clientIdOverride?: string | null) => {
        if (!workspaceId) {
            throw new Error(ERROR_MESSAGES.SIGN_IN_REQUIRED);
        }
        setLoadingLinkedInAccountOptions(true);
        try {
            const payload = (await listLinkedInAdAccounts({
                workspaceId,
                providerId: 'linkedin',
                clientId: clientIdOverride ?? selectedClientId ?? null,
            })) as LinkedInAdAccountOption[];
            const options = Array.isArray(payload) ? payload : [];
            setLinkedinAccountOptions(options);
            setSelectedLinkedInAccountId((currentValue) => {
                if (currentValue && options.some((option) => option.id === currentValue)) {
                    return currentValue;
                }
                const defaultOption = options.find((option) => option.isActive) ?? options[0];
                return defaultOption?.id ?? '';
            });
            return options;
        }
        catch (error) {
            setLinkedinAccountOptions([]);
            setSelectedLinkedInAccountId('');
            throw error;
        }
        finally {
            setLoadingLinkedInAccountOptions(false);
        }
    };
    const loadTikTokAdAccounts = async (clientIdOverride?: string | null) => {
        if (!workspaceId) {
            throw new Error(ERROR_MESSAGES.SIGN_IN_REQUIRED);
        }
        setLoadingTikTokAccountOptions(true);
        try {
            const payload = (await listTikTokAdAccounts({
                workspaceId,
                providerId: 'tiktok',
                clientId: clientIdOverride ?? selectedClientId ?? null,
            })) as TikTokAdAccountOption[];
            const options = Array.isArray(payload) ? payload : [];
            setTiktokAccountOptions(options);
            setSelectedTikTokAccountId((currentValue) => {
                if (currentValue && options.some((option) => option.id === currentValue)) {
                    return currentValue;
                }
                const defaultOption = options.find((option) => option.isActive) ?? options[0];
                return defaultOption?.id ?? '';
            });
            return options;
        }
        catch (error) {
            setTiktokAccountOptions([]);
            setSelectedTikTokAccountId('');
            throw error;
        }
        finally {
            setLoadingTikTokAccountOptions(false);
        }
    };
    const initializeGoogleIntegration = async (clientIdOverride?: string | null, accountIdOverride?: string | null) => {
        setGoogleSetupMessage(null);
        setInitializingGoogle(true);
        try {
            if (!workspaceId) {
                throw new Error(ERROR_MESSAGES.SIGN_IN_REQUIRED);
            }
            const accountId = (accountIdOverride ?? selectedGoogleAccountId).trim();
            if (!accountId) {
                throw new Error('Please select a Google Ads account to finish setup.');
            }
            const payload = (await initializeAdAccount({
                workspaceId,
                providerId: 'google',
                clientId: clientIdOverride ?? selectedClientId ?? null,
                accountId,
            })) as {
                accountName?: string;
            };
            notifySuccess({
                title: SUCCESS_MESSAGES.GOOGLE_CONNECTED,
                message: payload?.accountName
                    ? `Syncing data from ${payload.accountName}.`
                    : 'Google Ads account linked successfully.',
            });
            setGoogleAccountOptions([]);
            setSelectedGoogleAccountId('');
            setGoogleSetupDialogOpen(false);
            triggerRefresh();
        }
        catch (error: unknown) {
            reportConvexFailure({
                error,
                context: 'useAdsConnections:initializeGoogleIntegration',
                title: TOAST_TITLES.CONNECTION_FAILED,
                fallbackMessage: 'Unable to connect Google Ads.',
            });
            setGoogleSetupMessage(convexErrorMessage(error, 'Unable to connect Google Ads.'));
        }
        finally {
            setInitializingGoogle(false);
        }
    };
    const initializeLinkedInIntegration = async (clientIdOverride?: string | null, accountIdOverride?: string | null) => {
        setLinkedinSetupMessage(null);
        setInitializingLinkedIn(true);
        try {
            if (!workspaceId) {
                throw new Error(ERROR_MESSAGES.SIGN_IN_REQUIRED);
            }
            let accountId = (accountIdOverride ?? selectedLinkedInAccountId).trim();
            if (!accountId) {
                const availableAccounts = await loadLinkedInAdAccounts(clientIdOverride);
                const defaultAccount = availableAccounts.find((option) => option.isActive) ?? availableAccounts[0];
                if (!defaultAccount) {
                    throw new Error('No LinkedIn ad accounts are available for this integration token.');
                }
                accountId = defaultAccount.id;
                setSelectedLinkedInAccountId(defaultAccount.id);
            }
            const payload = (await initializeAdAccount({
                workspaceId,
                providerId: 'linkedin',
                clientId: clientIdOverride ?? selectedClientId ?? null,
                accountId,
            })) as {
                accountName?: string;
            };
            notifySuccess({
                title: SUCCESS_MESSAGES.LINKEDIN_CONNECTED,
                message: payload?.accountName
                    ? `Syncing data from ${payload.accountName}.`
                    : 'LinkedIn ad account linked successfully.',
            });
            setLinkedinAccountOptions([]);
            setSelectedLinkedInAccountId('');
            triggerRefresh();
        }
        catch (error: unknown) {
            reportConvexFailure({
                error,
                context: 'useAdsConnections:initializeLinkedInIntegration',
                title: TOAST_TITLES.CONNECTION_FAILED,
                fallbackMessage: 'Unable to connect LinkedIn Ads.',
            });
            setLinkedinSetupMessage(convexErrorMessage(error, 'Unable to connect LinkedIn Ads.'));
        }
        finally {
            setInitializingLinkedIn(false);
        }
    };
    const initializeMetaIntegration = async (clientIdOverride?: string | null, accountIdOverride?: string | null) => {
        setMetaSetupMessage(null);
        setInitializingMeta(true);
        try {
            if (!workspaceId) {
                throw new Error(ERROR_MESSAGES.SIGN_IN_REQUIRED);
            }
            let accountId = (accountIdOverride ?? selectedMetaAccountId).trim();
            if (!accountId) {
                const availableAccounts = await loadMetaAdAccounts(clientIdOverride);
                const defaultAccount = availableAccounts.find((option) => option.isActive) ?? availableAccounts[0];
                if (!defaultAccount) {
                    throw new Error('No Meta ad accounts are available for this integration token.');
                }
                accountId = defaultAccount.id;
                setSelectedMetaAccountId(defaultAccount.id);
            }
            const payload = (await initializeAdAccount({
                workspaceId,
                providerId: 'facebook',
                clientId: clientIdOverride ?? selectedClientId ?? null,
                accountId,
            })) as {
                accountName?: string;
            };
            notifySuccess({
                title: SUCCESS_MESSAGES.META_CONNECTED,
                message: payload?.accountName
                    ? `Syncing data from ${payload.accountName}.`
                    : 'Meta ad account linked successfully.',
            });
            setMetaAccountOptions([]);
            setSelectedMetaAccountId('');
            triggerRefresh();
        }
        catch (error: unknown) {
            reportConvexFailure({
                error,
                context: 'useAdsConnections:initializeMetaIntegration',
                title: TOAST_TITLES.META_SETUP_FAILED,
                fallbackMessage: 'Unable to connect Meta Ads.',
            });
            setMetaSetupMessage(convexErrorMessage(error, 'Unable to connect Meta Ads.'));
        }
        finally {
            setInitializingMeta(false);
        }
    };
    const initializeTikTokIntegration = async (clientIdOverride?: string | null, accountIdOverride?: string | null) => {
        setTiktokSetupMessage(null);
        setInitializingTikTok(true);
        try {
            if (!workspaceId) {
                throw new Error(ERROR_MESSAGES.SIGN_IN_REQUIRED);
            }
            let accountId = (accountIdOverride ?? selectedTikTokAccountId).trim();
            if (!accountId) {
                const availableAccounts = await loadTikTokAdAccounts(clientIdOverride);
                const defaultAccount = availableAccounts.find((option) => option.isActive) ?? availableAccounts[0];
                if (!defaultAccount) {
                    throw new Error('No TikTok ad accounts are available for this integration token.');
                }
                accountId = defaultAccount.id;
                setSelectedTikTokAccountId(defaultAccount.id);
            }
            const payload = (await initializeAdAccount({
                workspaceId,
                providerId: 'tiktok',
                clientId: clientIdOverride ?? selectedClientId ?? null,
                accountId,
            })) as {
                accountName?: string;
            };
            notifySuccess({
                title: SUCCESS_MESSAGES.TIKTOK_CONNECTED,
                message: payload?.accountName
                    ? `Syncing data from ${payload.accountName}.`
                    : 'TikTok ad account linked successfully.',
            });
            setTiktokAccountOptions([]);
            setSelectedTikTokAccountId('');
            triggerRefresh();
        }
        catch (error: unknown) {
            reportConvexFailure({
                error,
                context: 'useAdsConnections:initializeTikTokIntegration',
                title: TOAST_TITLES.TIKTOK_SETUP_FAILED,
                fallbackMessage: 'Unable to connect TikTok Ads.',
            });
            setTiktokSetupMessage(convexErrorMessage(error, 'Unable to connect TikTok Ads.'));
        }
        finally {
            setInitializingTikTok(false);
        }
    };
    return {
        googleSetupUi,
        setGoogleSetupUi,
        googleSetupMessage,
        setGoogleSetupMessage,
        setGoogleSetupDialogOpen,
        metaSetupMessage,
        setMetaSetupMessage,
        tiktokSetupMessage,
        setTiktokSetupMessage,
        linkedinSetupMessage,
        setLinkedinSetupMessage,
        initializingGoogle,
        initializingMeta,
        initializingTikTok,
        initializingLinkedIn,
        googleAccountOptions,
        selectedGoogleAccountId,
        setSelectedGoogleAccountId,
        loadingGoogleAccountOptions,
        metaAccountOptions,
        selectedMetaAccountId,
        setSelectedMetaAccountId,
        loadingMetaAccountOptions,
        linkedinAccountOptions,
        selectedLinkedInAccountId,
        setSelectedLinkedInAccountId,
        loadingLinkedInAccountOptions,
        tiktokAccountOptions,
        selectedTikTokAccountId,
        setSelectedTikTokAccountId,
        loadingTikTokAccountOptions,
        loadGoogleAdAccounts,
        loadMetaAdAccounts,
        loadLinkedInAdAccounts,
        loadTikTokAdAccounts,
        initializeGoogleIntegration,
        initializeLinkedInIntegration,
        initializeMetaIntegration,
        initializeTikTokIntegration,
    };
}
