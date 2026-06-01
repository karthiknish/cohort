'use client';
import { notifyFailure } from '@/lib/notifications';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConvexAuth, useMutation, useQuery } from 'convex/react';
import { useAuth } from '@/shared/contexts/auth-context';
import { useClientContext } from '@/shared/contexts/client-context';
import { usePreview } from '@/shared/contexts/preview-context';
import { socialsIntegrationsApi } from '@/lib/convex-api';
import { asErrorMessage, logError } from '@/lib/convex-errors';
import { getPreviewSocialConnectionStatus } from '@/lib/preview-data';
import { useToast } from '@/shared/ui/use-toast';
export type SocialsConnectionStatus = {
    connected: boolean;
    accountId: string | null;
    accountName: string | null;
    facebookPageId: string | null;
    facebookPageName: string | null;
    instagramBusinessId: string | null;
    instagramBusinessName: string | null;
    setupComplete: boolean;
    lastSyncStatus: 'never' | 'pending' | 'success' | 'error' | null;
    lastSyncedAtMs: number | null;
    linkedAtMs: number | null;
};
export type UseSocialsConnectionsReturn = {
    status: SocialsConnectionStatus | null;
    statusLoading: boolean;
    oauthPending: boolean;
    syncPending: boolean;
    connectionError: string | null;
    handleConnectMeta: () => Promise<void>;
    handleDisconnect: () => Promise<void>;
    handleRequestSync: () => Promise<void>;
};
export function useSocialsConnections(): UseSocialsConnectionsReturn {
    const { user, startMetaOauth } = useAuth();
    const router = useRouter();
    const { selectedClientId } = useClientContext();
    const { isPreviewMode } = usePreview();
    const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth();
    const { toast } = useToast();
    const requestManualSync = useMutation(socialsIntegrationsApi.requestManualSync);
    const disconnectIntegration = useMutation(socialsIntegrationsApi.disconnectIntegration);
    const [oauthPending, setOauthPending] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [syncPending, setSyncPending] = useState(false);
    const workspaceId = user?.agencyId ? String(user.agencyId) : null;
    const canQuery = !isPreviewMode && isAuthenticated && !convexAuthLoading && Boolean(workspaceId);
    const rawStatus = useQuery(socialsIntegrationsApi.getStatus, canQuery && workspaceId
        ? { workspaceId, clientId: selectedClientId ?? null }
        : 'skip');
    const statusLoading = canQuery && rawStatus === undefined;
    const status: SocialsConnectionStatus | null = isPreviewMode
        ? {
            ...getPreviewSocialConnectionStatus(),
            facebookPageId: 'preview-page',
            facebookPageName: 'Preview Page',
            instagramBusinessId: 'preview-ig',
            instagramBusinessName: 'preview_brand',
            setupComplete: true,
        }
        : rawStatus
            ? {
                connected: rawStatus.connected,
                accountId: rawStatus.accountId,
                accountName: rawStatus.accountName,
                facebookPageId: rawStatus.facebookPageId ?? null,
                facebookPageName: rawStatus.facebookPageName ?? null,
                instagramBusinessId: rawStatus.instagramBusinessId ?? null,
                instagramBusinessName: rawStatus.instagramBusinessName ?? null,
                setupComplete: rawStatus.setupComplete ?? Boolean(rawStatus.facebookPageId),
                lastSyncStatus: rawStatus.lastSyncStatus as SocialsConnectionStatus['lastSyncStatus'],
                lastSyncedAtMs: rawStatus.lastSyncedAtMs,
                linkedAtMs: rawStatus.linkedAtMs,
            }
            : null;
    useEffect(() => {
        setSyncPending(status?.lastSyncStatus === 'pending');
    }, [status?.lastSyncStatus]);
    const oauthProcessedRef = useRef(false);
    useEffect(() => {
        if (typeof window === 'undefined' || isPreviewMode)
            return;
        const searchParams = new URLSearchParams(window.location.search);
        const oauthSuccess = searchParams.get('oauth_success') === 'true';
        const oauthError = searchParams.get('oauth_error');
        const message = searchParams.get('message');
        if (!oauthSuccess && !oauthError)
            return;
        if (oauthProcessedRef.current)
            return;
        oauthProcessedRef.current = true;
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('oauth_success');
        newUrl.searchParams.delete('oauth_error');
        newUrl.searchParams.delete('provider');
        newUrl.searchParams.delete('message');
        newUrl.searchParams.delete('clientId');
        newUrl.searchParams.delete('surface');
        window.history.replaceState({}, '', newUrl.toString());
        if (oauthSuccess) {
            toast({
                title: 'Meta connected',
                description: 'Select a Facebook Page to finish organic social setup.',
            });
            setConnectionError(null);
        }
        else if (oauthError) {
            const errorMessage = message ?? 'Meta authorization failed';
            setConnectionError(errorMessage);
            notifyFailure({
                title: 'Connection failed',
                message: errorMessage,
            });
        }
    }, [isPreviewMode, toast]);
    const showPreviewModeToast = (description: string) => {
        toast({
            title: 'Preview mode',
            description,
        });
    };
    const handleConnectMeta = async () => {
        if (typeof window === 'undefined')
            return;
        if (isPreviewMode) {
            showPreviewModeToast('Meta connection is disabled while sample social data is active.');
            return;
        }
        if (convexAuthLoading || !isAuthenticated || !user) {
            notifyFailure({
                title: 'Sign in required',
                message: 'You must be signed in to connect Meta.',
            });
            router.push('/');
            return;
        }
        setOauthPending(true);
        setConnectionError(null);
        try {
            const { url } = await startMetaOauth(`${window.location.pathname}${window.location.search}`, selectedClientId ?? null, undefined, 'socials');
            if (typeof url !== 'string' || url.length === 0) {
                throw new Error('Meta OAuth did not return a URL.');
            }
            window.location.href = url;
        }
        catch (error: unknown) {
            logError(error, 'useSocialsConnections:handleConnectMeta');
            const message = asErrorMessage(error);
            setConnectionError(message);
            notifyFailure({
                title: 'Connection failed',
                message: message,
            });
            setOauthPending(false);
        }
    };
    const handleDisconnect = async () => {
        if (isPreviewMode) {
            showPreviewModeToast('Social disconnection is disabled while sample social data is active.');
            return;
        }
        if (!workspaceId)
            return;
        try {
            await disconnectIntegration({
                workspaceId,
                clientId: selectedClientId ?? null,
            });
            toast({ title: 'Disconnected', description: 'Organic Meta social connection removed (Ads unchanged).' });
        }
        catch (error: unknown) {
            reportConvexFailure({
                error: error,
                context: 'useSocialsConnections:handleDisconnect',
            });
        }
    };
    const handleRequestSync = async () => {
        if (isPreviewMode) {
            showPreviewModeToast('Social sync is disabled while sample social data is active.');
            return;
        }
        if (!workspaceId)
            return;
        if (!status?.setupComplete) {
            notifyFailure({
                title: 'Setup required',
                message: 'Select a Facebook Page before syncing organic metrics.',
            });
            return;
        }
        setSyncPending(true);
        try {
            await requestManualSync({
                workspaceId,
                clientId: selectedClientId ?? null,
                timeframeDays: 30,
            });
            toast({ title: 'Sync requested', description: 'Organic metrics will refresh shortly.' });
        }
        catch (error: unknown) {
            setSyncPending(false);
            reportConvexFailure({
                error,
                context: 'useSocialsConnections:handleRequestSync',
                title: 'Sync failed',
                fallbackMessage: 'Unable to start social sync.',
            });
        }
    };
    return {
        status,
        statusLoading,
        oauthPending,
        syncPending,
        connectionError,
        handleConnectMeta,
        handleDisconnect,
        handleRequestSync,
    };
}
