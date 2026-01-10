'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { TaskRecord, TaskStatus } from '@/types/tasks'
import { apiFetch } from '@/lib/api-client'
import { ApiClientError } from '@/lib/user-friendly-error'
import { getPreviewTasks } from '@/lib/preview-data'
import { emitDashboardRefresh } from '@/lib/refresh-bus'
import {
  RETRY_CONFIG,
  TaskListResponse,
  sleep,
  calculateBackoffDelay,
  isNetworkError,
  formatStatusLabel,
} from '../task-types'

export type UseTasksOptions = {
  userId: string | undefined
  clientId: string | undefined
  authLoading: boolean
  isPreviewMode?: boolean
}

export type UseTasksReturn = {
  tasks: TaskRecord[]
  setTasks: React.Dispatch<React.SetStateAction<TaskRecord[]>>
  nextCursor: string | null
  loading: boolean
  loadingMore: boolean
  error: string | null
  setError: React.Dispatch<React.SetStateAction<string | null>>
  retryCount: number
  pendingStatusUpdates: Set<string>
  handleLoadMore: () => Promise<void>
  handleRefresh: () => Promise<void>
  handleQuickStatusChange: (task: TaskRecord, newStatus: TaskStatus) => Promise<void>
  handleDeleteTask: (task: TaskRecord) => Promise<boolean>
  handleCreateTask: (payload: CreateTaskPayload) => Promise<TaskRecord | null>
  handleUpdateTask: (taskId: string, payload: UpdateTaskPayload) => Promise<TaskRecord | null>
  handleBulkUpdate: (ids: string[], update: Partial<UpdateTaskPayload>) => Promise<boolean>
  handleBulkDelete: (ids: string[]) => Promise<boolean>
}

export type CreateTaskPayload = {
  title: string
  description?: string
  status: TaskStatus
  priority: string
  assignedTo: string[]
  clientId: string
  client?: string
  dueDate?: string
  tags: string[]
}

export type UpdateTaskPayload = {
  title: string
  description?: string
  status: TaskStatus
  priority: string
  assignedTo: string[]
  dueDate?: string
  tags: string[]
}

