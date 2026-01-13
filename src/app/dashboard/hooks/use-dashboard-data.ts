import { useState, useEffect, useCallback } from 'react'
import { useConvexAuth } from 'convex/react'
import { useAuth } from '@/contexts/auth-context'
import { usePreview } from '@/contexts/preview-context'
import { getPreviewFinanceSummary, getPreviewMetrics, getPreviewTasks } from '@/lib/preview-data'
import type { FinanceSummaryResponse } from '@/types/finance'
import type { TaskRecord } from '@/types/tasks'
import type { MetricRecord, DashboardTaskItem } from '@/types/dashboard'
import { mapTasksForDashboard } from '@/lib/dashboard-utils'
import { summarizeTasks, DEFAULT_TASK_SUMMARY, type TaskSummary } from '../components'
import { mergeProposalForm } from '@/lib/proposals'
import type { ProposalDraft } from '@/types/proposals'
import { useQuery } from 'convex/react'
import { adsMetricsApi, financeSummaryApi, proposalsApi, tasksApi } from '@/lib/convex-api'
import { emitDashboardRefresh, onDashboardRefresh } from '@/lib/refresh-bus'
import { getWorkspaceId } from '@/lib/utils'
import { asErrorMessage, logError } from '@/lib/convex-errors'

export interface UseDashboardDataOptions {
    selectedClientId: string | null
}

export interface UseDashboardDataReturn {
    // Finance
    financeSummary: FinanceSummaryResponse | null
    financeLoading: boolean
    financeError: string | null

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
    const { selectedClientId } = options
    const { user, getIdToken } = useAuth()
    const { isAuthenticated: isConvexAuthenticated, isLoading: isConvexLoading } = useConvexAuth()
    const workspaceId = getWorkspaceId(user)
    const { isPreviewMode } = usePreview()
    
    // Don't run Convex queries until Convex auth is ready
    const canQueryConvex = isConvexAuthenticated && !isConvexLoading && !!user?.id && !!workspaceId

    const [financeSummary, setFinanceSummary] = useState<FinanceSummaryResponse | null>(null)
    const [financeLoading, setFinanceLoading] = useState(true)
    const [financeError, setFinanceError] = useState<string | null>(null)

    const [metrics, setMetrics] = useState<MetricRecord[]>([])
    const [metricsLoading, setMetricsLoading] = useState(true)
    const [metricsError, setMetricsError] = useState<string | null>(null)

    const [taskItems, setTaskItems] = useState<DashboardTaskItem[]>([])
    const [rawTasks, setRawTasks] = useState<TaskRecord[]>([])
    const [taskSummary, setTaskSummary] = useState<TaskSummary>(DEFAULT_TASK_SUMMARY)
    const [tasksLoading, setTasksLoading] = useState(true)
    const [tasksError, setTasksError] = useState<string | null>(null)

    const [proposals, setProposals] = useState<ProposalDraft[]>([])
    const [proposalsLoading, setProposalsLoading] = useState(true)
    const [proposalsError, setProposalsError] = useState<string | null>(null)

    const convexProposals = useQuery(
        proposalsApi.list,
        isPreviewMode || !workspaceId || !canQueryConvex
            ? 'skip'
            : {
                workspaceId,
                clientId: selectedClientId ?? undefined,
                limit: user?.role === 'client' ? 50 : 25,
            }
    )

    const convexTasks = useQuery(
        tasksApi.listByClient,
        isPreviewMode || !workspaceId || !canQueryConvex
            ? 'skip'
            : {
                workspaceId,
                clientId: selectedClientId ?? null,
                limit: 200,
            }
    ) as Array<any> | undefined

