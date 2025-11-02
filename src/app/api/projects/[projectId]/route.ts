import { NextRequest, NextResponse } from 'next/server'
import { Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import { resolveWorkspaceContext, type WorkspaceContext } from '@/lib/workspace'
import { projectStatusSchema, coerceStringArray } from '@/lib/projects'
import type { ProjectDetail, ProjectRecord } from '@/types/projects'
import type { TaskRecord } from '@/types/tasks'
import type { CollaborationMessage } from '@/types/collaboration'
import { buildProjectSummary } from '@/app/api/projects/route'
import { mapTaskDoc, type StoredTask } from '@/app/api/tasks/route'
import { mapMessageDoc, type StoredMessage } from '@/app/api/collaboration/messages/route'

const updateProjectSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(200).optional(),
    description: z
      .string()
      .trim()
      .max(2000)
      .transform((value) => (value.length === 0 ? null : value))
      .optional(),
    status: projectStatusSchema.optional(),
    clientId: z
      .string()
      .trim()
      .max(120)
      .transform((value) => (value.length === 0 ? null : value))
      .optional(),
    clientName: z
      .string()
      .trim()
      .max(200)
      .transform((value) => (value.length === 0 ? null : value))
      .optional(),
    startDate: z.union([z.string().trim(), z.null()]).optional(),
    endDate: z.union([z.string().trim(), z.null()]).optional(),
    tags: z.array(z.string().trim().min(1).max(60)).optional(),
    ownerId: z
      .string()
      .trim()
      .max(120)
      .transform((value) => (value.length === 0 ? null : value))
      .optional(),
  })
  .superRefine((value, ctx) => {
    if (value.clientName && !value.clientId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['clientName'],
        message: 'clientId is required when clientName is provided',
      })
    }

    if (value.startDate && typeof value.startDate === 'string') {
      const parsed = new Date(value.startDate)
      if (Number.isNaN(parsed.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['startDate'],
          message: 'Invalid start date',
        })
      }
    }

    if (value.endDate && typeof value.endDate === 'string') {
      const parsed = new Date(value.endDate)
      if (Number.isNaN(parsed.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['endDate'],
          message: 'Invalid end date',
        })
      }
    }

    if (typeof value.startDate === 'string' && typeof value.endDate === 'string') {
      const start = new Date(value.startDate)
      const end = new Date(value.endDate)
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end < start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['endDate'],
          message: 'End date cannot be before start date',
        })
      }
    }
  })

async function ensureProjectAccess(workspace: WorkspaceContext, projectId: string) {
  const docRef = workspace.projectsCollection.doc(projectId)
  const snapshot = await docRef.get()
  if (!snapshot.exists) {
    throw new AuthenticationError('Project not found', 404)
  }
  return snapshot
}

async function loadProjectRelations(
  workspace: WorkspaceContext,
  projectId: string
): Promise<{ tasks: TaskRecord[]; recentMessages: CollaborationMessage[] }> {
  const tasksSnapshot = await workspace.tasksCollection
    .where('projectId', '==', projectId)
    .orderBy('createdAt', 'desc')
    .limit(200)
    .get()

  const tasks = tasksSnapshot.docs.map((doc) => mapTaskDoc(doc.id, doc.data() as StoredTask))

  const messagesSnapshot = await workspace.collaborationCollection
    .where('channelType', '==', 'project')
    .where('projectId', '==', projectId)
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get()

  const recentMessages = messagesSnapshot.docs
    .map((doc) => mapMessageDoc(doc.id, doc.data() as StoredMessage))
    .filter((message) => !message.isDeleted)

  return { tasks, recentMessages }
}

function normalizeDateInput(value: string | null | undefined): Date | null | undefined {
  if (value === undefined) {
    return undefined
  }
  if (value === null) {
    return null
  }
  const trimmed = value.trim()
  if (trimmed.length === 0) {
    return null
  }
  const parsed = new Date(trimmed)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Invalid date')
  }
  return parsed
}