export function useTasks({ userId, clientId, authLoading, isPreviewMode = false }: UseTasksOptions): UseTasksReturn {
  const { toast } = useToast()
  const abortControllerRef = useRef<AbortController | null>(null)

  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [pendingStatusUpdates, setPendingStatusUpdates] = useState<Set<string>>(new Set())

  // Load tasks effect
  useEffect(() => {
    // Handle preview mode
    if (isPreviewMode) {
      setTasks(getPreviewTasks(clientId ?? null))
      setNextCursor(null)
      setLoading(false)
      setError(null)
      return
    }

    if (authLoading) return

    if (!userId) {
      setTasks([])
      setNextCursor(null)
      setLoading(false)
      return
    }

    if (!clientId) {
      setTasks([])
      setNextCursor(null)
      setLoading(false)
      return
    }

    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    const loadTasks = async (attempt = 0): Promise<void> => {
      setLoading(true)
      setError(null)
      setRetryCount(attempt)

      try {
        const search = new URLSearchParams()
        if (clientId) {
          search.set('clientId', clientId)
        }
        const queryString = search.toString()
        const url = `/api/tasks${queryString ? `?${queryString}` : ''}`
        const data = await apiFetch<TaskListResponse>(url, {
          cache: 'no-store',
          signal: abortControllerRef.current?.signal,
        })

        const entries = Array.isArray(data?.tasks) ? data.tasks : []
        setTasks(entries)
        setNextCursor(
          typeof data?.nextCursor === 'string' && data.nextCursor.length > 0
            ? data.nextCursor
            : null
        )
      } catch (fetchError: unknown) {
        // Ignore aborted requests
        if (fetchError instanceof Error && fetchError.name === 'AbortError') return
        if (fetchError instanceof ApiClientError && (fetchError as any).cause?.name === 'AbortError') return

        console.error('Failed to fetch tasks', fetchError)

        if (isNetworkError(fetchError) && attempt < RETRY_CONFIG.maxRetries) {
          const delay = calculateBackoffDelay(attempt)
          await sleep(delay)
          return loadTasks(attempt + 1)
        }

        const message =
          fetchError instanceof Error ? fetchError.message : 'Unexpected error loading tasks'
        setError(message)
        setTasks([])
        setNextCursor(null)
        toast({
          title: 'Failed to load tasks',
          description: `${message}. Please check your connection and try again.`,
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
        setRetryCount(0)
      }
    }

    void loadTasks()

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [authLoading, clientId, userId, toast, isPreviewMode])

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !nextCursor) return

    setLoadingMore(true)
    try {
      const params = new URLSearchParams()
      if (clientId) {
        params.set('clientId', clientId)
      }
      params.set('after', nextCursor)
      const url = `/api/tasks?${params.toString()}`
      const data = await apiFetch<TaskListResponse>(url, {
        cache: 'no-store',
      })

      const entries = Array.isArray(data?.tasks) ? data.tasks : []
      setTasks((prev) => [...prev, ...entries])
      setNextCursor(
        typeof data?.nextCursor === 'string' && data.nextCursor.length > 0 ? data.nextCursor : null
      )
    } catch (err) {
      console.error('Failed to load additional tasks', err)
      toast({
        title: "Couldn't load more tasks",
        description:
          err instanceof Error ? err.message : 'Unable to load more tasks. Try refreshing.',
        variant: 'destructive',
      })
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, nextCursor, clientId, toast])

  const handleRefresh = useCallback(async () => {
    // Handle preview mode refresh
    if (isPreviewMode) {
      const previewTasks = getPreviewTasks(clientId ?? null)
      setTasks(previewTasks)
      setNextCursor(null)
      setError(null)
      toast({
        title: 'Preview refreshed',
        description: `${previewTasks.length} demo task${previewTasks.length !== 1 ? 's' : ''} loaded.`,
      })
      return
    }

    if (!userId || !clientId) return

    setLoading(true)
    setError(null)

    try {
      const search = new URLSearchParams()
      if (clientId) {
        search.set('clientId', clientId)
      }
      const url = `/api/tasks?${search.toString()}`
      const data = await apiFetch<TaskListResponse>(url, {
        cache: 'no-store',
      })

      const entries = Array.isArray(data?.tasks) ? data.tasks : []
      setTasks(entries)
      setNextCursor(
        typeof data?.nextCursor === 'string' && data.nextCursor.length > 0 ? data.nextCursor : null
      )
      toast({
        title: 'Tasks refreshed',
        description: `${entries.length} task${entries.length !== 1 ? 's' : ''} loaded successfully.`,
      })
    } catch (err) {
      console.error('Failed to refresh tasks', err)
      toast({
        title: 'Refresh failed',
        description: err instanceof Error ? err.message : 'Unable to refresh tasks',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [userId, clientId, toast, isPreviewMode])

  const handleQuickStatusChange = useCallback(
    async (task: TaskRecord, newStatus: TaskStatus) => {
      // In preview mode, allow local state changes but show info toast
      if (isPreviewMode) {
        setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)))
        toast({
          title: 'Preview mode',
          description: `Status changed to "${formatStatusLabel(newStatus)}" (not saved).`,
        })
        return
      }

      if (!userId) return
      if (pendingStatusUpdates.has(task.id)) return

      const previousStatus = task.status
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)))
      setPendingStatusUpdates((prev) => new Set(prev).add(task.id))

      try {
        const updatedTask = await apiFetch<TaskRecord>(`/api/tasks/${task.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: newStatus }),
        })
        setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)))
        toast({
          title: 'Status updated',
          description: `Task moved to "${formatStatusLabel(newStatus)}".`,
        })
      } catch (err) {
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, status: previousStatus } : t))
        )
        console.error('Failed to update task status', err)
        toast({
          title: 'Status update failed',
          description:
            err instanceof Error ? err.message : 'Unable to update status. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setPendingStatusUpdates((prev) => {
          const next = new Set(prev)
          next.delete(task.id)
          return next
        })
      }
    },
    [userId, pendingStatusUpdates, toast, isPreviewMode]
  )

  const handleDeleteTask = useCallback(
    async (task: TaskRecord): Promise<boolean> => {
      // In preview mode, show info toast instead of deleting
      if (isPreviewMode) {
        toast({
          title: 'Preview mode',
          description: 'Changes are not saved in preview mode. Exit preview to make real changes.',
        })
        return true
      }

      try {
        await apiFetch(`/api/tasks/${task.id}`, {
          method: 'DELETE',
        })

        setTasks((prev) => prev.filter((t) => t.id !== task.id))
        emitDashboardRefresh({ reason: 'task-mutated', clientId: task.clientId ?? clientId ?? null })
        toast({
          title: 'Task deleted',
          description: `"${task.title}" has been permanently removed.`,
        })
        return true
      } catch (err) {
        console.error('Failed to delete task', err)
        toast({
          title: 'Deletion failed',
          description:
            err instanceof Error ? err.message : 'Unable to delete task. Please try again.',
          variant: 'destructive',
        })
        return false
      }
    },
    [toast, isPreviewMode]
  )

  const handleCreateTask = useCallback(
    async (payload: CreateTaskPayload): Promise<TaskRecord | null> => {
      // In preview mode, create a fake task locally
      if (isPreviewMode) {
        const fakeTask: TaskRecord = {
          id: `preview-task-${Date.now()}`,
          title: payload.title,
          description: payload.description ?? null,
          status: payload.status,
          priority: payload.priority as TaskRecord['priority'],
          assignedTo: payload.assignedTo,
          clientId: payload.clientId,
          client: payload.client ?? null,
          projectId: null,
          projectName: null,
          dueDate: payload.dueDate ?? null,
          tags: payload.tags,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
        }
        setTasks((prev) => [fakeTask, ...prev])
        toast({
          title: 'Preview mode',
          description: `Task created locally (not saved).`,
        })
        return fakeTask
      }

      try {
        const createdTask = await apiFetch<TaskRecord>('/api/tasks', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        setTasks((prev) => [createdTask, ...prev])
        setError(null)
        emitDashboardRefresh({ reason: 'task-mutated', clientId: createdTask.clientId ?? clientId ?? null })
        toast({
          title: 'Task created successfully',
          description: `"${createdTask.title}" has been added to your task list.`,
        })
        return createdTask
      } catch (err) {
        console.error('Failed to create task', err)
        throw err
      }
    },
    [toast, isPreviewMode]
  )

  const handleUpdateTask = useCallback(
    async (taskId: string, payload: UpdateTaskPayload): Promise<TaskRecord | null> => {
      // In preview mode, update local state only
      if (isPreviewMode) {
        setTasks((prev) => prev.map((t) => {
          if (t.id === taskId) {
            return {
              ...t,
              title: payload.title ?? t.title,
              description: payload.description ?? t.description,
              status: payload.status ?? t.status,
              priority: (payload.priority as TaskRecord['priority']) ?? t.priority,
              assignedTo: payload.assignedTo ?? t.assignedTo,
              dueDate: payload.dueDate ?? t.dueDate,
              tags: payload.tags ?? t.tags,
              updatedAt: new Date().toISOString(),
            }
          }
          return t
        }))
        toast({
          title: 'Preview mode',
          description: `Task updated locally (not saved).`,
        })
        return null
      }

      try {
        const updatedTask = await apiFetch<TaskRecord>(`/api/tasks/${taskId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
        setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)))
        emitDashboardRefresh({ reason: 'task-mutated', clientId: updatedTask.clientId ?? clientId ?? null })
        toast({
          title: 'Task updated',
          description: `Changes to "${updatedTask.title}" have been saved.`,
        })
        return updatedTask
      } catch (err) {
        console.error('Failed to update task', err)
        throw err
      }
    },
    [toast, isPreviewMode]
  )

  const handleBulkUpdate = useCallback(
    async (ids: string[], update: Partial<UpdateTaskPayload>): Promise<boolean> => {
      // In preview mode, update local state only
      if (isPreviewMode) {
        const idSet = new Set(ids)
        setTasks((prev) => prev.map((t) => {
          if (idSet.has(t.id)) {
            return {
              ...t,
              status: update.status ?? t.status,
              priority: (update.priority as TaskRecord['priority']) ?? t.priority,
              assignedTo: update.assignedTo ?? t.assignedTo,
              dueDate: update.dueDate ?? t.dueDate,
              tags: update.tags ?? t.tags,
              updatedAt: new Date().toISOString(),
            }
          }
          return t
        }))
        toast({
          title: 'Preview mode',
          description: `${ids.length} task(s) updated locally (not saved).`,
        })
        return true
      }

      try {
        const data = await apiFetch<{ message: string; results: any[]; tasks: TaskRecord[] }>('/api/tasks/bulk', {
          method: 'PATCH',
          body: JSON.stringify({ ids, update }),
        })

        const successfulUpdates = data.tasks || []
        const updatedIds = new Set(successfulUpdates.map(t => t.id))

        setTasks((prev) => prev.map((t) => {
          const updated = successfulUpdates.find(u => u.id === t.id)
          return updated || t
        }))

        toast({
          title: 'Bulk update complete',
          description: data.message,
        })
        return true
      } catch (err) {
        console.error('Failed to perform bulk update', err)
        toast({
          title: 'Bulk update failed',
          description: err instanceof Error ? err.message : 'Unable to update tasks in bulk',
          variant: 'destructive',
        })
        return false
      }
    },
    [toast, isPreviewMode]
  )

  const handleBulkDelete = useCallback(
    async (ids: string[]): Promise<boolean> => {
      // In preview mode, show info toast
      if (isPreviewMode) {
        toast({
          title: 'Preview mode',
          description: 'Changes are not saved in preview mode. Exit preview to make real changes.',
        })
        return true
      }

      try {
        const data = await apiFetch<{ message: string; results: any[] }>('/api/tasks/bulk', {
          method: 'DELETE',
          body: JSON.stringify({ ids }),
        })

        const deletedIds = new Set(data.results.filter(r => r.success).map(r => r.id))
        setTasks((prev) => prev.filter((t) => !deletedIds.has(t.id)))

        toast({
          title: 'Bulk deletion complete',
          description: data.message,
        })
        return true
      } catch (err) {
        console.error('Failed to perform bulk delete', err)
        toast({
          title: 'Bulk deletion failed',
          description: err instanceof Error ? err.message : 'Unable to delete tasks in bulk',
          variant: 'destructive',
        })
        return false
      }
    },
    [toast, isPreviewMode]
  )

  return {
    tasks,
    setTasks,
    nextCursor,
    loading,
    loadingMore,
    error,
    setError,
    retryCount,
    pendingStatusUpdates,
    handleLoadMore,
    handleRefresh,
    handleQuickStatusChange,
    handleDeleteTask,
    handleCreateTask,
    handleUpdateTask,
    handleBulkUpdate,
    handleBulkDelete,
  }
}
