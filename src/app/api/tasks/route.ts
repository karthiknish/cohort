import { NextResponse } from 'next/server'
import { FieldPath, Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { TASK_PRIORITIES, TASK_STATUSES, TaskPriority, TaskStatus, TaskRecord } from '@/types/tasks'
import type { StoredTask } from '@/types/stored-types'
import { buildCacheHeaders, serverCache, workspaceCacheKey } from '@/lib/cache'
import type { WorkspaceContext } from '@/lib/workspace'
import { notifyTaskCreatedWhatsApp, recordTaskNotification } from '@/lib/notifications'
import { NotFoundError } from '@/lib/api-errors'
import { mapTaskDoc } from '@/lib/firestore/mappers'
import { coerceStringArray, toISO, sanitizeInput } from '@/lib/utils'
import { decodeTimestampIdCursor, encodeTimestampIdCursor, parsePageSize } from '@/lib/pagination'

// Re-export StoredTask for backward compatibility
export type { StoredTask } from '@/types/stored-types'

export const baseTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(2000).optional(),
  status: z.enum(TASK_STATUSES).default('todo'),
  priority: z.enum(TASK_PRIORITIES).default('medium'),
  assignedTo: z.array(z.string().trim().min(1).max(120)).default([]),
  client: z.string().trim().max(200).optional(),
  clientId: z.string().trim().max(120).optional(),
  projectId: z.string().trim().max(120).optional(),
  dueDate: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined))
    .refine(
      (value) => !value || !Number.isNaN(new Date(value).getTime()),
      'Invalid due date'
    ),
  tags: z.array(z.string().trim().min(1).max(60)).default([]),
})

type CreateTaskInput = z.infer<typeof baseTaskSchema>

const taskQuerySchema = z.object({
  status: z.string().optional(),
  assignee: z.string().optional(),
  query: z.string().optional(),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  pageSize: z.string().optional(),
  after: z.string().optional(),
  includeSummary: z.string().optional(),
})

export const GET = createApiHandler(
  {
    workspace: 'required',
    querySchema: taskQuerySchema,
    rateLimit: 'standard',
  },
  async (req, { workspace, query }) => {
    if (!workspace) throw new Error('Workspace context missing')

    const {
      status: statusFilter,
      assignee: assigneeFilter,
      query: queryParam,
      clientId: clientIdFilter,
      projectId: projectIdFilter,
      pageSize: pageSizeParam,
      after: afterParam,
      includeSummary: includeSummaryParam,
    } = query

    const queryFilter = queryParam ? queryParam.trim().toLowerCase() : null
    const pageSize = parsePageSize(pageSizeParam, { defaultValue: 50, max: 100 })

    const includeSummary = includeSummaryParam === '1' || includeSummaryParam === 'true'

    const cacheKey = buildTasksCacheKey(workspace.workspaceId, {
      statusFilter: statusFilter ?? null,
      assigneeFilter: assigneeFilter ?? null,
      queryFilter,
      clientIdFilter: clientIdFilter ?? null,
      projectIdFilter: projectIdFilter ?? null,
      pageSize,
      after: afterParam ?? null,
      includeSummary,
    })

    const payload = await serverCache.getOrFetch<TaskListResponse & { summary?: TaskSummary }>(
      cacheKey,
      async () => {
        let baseQuery = workspace.tasksCollection
          .orderBy('createdAt', 'desc')
          .orderBy(FieldPath.documentId(), 'desc')
          .limit(pageSize + 1)

        const decodedCursor = decodeTimestampIdCursor(afterParam)
        if (decodedCursor) {
          baseQuery = baseQuery.startAfter(decodedCursor.time, decodedCursor.id)
        }

        const snapshot = await baseQuery.get()
        const docs = snapshot.docs

        const mapped = docs.map((doc) => mapTaskDoc(doc.id, doc.data() as StoredTask))
        const filtered = mapped.filter((task) => {
          if (task.deletedAt) {
            return false
          }
          if (clientIdFilter && task.clientId !== clientIdFilter) {
            return false
          }
          if (statusFilter && statusFilter !== 'all' && task.status !== statusFilter) {
            return false
          }
          if (assigneeFilter && assigneeFilter !== 'all') {
            const normalizedAssignee = assigneeFilter.toLowerCase()
            const matchesAssignee = task.assignedTo.some((member) => member.toLowerCase().includes(normalizedAssignee))
            if (!matchesAssignee) {
              return false
            }
          }
          if (projectIdFilter && task.projectId !== projectIdFilter) {
            return false
          }

          if (queryFilter && queryFilter.length > 0) {
            const haystack = `${task.title} ${task.description ?? ''}`.toLowerCase()
            if (!haystack.includes(queryFilter)) {
              return false
            }
          }
          return true
        })

        const tasks = filtered.slice(0, pageSize)
        const nextCursorDoc = docs.length > pageSize ? docs[pageSize] : null
        const nextCursor = nextCursorDoc
          ? (() => {
              const createdAt = toISO(nextCursorDoc.get('createdAt'))
              return createdAt ? encodeTimestampIdCursor(createdAt, nextCursorDoc.id) : null
            })()
          : null

        const computed: TaskListResponse & { summary?: TaskSummary } = {
          tasks,
          nextCursor,
        }

        if (includeSummary) {
          const summary = await tryBuildTaskSummary({
            workspace,
            statusFilter: statusFilter ?? null,
            clientIdFilter: clientIdFilter ?? null,
            projectIdFilter: projectIdFilter ?? null,
            assigneeFilter: assigneeFilter ?? null,
            queryFilter,
          })

          if (summary) {
            computed.summary = summary
          }
        }

        return computed
      },
      TASKS_CACHE_TTL_MS
    )

    return NextResponse.json(payload, {
      headers: buildCacheHeaders({ scope: 'private', maxAgeSeconds: 30, staleWhileRevalidateSeconds: 60 }),
    })
  }
)

