'use client';
import { useCallback, type Dispatch, type SetStateAction } from 'react';
import { useRouter } from '@/shared/ui/navigation';
import { useAction, useMutation } from 'convex/react';
import { useAuth } from '@/shared/contexts/auth-context';
import { adsIntegrationsApi } from '@/lib/convex-api';
import { asErrorMessage } from '@/lib/convex-errors';
import { convexErrorMessage, reportConvexFailure } from '@/lib/handle-convex-error';
import { notifyFailure, notifySuccess } from '@/lib/notifications';
import { formatProviderName } from '../components/utils';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, TOAST_TITLES, PROVIDER_IDS, } from '../components/constants';
import type { DisconnectOptions } from './ads-connections-types';
type UseAdsConnectionActionsArgs = {
    workspaceId: string | null;
    selectedClientId: string | null;
    convexAuthLoading: boolean;
    isAuthenticated: boolean;
    setConnectingProvider: Dispatch<SetStateAction<string | null>>;
    setConnectionErrors: Dispatch<SetStateAction<Record<string, string>>>;
    setConnectedProviderOverrides: Dispatch<SetStateAction<Record<string, boolean>>>;
    setSyncingProviders: Dispatch<SetStateAction<Record<string, boolean>>>;
    setGoogleSetupMessage: (message: string | null) => void;
    setMetaSetupMessage: (message: string | null) => void;
    setTiktokSetupMessage: (message: string | null) => void;
    triggerRefresh: () => void;
};
export function useAdsConnectionActions({ workspaceId, selectedClientId, convexAuthLoading, isAuthenticated, setConnectingProvider, setConnectionErrors, setConnectedProviderOverrides, setSyncingProviders, setGoogleSetupMessage, setMetaSetupMessage, setTiktokSetupMessage, triggerRefresh, }: UseAdsConnectionActionsArgs) {
    const { user, startGoogleOauth, startMetaOauth, startTikTokOauth, startLinkedInOauth } = useAuth();
    const router = useRouter();
    const runManualSyncAction = useAction(adsIntegrationsApi.runManualSync);
    const deleteAdIntegrationMutation = useMutation(adsIntegrationsApi.deleteAdIntegration);
    const deleteSyncJobsMutation = useMutation(adsIntegrationsApi.deleteSyncJobs);
    const deleteProviderMetricsMutation = useMutation(adsIntegrationsApi.deleteProviderMetrics);
    const handleConnect = async (providerId: string, action: () => Promise<void>) => {
        setConnectingProvider(providerId);
        setConnectionErrors((prev) => ({ ...prev, [providerId]: '' }));
        try {
            await action();
            setConnectedProviderOverrides((prev) => ({ ...prev, [providerId]: true }));
            triggerRefresh();
        }
        catch (error: unknown) {
            reportConvexFailure({
                error,
                context: 'useAdsConnections:handleConnect',
                title: TOAST_TITLES.CONNECTION_FAILED,
                fallbackMessage: 'Connection failed.',
            });
            setConnectionErrors((prev) => ({
                ...prev,
                [providerId]: convexErrorMessage(error, 'Connection failed.'),
            }));
            setConnectedProviderOverrides((prev) => ({ ...prev, [providerId]: false }));
        }
        finally {
            setConnectingProvider(null);
        }
    };
    const handleOauthRedirect = async (providerId: string) => {
        if (typeof window === 'undefined') {
            return;
        }
        if (providerId === PROVIDER_IDS.GOOGLE) {
            setGoogleSetupMessage(null);
        }
        if (providerId === PROVIDER_IDS.FACEBOOK) {
            setMetaSetupMessage(null);
        }
        if (providerId === PROVIDER_IDS.TIKTOK) {
            setTiktokSetupMessage(null);
        }
        if (convexAuthLoading || !isAuthenticated || !user) {
            const message = ERROR_MESSAGES.SIGN_IN_REQUIRED;
            setConnectionErrors((prev) => ({ ...prev, [providerId]: message }));
            notifyFailure({ title: TOAST_TITLES.CONNECTION_FAILED, message });
            router.push('/');
            return;
        }
        setConnectingProvider(providerId);
        setConnectionErrors((prev) => ({ ...prev, [providerId]: '' }));
        try {
            const redirectTarget = `${window.location.pathname}${window.location.search}`;
            if (providerId === PROVIDER_IDS.FACEBOOK) {
                const { url } = await startMetaOauth(redirectTarget, selectedClientId ?? null);
                if (typeof url !== 'string' || url.length === 0) {
                    throw new Error('Meta OAuth did not return a URL. Check server logs and environment variables.');
                }
                window.location.href = url;
                return;
            }
            if (providerId === PROVIDER_IDS.TIKTOK) {
                const { url } = await startTikTokOauth(redirectTarget, selectedClientId ?? null);
                window.location.href = url;
                return;
            }
            if (providerId === PROVIDER_IDS.GOOGLE) {
                const { url } = await startGoogleOauth(redirectTarget, selectedClientId ?? null);
                window.location.href = url;
                return;
            }
            if (providerId === PROVIDER_IDS.LINKEDIN) {
                const { url } = await startLinkedInOauth(redirectTarget, selectedClientId ?? null);
                window.location.href = url;
                return;
            }
            throw new Error('This provider does not support OAuth yet.');
        }
        catch (error: unknown) {
            const rawMessage = asErrorMessage(error, '');
            const isMetaConfigError = providerId === PROVIDER_IDS.FACEBOOK &&
                /meta business login is not configured/i.test(rawMessage);
            const isTikTokConfigError = providerId === PROVIDER_IDS.TIKTOK && /tiktok oauth is not configured/i.test(rawMessage);
            const message = isMetaConfigError || isTikTokConfigError ? rawMessage : asErrorMessage(error);
            setConnectionErrors((prev) => ({ ...prev, [providerId]: message }));
            if (providerId === PROVIDER_IDS.FACEBOOK &&
                (isMetaConfigError ||
                    message.toLowerCase().includes('meta business login is not configured'))) {
                setMetaSetupMessage('Meta business login is not configured. Add META_APP_ID, META_BUSINESS_CONFIG_ID, and META_OAUTH_REDIRECT_URI environment variables.');
            }
            if (providerId === PROVIDER_IDS.TIKTOK &&
                (isTikTokConfigError || message.toLowerCase().includes('tiktok oauth is not configured'))) {
                setTiktokSetupMessage('TikTok OAuth is not configured. Add TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, and TIKTOK_OAUTH_REDIRECT_URI environment variables.');
            }
            reportConvexFailure({
                error,
                context: 'useAdsConnections:handleOauthRedirect',
                title: TOAST_TITLES.CONNECTION_FAILED,
                message,
                fallbackMessage: 'Connection failed.',
            });
        }
        finally {
            setConnectingProvider(null);
        }
    };
    const handleDisconnect = async (providerId: string, options?: DisconnectOptions) => {
        const providerName = formatProviderName(providerId);
        if (!workspaceId) {
            notifyFailure({ title: TOAST_TITLES.DISCONNECT_FAILED, message: ERROR_MESSAGES.SIGN_IN_REQUIRED });
            return;
        }
        setConnectingProvider(providerId);
        setConnectionErrors((prev) => ({ ...prev, [providerId]: '' }));
        try {
            let deletedMetrics = 0;
            if (options?.clearHistoricalData) {
                const result = (await deleteProviderMetricsMutation({
                    workspaceId,
                    providerId,
                    clientId: selectedClientId ?? null,
                })) as {
                    deleted?: number;
                };
                deletedMetrics = typeof result?.deleted === 'number' ? result.deleted : 0;
            }
            await deleteSyncJobsMutation({ workspaceId, providerId, clientId: selectedClientId ?? null });
            await deleteAdIntegrationMutation({ workspaceId, providerId, clientId: selectedClientId ?? null });
            setConnectedProviderOverrides((prev) => ({ ...prev, [providerId]: false }));
            notifySuccess({
                title: TOAST_TITLES.DISCONNECTED,
                message: options?.clearHistoricalData
                    ? `${SUCCESS_MESSAGES.DISCONNECTED(providerName)} Cleared ${deletedMetrics} historical metric row(s).`
                    : SUCCESS_MESSAGES.DISCONNECTED(providerName),
            });
            triggerRefresh();
        }
        catch (error: unknown) {
            reportConvexFailure({
                error,
                context: 'useAdsConnections:handleDisconnect',
                title: TOAST_TITLES.DISCONNECT_FAILED,
                fallbackMessage: 'Disconnect failed.',
            });
            setConnectionErrors((prev) => ({
                ...prev,
                [providerId]: convexErrorMessage(error, 'Disconnect failed.'),
            }));
        }
        finally {
            setConnectingProvider(null);
        }
    };
    const handleSyncNow = async (providerId: string) => {
        if (!workspaceId) {
            notifyFailure({ title: 'Sync failed', message: ERROR_MESSAGES.SIGN_IN_REQUIRED });
            return;
        }
        setSyncingProviders((prev) => ({ ...prev, [providerId]: true }));
        try {
            await runManualSyncAction({
                workspaceId,
                providerId,
                clientId: selectedClientId ?? null,
            });
            notifySuccess({
                title: 'Sync complete',
                message: `${formatProviderName(providerId)} data has been refreshed.`,
            });
            triggerRefresh();
        }
        catch (error: unknown) {
            reportConvexFailure({
                error,
                context: 'useAdsConnections:handleSyncNow',
                title: 'Sync failed',
                fallbackMessage: 'Unable to sync ad data.',
            });
        }
        finally {
            setSyncingProviders((prev) => ({ ...prev, [providerId]: false }));
        }
    };
    return {
        handleConnect,
        handleOauthRedirect,
        handleDisconnect,
        handleSyncNow,
    };
}
