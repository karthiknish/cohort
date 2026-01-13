'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation } from 'convex/react'

import { asErrorMessage, logError } from '@/lib/convex-errors'
import { useToast } from '@/components/ui/use-toast'
import { tasksApi } from '@/lib/convex-api'
import { TaskRecord, TaskStatus } from '@/types/tasks'
import { getPreviewTasks } from '@/lib/preview-data'
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

function mapConvexTaskToTaskRecord(row: any): TaskRecord {
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
    tags: Array.isArray(row.tags) ? row.tags : [],
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

  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [error, setError] = useState<string | null>(null)
  const [pendingStatusUpdates, setPendingStatusUpdates] = useState<Set<string>>(new Set())

  const convexTasksQuery = useQuery(
    tasksApi.listByClient,
    !isPreviewMode && !authLoading && workspaceId && clientId !== undefined
      ? { workspaceId, clientId: clientId ?? null, limit: 200 }
      : 'skip'
  )

  const createTask = useMutation(tasksApi.createTask)
  const patchTask = useMutation(tasksApi.patchTask)
  const bulkPatchTasks = useMutation(tasksApi.bulkPatchTasks)
  const softDeleteTask = useMutation(tasksApi.softDeleteTask)
  const bulkSoftDeleteTasks = useMutation(tasksApi.bulkSoftDeleteTasks)

  const loading = useMemo(() => {
    if (isPreviewMode) return false
    if (authLoading) return true
    if (!userId || !workspaceId || clientId === undefined) return false
    return convexTasksQuery === undefined
  }, [authLoading, clientId, convexTasksQuery, isPreviewMode, userId, workspaceId])

  useEffect(() => {
    if (isPreviewMode) {
      setTasks(getPreviewTasks(clientId ?? null))
      setError(null)
      return
    }

    if (!userId || !workspaceId || clientId === undefined) {
      setTasks([])
      setError(null)
      return
    }

    const rows = Array.isArray(convexTasksQuery)
      ? convexTasksQuery
      : Array.isArray((convexTasksQuery as any)?.items)
        ? ((convexTasksQuery as any).items as any[])
        : []

    if (rows.length === 0 && convexTasksQuery) {
      logError(convexTasksQuery, 'useTasks:unexpectedQueryShape')
    }

    setTasks(rows.map(mapConvexTaskToTaskRecord))
    setError(null)
  }, [clientId, convexTasksQuery, isPreviewMode, userId, workspaceId])

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
        toast({
          title: 'Status update failed',
          description: asErrorMessage(err),
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
    [isPreviewMode, patchTask, pendingStatusUpdates, toast, workspaceId]
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
        logError(err, 'useTasks:handleDeleteTask')
        toast({
          title: 'Deletion failed',
          description: asErrorMessage(err),
          variant: 'destructive',
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
          projectId: null,
          projectName: null,
          dueDate: payload.dueDate ?? null,
          tags: payload.tags,
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
        const result = await createTask({
          workspaceId,
          title: payload.title,
          description: payload.description ?? null,
          status: payload.status,
          priority: payload.priority,
          assignedTo: payload.assignedTo,
          clientId: payload.clientId,
          client: payload.client ?? null,
          dueDateMs: msFromIsoDateString(payload.dueDate),
          tags: payload.tags,
        })

        toast({ title: 'Task created', description: `"${payload.title}" added.` })

        return result?.legacyId
          ? {
            id: result.legacyId,
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
          : null
      } catch (err) {
        logError(err, 'useTasks:handleCreateTask')
        toast({
          title: 'Creation failed',
          description: asErrorMessage(err),
          variant: 'destructive',
        })
        return null
      }
    },
    [createTask, isPreviewMode, toast, workspaceId]
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
                tags: payload.tags ?? t.tags,
                updatedAt: new Date().toISOString(),
              }
              : t
          )
        )
        toast({ title: 'Preview mode', description: 'Task updated locally (not saved).' })
        return null
      }

      if (!workspaceId) return null

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
            tags: payload.tags,
          },
        })
  
        toast({ title: 'Task updated', description: 'Changes saved.' })
      } catch (err) {
        logError(err, 'useTasks:handleUpdateTask')
        toast({
          title: 'Update failed',
          description: asErrorMessage(err),
          variant: 'destructive',
        })
      }
      return null
    },
    [isPreviewMode, patchTask, toast, workspaceId]
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
              tags: update.tags ?? t.tags,
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
            tags: update.tags,
          },
        })
        toast({ title: 'Bulk update complete' })
        return true
      } catch (err) {
        logError(err, 'useTasks:handleBulkUpdate')
        toast({
          title: 'Bulk update failed',
          description: asErrorMessage(err),
          variant: 'destructive',
        })
        return false
      }
    },
    [bulkPatchTasks, isPreviewMode, toast, workspaceId]
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
        logError(err, 'useTasks:handleBulkDelete')
        toast({
          title: 'Bulk deletion failed',
          description: asErrorMessage(err),
          variant: 'destructive',
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