export const POST = createApiHandler(
  {
    workspace: 'required',
    bodySchema: baseTaskSchema,
    rateLimit: 'sensitive',
  },
  async (req, { auth, workspace, body }) => {
    if (!workspace) throw new Error('Workspace context missing')

    const payload = body as CreateTaskInput
    const uid = auth.uid!

    const normalizedAssignedTo = payload.assignedTo.map((name) => name.trim()).filter((name) => name.length > 0)
    const normalizedTags = payload.tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0)

    let projectId: string | null = null
    let projectName: string | null = null

    if (payload.projectId) {
      const projectDoc = await workspace.projectsCollection.doc(payload.projectId).get()
      if (!projectDoc.exists) {
        throw new NotFoundError('Project not found for this workspace')
      }

      projectId = projectDoc.id
      const projectData = projectDoc.data() as Record<string, unknown>
      projectName = typeof projectData.name === 'string' ? projectData.name : null

      if (!payload.clientId && typeof projectData.clientId === 'string') {
        payload.clientId = projectData.clientId
      }

      if (!payload.client && typeof projectData.clientName === 'string') {
        payload.client = projectData.clientName
      }
    }

    const now = Timestamp.now()
    const taskData = {
      title: sanitizeInput(payload.title),
      description: payload.description ? sanitizeInput(payload.description) : null,
      status: payload.status,
      priority: payload.priority,
      assignedTo: normalizedAssignedTo,
      client: payload.client ? sanitizeInput(payload.client) : null,
      clientId: payload.clientId ?? null,
      projectId,
      projectName,
      dueDate: payload.dueDate ? Timestamp.fromDate(new Date(payload.dueDate)) : null,
      tags: normalizedTags,
      workspaceId: workspace.workspaceId,
      createdBy: uid,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    }

    const docRef = await workspace.tasksCollection.add(taskData)
    const task = mapTaskDoc(docRef.id, taskData as StoredTask)

    void invalidateTasksCache(workspace.workspaceId)

    const actorName = typeof auth.claims?.name === 'string'
      ? (auth.claims.name as string)
      : auth.email || 'Unknown'

    try {
      await notifyTaskCreatedWhatsApp({ workspaceId: workspace.workspaceId, task, actorName })
    } catch (notificationError) {
      console.error('[tasks] whatsapp notification failed', notificationError)
    }

    try {
      await recordTaskNotification({
        workspaceId: workspace.workspaceId,
        task,
        actorId: uid,
        actorName,
      })
    } catch (notificationError) {
      console.error('[tasks] workspace notification failed', notificationError)
    }

    return task
  }
)

