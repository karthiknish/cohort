import { NextRequest, NextResponse } from 'next/server'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { adminDb } from '@/lib/firebase-admin'
import { authenticateRequest, assertAdmin, AuthenticationError } from '@/lib/server-auth'

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

function toISO(value: unknown): string | null {
  if (!value) return null
  try {
    if (value instanceof Date) {
      return value.toISOString()
    }
    if (value instanceof Timestamp) {
      return value.toDate().toISOString()
    }
    const timestamp = (value as { toDate?: () => Date }).toDate?.()
    if (timestamp) {
      return timestamp.toISOString()
    }
  } catch {
    // noop
  }
  if (typeof value === 'string') {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString()
    }
    return value
  }
  return null
}

/**
 * GET /api/admin/features - List all features
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    assertAdmin(auth)

    const snapshot = await adminDb
      .collection(COLLECTION_NAME)
      .orderBy('createdAt', 'desc')
      .get()

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

    return NextResponse.json({ features })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[admin/features] GET failed', error)
    return NextResponse.json({ error: 'Failed to load features' }, { status: 500 })
  }
}

/**
 * POST /api/admin/features - Create a new feature
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    assertAdmin(auth)

    const body = await request.json().catch(() => null)
    const parseResult = createFeatureSchema.safeParse(body)
    
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request payload', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }

    const { title, description, status, priority, imageUrl, references } = parseResult.data
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

    return NextResponse.json({
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
    }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[admin/features] POST failed', error)
    return NextResponse.json({ error: 'Failed to create feature' }, { status: 500 })
  }
}
