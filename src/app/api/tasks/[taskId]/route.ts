import { NextRequest, NextResponse } from 'next/server'
import { Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import { TASK_PRIORITIES, TASK_STATUSES } from '@/types/tasks'
import { coerceStringArray, invalidateTasksCache, mapTaskDoc, type StoredTask } from '../route'
import { resolveWorkspaceContext } from '@/lib/workspace'
import { recordTaskUpdatedNotification } from '@/lib/notifications'

const updateTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  assignedTo: z.array(z.string().trim().min(1).max(120)).optional(),
  client: z.string().trim().max(200).nullable().optional(),
  clientId: z.string().trim().max(120).nullable().optional(),
  projectId: z
    .union([
      z
        .string()
        .trim()
        .min(1)
        .max(120),
      z.literal(null),
    ])
    .optional(),
  dueDate: z
    .union([
      z
        .string()
        .trim()
        .refine((value) => {
          const parsed = new Date(value)
          return !Number.isNaN(parsed.getTime())
        }, 'Invalid due date'),
      z.literal(null),
    ])
    .optional(),
  tags: z.array(z.string().trim().min(1).max(60)).optional(),
})

type UpdateTaskInput = z.infer<typeof updateTaskSchema>

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  try {
    const params = await context.params
    const taskId = params?.taskId?.trim()
    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    const auth = await authenticateRequest(request)
    const uid = auth.uid

    if (!uid) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const json = (await request.json().catch(() => null)) ?? {}
    const payload = updateTaskSchema.parse(json)

    const workspace = await resolveWorkspaceContext(auth)
    const docRef = workspace.tasksCollection.doc(taskId)

    const existingDoc = await docRef.get()
    if (!existingDoc.exists) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const updates = buildTaskUpdate(payload)
    if (!updates) {
      return NextResponse.json({ error: 'No valid updates supplied' }, { status: 400 })
    }

    if (payload.projectId !== undefined) {
      if (payload.projectId === null) {
        updates.projectId = null
        updates.projectName = null
      } else {
        const projectDoc = await workspace.projectsCollection.doc(payload.projectId).get()
        if (!projectDoc.exists) {
          return NextResponse.json({ error: 'Project not found for this workspace' }, { status: 404 })
        }
        const data = projectDoc.data() as Record<string, unknown>
        updates.projectId = projectDoc.id
        updates.projectName = typeof data.name === 'string' ? data.name : null

        if (updates.clientId === undefined && !payload.clientId && typeof data.clientId === 'string') {
          updates.clientId = data.clientId
        }
        if (updates.client === undefined && !payload.client && typeof data.clientName === 'string') {
          updates.client = data.clientName
        }
      }
    }

    updates.updatedBy = uid

    await docRef.update(updates)

    invalidateTasksCache(workspace.workspaceId)

    const updatedDoc = await docRef.get()
    const task = mapTaskDoc(updatedDoc.id, updatedDoc.data() as StoredTask)

    // Calculate changes for notification
    const oldData = existingDoc.data() as StoredTask
    const newData = updatedDoc.data() as StoredTask
    const changes: string[] = []

    if (newData.status && oldData.status !== newData.status) {
      changes.push(`Status: ${oldData.status} → ${newData.status}`)
    }

    if (newData.priority && oldData.priority !== newData.priority) {
      changes.push(`Priority: ${oldData.priority} → ${newData.priority}`)
    }

    // Check for assignment changes
    const oldAssigned = Array.isArray(oldData.assignedTo) ? oldData.assignedTo.sort().join(',') : ''
    const newAssigned = Array.isArray(newData.assignedTo) ? newData.assignedTo.sort().join(',') : ''
    if (oldAssigned !== newAssigned) {
      const assignedList = Array.isArray(newData.assignedTo) && newData.assignedTo.length > 0 
        ? newData.assignedTo.join(', ') 
        : 'Unassigned'
      changes.push(`Assigned to: ${assignedList}`)
    }

    if (changes.length > 0) {
      await recordTaskUpdatedNotification({
        workspaceId: workspace.workspaceId,
        task,
        changes,
        actorId: auth.uid,
        actorName: auth.name,
      })
    }

    return NextResponse.json(task)
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.error('[tasks] failed to update task', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  try {
    const params = await context.params
    const taskId = params?.taskId?.trim()
    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    const auth = await authenticateRequest(request)
    const uid = auth.uid

    if (!uid) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const workspace = await resolveWorkspaceContext(auth)
    const docRef = workspace.tasksCollection.doc(taskId)
    const existingDoc = await docRef.get()
    if (!existingDoc.exists) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    await docRef.delete()

    invalidateTasksCache(workspace.workspaceId)

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('[tasks] failed to delete task', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}

function buildTaskUpdate(payload: UpdateTaskInput): Record<string, unknown> | null {
  const updates: Record<string, unknown> = {}

  if (payload.title !== undefined) {
    updates.title = payload.title
  }

  if (payload.description !== undefined) {
    updates.description = payload.description ?? null
  }

  if (payload.status !== undefined) {
    updates.status = payload.status
  }

  if (payload.priority !== undefined) {
    updates.priority = payload.priority
  }

  if (payload.assignedTo !== undefined) {
    updates.assignedTo = coerceStringArray(payload.assignedTo)
  }

  if (payload.client !== undefined) {
    const normalizedClient = payload.client?.trim() ?? ''
    updates.client = normalizedClient.length > 0 ? normalizedClient : null
  }

  if (payload.clientId !== undefined) {
    const normalizedClientId = payload.clientId?.trim() ?? ''
    updates.clientId = normalizedClientId.length > 0 ? normalizedClientId : null
  }

  if (payload.dueDate !== undefined) {
    if (payload.dueDate === null) {
      updates.dueDate = null
    } else {
      updates.dueDate = Timestamp.fromDate(new Date(payload.dueDate))
    }
  }

  if (payload.tags !== undefined) {
    updates.tags = coerceStringArray(payload.tags)
  }

  if (Object.keys(updates).length === 0) {
    return null
  }

  updates.updatedAt = Timestamp.now()
  return updates
}