function coerceNullableString(value: string | null | undefined): string | null | undefined {
  if (value === undefined) {
    return undefined
  }
  if (value === null) {
    return null
  }
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function buildDetailResponse(base: ProjectRecord, tasks: TaskRecord[], recentMessages: CollaborationMessage[]): ProjectDetail {
  return {
    ...base,
    tasks,
    recentMessages,
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ projectId: string }> }) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      throw new AuthenticationError('Authentication required', 401)
    }

    const { projectId } = await context.params
    if (!projectId) {
      return NextResponse.json({ error: 'Project id is required' }, { status: 400 })
    }

    const workspace = await resolveWorkspaceContext(auth)
    const snapshot = await ensureProjectAccess(workspace, projectId)

    const projectRecord = await buildProjectSummary(workspace, snapshot.id, snapshot.data() as Record<string, unknown>)
    const { tasks, recentMessages } = await loadProjectRelations(workspace, projectId)
    const projectDetail = buildDetailResponse(projectRecord, tasks, recentMessages)

    return NextResponse.json({ project: projectDetail })
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('[projects] detail GET failed', error)
    return NextResponse.json({ error: 'Failed to load project' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ projectId: string }> }) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      throw new AuthenticationError('Authentication required', 401)
    }

    const { projectId } = await context.params
    if (!projectId) {
      return NextResponse.json({ error: 'Project id is required' }, { status: 400 })
    }

    const workspace = await resolveWorkspaceContext(auth)
    const snapshot = await ensureProjectAccess(workspace, projectId)

    const json = (await request.json().catch(() => null)) ?? {}
    const payload = updateProjectSchema.parse(json)

    let inferredClientName: string | null | undefined
    if (payload.clientId !== undefined && payload.clientId !== null) {
      const clientSnapshot = await workspace.clientsCollection.doc(payload.clientId).get()
      if (!clientSnapshot.exists) {
        return NextResponse.json({ error: 'Client not found for this workspace' }, { status: 404 })
      }

      const clientData = clientSnapshot.data() as Record<string, unknown> | undefined
      if (clientData) {
        const resolvedName = clientData.name
        if (typeof resolvedName === 'string') {
          inferredClientName = resolvedName
        }
      }
    }

    if (Object.keys(json).length === 0) {
      return NextResponse.json({ error: 'No fields provided for update' }, { status: 400 })
    }

    const updates: Record<string, unknown> = {
      updatedAt: Timestamp.now(),
    }

    const normalizedName = coerceNullableString(payload.name ?? undefined)
    if (normalizedName !== undefined) {
      if (normalizedName === null) {
        return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 })
      }
      updates.name = normalizedName
    }

    if (payload.description !== undefined) {
      updates.description = payload.description
    }

    if (payload.status) {
      updates.status = payload.status
    }

    if (payload.clientId !== undefined) {
      updates.clientId = payload.clientId
      if (payload.clientId === null && payload.clientName === undefined) {
        updates.clientName = null
      }
    }

    if (payload.clientName !== undefined) {
      updates.clientName = payload.clientName
    } else if (inferredClientName !== undefined) {
      updates.clientName = inferredClientName
    }

    if (payload.tags !== undefined) {
      updates.tags = coerceStringArray(payload.tags)
    }

    if (payload.ownerId !== undefined) {
      updates.ownerId = payload.ownerId
    }

    const normalizedStartDate = normalizeDateInput(payload.startDate as string | null | undefined)
    if (normalizedStartDate !== undefined) {
      updates.startDate = normalizedStartDate ? Timestamp.fromDate(normalizedStartDate) : null
    }

    const normalizedEndDate = normalizeDateInput(payload.endDate as string | null | undefined)
    if (normalizedEndDate !== undefined) {
      updates.endDate = normalizedEndDate ? Timestamp.fromDate(normalizedEndDate) : null
    }

    await snapshot.ref.update(updates)

    const refreshed = await snapshot.ref.get()
    const projectRecord = await buildProjectSummary(
      workspace,
      refreshed.id,
      refreshed.data() as Record<string, unknown>
    )
    const { tasks, recentMessages } = await loadProjectRelations(workspace, projectId)
    const projectDetail = buildDetailResponse(projectRecord, tasks, recentMessages)

    return NextResponse.json({ project: projectDetail })
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (error instanceof Error && error.message === 'Invalid date') {
      return NextResponse.json({ error: 'Invalid date provided' }, { status: 400 })
    }

    console.error('[projects] detail PATCH failed', error)
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
  }
}
