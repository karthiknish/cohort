'use client';
import { useEffect, useEffectEvent, useRef, type Dispatch, type SetStateAction } from 'react';
import { asErrorMessage, logError } from '@/lib/convex-errors';
import { convexErrorMessage, reportConvexFailure } from '@/lib/handle-convex-error';
import { notifyFailure } from '@/lib/notifications';
import { useToast } from '@/shared/ui/use-toast';
import { formatProviderName } from '../components/utils';
import { PROVIDER_IDS, SUCCESS_MESSAGES, TOAST_TITLES } from '../components/constants';
type UseAdsOauthCallbackArgs = {
    googleNeedsAccountSelection: boolean;
    metaNeedsAccountSelection: boolean;
    googleAccountOptionsLength: number;
    metaAccountOptionsLength: number;
    loadingGoogleAccountOptions: boolean;
    loadingMetaAccountOptions: boolean;
    loadGoogleAdAccounts: (clientIdOverride?: string | null) => Promise<unknown>;
    loadMetaAdAccounts: (clientIdOverride?: string | null) => Promise<unknown>;
    initializeLinkedInIntegration: () => Promise<unknown>;
    initializeTikTokIntegration: (clientIdOverride?: string | null) => Promise<void>;
    setGoogleSetupUi: Dispatch<SetStateAction<{
        message: string | null;
        dialogOpen: boolean;
    }>>;
    setGoogleSetupMessage: (message: string | null) => void;
    setMetaSetupMessage: (message: string | null) => void;
    setConnectionErrors: Dispatch<SetStateAction<Record<string, string>>>;
    triggerRefresh: () => void;
};
export function useAdsOauthCallback({ googleNeedsAccountSelection, metaNeedsAccountSelection, googleAccountOptionsLength, metaAccountOptionsLength, loadingGoogleAccountOptions, loadingMetaAccountOptions, loadGoogleAdAccounts, loadMetaAdAccounts, initializeLinkedInIntegration, initializeTikTokIntegration, setGoogleSetupUi, setGoogleSetupMessage, setMetaSetupMessage, setConnectionErrors, triggerRefresh, }: UseAdsOauthCallbackArgs) {
    const { toast } = useToast();
    const oauthProcessedRef = useRef<Record<string, boolean>>({});
    const processOauthRedirect = useEffectEvent(({ oauthSuccess, oauthError, providerId, message, oauthClientId, }: {
        oauthSuccess: boolean;
        oauthError: boolean;
        providerId: string;
        message: string | null;
        oauthClientId: string | null;
    }) => {
        if (oauthSuccess) {
            if (providerId === PROVIDER_IDS.FACEBOOK) {
                setMetaSetupMessage(null);
                toast({
                    title: SUCCESS_MESSAGES.META_CONNECTED,
                    description: 'Meta connected. Select an ad account to finish setup.',
                });
                void loadMetaAdAccounts(oauthClientId)
                    .then(() => {
                    triggerRefresh();
                })
                    .catch((error) => {
                    reportConvexFailure({
                        error,
                        context: 'useAdsConnections:oauthSuccess:facebook',
                        title: TOAST_TITLES.META_SETUP_FAILED,
                        fallbackMessage: 'Unable to load Meta ad accounts.',
                    });
                    setMetaSetupMessage(convexErrorMessage(error, 'Unable to load Meta ad accounts.'));
                });
                return;
            }
            if (providerId === PROVIDER_IDS.TIKTOK) {
                void initializeTikTokIntegration(oauthClientId);
                return;
            }
            if (providerId === PROVIDER_IDS.GOOGLE) {
                setGoogleSetupUi({ message: null, dialogOpen: true });
                toast({
                    title: SUCCESS_MESSAGES.GOOGLE_CONNECTED,
                    description: 'Google connected. Select an ads account to finish setup.',
                });
                void loadGoogleAdAccounts(oauthClientId)
                    .then(() => {
                    triggerRefresh();
                })
                    .catch((error) => {
                    reportConvexFailure({
                        error,
                        context: 'useAdsConnections:oauthSuccess:google',
                        title: TOAST_TITLES.CONNECTION_FAILED,
                        fallbackMessage: 'Unable to load Google ad accounts.',
                    });
                    setGoogleSetupMessage(convexErrorMessage(error, 'Unable to load Google ad accounts.'));
                });
                return;
            }
            if (providerId === PROVIDER_IDS.LINKEDIN) {
                void initializeLinkedInIntegration()
                    .then(async () => {
                    toast({ title: SUCCESS_MESSAGES.LINKEDIN_CONNECTED, description: 'Syncing your ad data.' });
                    triggerRefresh();
                })
                    .catch((err) => {
                    reportConvexFailure({
                        error: err,
                        context: 'useAdsConnections:oauthSuccess:linkedin',
                        title: TOAST_TITLES.CONNECTION_FAILED,
                        fallbackMessage: 'Unable to connect LinkedIn Ads.',
                    });
                });
                return;
            }
            toast({
                title: 'Connection successful',
                description: `${formatProviderName(providerId)} has been linked.`,
            });
            triggerRefresh();
            return;
        }
        if (oauthError) {
            const displayProvider = formatProviderName(providerId);
            const errorMessage = message || 'An unknown error occurred during authentication.';
            logError(new Error(errorMessage), `useAdsConnections:oauthError:${providerId}`);
            notifyFailure({ title: `${displayProvider} connection failed`, message: errorMessage });
            setConnectionErrors((prev) => ({ ...prev, [providerId]: errorMessage }));
        }
    });
    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        const searchParams = new URLSearchParams(window.location.search);
        const oauthSuccess = searchParams.get('oauth_success') === 'true';
        const oauthError = searchParams.get('oauth_error');
        const providerId = searchParams.get('provider');
        const message = searchParams.get('message');
        const oauthClientId = searchParams.get('clientId');
        if (!oauthSuccess && !oauthError) {
            return;
        }
        if (!providerId) {
            return;
        }
        const processingKey = `${providerId}:${oauthSuccess ? 'success' : 'error'}`;
        if (oauthProcessedRef.current[processingKey]) {
            return;
        }
        oauthProcessedRef.current[processingKey] = true;
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('oauth_success');
        newUrl.searchParams.delete('oauth_error');
        newUrl.searchParams.delete('provider');
        newUrl.searchParams.delete('message');
        newUrl.searchParams.delete('clientId');
        window.history.replaceState({}, '', newUrl.toString());
        processOauthRedirect({
            oauthSuccess,
            oauthError: Boolean(oauthError),
            providerId,
            message,
            oauthClientId,
        });
    }, []);
    useEffect(() => {
        if (!googleNeedsAccountSelection) {
            return;
        }
        if (loadingGoogleAccountOptions || googleAccountOptionsLength > 0) {
            return;
        }
        void loadGoogleAdAccounts().catch((error) => {
            logError(error, 'useAdsConnections:autoLoadGoogleAccounts');
            setGoogleSetupMessage(asErrorMessage(error));
        });
    }, [
        googleAccountOptionsLength,
        googleNeedsAccountSelection,
        loadGoogleAdAccounts,
        loadingGoogleAccountOptions,
        setGoogleSetupMessage,
    ]);
    useEffect(() => {
        if (!metaNeedsAccountSelection) {
            return;
        }
        if (loadingMetaAccountOptions || metaAccountOptionsLength > 0) {
            return;
        }
        void loadMetaAdAccounts().catch((error) => {
            logError(error, 'useAdsConnections:autoLoadMetaAccounts');
            setMetaSetupMessage(asErrorMessage(error));
        });
    }, [
        loadMetaAdAccounts,
        loadingMetaAccountOptions,
        metaAccountOptionsLength,
        metaNeedsAccountSelection,
        setMetaSetupMessage,
    ]);
}
