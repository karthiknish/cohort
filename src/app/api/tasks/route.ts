import { NextRequest, NextResponse } from 'next/server'
import { Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { adminDb } from '@/lib/firebase-admin'
import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import { TASK_PRIORITIES, TASK_STATUSES, TaskPriority, TaskStatus, TaskRecord } from '@/types/tasks'

export const baseTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(2000).optional(),
  status: z.enum(TASK_STATUSES).default('todo'),
  priority: z.enum(TASK_PRIORITIES).default('medium'),
  assignedTo: z.array(z.string().trim().min(1).max(120)).default([]),
  client: z.string().trim().max(200).optional(),
  clientId: z.string().trim().max(120).optional(),
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

    const searchParams = request.nextUrl.searchParams
    const statusFilter = searchParams.get('status')
    const assigneeFilter = searchParams.get('assignee')
    const queryFilter = searchParams.get('query')?.toLowerCase().trim()
    const clientIdFilter = searchParams.get('clientId')

    const tasksSnapshot = await adminDb
      .collection('users')
      .doc(uid)
      .collection('tasks')
      .orderBy('createdAt', 'desc')
      .limit(200)
      .get()

    const tasks = tasksSnapshot.docs
      .map((doc) => mapTaskDoc(doc.id, doc.data() as StoredTask))
      .filter((task) => {
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
        if (queryFilter && queryFilter.length > 0) {
          const haystack = `${task.title} ${task.description ?? ''}`.toLowerCase()
          if (!haystack.includes(queryFilter)) {
            return false
          }
        }
        return true
      })

    return NextResponse.json(tasks)
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

    const json = (await request.json().catch(() => null)) ?? {}
    const payload = baseTaskSchema.parse(json) satisfies CreateTaskInput

    const normalizedAssignedTo = payload.assignedTo.map((name) => name.trim()).filter((name) => name.length > 0)
    const normalizedTags = payload.tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0)

    const tasksCollection = adminDb.collection('users').doc(uid).collection('tasks')
    const docRef = await tasksCollection.add({
      title: payload.title,
      description: payload.description ?? null,
      status: payload.status,
      priority: payload.priority,
      assignedTo: normalizedAssignedTo,
      client: payload.client ?? null,
      clientId: payload.clientId ?? null,
      dueDate: payload.dueDate ? Timestamp.fromDate(new Date(payload.dueDate)) : null,
      tags: normalizedTags,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })

    const createdDoc = await docRef.get()
    const task = mapTaskDoc(createdDoc.id, createdDoc.data() as StoredTask)

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
