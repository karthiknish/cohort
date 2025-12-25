import { Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { milestoneStatusSchema, mapMilestoneDoc, normalizeTimestamp } from '@/lib/milestones'
import type { StoredMilestone } from '@/lib/milestones'
import { NotFoundError, ValidationError } from '@/lib/api-errors'
import { resolveWorkspaceContext } from '@/lib/workspace'

const createMilestoneSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(200),
    description: z.string().trim().max(2000).optional(),
    status: milestoneStatusSchema.default('planned'),
    startDate: z.string().trim().optional(),
    endDate: z.string().trim().optional(),
    ownerId: z.string().trim().max(120).optional(),
    order: z.number().int().min(0).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.startDate && value.endDate) {
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

export const GET = createApiHandler(
  {
    workspace: 'required',
    rateLimit: 'standard',
  },
  async (req, { workspace, params }) => {
    if (!workspace) throw new Error('Workspace context missing')
    const projectId = (params?.projectId as string)?.trim()
    if (!projectId) {
      throw new ValidationError('Project id is required')
    }

    const projectRef = workspace.projectsCollection.doc(projectId)
    const projectSnap = await projectRef.get()
    if (!projectSnap.exists) {
      throw new NotFoundError('Project not found')
    }

    const snapshot = await projectRef.collection('milestones').orderBy('startDate', 'asc').orderBy('createdAt', 'asc').get()
    const milestones = snapshot.docs.map((doc) => mapMilestoneDoc(doc.id, doc.data() as StoredMilestone))

    return { milestones }
  }
)

export const POST = createApiHandler(
  {
    workspace: 'required',
    bodySchema: createMilestoneSchema,
    rateLimit: 'sensitive',
  },
  async (req, { auth, workspace, params, body }) => {
    if (!workspace) throw new Error('Workspace context missing')
    const projectId = (params?.projectId as string)?.trim()
    if (!projectId) {
      throw new ValidationError('Project id is required')
    }

    const projectRef = workspace.projectsCollection.doc(projectId)
    const projectSnap = await projectRef.get()
    if (!projectSnap.exists) {
      throw new NotFoundError('Project not found')
    }

    let startDate: Timestamp | null = null
    let endDate: Timestamp | null = null

    try {
      startDate = normalizeTimestamp(body.startDate)
      endDate = normalizeTimestamp(body.endDate)
    } catch (error) {
      throw new ValidationError(error instanceof Error ? error.message : 'Invalid date')
    }

    if (startDate && endDate && endDate.toMillis() < startDate.toMillis()) {
      throw new ValidationError('End date cannot be before start date')
    }

    const now = Timestamp.now()

    const docRef = await projectRef.collection('milestones').add({
      projectId,
      title: body.title.trim(),
      description: body.description?.trim() || null,
      status: body.status,
      startDate,
      endDate,
      ownerId: body.ownerId ?? auth.uid ?? null,
      order: body.order ?? null,
      createdAt: now,
      updatedAt: now,
    })

    const created = await docRef.get()
    const milestone = mapMilestoneDoc(created.id, created.data() as StoredMilestone)

    return { milestone }
  }
)
