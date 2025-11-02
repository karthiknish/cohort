import { NextRequest, NextResponse } from 'next/server'
import { FieldPath, Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import { TASK_PRIORITIES, TASK_STATUSES, TaskPriority, TaskStatus, TaskRecord } from '@/types/tasks'
import { buildCacheHeaders, serverCache } from '@/lib/cache'
import { resolveWorkspaceContext } from '@/lib/workspace'
import { notifyTaskCreatedWhatsApp, recordTaskNotification } from '@/lib/notifications'

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

export function toISO(value: unknown): string | null {
  if (!value && value !== 0) return null
  if (value instanceof Timestamp) {
    return value.toDate().toISOString()
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate?: () => Date }).toDate === 'function'
  ) {
    return (value as Timestamp).toDate().toISOString()
  }

  if (typeof value === 'string') {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString()
    }
    return value
  }

  return null
}

export function coerceStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0)
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

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    const uid = auth.uid

    if (!uid) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const workspace = await resolveWorkspaceContext(auth)

    const searchParams = request.nextUrl.searchParams
    const statusFilter = searchParams.get('status')
    const assigneeFilter = searchParams.get('assignee')
    const rawQuery = searchParams.get('query')
    const queryFilter = rawQuery ? rawQuery.trim().toLowerCase() : null
    const clientIdFilter = searchParams.get('clientId')
    const projectIdFilter = searchParams.get('projectId')
    const pageSizeParam = searchParams.get('pageSize')
    const afterParam = searchParams.get('after')

    const pageSize = Math.min(Math.max(Number(pageSizeParam) || 50, 1), 100)

    const cacheKey = buildTasksCacheKey(workspace.workspaceId, {
      statusFilter,
      assigneeFilter,
      queryFilter,
      clientIdFilter,
      projectIdFilter,
      pageSize,
      after: afterParam,
    })

    const cached = serverCache.get<TaskListResponse>(cacheKey)
    if (cached) {
      return NextResponse.json(cached, {
        headers: buildCacheHeaders({ scope: 'private', maxAgeSeconds: 30, staleWhileRevalidateSeconds: 60 }),
      })
    }

    let query = workspace.tasksCollection
      .orderBy('createdAt', 'desc')
      .orderBy(FieldPath.documentId(), 'desc')
      .limit(pageSize + 1)

    if (afterParam) {
      const [timestamp, docId] = afterParam.split('|')
      if (timestamp && docId) {
        const afterDate = new Date(timestamp)
        if (!Number.isNaN(afterDate.getTime())) {
          query = query.startAfter(Timestamp.fromDate(afterDate), docId)
        }
      }
    }

    const snapshot = await query.get()
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
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[tasks] failed to load tasks', error)
    return NextResponse.json({ error: 'Failed to load tasks' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    const uid = auth.uid

    if (!uid) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const workspace = await resolveWorkspaceContext(auth)

    const json = (await request.json().catch(() => null)) ?? {}
    const payload = baseTaskSchema.parse(json) satisfies CreateTaskInput

    const normalizedAssignedTo = payload.assignedTo.map((name) => name.trim()).filter((name) => name.length > 0)
    const normalizedTags = payload.tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0)

    let projectId: string | null = null
    let projectName: string | null = null

    if (payload.projectId) {
      const projectDoc = await workspace.projectsCollection.doc(payload.projectId).get()
      if (!projectDoc.exists) {
        return NextResponse.json({ error: 'Project not found for this workspace' }, { status: 404 })
      }

      projectId = projectDoc.id
      const projectData = projectDoc.data() as Record<string, unknown>
      projectName = typeof projectData.name === 'string' ? projectData.name : null

      if (!payload.clientId && typeof projectData.clientId === 'string') {
        // inherit client context from project when not explicitly provided
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
      : auth.email

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

    return NextResponse.json(task, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.error('[tasks] failed to create task', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}

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
