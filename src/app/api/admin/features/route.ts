import { NextRequest, NextResponse } from 'next/server'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { adminDb } from '@/lib/firebase-admin'
import { createApiHandler } from '@/lib/api-handler'
import { toISO } from '@/lib/utils'

const COLLECTION_NAME = 'platform_features'

const featureStatusSchema = z.enum(['backlog', 'planned', 'in_progress', 'completed'])
const featurePrioritySchema = z.enum(['low', 'medium', 'high'])

const referenceSchema = z.object({
  url: z.string().url(),
  label: z.string().min(1),
})

const createFeatureSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).default(''),
  status: featureStatusSchema.default('backlog'),
  priority: featurePrioritySchema.default('medium'),
  imageUrl: z.string().url().nullable().optional(),
  references: z.array(referenceSchema).default([]),
})

/**
 * GET /api/admin/features - List all features
 */
export const GET = createApiHandler(
  {
    adminOnly: true,
    rateLimit: 'standard',
  },
  async (req) => {
    const snapshot = await adminDb.collection(COLLECTION_NAME).orderBy('createdAt', 'desc').get()

    const features = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        title: data.title ?? '',
        description: data.description ?? '',
        status: data.status ?? 'backlog',
        priority: data.priority ?? 'medium',
        imageUrl: data.imageUrl ?? null,
        references: data.references ?? [],
        createdAt: toISO(data.createdAt) ?? new Date().toISOString(),
        updatedAt: toISO(data.updatedAt) ?? new Date().toISOString(),
      }
    })

    return { features }
  }
)

/**
 * POST /api/admin/features - Create a new feature
 */
export const POST = createApiHandler(
  {
    adminOnly: true,
    bodySchema: createFeatureSchema,
    rateLimit: 'sensitive',
  },
  async (req, { body }) => {
    const { title, description, status, priority, imageUrl, references } = body
    const now = FieldValue.serverTimestamp()

    const docRef = await adminDb.collection(COLLECTION_NAME).add({
      title,
      description,
      status,
      priority,
      imageUrl: imageUrl ?? null,
      references,
      createdAt: now,
      updatedAt: now,
    })

    const createdDoc = await docRef.get()
    const data = createdDoc.data()

    return NextResponse.json(
      {
        feature: {
          id: docRef.id,
          title,
          description,
          status,
          priority,
          imageUrl: imageUrl ?? null,
          references,
          createdAt: toISO(data?.createdAt) ?? new Date().toISOString(),
          updatedAt: toISO(data?.updatedAt) ?? new Date().toISOString(),
        },
      },
      { status: 201 }
    )
  }
)
