'use client';
import { useAction } from 'convex/react';
import { useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logError } from '@/lib/convex-errors';
import { adsIntegrationsApi } from '@/lib/convex-api';
type SyncGoogleAnalyticsParams = {
    periodDays: number;
    clientId?: string | null;
    workspaceId: string;
};
type SyncGoogleAnalyticsResponse = {
    written: number;
    propertyName?: string;
    error?: string;
    synced?: boolean;
};
/**
 * Hook for syncing Google Analytics data via the Convex `runManualSync` action.
 * This bypasses the HTTP route which relied on CONVEX_DEPLOY_KEY (unavailable
 * in the TanStack Start server runtime) and caused 500 errors.
 */
export function useGoogleAnalyticsSync() {
    const queryClient = useQueryClient();
    const runManualSync = useAction(adsIntegrationsApi.runManualSync);
    const [isPending, setIsPending] = useState(false);
    const pendingRef = useRef(false);
    const mutateAsync = useCallback(async (params: SyncGoogleAnalyticsParams): Promise<SyncGoogleAnalyticsResponse> => {
        if (pendingRef.current) {
            return { written: 0, synced: false };
        }
        pendingRef.current = true;
        setIsPending(true);
        try {
            const result = await runManualSync({
                workspaceId: params.workspaceId,
                providerId: 'google-analytics',
                clientId: params.clientId ?? undefined,
            });
            void queryClient.invalidateQueries({ queryKey: ['analytics'] });
            void queryClient.invalidateQueries({ queryKey: ['metrics'] });
            return {
                written: 0,
                synced: result?.synced ?? false,
            };
        }
        catch (error) {
            logError(error, 'useGoogleAnalyticsSync');
            // Toast is handled by the caller to allow context-specific messages
            // (e.g. timeout vs generic failure). Do not notify here.
            throw error;
        }
        finally {
            pendingRef.current = false;
            setIsPending(false);
        }
    }, [queryClient, runManualSync]);
    return {
        isPending,
        mutateAsync,
    };
}