    const [refreshKey, setRefreshKey] = useState(0)
    const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())

    const financeRealtime = useQuery(
        financeSummaryApi.get,
        isPreviewMode || !workspaceId || !canQueryConvex
            ? 'skip'
            : {
                workspaceId,
                clientId: selectedClientId ?? null,
                invoiceLimit: 200,
                costLimit: 200,
                revenueLimit: 36,
            }
    ) as FinanceSummaryResponse | undefined

    // Metrics are now fetched directly from Convex
    const metricsRealtime = useQuery(
        adsMetricsApi.listMetricsWithSummary,
        isPreviewMode || !workspaceId || !canQueryConvex
            ? 'skip'
            : {
                workspaceId,
                clientId: selectedClientId ?? null,
                limit: 100,
            }
    ) as { metrics: MetricRecord[] } | undefined

    const triggerReload = useCallback(() => {
        setRefreshKey((prev) => prev + 1)
    }, [])

    const handleRefresh = useCallback(() => {
        triggerReload()
        emitDashboardRefresh({ reason: 'manual-dashboard-refresh', clientId: selectedClientId })
    }, [selectedClientId, triggerReload])

    // When tasks/projects are created/updated elsewhere, refresh dashboard data automatically.
    // This fixes cross-page staleness (e.g., creating a project on /dashboard/projects).
    useEffect(() => {
        if (isPreviewMode) return
        const unsubscribe = onDashboardRefresh((evt) => {
            // If the dashboard is scoped to a client, only react to matching events.
            if (selectedClientId && evt.clientId && evt.clientId !== selectedClientId) {
                return
            }
            triggerReload()
        })
        return unsubscribe
    }, [isPreviewMode, selectedClientId, triggerReload])

    const isRefreshing = financeLoading || metricsLoading || tasksLoading || (user?.role === 'client' && proposalsLoading)

    useEffect(() => {
        let isCancelled = false

        if (!isPreviewMode && workspaceId && user?.id && convexTasks !== undefined) {
            const taskRows = Array.isArray(convexTasks)
                ? convexTasks
                : (convexTasks && typeof convexTasks === 'object' && 'items' in convexTasks && Array.isArray((convexTasks as any).items))
                    ? (convexTasks as any).items
                    : []

            const mapped = taskRows.map((row: any) => ({
                id: String(row.legacyId),
                title: String(row.title ?? ''),
                description: typeof row.description === 'string' ? row.description : null,
                status: row.status,
                priority: row.priority,
                assignedTo: Array.isArray(row.assignedTo) ? row.assignedTo : [],
                clientId: row.clientId ?? null,
                client: row.client ?? null,
                projectId: row.projectId ?? null,
                projectName: row.projectName ?? null,
                dueDate: typeof row.dueDateMs === 'number' ? new Date(row.dueDateMs).toISOString() : null,
                tags: Array.isArray(row.tags) ? row.tags : [],
                createdAt: typeof row.createdAtMs === 'number' ? new Date(row.createdAtMs).toISOString() : null,
                updatedAt: typeof row.updatedAtMs === 'number' ? new Date(row.updatedAtMs).toISOString() : null,
                deletedAt: typeof row.deletedAtMs === 'number' ? new Date(row.deletedAtMs).toISOString() : null,
            })) as TaskRecord[]

            setRawTasks(mapped)
            setTaskItems(mapTasksForDashboard(mapped))
            setTaskSummary(summarizeTasks(mapped))
            setTasksError(null)
            setTasksLoading(false)
        }

        if (!user?.id) {
            setFinanceSummary(null)
            setMetrics([])
            setFinanceError(null)
            setMetricsError(null)
            setFinanceLoading(false)
            setMetricsLoading(false)
            setTaskItems([])
            setTaskSummary(DEFAULT_TASK_SUMMARY)
            setTasksError(null)
            setTasksLoading(false)
            setProposals([])
            setProposalsError(null)
            setProposalsLoading(false)
            return () => {
                isCancelled = true
            }
        }

        if (isPreviewMode) {
            const previewFinance = getPreviewFinanceSummary(selectedClientId ?? null)
            const previewMetrics = getPreviewMetrics(selectedClientId ?? null)
            const previewTasks = getPreviewTasks(selectedClientId ?? null)

            setFinanceSummary(previewFinance)
            setFinanceError(null)
            setFinanceLoading(false)

            setMetrics(previewMetrics)
            setMetricsError(null)
            setMetricsLoading(false)

            setRawTasks(previewTasks)
            setTaskItems(mapTasksForDashboard(previewTasks))
            setTaskSummary(summarizeTasks(previewTasks))
            setTasksError(null)
            setTasksLoading(false)

            setProposals([])
            setProposalsError(null)
            setProposalsLoading(false)

            setLastRefreshed(new Date())

            return () => {
                isCancelled = true
            }
        }

        const loadFinance = async () => {
            setFinanceLoading(true)
            setFinanceError(null)
            try {
                if (financeRealtime === undefined) {
                    return
                }
                if (!isCancelled) {
                    setFinanceSummary(financeRealtime)
                }
            } catch (error) {
                if (!isCancelled) {
                    logError(error, 'useDashboardData:loadFinance')
                    setFinanceSummary(null)
                    setFinanceError(asErrorMessage(error))
                }
            } finally {
                if (!isCancelled) {
                    setFinanceLoading(false)
                }
            }
        }

         const loadMetrics = async () => {
             // Metrics are now realtime via Convex
             if (!canQueryConvex) {
                 setMetrics([])
                 setMetricsError(null)
                 setMetricsLoading(false)
                 return
             }

             if (metricsRealtime === undefined) {
                 setMetricsLoading(true)
                 return
             }

             if (!isCancelled) {
                 const entries = Array.isArray(metricsRealtime?.metrics) ? metricsRealtime.metrics : []
                 setMetrics(entries as MetricRecord[])
                 setMetricsError(null)
                 setMetricsLoading(false)
             }
         }


        const loadTasks = async () => {
            // Tasks are realtime via Convex; this function is a no-op.
            setTasksLoading(false)
        }

        const loadProposals = async () => {
            const shouldLoad = user?.role === 'client' || user?.role === 'admin' || user?.role === 'team'
            if (!shouldLoad) {
                setProposals([])
                setProposalsLoading(false)
                return
            }

            // Proposals list is realtime via Convex. We just mirror it into local state
            // to preserve the existing hook shape.
            if (convexProposals === undefined) {
                setProposalsLoading(true)
                return
            }

            setProposalsLoading(false)
            setProposalsError(null)

            const rows = convexProposals ?? []
            const mapped: ProposalDraft[] = rows.map((row: any) => ({
                id: String(row.legacyId),
                status: (row.status ?? 'draft') as ProposalDraft['status'],
                stepProgress: typeof row.stepProgress === 'number' ? row.stepProgress : 0,
                formData: mergeProposalForm(row.formData ?? null),
                aiInsights: row.aiInsights ?? null,
                aiSuggestions: row.aiSuggestions ?? null,
                pdfUrl: row.pdfUrl ?? null,
                pptUrl: row.pptUrl ?? null,
                createdAt: typeof row.createdAtMs === 'number' ? new Date(row.createdAtMs).toISOString() : null,
                updatedAt: typeof row.updatedAtMs === 'number' ? new Date(row.updatedAtMs).toISOString() : null,
                lastAutosaveAt: typeof row.lastAutosaveAtMs === 'number' ? new Date(row.lastAutosaveAtMs).toISOString() : null,
                clientId: row.clientId ?? null,
                clientName: row.clientName ?? null,
                presentationDeck: row.presentationDeck
                    ? {
                        ...row.presentationDeck,
                        storageUrl: row.presentationDeck.storageUrl ?? row.pptUrl ?? null,
                    }
                    : null,
            }))

            if (!isCancelled) {
                setProposals(mapped)
            }
        }

        const loadAll = async () => {
            await Promise.all([loadFinance(), loadMetrics(), loadTasks(), loadProposals()])
            if (!isCancelled) {
                setLastRefreshed(new Date())
            }
        }

        void loadAll()
        return () => {
            isCancelled = true
        }
     }, [user?.id, workspaceId, selectedClientId, getIdToken, refreshKey, isPreviewMode, convexProposals, financeRealtime, metricsRealtime, canQueryConvex])


    return {
        financeSummary,
        financeLoading,
        financeError,
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
    }
}
