'use client';
import { notifyFailure, notifyInfo, notifySuccess } from '@/lib/notifications';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CheckCheck, LoaderCircle, Settings2, Trash2, MessageSquare, Filter, } from 'lucide-react';
import { Link } from '@/shared/ui/link';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useConvex, useMutation } from 'convex/react';
import { useAuth } from '@/shared/contexts/auth-context';
import { useClientContext } from '@/shared/contexts/client-context';
import { usePreview } from '@/shared/contexts/preview-context';
import type { WorkspaceNotification } from '@/types/notifications';
import { cn } from '@/lib/utils';
import { DASHBOARD_THEME, PAGE_TITLES, getButtonClasses } from '@/lib/dashboard-theme';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { LiveRegion } from '@/shared/ui/live-region';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Skeleton } from '@/shared/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs';
import { Badge } from '@/shared/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { notificationsApi } from '@/lib/convex-api';
import { asErrorMessage, logError } from '@/lib/convex-errors';
import { parsePageSize } from '@/lib/pagination';
import { getPreviewNotifications } from '@/lib/preview-data';
import { usePersistedTab } from '@/shared/hooks/use-persisted-tab';
import { RevealTransition, RevealTransitionFallback } from '@/shared/ui/page-transition';
import { NotificationItem } from '@/features/notifications/components/notification-item';
import { NotificationEmptyState } from '@/features/notifications/components/notification-empty-state';
import { useNotificationNavigation } from '@/features/notifications/hooks/use-notification-navigation';
import { NOTIFICATIONS_PAGE_PAGE_SIZE } from '@/lib/notifications/pagination';
import { FILTER_VALUES, FILTER_EMPTY_LABELS, type AckAction, type FilterType, type NotificationsCursor, MAX_NOTIFICATION_PAGES, VIRTUAL_NOTIFICATIONS_THRESHOLD } from './notifications-page-constants';
export function useNotificationsPage() {
    // TanStack useVirtualizer uses interior mutability and is on the React Compiler
    // incompatible-library allowlist; opt this hook out of compilation.
    'use no memo';
    const { user } = useAuth();
    const { selectedClientId } = useClientContext();
    const { isPreviewMode } = usePreview();
    const filterTabs = usePersistedTab<FilterType>({
        param: 'tab',
        defaultValue: 'all',
        allowedValues: FILTER_VALUES,
        storageNamespace: 'dashboard:notifications',
        syncToUrl: true,
    });
    const activeFilter = filterTabs.value;
    const setActiveFilter = filterTabs.setValue;
    const [ackInFlight, setAckInFlight] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
    const [notificationAnnouncement, setNotificationAnnouncement] = useState('');
    const handleOpenNotification = useNotificationNavigation();
    const [previewNotificationState, setPreviewNotificationState] = useState<{
        sourceKey: string;
        notifications: WorkspaceNotification[];
    } | null>(null);
    const previewSourceKey = `preview:${selectedClientId ?? 'all'}`;
    const basePreviewNotifications = getPreviewNotifications(selectedClientId ?? null);
    const previewNotifications = (() => {
        if (previewNotificationState?.sourceKey === previewSourceKey) {
            return previewNotificationState.notifications;
        }
        return basePreviewNotifications;
    })();
    const convex = useConvex();
    const workspaceId = user?.agencyId;
    const { data: notificationsData, isLoading: isLoadingNotifications, isFetchingNextPage, hasNextPage, fetchNextPage, isError: isNotificationsError, error: notificationsError, refetch: refetchNotificationsQuery } = useInfiniteQuery({
        queryKey: ['notificationsPage', workspaceId, user?.role, selectedClientId, activeFilter],
        enabled: !isPreviewMode && Boolean(workspaceId),
        initialPageParam: null as NotificationsCursor | null,
        maxPages: MAX_NOTIFICATION_PAGES,
        queryFn: async ({ pageParam }) => {
            if (!workspaceId) {
                return { notifications: [], nextCursor: null as NotificationsCursor | null };
            }
            return convex.query(notificationsApi.list, {
                workspaceId,
                pageSize: parsePageSize(NOTIFICATIONS_PAGE_PAGE_SIZE, {
                    defaultValue: NOTIFICATIONS_PAGE_PAGE_SIZE,
                    max: 100,
                }),
                role: user?.role ?? undefined,
                clientId: user?.role === 'client' ? (selectedClientId ?? undefined) : undefined,
                unread: activeFilter === 'unread' ? true : undefined,
                afterCreatedAtMs: pageParam?.createdAtMs,
                afterLegacyId: pageParam?.legacyId,
                scanCursor: pageParam?.scanCursor ?? undefined,
                overflowLegacyIds: pageParam?.overflowLegacyIds,
            });
        },
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
    });
    const refetchNotifications = useCallback(() => {
        void fetchNextPage();
    }, [fetchNextPage]);
    const liveNotifications = notificationsData?.pages.flatMap((page) => page.notifications ?? []) ?? [];
    const notifications = (() => {
        let items = isPreviewMode ? previewNotifications : liveNotifications;
        if (activeFilter === 'unread') {
            items = items.filter((n: WorkspaceNotification) => !n.read);
        }
        else if (activeFilter === 'mentions') {
            items = items.filter((n: WorkspaceNotification) => n.kind === 'collaboration.mention' || n.kind === 'task.mention');
        }
        else if (activeFilter === 'tasks') {
            items = items.filter((n: WorkspaceNotification) => n.kind.startsWith('task.'));
        }
        else if (activeFilter === 'collaboration') {
            items = items.filter((n: WorkspaceNotification) => n.kind.startsWith('collaboration.'));
        }
        else if (activeFilter === 'system') {
            items = items.filter((n: WorkspaceNotification) => n.kind === 'proposal.deck.ready' || n.kind === 'report.generated' || n.kind === 'project.created' || n.kind.startsWith('meeting.'));
        }
        return items;
    })();
    const ackNotifications = useMutation(notificationsApi.ack);
    const loading = isPreviewMode ? false : isLoadingNotifications;
    const loadingMore = isPreviewMode ? false : isFetchingNextPage;
    const error = isPreviewMode
        ? null
        : isNotificationsError
            ? (asErrorMessage(notificationsError) || 'Failed to load notifications')
            : null;
    const nextCursor = isPreviewMode ? false : hasNextPage;
    const updateNotificationStatus = (ids: string[], action: AckAction, label?: string) => {
        if (isPreviewMode) {
            if (ids.length === 0) {
                return Promise.resolve();
            }
            const announcementLabel = label ?? `${ids.length} notification${ids.length > 1 ? 's' : ''}`;
            setNotificationAnnouncement(action === 'dismiss'
                ? `Dismissing ${announcementLabel}.`
                : `Marking ${announcementLabel} as read.`);
            setPreviewNotificationState((current) => {
                const currentNotifications = current?.sourceKey === previewSourceKey ? current.notifications : basePreviewNotifications;
                if (action === 'dismiss') {
                    return {
                        sourceKey: previewSourceKey,
                        notifications: currentNotifications.filter((notification) => !ids.includes(notification.id)),
                    };
                }
                return {
                    sourceKey: previewSourceKey,
                    notifications: currentNotifications.map((notification) => ids.includes(notification.id)
                        ? { ...notification, read: true, acknowledged: true }
                        : notification),
                };
            });
            notifySuccess({
                title: action === 'dismiss' ? 'Notifications cleared' : 'Marked as read',
                message: `${ids.length} notification${ids.length > 1 ? 's' : ''} ${action === 'dismiss' ? 'removed' : 'updated'} successfully.`,
            });
            setNotificationAnnouncement(action === 'dismiss'
                ? `${announcementLabel} dismissed.`
                : `${announcementLabel} marked as read.`);
            return Promise.resolve();
        }
        if (!workspaceId || ids.length === 0) {
            return Promise.resolve();
        }
        const announcementLabel = label ?? `${ids.length} notification${ids.length > 1 ? 's' : ''}`;
        setNotificationAnnouncement(action === 'dismiss'
            ? `Dismissing ${announcementLabel}.`
            : `Marking ${announcementLabel} as read.`);
        setAckInFlight(true);
        return ackNotifications({
            workspaceId,
            ids,
            action,
            ...(user?.role === 'client' && selectedClientId ? { clientId: selectedClientId } : {}),
        })
            .then(() => refetchNotifications())
            .then(() => {
            notifySuccess({
                title: action === 'dismiss' ? 'Notifications cleared' : 'Marked as read',
                message: `${ids.length} notification${ids.length > 1 ? 's' : ''} ${action === 'dismiss' ? 'removed' : 'updated'} successfully.`,
            });
            setNotificationAnnouncement(action === 'dismiss'
                ? `${announcementLabel} dismissed.`
                : `${announcementLabel} marked as read.`);
        })
            .catch((updateError) => {
            logError(updateError, 'Notifications:updateStatus');
            const message = asErrorMessage(updateError);
            notifyFailure({
                title: 'Notification error',
                message,
            });
            setNotificationAnnouncement(`Could not update ${announcementLabel}. ${message}`);
        })
            .finally(() => {
            setAckInFlight(false);
        });
    };
    const handleRefresh = () => {
        if (isPreviewMode) {
            setPreviewNotificationState({
                sourceKey: previewSourceKey,
                notifications: basePreviewNotifications,
            });
            notifyInfo({ title: 'Preview data refreshed', message: 'Showing sample notifications.' });
            return;
        }
        void refetchNotifications();
    };
    const handleRetryNotificationsQuery = () => {
        void refetchNotificationsQuery();
    };
    const handleLoadMore = () => {
        if (isPreviewMode) {
            return;
        }
        if (!hasNextPage || isFetchingNextPage) {
            return;
        }
        void fetchNextPage();
    };
    const handleDismiss = (id: string, title?: string) => {
        void updateNotificationStatus([id], 'dismiss', title ? `${title} notification` : 'notification');
    };
    const handleMarkAsRead = (id: string, title?: string) => {
        void updateNotificationStatus([id], 'read', title ? `${title} notification` : 'notification');
    };
    const handleMarkAllRead = () => {
        const unreadIds = notifications.flatMap((item) => (!item.read ? [item.id] : []));
        if (unreadIds.length === 0) {
            notifySuccess({ title: 'All caught up!', message: 'You have no unread notifications.' });
            return;
        }
        void updateNotificationStatus(unreadIds, 'read', `${unreadIds.length} notifications`);
    };
    const handleActiveFilterChange = (value: string) => {
        setActiveFilter(value as FilterType);
    };
    const handleClearAll = () => {
        const allIds = notifications.map((item) => item.id);
        if (allIds.length === 0) {
            notifySuccess({ title: 'Inbox empty', message: 'There are no notifications to clear.' });
            return;
        }
        void updateNotificationStatus(allIds, 'dismiss', `${allIds.length} notifications`);
    };
    const allNotifications = isPreviewMode ? previewNotifications : liveNotifications;
    const unreadCount = allNotifications.filter((item) => !item.read).length;
    const handleSelectToggle = (id: string) => {
        setSelectedIds((current) => {
            const next = new Set(current);
            if (next.has(id)) {
                next.delete(id);
            }
            else {
                next.add(id);
            }
            return next;
        });
    };
    const handleBulkMarkRead = () => {
        const ids = [...selectedIds];
        if (ids.length === 0)
            return;
        void updateNotificationStatus(ids, 'read').then(() => setSelectedIds(new Set()));
    };
    const handleBulkDismiss = () => {
        const ids = [...selectedIds];
        if (ids.length === 0)
            return;
        void updateNotificationStatus(ids, 'dismiss').then(() => setSelectedIds(new Set()));
    };
    const notificationScrollRef = useRef<HTMLDivElement | null>(null);
    const shouldVirtualizeNotifications = notifications.length > VIRTUAL_NOTIFICATIONS_THRESHOLD;
    const notificationVirtualizer = useVirtualizer({
        count: shouldVirtualizeNotifications ? notifications.length : 0,
        getScrollElement: () => notificationScrollRef.current,
        estimateSize: () => 128,
        overscan: 6,
    });
    useEffect(() => {
        if (!shouldVirtualizeNotifications) {
            return;
        }
        notificationVirtualizer.measure();
    }, [notificationVirtualizer, shouldVirtualizeNotifications, notifications.length]);
    const virtualTotalSize = notificationVirtualizer.getTotalSize();
    const virtualContainerStyle = ({ height: virtualTotalSize });
    const handleClearSelection = () => {
        setSelectedIds(new Set());
    };
    return {
        activeFilter,
        ackInFlight,
        error,
        handleActiveFilterChange,
        handleBulkDismiss,
        handleBulkMarkRead,
        handleClearAll,
        handleClearSelection,
        handleDismiss,
        handleLoadMore,
        handleMarkAllRead,
        handleMarkAsRead,
        handleOpenNotification,
        handleRefresh,
        handleRetryNotificationsQuery,
        handleSelectToggle,
        isPreviewMode,
        loading,
        loadingMore,
        nextCursor,
        notificationAnnouncement,
        notificationScrollRef,
        notifications,
        notificationVirtualizer,
        selectedIds,
        shouldVirtualizeNotifications,
        unreadCount,
        virtualContainerStyle,
    };
}
