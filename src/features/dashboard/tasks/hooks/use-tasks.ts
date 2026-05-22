'use client'

import { notifyFailure } from '@/lib/notifications'
import { reportConvexFailure } from '@/lib/handle-convex-error'
import { useMutation, useQuery } from 'convex/react'
import { useCallback, useMemo, useReducer, useRef } from 'react'

import { useToast } from '@/shared/ui/use-toast'
import { tasksApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { getPreviewTasks } from '@/lib/preview-data'
import type { TaskAttachment, TaskRecord, TaskStatus } from '@/types/tasks'
import { formatStatusLabel } from '../task-types'

export type UseTasksOptions = {
  userId: string | undefined
  clientId: string | undefined
  authLoading: boolean
  isPreviewMode?: boolean
  workspaceId?: string | null
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
  projectId?: string
  projectName?: string
  dueDate?: string
  attachments?: TaskAttachment[]
}

export type UpdateTaskPayload = {
  title: string
  description?: string
  status: TaskStatus
  priority: string
  assignedTo: string[]
  dueDate?: string
}

function msFromIsoDateString(input: string | undefined): number | null {
  if (!input) return null
  const ms = Date.parse(input)
  return Number.isNaN(ms) ? null : ms
}

function toIsoDateString(input: number | null): string | null {
  if (input == null) return null
  const date = new Date(input)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

type TaskQueryRow = {
  legacyId: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskRecord['priority']
  assignedTo: string[]
  clientId: string | null
  client: string | null
  projectId: string | null
  projectName: string | null
  dueDateMs: number | null
  attachments?: TaskAttachment[]
  createdAtMs: number | null
  updatedAtMs: number | null
  deletedAtMs: number | null
}

type PaginatedTaskRows = {
  items: TaskQueryRow[]
}

type CreateTaskMutationResult = string | { legacyId?: string | null } | null | undefined

type UseTasksState = {
  tasks: TaskRecord[]
  error: string | null
  pendingStatusUpdates: Set<string>
}

type UseTasksAction =
  | {
      type: 'syncData'
      tasks: TaskRecord[]
      error: string | null
    }
  | {
      type: 'setTasks'
      updater: React.SetStateAction<TaskRecord[]>
    }
  | {
      type: 'setError'
      updater: React.SetStateAction<string | null>
    }
  | {
      type: 'setPendingStatusUpdates'
      updater: React.SetStateAction<Set<string>>
    }

const INITIAL_USE_TASKS_STATE: UseTasksState = {
  tasks: [],
  error: null,
  pendingStatusUpdates: new Set(),
}

function resolveStateUpdate<T>(previous: T, updater: React.SetStateAction<T>): T {
  return typeof updater === 'function'
    ? (updater as (previousState: T) => T)(previous)
    : updater
}

function useTasksReducer(state: UseTasksState, action: UseTasksAction): UseTasksState {
  switch (action.type) {
    case 'syncData':
      return {
        ...state,
        tasks: action.tasks,
        error: action.error,
      }
    case 'setTasks':
      return {
        ...state,
        tasks: resolveStateUpdate(state.tasks, action.updater),
      }
    case 'setError':
      return {
        ...state,
        error: resolveStateUpdate(state.error, action.updater),
      }
    case 'setPendingStatusUpdates':
      return {
        ...state,
        pendingStatusUpdates: resolveStateUpdate(state.pendingStatusUpdates, action.updater),
      }
    default:
      return state
  }
}

function hasPaginatedItems(value: unknown): value is PaginatedTaskRows {
  if (!value || typeof value !== 'object') return false
  return Array.isArray((value as { items?: unknown }).items)
}

function mapConvexTaskToTaskRecord(row: TaskQueryRow): TaskRecord {
  const attachments = Array.isArray(row.attachments)
    ? row.attachments
      .flatMap((item) =>
        item && typeof item.name === 'string' && typeof item.url === 'string'
          ? [{
              name: item.name,
              url: item.url,
              type: typeof item.type === 'string' ? item.type : null,
              size: typeof item.size === 'string' ? item.size : null,
            }]
          : [],
      )
    : []

  return {
    id: String(row.legacyId),
    title: row.title,
    description: row.description ?? null,
    status: row.status,
    priority: row.priority,
    assignedTo: Array.isArray(row.assignedTo) ? row.assignedTo : [],
    clientId: row.clientId ?? null,
    client: row.client ?? null,
    projectId: row.projectId ?? null,
    projectName: row.projectName ?? null,
    dueDate: toIsoDateString(row.dueDateMs ?? null),
    attachments,
    createdAt: toIsoDateString(row.createdAtMs ?? null),
    updatedAt: toIsoDateString(row.updatedAtMs ?? null),
    deletedAt: toIsoDateString(row.deletedAtMs ?? null),
  }
}

export function useTasks({
  userId,
  clientId,
  authLoading,
  isPreviewMode = false,
  workspaceId,
}: UseTasksOptions): UseTasksReturn {
  const { toast } = useToast()

  const [{ tasks, error, pendingStatusUpdates }, dispatch] = useReducer(
    useTasksReducer,
    INITIAL_USE_TASKS_STATE,
  )

  const setTasks = useCallback<React.Dispatch<React.SetStateAction<TaskRecord[]>>>((updater) => {
    dispatch({ type: 'setTasks', updater })
  }, [])

  const setError = useCallback<React.Dispatch<React.SetStateAction<string | null>>>((updater) => {
    dispatch({ type: 'setError', updater })
  }, [])

  const setPendingStatusUpdates = useCallback<React.Dispatch<React.SetStateAction<Set<string>>>>((updater) => {
    dispatch({ type: 'setPendingStatusUpdates', updater })
  }, [])

  const convexAllTasksQuery = useQuery(
    tasksApi.list,
    !isPreviewMode && !authLoading && workspaceId && clientId === undefined
      ? { workspaceId, limit: 200 }
      : 'skip'
  )

  const convexClientTasksQuery = useQuery(
    tasksApi.listByClient,
    !isPreviewMode && !authLoading && workspaceId && clientId !== undefined
      ? { workspaceId, clientId: clientId ?? null, limit: 200 }
      : 'skip'
  )

  const convexTasksQuery = clientId === undefined ? convexAllTasksQuery : convexClientTasksQuery

  const createTask = useMutation(tasksApi.createTask)
  const patchTask = useMutation(tasksApi.patchTask)
  const bulkPatchTasks = useMutation(tasksApi.bulkPatchTasks)
  const softDeleteTask = useMutation(tasksApi.softDeleteTask)
  const bulkSoftDeleteTasks = useMutation(tasksApi.bulkSoftDeleteTasks)

  const loading = useMemo(() => {
    if (isPreviewMode) return false
    if (authLoading) return true
    if (!userId || !workspaceId) return false
    return convexTasksQuery === undefined
  }, [authLoading, convexTasksQuery, isPreviewMode, userId, workspaceId])

  const syncedTasksFromQuery = useMemo(() => {
    if (isPreviewMode) {
      return getPreviewTasks(clientId ?? null)
    }

    if (!userId || !workspaceId) {
      return [] as TaskRecord[]
    }

    const queryValue = convexTasksQuery as unknown
    const isArray = Array.isArray(queryValue)
    const paginated = hasPaginatedItems(queryValue)

    const rows = isArray
      ? (queryValue as TaskQueryRow[])
      : paginated
        ? queryValue.items
        : []

    if (queryValue && !isArray && !paginated) {
      logError(convexTasksQuery, 'useTasks:unexpectedQueryShape')
    }

    return rows.map(mapConvexTaskToTaskRecord)
  }, [clientId, convexTasksQuery, isPreviewMode, userId, workspaceId])

  const tasksSyncKey = `${isPreviewMode}|${clientId ?? ''}|${userId ?? ''}|${workspaceId ?? ''}|${syncedTasksFromQuery.length}|${syncedTasksFromQuery[0]?.id ?? ''}|${syncedTasksFromQuery.at(-1)?.updatedAt ?? ''}`
  const tasksSyncKeyRef = useRef<string | null>(null)
  if (tasksSyncKeyRef.current !== tasksSyncKey) {
    tasksSyncKeyRef.current = tasksSyncKey
    dispatch({
      type: 'syncData',
      tasks: syncedTasksFromQuery,
      error: null,
    })
  }

  const handleLoadMore = useCallback(async () => {
    // Realtime query returns the current dataset; no cursor pagination.
  }, [])

  const handleRefresh = useCallback(async () => {
    // Convex query stays live; a manual refresh is a no-op.
    toast({ title: 'Up to date', description: 'Tasks update in real time.' })
  }, [toast])

  const handleQuickStatusChange = useCallback(
    async (task: TaskRecord, newStatus: TaskStatus) => {
      if (isPreviewMode) {
        setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)))
        toast({
          title: 'Preview mode',
          description: `Status changed to "${formatStatusLabel(newStatus)}" (not saved).`,
        })
        return
      }

      if (!workspaceId) return
      if (pendingStatusUpdates.has(task.id)) return

      const previousStatus = task.status
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)))
      setPendingStatusUpdates((prev) => new Set(prev).add(task.id))

      try {
        await patchTask({
          workspaceId,
          legacyId: task.id,
          update: { status: newStatus },
        })
        toast({
          title: 'Status updated',
          description: `Task moved to "${formatStatusLabel(newStatus)}".`,
        })
      } catch (err) {
        logError(err, 'useTasks:handleQuickStatusChange')
        setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: previousStatus } : t)))
        reportConvexFailure({
        error: err,
        context: 'use-tasks.ts:catch',
        title: 'Status update failed',
        fallbackMessage: 'Status update failed',
        })
      } finally {
        setPendingStatusUpdates((prev) => {
          const next = new Set(prev)
          next.delete(task.id)
          return next
        })
      }
    },
    [isPreviewMode, patchTask, pendingStatusUpdates, setPendingStatusUpdates, setTasks, toast, workspaceId]
  )

  const handleDeleteTask = useCallback(
    async (task: TaskRecord): Promise<boolean> => {
      if (isPreviewMode) {
        toast({
          title: 'Preview mode',
          description: 'Changes are not saved in preview mode. Exit preview to make real changes.',
        })
        return true
      }

      if (!workspaceId) return false

      try {
        await softDeleteTask({ workspaceId, legacyId: task.id })
        toast({ title: 'Task deleted', description: `"${task.title}" has been removed.` })
        return true
      } catch (err) {
        reportConvexFailure({
        error: err,
        context: 'useTasks:handleDeleteTask',
        title: 'Deletion failed',
        fallbackMessage: 'Deletion failed',
        })
        return false
      }
    },
    [isPreviewMode, softDeleteTask, toast, workspaceId]
  )

  const handleCreateTask = useCallback(
    async (payload: CreateTaskPayload): Promise<TaskRecord | null> => {
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
          projectId: payload.projectId ?? null,
          projectName: payload.projectName ?? null,
          dueDate: payload.dueDate ?? null,
          attachments: payload.attachments ?? [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
        }
        setTasks((prev) => [fakeTask, ...prev])
        toast({ title: 'Preview mode', description: 'Task created locally (not saved).' })
        return fakeTask
      }

      if (!workspaceId) {
        throw new Error('Workspace not available.')
      }

      try {
        const result = (await createTask({
          workspaceId,
          title: payload.title,
          description: payload.description ?? null,
          status: payload.status,
          priority: payload.priority,
          assignedTo: payload.assignedTo,
          clientId: payload.clientId,
          client: payload.client ?? null,
          projectId: payload.projectId ?? null,
          projectName: payload.projectName ?? null,
          dueDateMs: msFromIsoDateString(payload.dueDate),
          attachments: payload.attachments ?? [],
        })) as CreateTaskMutationResult

        const legacyId = typeof result === 'string'
          ? result
          : typeof result?.legacyId === 'string'
            ? result.legacyId
            : null

        if (!legacyId) {
          throw new Error('Task creation failed to return a task id.')
        }

        toast({ title: 'Task created', description: `"${payload.title}" added.` })

        return {
          id: legacyId,
          title: payload.title,
          description: payload.description ?? null,
          status: payload.status,
          priority: payload.priority as TaskRecord['priority'],
          assignedTo: payload.assignedTo,
          clientId: payload.clientId,
          client: payload.client ?? null,
          projectId: payload.projectId ?? null,
          projectName: payload.projectName ?? null,
          dueDate: payload.dueDate ?? null,
          attachments: payload.attachments ?? [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
        }
      } catch (err) {
        reportConvexFailure({
        error: err,
        context: 'useTasks:handleCreateTask',
        title: 'Creation failed',
        fallbackMessage: 'Creation failed',
        })
        return null
      }
    },
    [createTask, isPreviewMode, setTasks, toast, workspaceId]
  )

  const handleUpdateTask = useCallback(
    async (taskId: string, payload: UpdateTaskPayload): Promise<TaskRecord | null> => {
      if (isPreviewMode) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? {
                ...t,
                title: payload.title ?? t.title,
                description: payload.description ?? t.description,
                status: payload.status ?? t.status,
                priority: (payload.priority as TaskRecord['priority']) ?? t.priority,
                assignedTo: payload.assignedTo ?? t.assignedTo,
                dueDate: payload.dueDate ?? t.dueDate,
                updatedAt: new Date().toISOString(),
              }
              : t
          )
        )
        toast({ title: 'Preview mode', description: 'Task updated locally (not saved).' })
        return { id: taskId } as TaskRecord
      }

      if (!workspaceId) {
        const message = 'Workspace not available.'
        notifyFailure({
        title: 'Update failed',
        message: message,
      })
        throw new Error(message)
      }

      try {
        await patchTask({
          workspaceId,
          legacyId: taskId,
          update: {
            title: payload.title,
            description: payload.description ?? null,
            status: payload.status,
            priority: payload.priority,
            assignedTo: payload.assignedTo,
            dueDateMs: msFromIsoDateString(payload.dueDate),
          },
        })

        toast({ title: 'Task updated', description: 'Changes saved.' })
        return { id: taskId } as TaskRecord
      } catch (err) {
        reportConvexFailure({
        error: err,
        context: 'useTasks:handleUpdateTask',
        title: 'Update failed',
        fallbackMessage: 'Update failed',
        })
        throw err
      }
    },
    [isPreviewMode, patchTask, setTasks, toast, workspaceId]
  )

  const handleBulkUpdate = useCallback(
    async (ids: string[], update: Partial<UpdateTaskPayload>): Promise<boolean> => {
      if (isPreviewMode) {
        const idSet = new Set(ids)
        setTasks((prev) =>
          prev.map((t) => {
            if (!idSet.has(t.id)) return t
            return {
              ...t,
              status: update.status ?? t.status,
              priority: (update.priority as TaskRecord['priority']) ?? t.priority,
              assignedTo: update.assignedTo ?? t.assignedTo,
              dueDate: update.dueDate ?? t.dueDate,
              updatedAt: new Date().toISOString(),
            }
          })
        )
        toast({ title: 'Preview mode', description: `${ids.length} task(s) updated locally (not saved).` })
        return true
      }

      if (!workspaceId) return false

      try {
        await bulkPatchTasks({
          workspaceId,
          ids,
          update: {
            status: update.status,
            priority: update.priority,
            assignedTo: update.assignedTo,
            dueDateMs: update.dueDate !== undefined ? msFromIsoDateString(update.dueDate) : undefined,
          },
        })
        toast({ title: 'Bulk update complete' })
        return true
      } catch (err) {
        reportConvexFailure({
        error: err,
        context: 'useTasks:handleBulkUpdate',
        title: 'Bulk update failed',
        fallbackMessage: 'Bulk update failed',
        })
        return false
      }
    },
    [bulkPatchTasks, isPreviewMode, setTasks, toast, workspaceId]
  )

  const handleBulkDelete = useCallback(
    async (ids: string[]): Promise<boolean> => {
      if (isPreviewMode) {
        toast({
          title: 'Preview mode',
          description: 'Changes are not saved in preview mode. Exit preview to make real changes.',
        })
        return true
      }

      if (!workspaceId) return false

      try {
        await bulkSoftDeleteTasks({ workspaceId, ids })
        toast({ title: 'Bulk deletion complete' })
        return true
      } catch (err) {
        reportConvexFailure({
        error: err,
        context: 'useTasks:handleBulkDelete',
        title: 'Bulk deletion failed',
        fallbackMessage: 'Bulk deletion failed',
        })
        return false
      }
    },
    [bulkSoftDeleteTasks, isPreviewMode, toast, workspaceId]
  )

  return {
    tasks,
    setTasks,
    nextCursor: null,
    loading,
    loadingMore: false,
    error,
    setError,
    retryCount: 0,
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
