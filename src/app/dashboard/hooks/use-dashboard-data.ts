import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { usePreview } from '@/contexts/preview-context'
import { getPreviewFinanceSummary, getPreviewMetrics, getPreviewTasks } from '@/lib/preview-data'
import type { FinanceSummaryResponse } from '@/types/finance'
import type { TaskRecord } from '@/types/tasks'
import type { MetricRecord, DashboardTaskItem } from '@/types/dashboard'
import { getErrorMessage, mapTasksForDashboard } from '@/lib/dashboard-utils'
import { summarizeTasks, DEFAULT_TASK_SUMMARY, type TaskSummary } from '../components'

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

    // Refresh
    lastRefreshed: Date
    handleRefresh: () => void
    isRefreshing: boolean
}

export function useDashboardData(options: UseDashboardDataOptions): UseDashboardDataReturn {
    const { selectedClientId } = options
    const { user, getIdToken } = useAuth()
    const { isPreviewMode } = usePreview()

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

    const [refreshKey, setRefreshKey] = useState(0)
    const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())

    const handleRefresh = useCallback(() => {
        setRefreshKey((prev) => prev + 1)
    }, [])

    const isRefreshing = financeLoading || metricsLoading || tasksLoading

    useEffect(() => {
        let isCancelled = false

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

            setLastRefreshed(new Date())

            return () => {
                isCancelled = true
            }
        }

        const query = selectedClientId ? `?clientId=${encodeURIComponent(selectedClientId)}` : ''
        const tasksQuery = query ? `${query}&includeSummary=1` : '?includeSummary=1'

        const loadFinance = async () => {
            setFinanceLoading(true)
            setFinanceError(null)
            try {
                const token = await getIdToken()
                const response = await fetch(`/api/finance${query}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: 'no-store',
                })

                if (!response.ok) {
                    let message = 'Failed to load finance data'
                    try {
                        const payload = (await response.json()) as { error?: unknown }
                        if (typeof payload.error === 'string' && payload.error.trim().length > 0) {
                            message = payload.error
                        }
                    } catch {
                        // ignore JSON parse errors
                    }
                    throw new Error(message)
                }

                const payload = (await response.json()) as Record<string, unknown>
                const data = payload.data || payload
                if (!isCancelled) {
                    setFinanceSummary(data as FinanceSummaryResponse)
                }
            } catch (error) {
                if (!isCancelled) {
                    setFinanceSummary(null)
                    setFinanceError(getErrorMessage(error, 'Unable to load finance data'))
                }
            } finally {
                if (!isCancelled) {
                    setFinanceLoading(false)
                }
            }
        }

        const loadMetrics = async () => {
            setMetricsLoading(true)
            setMetricsError(null)
            try {
                const token = await getIdToken()
                const response = await fetch(`/api/metrics${query}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: 'no-store',
                })

                if (!response.ok) {
                    let message = 'Failed to load marketing data'
                    try {
                        const payload = (await response.json()) as { error?: unknown }
                        if (typeof payload.error === 'string' && payload.error.trim().length > 0) {
                            message = payload.error
                        }
                    } catch {
                        // ignore JSON parse errors
                    }
                    throw new Error(message)
                }

                const payload = (await response.json()) as Record<string, unknown>
                const data = payload.data || payload
                if (!isCancelled) {
                    const dataRecord = data as Record<string, unknown>
                    const entries = Array.isArray(dataRecord?.metrics) ? dataRecord.metrics : Array.isArray(data) ? data : []
                    setMetrics(entries as MetricRecord[])
                }
            } catch (error) {
                if (!isCancelled) {
                    setMetrics([])
                    setMetricsError(getErrorMessage(error, 'Unable to load marketing performance'))
                }
            } finally {
                if (!isCancelled) {
                    setMetricsLoading(false)
                }
            }
        }

        const loadTasks = async () => {
            setTasksLoading(true)
            setTasksError(null)
            try {
                const token = await getIdToken()
                const response = await fetch(`/api/tasks${tasksQuery}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: 'no-store',
                })

                if (!response.ok) {
                    let message = 'Failed to load tasks'
                    try {
                        const payload = (await response.json()) as { error?: unknown }
                        if (typeof payload.error === 'string' && payload.error.trim().length > 0) {
                            message = payload.error
                        }
                    } catch {
                        // ignore JSON parse errors
                    }
                    throw new Error(message)
                }

                const payload = (await response.json()) as Record<string, unknown>
                const data = payload.data || payload
                if (!isCancelled) {
                    const dataRecord = data as Record<string, unknown>
                    const tasks = Array.isArray(dataRecord?.tasks) ? dataRecord.tasks : Array.isArray(data) ? data : []
                    const summary = dataRecord?.summary as TaskSummary | undefined
                    setRawTasks(tasks as TaskRecord[])
                    const entries = mapTasksForDashboard(tasks as TaskRecord[])
                    setTaskItems(entries)

                    if (
                        summary &&
                        typeof summary.total === 'number' &&
                        typeof summary.overdue === 'number' &&
                        typeof summary.dueSoon === 'number' &&
                        typeof summary.highPriority === 'number'
                    ) {
                        setTaskSummary(summary)
                    } else {
                        setTaskSummary(summarizeTasks(tasks as TaskRecord[]))
                    }
                }
            } catch (error) {
                if (!isCancelled) {
                    setRawTasks([])
                    setTaskItems([])
                    setTaskSummary(DEFAULT_TASK_SUMMARY)
                    setTasksError(getErrorMessage(error, 'Unable to load tasks'))
                }
            } finally {
                if (!isCancelled) {
                    setTasksLoading(false)
                }
            }
        }

        const loadAll = async () => {
            await Promise.all([loadFinance(), loadMetrics(), loadTasks()])
            if (!isCancelled) {
                setLastRefreshed(new Date())
            }
        }

        void loadAll()
        return () => {
            isCancelled = true
        }
    }, [user?.id, selectedClientId, getIdToken, refreshKey, isPreviewMode])

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
    }
}
