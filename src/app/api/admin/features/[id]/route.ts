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

const updateFeatureSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: featureStatusSchema.optional(),
  priority: featurePrioritySchema.optional(),
  imageUrl: z.string().url().nullable().optional(),
  references: z.array(referenceSchema).optional(),
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

type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * GET /api/admin/features/[id] - Get a single feature
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const auth = await authenticateRequest(request)
    assertAdmin(auth)

    const { id } = await context.params
    const docRef = adminDb.collection(COLLECTION_NAME).doc(id)
    const docSnapshot = await docRef.get()

    if (!docSnapshot.exists) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 })
    }

    const data = docSnapshot.data()
    return NextResponse.json({
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
    })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[admin/features/[id]] GET failed', error)
    return NextResponse.json({ error: 'Failed to load feature' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/features/[id] - Update a feature
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const auth = await authenticateRequest(request)
    assertAdmin(auth)

    const { id } = await context.params
    const body = await request.json().catch(() => null)
    const parseResult = updateFeatureSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request payload', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }

    const docRef = adminDb.collection(COLLECTION_NAME).doc(id)
    const docSnapshot = await docRef.get()

    if (!docSnapshot.exists) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 })
    }

    const updates: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    }

    const { title, description, status, priority, imageUrl, references } = parseResult.data

    if (title !== undefined) updates.title = title
    if (description !== undefined) updates.description = description
    if (status !== undefined) updates.status = status
    if (priority !== undefined) updates.priority = priority
    if (imageUrl !== undefined) updates.imageUrl = imageUrl
    if (references !== undefined) updates.references = references

    await docRef.update(updates)

    const updatedDoc = await docRef.get()
    const data = updatedDoc.data()

    return NextResponse.json({
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
    })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[admin/features/[id]] PATCH failed', error)
    return NextResponse.json({ error: 'Failed to update feature' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/features/[id] - Delete a feature
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const auth = await authenticateRequest(request)
    assertAdmin(auth)

    const { id } = await context.params
    const docRef = adminDb.collection(COLLECTION_NAME).doc(id)
    const docSnapshot = await docRef.get()

    if (!docSnapshot.exists) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 })
    }

    await docRef.delete()

    return NextResponse.json({ ok: true, id })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[admin/features/[id]] DELETE failed', error)
    return NextResponse.json({ error: 'Failed to delete feature' }, { status: 500 })
  }
}
