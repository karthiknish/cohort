'use client';
import { useCallback, useEffect, useState } from 'react';
import { useAction } from 'convex/react';
import { adsIntegrationsApi } from '@/lib/convex-api';
import { convexErrorMessage, reportConvexFailure } from '@/lib/handle-convex-error';
import { useToast } from '@/shared/ui/use-toast';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, TOAST_TITLES, } from '../components/constants';
import type { GoogleAdAccountOption, MetaAdAccountOption, } from './ads-connections-types';
type UseAdsProviderSetupArgs = {
    workspaceId: string | null;
    selectedClientId: string | null;
    triggerRefresh: () => void;
};
export function useAdsProviderSetup({ workspaceId, selectedClientId, triggerRefresh, }: UseAdsProviderSetupArgs) {
    const { toast } = useToast();
    const initializeAdAccount = useAction(adsIntegrationsApi.initializeAdAccount);
    const listGoogleAdAccounts = useAction(adsIntegrationsApi.listGoogleAdAccounts);
    const listMetaAdAccounts = useAction(adsIntegrationsApi.listMetaAdAccounts);
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
    const [initializingGoogle, setInitializingGoogle] = useState(false);
    const [initializingMeta, setInitializingMeta] = useState(false);
    const [initializingTikTok, setInitializingTikTok] = useState(false);
    const [googleAccountOptions, setGoogleAccountOptions] = useState<GoogleAdAccountOption[]>([]);
    const [selectedGoogleAccountId, setSelectedGoogleAccountId] = useState('');
    const [loadingGoogleAccountOptions, setLoadingGoogleAccountOptions] = useState(false);
    const [metaAccountOptions, setMetaAccountOptions] = useState<MetaAdAccountOption[]>([]);
    const [selectedMetaAccountId, setSelectedMetaAccountId] = useState('');
    const [loadingMetaAccountOptions, setLoadingMetaAccountOptions] = useState(false);
    useEffect(() => {
        setGoogleAccountOptions([]);
        setSelectedGoogleAccountId('');
        setGoogleSetupDialogOpen(false);
        setMetaAccountOptions([]);
        setSelectedMetaAccountId('');
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
                if (currentValue && options.some((option) => option.id === currentValue)) {
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
            toast({
                title: SUCCESS_MESSAGES.GOOGLE_CONNECTED,
                description: payload?.accountName
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
    const initializeLinkedInIntegration = async () => {
        if (!workspaceId) {
            throw new Error(ERROR_MESSAGES.SIGN_IN_REQUIRED);
        }
        return await initializeAdAccount({
            workspaceId,
            providerId: 'linkedin',
            clientId: selectedClientId ?? null,
        });
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
            toast({
                title: SUCCESS_MESSAGES.META_CONNECTED,
                description: payload?.accountName
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
    const initializeTikTokIntegration = async (clientIdOverride?: string | null) => {
        setTiktokSetupMessage(null);
        setInitializingTikTok(true);
        try {
            if (!workspaceId) {
                throw new Error(ERROR_MESSAGES.SIGN_IN_REQUIRED);
            }
            const payload = (await initializeAdAccount({
                workspaceId,
                providerId: 'tiktok',
                clientId: clientIdOverride ?? selectedClientId ?? null,
            })) as {
                accountName?: string;
            };
            toast({
                title: SUCCESS_MESSAGES.TIKTOK_CONNECTED,
                description: payload?.accountName
                    ? `Syncing data from ${payload.accountName}.`
                    : 'Default ad account linked successfully.',
            });
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
        initializingGoogle,
        initializingMeta,
        initializingTikTok,
        googleAccountOptions,
        selectedGoogleAccountId,
        setSelectedGoogleAccountId,
        loadingGoogleAccountOptions,
        metaAccountOptions,
        selectedMetaAccountId,
        setSelectedMetaAccountId,
        loadingMetaAccountOptions,
        loadGoogleAdAccounts,
        loadMetaAdAccounts,
        initializeGoogleIntegration,
        initializeLinkedInIntegration,
        initializeMetaIntegration,
        initializeTikTokIntegration,
    };
}
