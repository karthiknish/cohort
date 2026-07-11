'use client';
import { useEffect, useEffectEvent, useRef, type Dispatch, type SetStateAction } from 'react';
import { usePathname, useRouter, useSearchParams } from '@/shared/ui/navigation';
import { asErrorMessage, logError } from '@/lib/convex-errors';
import { convexErrorMessage, reportConvexFailure } from '@/lib/handle-convex-error';
import { notifyFailure, notifySuccess } from '@/lib/notifications';
import { formatProviderName } from '../components/utils';
import { PROVIDER_IDS, SUCCESS_MESSAGES, TOAST_TITLES } from '../components/constants';
type UseAdsOauthCallbackArgs = {
    googleNeedsAccountSelection: boolean;
    metaNeedsAccountSelection: boolean;
    linkedinNeedsAccountSelection: boolean;
    googleAccountOptionsLength: number;
    metaAccountOptionsLength: number;
    linkedinAccountOptionsLength: number;
    loadingGoogleAccountOptions: boolean;
    loadingMetaAccountOptions: boolean;
    loadingLinkedInAccountOptions: boolean;
    loadGoogleAdAccounts: (clientIdOverride?: string | null) => Promise<unknown>;
    loadMetaAdAccounts: (clientIdOverride?: string | null) => Promise<unknown>;
    loadLinkedInAdAccounts: (clientIdOverride?: string | null) => Promise<unknown>;
    initializeTikTokIntegration: (clientIdOverride?: string | null) => Promise<void>;
    setGoogleSetupUi: Dispatch<SetStateAction<{
        message: string | null;
        dialogOpen: boolean;
    }>>;
    setGoogleSetupMessage: (message: string | null) => void;
    setMetaSetupMessage: (message: string | null) => void;
    setLinkedinSetupMessage: (message: string | null) => void;
    setConnectionErrors: Dispatch<SetStateAction<Record<string, string>>>;
    triggerRefresh: () => void;
};
export function useAdsOauthCallback({ googleNeedsAccountSelection, metaNeedsAccountSelection, linkedinNeedsAccountSelection, googleAccountOptionsLength, metaAccountOptionsLength, linkedinAccountOptionsLength, loadingGoogleAccountOptions, loadingMetaAccountOptions, loadingLinkedInAccountOptions, loadGoogleAdAccounts, loadMetaAdAccounts, loadLinkedInAdAccounts, initializeTikTokIntegration, setGoogleSetupUi, setGoogleSetupMessage, setMetaSetupMessage, setLinkedinSetupMessage, setConnectionErrors, triggerRefresh, }: UseAdsOauthCallbackArgs) {
    const { replace } = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
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
                notifySuccess({
                    title: SUCCESS_MESSAGES.META_CONNECTED,
                    message: 'Meta connected. Select an ad account to finish setup.',
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
                notifySuccess({
                    title: SUCCESS_MESSAGES.GOOGLE_CONNECTED,
                    message: 'Google connected. Select an ads account to finish setup.',
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
                setLinkedinSetupMessage(null);
                notifySuccess({
                    title: SUCCESS_MESSAGES.LINKEDIN_CONNECTED,
                    message: 'LinkedIn connected. Select an ad account to finish setup.',
                });
                void loadLinkedInAdAccounts(oauthClientId)
                    .then(() => {
                    triggerRefresh();
                })
                    .catch((error) => {
                    reportConvexFailure({
                        error,
                        context: 'useAdsConnections:oauthSuccess:linkedin',
                        title: TOAST_TITLES.CONNECTION_FAILED,
                        fallbackMessage: 'Unable to load LinkedIn ad accounts.',
                    });
                    setLinkedinSetupMessage(convexErrorMessage(error, 'Unable to load LinkedIn ad accounts.'));
                });
                return;
            }
            notifySuccess({
                title: 'Connection successful',
                message: `${formatProviderName(providerId)} has been linked.`,
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
        const cleanedParams = new URLSearchParams(searchParams.toString());
        cleanedParams.delete('oauth_success');
        cleanedParams.delete('oauth_error');
        cleanedParams.delete('provider');
        cleanedParams.delete('message');
        cleanedParams.delete('clientId');
        const nextQuery = cleanedParams.toString();
        replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
        processOauthRedirect({
            oauthSuccess,
            oauthError: Boolean(oauthError),
            providerId,
            message,
            oauthClientId,
        });
    }, [pathname, processOauthRedirect, replace, searchParams]);
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
    useEffect(() => {
        if (!linkedinNeedsAccountSelection) {
            return;
        }
        if (loadingLinkedInAccountOptions || linkedinAccountOptionsLength > 0) {
            return;
        }
        void loadLinkedInAdAccounts().catch((error) => {
            logError(error, 'useAdsConnections:autoLoadLinkedInAccounts');
            setLinkedinSetupMessage(asErrorMessage(error));
        });
    }, [
        linkedinAccountOptionsLength,
        linkedinNeedsAccountSelection,
        loadLinkedInAdAccounts,
        loadingLinkedInAccountOptions,
        setLinkedinSetupMessage,
    ]);
}
