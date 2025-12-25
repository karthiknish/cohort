import { Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { milestoneStatusSchema, mapMilestoneDoc, normalizeTimestamp } from '@/lib/milestones'
import type { StoredMilestone } from '@/lib/milestones'
import { NotFoundError, ValidationError } from '@/lib/api-errors'

const updateMilestoneSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    status: milestoneStatusSchema.optional(),
    startDate: z.union([z.string().trim(), z.null()]).optional(),
    endDate: z.union([z.string().trim(), z.null()]).optional(),
    ownerId: z.string().trim().max(120).nullable().optional(),
    order: z.number().int().min(0).nullable().optional(),
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

export const PATCH = createApiHandler(
  {
    workspace: 'required',
    bodySchema: updateMilestoneSchema,
    rateLimit: 'sensitive',
  },
  async (req, { workspace, params, body }) => {
    if (!workspace) throw new Error('Workspace context missing')
    const projectId = (params?.projectId as string)?.trim()
    const milestoneId = (params?.milestoneId as string)?.trim()

    if (!projectId || !milestoneId) {
      throw new ValidationError('Project id and milestone id are required')
    }

    const projectRef = workspace.projectsCollection.doc(projectId)
    const projectSnap = await projectRef.get()
    if (!projectSnap.exists) {
      throw new NotFoundError('Project not found')
    }

    const milestoneRef = projectRef.collection('milestones').doc(milestoneId)
    const milestoneSnap = await milestoneRef.get()
    if (!milestoneSnap.exists) {
      throw new NotFoundError('Milestone not found')
    }

    if (Object.keys(body).length === 0) {
      throw new ValidationError('No fields provided for update')
    }

    const updates: Record<string, unknown> = {
      updatedAt: Timestamp.now(),
    }

    if (body.title !== undefined) {
      updates.title = body.title.trim()
    }

    if (body.description !== undefined) {
      updates.description = body.description === null ? null : body.description.trim()
    }

    if (body.status) {
      updates.status = body.status
    }

    if (body.order !== undefined) {
      updates.order = body.order
    }

    try {
      if (body.startDate !== undefined) {
        updates.startDate = body.startDate ? normalizeTimestamp(body.startDate) : null
      }
      if (body.endDate !== undefined) {
        updates.endDate = body.endDate ? normalizeTimestamp(body.endDate) : null
      }
    } catch (error) {
      throw new ValidationError(error instanceof Error ? error.message : 'Invalid date')
    }

    await milestoneRef.update(updates)

    const refreshed = await milestoneRef.get()
    const milestone = mapMilestoneDoc(refreshed.id, refreshed.data() as StoredMilestone)

    return { milestone }
  }
)

export const DELETE = createApiHandler(
  {
    workspace: 'required',
    rateLimit: 'sensitive',
  },
  async (req, { workspace, params }) => {
    if (!workspace) throw new Error('Workspace context missing')
    const projectId = (params?.projectId as string)?.trim()
    const milestoneId = (params?.milestoneId as string)?.trim()

    if (!projectId || !milestoneId) {
      throw new ValidationError('Project id and milestone id are required')
    }

    const projectRef = workspace.projectsCollection.doc(projectId)
    const milestoneRef = projectRef.collection('milestones').doc(milestoneId)
    const milestoneSnap = await milestoneRef.get()

    if (!milestoneSnap.exists) {
      throw new NotFoundError('Milestone not found')
    }

    await milestoneRef.delete()

    return { ok: true }
  }
)
