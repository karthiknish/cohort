'use client';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { useAuth } from '@/shared/contexts/auth-context';
import { useClientContext } from '@/shared/contexts/client-context';
import { usePreview } from '@/shared/contexts/preview-context';
import { asErrorMessage, logError } from '@/lib/convex-errors';
import { api, notificationsApi } from '@/lib/convex-api';
import { getPreviewActivity } from '@/lib/preview-data';
import type { Activity } from '@/types/activity';
export function useRealtimeActivity(limitCount = 20, preferPreviewData = false) {
    const { user } = useAuth();
    const { selectedClient } = useClientContext();
    const { isPreviewMode } = usePreview();
    const [currentLimit, setCurrentLimit] = useState(limitCount);
    const [error, setError] = useState<string | null>(null);
    const usePreviewData = isPreviewMode || preferPreviewData;
    const convexEnabled = !usePreviewData && Boolean(user?.agencyId) && Boolean(selectedClient?.id);
    const convexActivities = useQuery(api.activity.listForClient, convexEnabled
        ? {
            workspaceId: String(user!.agencyId),
            clientId: String(selectedClient!.id),
            limit: currentLimit,
        }
        : 'skip') as Activity[] | undefined;
    const ackMutation = useMutation(notificationsApi.ack);
    const { activities, loading, hasMore } = (() => {
        if (usePreviewData) {
            const previewActivities = getPreviewActivity(selectedClient?.id ?? null);
            return {
                activities: previewActivities.slice(0, currentLimit),
                loading: false,
                hasMore: previewActivities.length > currentLimit,
            };
        }
        if (!convexEnabled) {
            return { activities: [] as Activity[], loading: false, hasMore: false };
        }
        if (!convexActivities) {
            return { activities: [] as Activity[], loading: true, hasMore: false };
        }
        return {
            activities: convexActivities,
            loading: false,
            hasMore: convexActivities.length === currentLimit,
        };
    })();
    const refresh = async () => {
        setError(null);
    };
    const loadMore = () => {
        setCurrentLimit((prev) => prev + limitCount);
    };
    const retry = () => {
        setCurrentLimit(limitCount);
        void refresh();
    };
    const markAsRead = async (ids: string[]) => {
        if (!user?.agencyId || ids.length === 0)
            return;
        try {
            await ackMutation({
                workspaceId: String(user.agencyId),
                ids,
                action: 'read',
                ...(user.role === 'client' && selectedClient?.id
                    ? { clientId: String(selectedClient.id) }
                    : {}),
            });
            setError(null);
        }
        catch (error) {
            logError(error, 'useRealtimeActivity:markAsRead');
            setError('Unable to update activity read status. Please try again.');
            reportConvexFailure({
                error: error,
                context: 'use-realtime-activity.ts:catch',
                title: 'Update failed',
                fallbackMessage: 'Update failed',
            });
        }
    };
    return {
        activities,
        loading,
        error,
        retry,
        loadMore,
        hasMore,
        isRealTime: convexEnabled,
        markAsRead,
    };
}
