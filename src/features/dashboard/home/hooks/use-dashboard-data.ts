import { useEffect, useEffectEvent, useState } from 'react';
import { useConvexAuth, useQuery } from 'convex/react';
import { asErrorMessage } from '@/lib/convex-errors';
import { useAuth } from '@/shared/contexts/auth-context';
import { usePreview } from '@/shared/contexts/preview-context';
import { getPreviewMetrics, getPreviewProposals, getPreviewTasks } from '@/lib/preview-data';
import type { TaskRecord } from '@/types/tasks';
import type { MetricRecord, DashboardTaskItem } from '@/types/dashboard';
import { mapTasksForDashboard } from '@/lib/dashboard-utils';
import { summarizeTasks, type TaskSummary } from '../components/utils';
import { mergeProposalForm } from '@/lib/proposals';
import type { ProposalDraft } from '@/types/proposals';
import { adsMetricsApi, proposalsApi, tasksApi } from '@/lib/convex-api';
import { emitDashboardRefresh, onDashboardRefresh } from '@/lib/refresh-bus';
import { mergeQueryErrors, useConvexQueryError } from '@/lib/hooks/use-convex-query-error';
import { getWorkspaceId } from '@/lib/utils';
export interface UseDashboardDataOptions {
    selectedClientId: string | null;
    preferPreviewData?: boolean;
}
export interface UseDashboardDataReturn {
    // Metrics
    metrics: MetricRecord[];
    metricsLoading: boolean;
    metricsError: string | null;
    // Tasks
    taskItems: DashboardTaskItem[];
    rawTasks: TaskRecord[];
    taskSummary: TaskSummary;
    tasksLoading: boolean;
    tasksError: string | null;
    // Proposals
    proposals: ProposalDraft[];
    proposalsLoading: boolean;
    proposalsError: string | null;
    // Refresh
    lastRefreshed: Date;
    handleRefresh: () => void;
    isRefreshing: boolean;
}
export function useDashboardData(options: UseDashboardDataOptions): UseDashboardDataReturn {
    const { selectedClientId, preferPreviewData = false } = options;
    const { user } = useAuth();
    const { isAuthenticated: isConvexAuthenticated, isLoading: isConvexLoading } = useConvexAuth();
    const workspaceId = getWorkspaceId(user);
    const { isPreviewMode } = usePreview();
    const usePreviewData = isPreviewMode || preferPreviewData;
    // Don't run Convex queries until Convex auth is ready
    const canQueryConvex = isConvexAuthenticated && !isConvexLoading && !!user?.id && !!workspaceId;
    const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
    const proposalsArgs = (usePreviewData || !workspaceId || !canQueryConvex
        ? 'skip'
        : {
            workspaceId,
            clientId: selectedClientId ?? undefined,
            limit: user?.role === 'client' ? 50 : 25,
        });
    const convexProposals = useQuery(proposalsApi.list, proposalsArgs);
    const tasksArgs = (() => {
        if (usePreviewData || !workspaceId || !canQueryConvex || !user?.id) {
            return 'skip';
        }
        if (selectedClientId) {
            return {
                workspaceId,
                clientId: selectedClientId,
                limit: 200,
            };
        }
        return {
            workspaceId,
            userId: user.id,
        };
    })();
    const convexTasks = useQuery(selectedClientId ? tasksApi.listByClient : tasksApi.listForUser, tasksArgs) as {
        items?: unknown[];
    } | unknown[] | undefined;
    const metricsArgs = (usePreviewData || !workspaceId || !canQueryConvex
        ? 'skip'
        : {
            workspaceId,
            clientId: selectedClientId ?? null,
            limit: 100,
        });
    const metricsRealtime = useQuery(adsMetricsApi.listMetricsWithSummary, metricsArgs) as {
        metrics: MetricRecord[];
    } | undefined;
    const metricsSkipped = usePreviewData || !workspaceId || !canQueryConvex;
    const tasksSkipped = usePreviewData || !workspaceId || !canQueryConvex || !user?.id;
    const proposalsSkipped = usePreviewData || !workspaceId || !canQueryConvex;
    const metricsQueryError = useConvexQueryError({
        data: metricsRealtime,
        skipped: metricsSkipped,
        loading: !metricsSkipped && metricsRealtime === undefined,
        fallbackMessage: 'Unable to load dashboard metrics.',
    });
    const tasksQueryError = useConvexQueryError({
        data: convexTasks,
        skipped: tasksSkipped,
        loading: !tasksSkipped && convexTasks === undefined,
        fallbackMessage: 'Unable to load dashboard tasks.',
    });
    const proposalsQueryError = useConvexQueryError({
        data: convexProposals,
        skipped: proposalsSkipped,
        loading: !proposalsSkipped && convexProposals === undefined,
        fallbackMessage: 'Unable to load proposals.',
    });
    const triggerReload = useEffectEvent(() => {
        setLastRefreshed(new Date());
    });
    const handleRefresh = () => {
        triggerReload();
        emitDashboardRefresh({ reason: 'manual-dashboard-refresh', clientId: selectedClientId });
    };
    // Subscription for global refresh events
    useEffect(() => {
        if (usePreviewData)
            return;
        const unsubscribe = onDashboardRefresh((evt) => {
            if (selectedClientId && evt.clientId && evt.clientId !== selectedClientId) {
                return;
            }
            triggerReload();
        });
        return unsubscribe;
    }, [selectedClientId, usePreviewData]);
    // Derived Data: Metrics
    const metricsResult = (() => {
        if (usePreviewData) {
            return { data: getPreviewMetrics(selectedClientId ?? null), error: null as string | null };
        }
        if (!user?.id) {
            return { data: [] as MetricRecord[], error: null as string | null };
        }
        if (metricsRealtime === undefined) {
            return { data: [] as MetricRecord[], error: null as string | null };
        }
        try {
            if (!metricsRealtime || typeof metricsRealtime !== 'object' || !Array.isArray((metricsRealtime as {
                metrics?: unknown;
            }).metrics)) {
                throw new Error('Malformed metrics response');
            }
            const rows = (metricsRealtime as unknown as {
                metrics: Array<Record<string, unknown>>;
            }).metrics;
            const data = rows.map((row) => ({
                id: String(row.id ?? ''),
                providerId: String(row.providerId ?? 'unknown'),
                date: String(row.date ?? ''),
                clientId: typeof row.clientId === 'string' ? row.clientId : null,
                createdAt: typeof row.createdAtMs === 'number'
                    ? new Date(row.createdAtMs).toISOString()
                    : typeof row.createdAt === 'string'
                        ? row.createdAt
                        : null,
                currency: typeof row.currency === 'string' ? row.currency : null,
                spend: Number(row.spend ?? 0),
                impressions: Number(row.impressions ?? 0),
                clicks: Number(row.clicks ?? 0),
                conversions: Number(row.conversions ?? 0),
                revenue: row.revenue === null || row.revenue === undefined ? null : Number(row.revenue),
            })) satisfies MetricRecord[];
            return {
                data,
                error: null as string | null,
            };
        }
        catch (error) {
            return {
                data: [] as MetricRecord[],
                error: asErrorMessage(error, 'Unable to load dashboard metrics'),
            };
        }
    })();
    const metrics = metricsResult.data;
    const metricsLoading = (() => {
        if (usePreviewData)
            return false;
        if (!user?.id)
            return false;
        return metricsRealtime === undefined;
    })();
    // Derived Data: Tasks
    const tasksResult = (() => {
        if (usePreviewData) {
            return { data: getPreviewTasks(selectedClientId ?? null), error: null as string | null };
        }
        if (!user?.id || convexTasks === undefined) {
            return { data: [] as TaskRecord[], error: null as string | null };
        }
        try {
            const rows = Array.isArray(convexTasks)
                ? convexTasks
                : Array.isArray(convexTasks?.items)
                    ? convexTasks.items
                    : [];
            const data = rows.map((raw) => {
                const row = (raw ?? {}) as Record<string, unknown>;
                return {
                    id: String(row.legacyId),
                    title: String(row.title ?? ''),
                    description: typeof row.description === 'string' ? row.description : null,
                    status: row.status as TaskRecord['status'],
                    priority: row.priority as TaskRecord['priority'],
                    assignedTo: Array.isArray(row.assignedTo) ? row.assignedTo : [],
                    clientId: typeof row.clientId === 'string' ? row.clientId : null,
                    client: typeof row.client === 'string' ? row.client : null,
                    projectId: typeof row.projectId === 'string' ? row.projectId : null,
                    projectName: typeof row.projectName === 'string' ? row.projectName : null,
                    dueDate: typeof row.dueDateMs === 'number' ? new Date(row.dueDateMs).toISOString() : null,
                    createdAt: typeof row.createdAtMs === 'number' ? new Date(row.createdAtMs).toISOString() : null,
                    updatedAt: typeof row.updatedAtMs === 'number' ? new Date(row.updatedAtMs).toISOString() : null,
                    deletedAt: typeof row.deletedAtMs === 'number' ? new Date(row.deletedAtMs).toISOString() : null,
                };
            }) as TaskRecord[];
            return { data, error: null as string | null };
        }
        catch (error) {
            return {
                data: [] as TaskRecord[],
                error: asErrorMessage(error, 'Unable to load dashboard tasks'),
            };
        }
    })();
    const rawTasks = tasksResult.data;
    const taskItems = mapTasksForDashboard(rawTasks);
    const taskSummary = summarizeTasks(rawTasks);
    const tasksLoading = (() => {
        if (usePreviewData)
            return false;
        if (!user?.id)
            return false;
        return convexTasks === undefined;
    })();
    // Derived Data: Proposals
    const proposalsResult = (() => {
        if (usePreviewData) {
            return { data: getPreviewProposals(selectedClientId ?? null), error: null as string | null };
        }
        const shouldLoad = user?.role === 'client' || user?.role === 'admin' || user?.role === 'team';
        if (!user?.id || !shouldLoad || convexProposals === undefined) {
            return { data: [] as ProposalDraft[], error: null as string | null };
        }
        try {
            const data = convexProposals.map((raw: unknown) => {
                const row = (raw ?? {}) as Record<string, unknown>;
                const deck = (row.presentationDeck ?? null) as ProposalDraft['presentationDeck'];
                const pptUrl = typeof row.pptUrl === 'string' ? row.pptUrl : null;
                return {
                    id: String(row.legacyId),
                    status: (row.status ?? 'draft') as ProposalDraft['status'],
                    stepProgress: typeof row.stepProgress === 'number' ? row.stepProgress : 0,
                    formData: mergeProposalForm(row.formData ?? null),
                    aiInsights: row.aiInsights ?? null,
                    aiSuggestions: row.aiSuggestions ?? null,
                    pdfUrl: (row.pdfUrl as string | null | undefined) ?? null,
                    pptUrl,
                    createdAt: typeof row.createdAtMs === 'number' ? new Date(row.createdAtMs).toISOString() : null,
                    updatedAt: typeof row.updatedAtMs === 'number' ? new Date(row.updatedAtMs).toISOString() : null,
                    lastAutosaveAt: typeof row.lastAutosaveAtMs === 'number' ? new Date(row.lastAutosaveAtMs).toISOString() : null,
                    clientId: typeof row.clientId === 'string' ? row.clientId : null,
                    clientName: typeof row.clientName === 'string' ? row.clientName : null,
                    presentationDeck: deck
                        ? {
                            ...deck,
                            storageUrl: deck.storageUrl ?? pptUrl,
                        }
                        : null,
                };
            }) as ProposalDraft[];
            return { data, error: null as string | null };
        }
        catch (error) {
            return {
                data: [] as ProposalDraft[],
                error: asErrorMessage(error, 'Unable to load proposals'),
            };
        }
    })();
    const proposals = proposalsResult.data;
    const proposalsLoading = (() => {
        if (usePreviewData)
            return false;
        if (!user?.id)
            return false;
        return convexProposals === undefined;
    })();
    const isRefreshing = metricsLoading || tasksLoading || proposalsLoading;
    const metricsError = mergeQueryErrors(metricsResult.error, metricsQueryError);
    const tasksError = mergeQueryErrors(tasksResult.error, tasksQueryError);
    const proposalsError = mergeQueryErrors(proposalsResult.error, proposalsQueryError);
    return ({
        metrics,
        metricsLoading,
        metricsError,
        taskItems,
        rawTasks,
        taskSummary,
        tasksLoading,
        tasksError,
        lastRefreshed,
        handleRefresh,
        isRefreshing,
        proposals,
        proposalsLoading,
        proposalsError,
    });
}