const TASKS_CACHE_TTL_MS = 60_000

export type TaskCacheKeyInput = {
  statusFilter: string | null
  assigneeFilter: string | null
  queryFilter: string | null
  clientIdFilter: string | null
  projectIdFilter: string | null
  pageSize: number
  after: string | null
  includeSummary: boolean
}

type TaskListResponse = {
  tasks: TaskRecord[]
  nextCursor: string | null
}

export type TaskSummary = {
  total: number
  overdue: number
  dueSoon: number
  highPriority: number
}

async function tryBuildTaskSummary(input: {
  workspace: WorkspaceContext
  statusFilter: string | null
  clientIdFilter: string | null
  projectIdFilter: string | null
  assigneeFilter: string | null
  queryFilter: string | null
}): Promise<TaskSummary | null> {
  const { workspace, statusFilter, clientIdFilter, projectIdFilter, assigneeFilter, queryFilter } = input

  // We can only compute accurate summary counts for filters that are representable in Firestore.
  // - Text search is implemented client-side (string contains), so skip.
  // - Assignee matching is substring-based, so skip unless it's unset or 'all'.
  if (queryFilter) return null
  if (assigneeFilter && assigneeFilter !== 'all') return null

  const openStatuses: TaskStatus[] = ['todo', 'in-progress', 'review']
  const now = Timestamp.now()
  const soonCutoff = Timestamp.fromDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))

  try {
    let base = workspace.tasksCollection.where('deletedAt', '==', null)

    if (clientIdFilter) {
      base = base.where('clientId', '==', clientIdFilter)
    }

    if (projectIdFilter) {
      base = base.where('projectId', '==', projectIdFilter)
    }

    if (statusFilter && statusFilter !== 'all') {
      // If the caller explicitly filters status, the summary should reflect that.
      base = base.where('status', '==', statusFilter)
    } else {
      // Default dashboard expectation: “open tasks” excludes completed.
      base = base.where('status', 'in', openStatuses)
    }

    const [totalSnap, overdueSnap, dueSoonSnap, highPriorityHighSnap, highPriorityUrgentSnap] = await Promise.all([
      base.count().get(),
      base.where('dueDate', '<', now).count().get(),
      base.where('dueDate', '>=', now).where('dueDate', '<=', soonCutoff).count().get(),
      base.where('priority', '==', 'high').count().get(),
      base.where('priority', '==', 'urgent').count().get(),
    ])

    return {
      total: totalSnap.data().count,
      overdue: overdueSnap.data().count,
      dueSoon: dueSoonSnap.data().count,
      highPriority: highPriorityHighSnap.data().count + highPriorityUrgentSnap.data().count,
    }
  } catch (error) {
    console.warn('[tasks] unable to compute summary counts', error)
    return null
  }
}

export function buildTasksCacheKey(workspaceId: string, filters: TaskCacheKeyInput): string {
  // Keep key generation consistent across backends (and cheap to invalidate via prefix).
  const signature = JSON.stringify({
    clientId: filters.clientIdFilter,
    projectId: filters.projectIdFilter,
    status: filters.statusFilter,
    assignee: filters.assigneeFilter,
    query: filters.queryFilter,
    pageSize: filters.pageSize,
    after: filters.after,
    includeSummary: filters.includeSummary,
  })

  return workspaceCacheKey(workspaceId, 'tasks', 'list', signature)
}

export async function invalidateTasksCache(workspaceId: string): Promise<void> {
  // Tasks impact task lists and also project stats in /api/projects when includeStats=true.
  await serverCache.invalidate(`${workspaceCacheKey(workspaceId, 'tasks')}:*`)
  await serverCache.invalidate(`${workspaceCacheKey(workspaceId, 'projects', 'stats')}:*`)
}
