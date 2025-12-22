import { NextRequest, NextResponse } from 'next/server'
import { Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
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

export const PATCH = createApiHandler(
  {
    workspace: 'required',
    bodySchema: updateTaskSchema,
  },
  async (req, { auth, workspace, body, params }) => {
    if (!workspace) throw new Error('Workspace context missing')

    const taskId = (params?.taskId as string)?.trim()
    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    const uid = auth.uid!
    const payload = body as UpdateTaskInput
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
        actorId: auth.uid!,
        actorName: auth.name!,
      })
    }

    return task
  }
)

export const DELETE = createApiHandler(
  {
    workspace: 'required',
  },
  async (req, { workspace, params }) => {
    if (!workspace) throw new Error('Workspace context missing')

    const taskId = (params?.taskId as string)?.trim()
    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    const docRef = workspace.tasksCollection.doc(taskId)
    const existingDoc = await docRef.get()
    if (!existingDoc.exists) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    await docRef.delete()

    invalidateTasksCache(workspace.workspaceId)

    return { success: true }
  }
)

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
