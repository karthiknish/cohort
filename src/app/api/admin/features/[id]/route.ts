import { NextRequest } from 'next/server'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { adminDb } from '@/lib/firebase-admin'
import { createApiHandler } from '@/lib/api-handler'
import { NotFoundError } from '@/lib/api-errors'
import { toISO } from '@/lib/utils'

const COLLECTION_NAME = 'platform_features'

const featureStatusSchema = z.enum(['backlog', 'planned', 'in_progress', 'completed'])
const featurePrioritySchema = z.enum(['low', 'medium', 'high'])

const referenceSchema = z.object({
  url: z.string().url(),
  label: z.string().min(1),
})

const updateFeatureSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: featureStatusSchema.optional(),
  priority: featurePrioritySchema.optional(),
  imageUrl: z.string().url().nullable().optional(),
  references: z.array(referenceSchema).optional(),
})

/**
 * GET /api/admin/features/[id] - Get a single feature
 */
export const GET = createApiHandler(
  {
    adminOnly: true,
    rateLimit: 'standard',
  },
  async (req, { params }) => {
    const { id } = params as { id: string }
    const docRef = adminDb.collection(COLLECTION_NAME).doc(id)
    const docSnapshot = await docRef.get()

    if (!docSnapshot.exists) {
      throw new NotFoundError('Feature not found')
    }

    const data = docSnapshot.data()
    return {
      feature: {
        id: docSnapshot.id,
        title: data?.title ?? '',
        description: data?.description ?? '',
        status: data?.status ?? 'backlog',
        priority: data?.priority ?? 'medium',
        imageUrl: data?.imageUrl ?? null,
        references: data?.references ?? [],
        createdAt: toISO(data?.createdAt) ?? new Date().toISOString(),
        updatedAt: toISO(data?.updatedAt) ?? new Date().toISOString(),
      },
    }
  }
)

/**
 * PATCH /api/admin/features/[id] - Update a feature
 */
export const PATCH = createApiHandler(
  {
    adminOnly: true,
    bodySchema: updateFeatureSchema,
    rateLimit: 'sensitive',
  },
  async (req, { body, params }) => {
    const { id } = params as { id: string }
    const docRef = adminDb.collection(COLLECTION_NAME).doc(id)
    const docSnapshot = await docRef.get()

    if (!docSnapshot.exists) {
      throw new NotFoundError('Feature not found')
    }

    const updates: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    }

    const { title, description, status, priority, imageUrl, references } = body

    if (title !== undefined) updates.title = title
    if (description !== undefined) updates.description = description
    if (status !== undefined) updates.status = status
    if (priority !== undefined) updates.priority = priority
    if (imageUrl !== undefined) updates.imageUrl = imageUrl
    if (references !== undefined) updates.references = references

    await docRef.update(updates)

    const updatedDoc = await docRef.get()
    const data = updatedDoc.data()

    return {
      feature: {
        id: updatedDoc.id,
        title: data?.title ?? '',
        description: data?.description ?? '',
        status: data?.status ?? 'backlog',
        priority: data?.priority ?? 'medium',
        imageUrl: data?.imageUrl ?? null,
        references: data?.references ?? [],
        createdAt: toISO(data?.createdAt) ?? new Date().toISOString(),
        updatedAt: toISO(data?.updatedAt) ?? new Date().toISOString(),
      },
    }
  }
)

/**
 * DELETE /api/admin/features/[id] - Delete a feature
 */
export const DELETE = createApiHandler(
  {
    adminOnly: true,
    rateLimit: 'sensitive',
  },
  async (req, { params }) => {
    const { id } = params as { id: string }
    const docRef = adminDb.collection(COLLECTION_NAME).doc(id)
    const docSnapshot = await docRef.get()

    if (!docSnapshot.exists) {
      throw new NotFoundError('Feature not found')
    }

    await docRef.delete()

    return { ok: true, id }
  }
)
