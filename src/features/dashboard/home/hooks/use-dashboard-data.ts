import { useState, useEffect, useCallback, useMemo } from 'react'
import { useConvexAuth } from 'convex/react'
import { useAuth } from '@/shared/contexts/auth-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { getPreviewMetrics, getPreviewProposals, getPreviewTasks } from '@/lib/preview-data'
import type { TaskRecord } from '@/types/tasks'
import type { MetricRecord, DashboardTaskItem } from '@/types/dashboard'
import { mapTasksForDashboard } from '@/lib/dashboard-utils'
import { summarizeTasks, type TaskSummary } from '../components'
import { mergeProposalForm } from '@/lib/proposals'
import type { ProposalDraft } from '@/types/proposals'
import { useQuery } from 'convex/react'
import { adsMetricsApi, proposalsApi, tasksApi } from '@/lib/convex-api'
import { emitDashboardRefresh, onDashboardRefresh } from '@/lib/refresh-bus'
import { getWorkspaceId } from '@/lib/utils'

export interface UseDashboardDataOptions {
    selectedClientId: string | null
    preferPreviewData?: boolean
}

export interface UseDashboardDataReturn {
    // Metrics
    metrics: MetricRecord[]
    metricsLoading: boolean
    metricsError: string | null

    // Tasks
    taskItems: DashboardTaskItem[]
    rawTasks: TaskRecord[]
    taskSummary: TaskSummary
    tasksLoading: boolean
    tasksError: string | null

    // Proposals
    proposals: ProposalDraft[]
    proposalsLoading: boolean
    proposalsError: string | null

    // Refresh
    lastRefreshed: Date
    handleRefresh: () => void
    isRefreshing: boolean
}

export function useDashboardData(options: UseDashboardDataOptions): UseDashboardDataReturn {
    const { selectedClientId, preferPreviewData = false } = options
    const { user } = useAuth()
    const { isAuthenticated: isConvexAuthenticated, isLoading: isConvexLoading } = useConvexAuth()
    const workspaceId = getWorkspaceId(user)
    const { isPreviewMode } = usePreview()
    const usePreviewData = isPreviewMode || preferPreviewData
    
    // Don't run Convex queries until Convex auth is ready
    const canQueryConvex = isConvexAuthenticated && !isConvexLoading && !!user?.id && !!workspaceId

    const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())

    const proposalsArgs = useMemo(() => (usePreviewData || !workspaceId || !canQueryConvex
            ? 'skip'
            : {
                workspaceId,
                clientId: selectedClientId ?? undefined,
                limit: user?.role === 'client' ? 50 : 25,
            }), [usePreviewData, workspaceId, canQueryConvex, selectedClientId, user?.role])

    const convexProposals = useQuery(proposalsApi.list, proposalsArgs)

    const tasksArgs = useMemo(() => {
        if (usePreviewData || !workspaceId || !canQueryConvex || !user?.id) {
            return 'skip'
        }

        if (selectedClientId) {
            return {
                workspaceId,
                clientId: selectedClientId,
                limit: 200,
            }
        }

        return {
            workspaceId,
            userId: user.id,
        }
    }, [usePreviewData, workspaceId, canQueryConvex, selectedClientId, user?.id])

    const convexTasks = useQuery(
        selectedClientId ? tasksApi.listByClient : tasksApi.listForUser,
        tasksArgs,
    ) as { items?: unknown[] } | unknown[] | undefined

    const metricsArgs = useMemo(() => (usePreviewData || !workspaceId || !canQueryConvex
            ? 'skip'
            : {
                workspaceId,
                clientId: selectedClientId ?? null,
                limit: 100,
            }), [usePreviewData, workspaceId, canQueryConvex, selectedClientId])

    const metricsRealtime = useQuery(adsMetricsApi.listMetricsWithSummary, metricsArgs) as { metrics: MetricRecord[] } | undefined

    const triggerReload = useCallback(() => {
        setLastRefreshed(new Date())
    }, [])

    const handleRefresh = useCallback(() => {
        triggerReload()
        emitDashboardRefresh({ reason: 'manual-dashboard-refresh', clientId: selectedClientId })
    }, [selectedClientId, triggerReload])

    // Subscription for global refresh events
    useEffect(() => {
        if (usePreviewData) return
        const unsubscribe = onDashboardRefresh((evt) => {
            if (selectedClientId && evt.clientId && evt.clientId !== selectedClientId) {
                return
            }
            triggerReload()
        })
        return unsubscribe
    }, [usePreviewData, selectedClientId, triggerReload])

    // Derived Data: Metrics
    const metrics = useMemo(() => {
        if (usePreviewData) return getPreviewMetrics(selectedClientId ?? null)
        if (!user?.id) return []
        return metricsRealtime?.metrics ?? []
    }, [usePreviewData, selectedClientId, user?.id, metricsRealtime])

    const metricsLoading = useMemo(() => {
        if (usePreviewData) return false
        if (!user?.id) return false
        return metricsRealtime === undefined
    }, [usePreviewData, user?.id, metricsRealtime])

    // Derived Data: Tasks
    const rawTasks = useMemo(() => {
        if (usePreviewData) return getPreviewTasks(selectedClientId ?? null)
        if (!user?.id || convexTasks === undefined) return []
        
        const rows = Array.isArray(convexTasks)
            ? convexTasks
            : Array.isArray(convexTasks?.items)
                ? convexTasks.items
                : []
        return rows.map((raw) => {
            const row = (raw ?? {}) as Record<string, unknown>
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
            }
        }) as TaskRecord[]
    }, [usePreviewData, selectedClientId, user?.id, convexTasks])

    const taskItems = useMemo(() => mapTasksForDashboard(rawTasks), [rawTasks])
    const taskSummary = useMemo(() => summarizeTasks(rawTasks), [rawTasks])
    const tasksLoading = useMemo(() => {
        if (usePreviewData) return false
        if (!user?.id) return false
        return convexTasks === undefined
    }, [usePreviewData, user?.id, convexTasks])

    // Derived Data: Proposals
    const proposals = useMemo(() => {
        if (usePreviewData) return getPreviewProposals(selectedClientId ?? null)
        const shouldLoad = user?.role === 'client' || user?.role === 'admin' || user?.role === 'team'
        if (!user?.id || !shouldLoad || convexProposals === undefined) return []

        return convexProposals.map((raw: unknown) => {
            const row = (raw ?? {}) as Record<string, unknown>
            const deck = (row.presentationDeck ?? null) as ProposalDraft['presentationDeck']
            const pptUrl = typeof row.pptUrl === 'string' ? row.pptUrl : null

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
            }
        }) as ProposalDraft[]
    }, [usePreviewData, selectedClientId, user?.id, user?.role, convexProposals])

    const proposalsLoading = useMemo(() => {
        if (usePreviewData) return false
        if (!user?.id) return false
        return convexProposals === undefined
    }, [usePreviewData, user?.id, convexProposals])

    const isRefreshing = metricsLoading || tasksLoading || proposalsLoading

    return useMemo(() => ({
        metrics,
        metricsLoading,
        metricsError: null,
        taskItems,
        rawTasks,
        taskSummary,
        tasksLoading,
        tasksError: null,
        lastRefreshed,
        handleRefresh,
        isRefreshing,
        proposals,
        proposalsLoading,
        proposalsError: null,
    }), [
        metrics,
        metricsLoading,
        taskItems,
        rawTasks,
        taskSummary,
        tasksLoading,
        lastRefreshed,
        handleRefresh,
        isRefreshing,
        proposals,
        proposalsLoading
    ])
}
