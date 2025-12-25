import { NextResponse } from 'next/server'
import { FieldPath, Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { TASK_PRIORITIES, TASK_STATUSES, TaskPriority, TaskStatus, TaskRecord } from '@/types/tasks'
import { buildCacheHeaders, serverCache } from '@/lib/cache'
import { resolveWorkspaceContext } from '@/lib/workspace'
import { notifyTaskCreatedWhatsApp, recordTaskNotification } from '@/lib/notifications'
import { NotFoundError } from '@/lib/api-errors'
import { coerceStringArray, toISO } from '@/lib/utils'

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
})

export type StoredTask = {
  title?: unknown
  description?: unknown
  status?: unknown
  priority?: unknown
  assignedTo?: unknown
  client?: unknown
  clientId?: unknown
  projectId?: unknown
  projectName?: unknown
  dueDate?: unknown
  tags?: unknown
  createdAt?: unknown
  updatedAt?: unknown
}

export function mapTaskDoc(docId: string, data: StoredTask): TaskRecord {
  const status = (typeof data.status === 'string' ? data.status : 'todo') as TaskStatus
  const priority = (typeof data.priority === 'string' ? data.priority : 'medium') as TaskPriority

  return {
    id: docId,
    title: typeof data.title === 'string' ? data.title : 'Untitled task',
    description: typeof data.description === 'string' ? data.description : null,
    status: TASK_STATUSES.includes(status) ? status : 'todo',
    priority: TASK_PRIORITIES.includes(priority) ? priority : 'medium',
    assignedTo: coerceStringArray(data.assignedTo),
    clientId: typeof data.clientId === 'string' ? data.clientId : null,
    client: typeof data.client === 'string' ? data.client : null,
    projectId: typeof data.projectId === 'string' ? data.projectId : null,
    projectName: typeof data.projectName === 'string' ? data.projectName : null,
    dueDate: toISO(data.dueDate),
    tags: coerceStringArray(data.tags),
    createdAt: toISO(data.createdAt),
    updatedAt: toISO(data.updatedAt),
  }
}

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
    } = query

    const queryFilter = queryParam ? queryParam.trim().toLowerCase() : null
    const pageSize = Math.min(Math.max(Number(pageSizeParam) || 50, 1), 100)

    const cacheKey = buildTasksCacheKey(workspace.workspaceId, {
      statusFilter: statusFilter ?? null,
      assigneeFilter: assigneeFilter ?? null,
      queryFilter,
      clientIdFilter: clientIdFilter ?? null,
      projectIdFilter: projectIdFilter ?? null,
      pageSize,
      after: afterParam ?? null,
    })

    const cached = serverCache.get<TaskListResponse>(cacheKey)
    if (cached) {
      return NextResponse.json(cached, {
        headers: buildCacheHeaders({ scope: 'private', maxAgeSeconds: 30, staleWhileRevalidateSeconds: 60 }),
      })
    }

    let baseQuery = workspace.tasksCollection
      .orderBy('createdAt', 'desc')
      .orderBy(FieldPath.documentId(), 'desc')
      .limit(pageSize + 1)

    if (afterParam) {
      const [timestamp, docId] = afterParam.split('|')
      if (timestamp && docId) {
        const afterDate = new Date(timestamp)
        if (!Number.isNaN(afterDate.getTime())) {
          baseQuery = baseQuery.startAfter(Timestamp.fromDate(afterDate), docId)
        }
      }
    }

    const snapshot = await baseQuery.get()
    const docs = snapshot.docs

    const mapped = docs.map((doc) => mapTaskDoc(doc.id, doc.data() as StoredTask))
    const filtered = mapped.filter((task) => {
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
          return createdAt ? `${createdAt}|${nextCursorDoc.id}` : null
        })()
      : null

    const payload: TaskListResponse = {
      tasks,
      nextCursor,
    }

    serverCache.set(cacheKey, payload, TASKS_CACHE_TTL_MS)

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

    const docRef = await workspace.tasksCollection.add({
      title: payload.title,
      description: payload.description ?? null,
      status: payload.status,
      priority: payload.priority,
      assignedTo: normalizedAssignedTo,
      client: payload.client ?? null,
      clientId: payload.clientId ?? null,
      projectId,
      projectName,
      dueDate: payload.dueDate ? Timestamp.fromDate(new Date(payload.dueDate)) : null,
      tags: normalizedTags,
      workspaceId: workspace.workspaceId,
      createdBy: uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })

    const createdDoc = await docRef.get()
    const task = mapTaskDoc(createdDoc.id, createdDoc.data() as StoredTask)

    invalidateTasksCache(workspace.workspaceId)

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
}

type TaskListResponse = {
  tasks: TaskRecord[]
  nextCursor: string | null
}

export function buildTasksCacheKey(workspaceId: string, filters: TaskCacheKeyInput): string {
  const parts = [
    'tasks',
    workspaceId,
    filters.clientIdFilter ?? '*',
    filters.projectIdFilter ?? '*',
    filters.statusFilter ?? '*',
    filters.assigneeFilter ?? '*',
    filters.queryFilter ?? '*',
    `${filters.pageSize}`,
    filters.after ?? '*',
  ]

  return parts.map((part) => encodeURIComponent(part)).join('::')
}

export function invalidateTasksCache(workspaceId: string): void {
  serverCache.invalidatePrefix(`tasks::${encodeURIComponent(workspaceId)}`)
}
