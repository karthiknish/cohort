import { Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { resolveWorkspaceContext, type WorkspaceContext } from '@/lib/workspace'
import { projectStatusSchema, coerceStringArray } from '@/lib/projects'
import type { ProjectDetail, ProjectRecord } from '@/types/projects'
import type { TaskRecord } from '@/types/tasks'
import type { CollaborationMessage } from '@/types/collaboration'
import type { MilestoneRecord } from '@/types/milestones'
import { buildProjectSummary } from '@/lib/projects-stats'
import { mapMilestoneDoc, type StoredMilestone } from '@/lib/milestones'
import { mapMessageDoc, mapTaskDoc, type StoredMessage, type StoredTask } from '@/lib/firestore/mappers'
import { AuthenticationError } from '@/lib/server-auth'
import { NotFoundError, ValidationError } from '@/lib/api-errors'
import { logAuditAction } from '@/lib/audit-logger'

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
): Promise<{ tasks: TaskRecord[]; recentMessages: CollaborationMessage[]; milestones: MilestoneRecord[] }> {
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

  const milestonesSnapshot = await workspace.projectsCollection
    .doc(projectId)
    .collection('milestones')
    .orderBy('startDate', 'asc')
    .orderBy('createdAt', 'asc')
    .get()

  const milestones = milestonesSnapshot.docs.map((doc) => mapMilestoneDoc(doc.id, doc.data() as StoredMilestone))

  return { tasks, recentMessages, milestones }
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

function buildDetailResponse(base: ProjectRecord, tasks: TaskRecord[], recentMessages: CollaborationMessage[], milestones: MilestoneRecord[]): ProjectDetail {
  return {
    ...base,
    tasks,
    recentMessages,
    milestones,
  }
}

export const GET = createApiHandler(
  {
    workspace: 'required',
  },
  async (req, { workspace, params }) => {
    if (!workspace) throw new Error('Workspace context missing')
    const projectId = (params?.projectId as string)?.trim()
    if (!projectId) {
      throw new ValidationError('Project id is required')
    }

    const snapshot = await ensureProjectAccess(workspace, projectId)

    const projectRecord = await buildProjectSummary(workspace, snapshot.id, snapshot.data() as Record<string, unknown>)
    const { tasks, recentMessages, milestones } = await loadProjectRelations(workspace, projectId)
    const projectDetail = buildDetailResponse(projectRecord, tasks, recentMessages, milestones)

    return projectDetail
  }
)

export const PATCH = createApiHandler(
  {
    workspace: 'required',
    bodySchema: updateProjectSchema,
    rateLimit: 'sensitive',
  },
  async (req, { auth, workspace, body, params }) => {
    if (!workspace) throw new Error('Workspace context missing')
    const projectId = (params?.projectId as string)?.trim()
    if (!projectId) {
      throw new ValidationError('Project id is required')
    }

    const snapshot = await ensureProjectAccess(workspace, projectId)
    const payload = body

    let inferredClientName: string | null | undefined
    if (payload.clientId !== undefined && payload.clientId !== null) {
      const clientSnapshot = await workspace.clientsCollection.doc(payload.clientId).get()
      if (!clientSnapshot.exists) {
        throw new NotFoundError('Client not found for this workspace')
      }

      const clientData = clientSnapshot.data() as Record<string, unknown> | undefined
      if (clientData) {
        const resolvedName = clientData.name
        if (typeof resolvedName === 'string') {
          inferredClientName = resolvedName
        }
      }
    }

    if (Object.keys(payload).length === 0) {
      throw new ValidationError('No fields provided for update')
    }

    const updates: Record<string, unknown> = {
      updatedAt: Timestamp.now(),
    }

    const normalizedName = coerceNullableString(payload.name ?? undefined)
    if (normalizedName !== undefined) {
      if (normalizedName === null) {
        throw new ValidationError('Name cannot be empty')
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
    const { tasks, recentMessages, milestones } = await loadProjectRelations(workspace, projectId)
    const projectDetail = buildDetailResponse(projectRecord, tasks, recentMessages, milestones)

    return projectDetail
  }
)

export const DELETE = createApiHandler(
  {
    workspace: 'required',
    rateLimit: 'sensitive',
  },
  async (req, { auth, workspace, params }) => {
    if (!workspace) throw new Error('Workspace context missing')
    const projectId = (params?.projectId as string)?.trim()
    if (!projectId) {
      throw new ValidationError('Project id is required')
    }

    const snapshot = await ensureProjectAccess(workspace, projectId)
    const projectData = snapshot.data()

    // Soft delete the project document
    await snapshot.ref.update({
      deletedAt: new Date().toISOString(),
      updatedAt: Timestamp.now()
    })

    await logAuditAction({
      action: 'PROJECT_DELETE',
      actorId: auth.uid!,
      targetId: projectId,
      workspaceId: workspace.workspaceId,
      metadata: {
        name: projectData?.name,
      },
    })

    return { success: true, message: 'Project deleted successfully' }
  }
)
