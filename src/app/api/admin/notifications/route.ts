import { NextRequest, NextResponse } from 'next/server'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'

import { adminDb } from '@/lib/firebase-admin'
import { createApiHandler } from '@/lib/api-handler'

const COLLECTION_NAME = 'admin_notifications'

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
 * GET /api/admin/notifications - List all admin notifications
 */
export const GET = createApiHandler(
  {
    adminOnly: true,
  },
  async (req) => {
    const url = new URL(req.url)
    const unreadOnly = url.searchParams.get('unread') === 'true'
    const limitParam = url.searchParams.get('limit')
    const limit = Math.min(Math.max(Number(limitParam) || 50, 1), 100)

    let query = adminDb.collection(COLLECTION_NAME).orderBy('createdAt', 'desc').limit(limit)

    if (unreadOnly) {
      query = adminDb
        .collection(COLLECTION_NAME)
        .where('read', '==', false)
        .orderBy('createdAt', 'desc')
        .limit(limit)
    }

    const snapshot = await query.get()

    const notifications = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        type: data.type ?? 'unknown',
        title: data.title ?? '',
        message: data.message ?? '',
        userId: data.userId ?? null,
        userEmail: data.userEmail ?? null,
        userName: data.userName ?? null,
        read: data.read ?? false,
        createdAt: toISO(data.createdAt) ?? new Date().toISOString(),
      }
    })

    // Get unread count
    const unreadSnapshot = await adminDb
      .collection(COLLECTION_NAME)
      .where('read', '==', false)
      .count()
      .get()

    const unreadCount = unreadSnapshot.data().count

    return { notifications, unreadCount }
  }
)

/**
 * PATCH /api/admin/notifications - Mark notifications as read
 */
export const PATCH = createApiHandler(
  {
    adminOnly: true,
  },
  async (req, { body }) => {
    const { ids, markAllRead } = (body as { ids?: string[]; markAllRead?: boolean }) ?? {}

    if (markAllRead) {
      // Mark all as read
      const unreadSnapshot = await adminDb.collection(COLLECTION_NAME).where('read', '==', false).get()

      const batch = adminDb.batch()
      unreadSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { read: true, updatedAt: FieldValue.serverTimestamp() })
      })
      await batch.commit()

      return { ok: true, count: unreadSnapshot.size }
    }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No notification ids provided' }, { status: 400 })
    }

    // Mark specific notifications as read
    const batch = adminDb.batch()
    for (const id of ids) {
      const docRef = adminDb.collection(COLLECTION_NAME).doc(id)
      batch.update(docRef, { read: true, updatedAt: FieldValue.serverTimestamp() })
    }
    await batch.commit()

    return { ok: true, count: ids.length }
  }
)

/**
 * DELETE /api/admin/notifications - Delete notifications
 */
export const DELETE = createApiHandler(
  {
    adminOnly: true,
  },
  async (req, { body }) => {
    const { ids, deleteAll } = (body as { ids?: string[]; deleteAll?: boolean }) ?? {}

    if (deleteAll) {
      // Delete all notifications
      const allSnapshot = await adminDb.collection(COLLECTION_NAME).get()
      const batch = adminDb.batch()
      allSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref)
      })
      await batch.commit()

      return { ok: true, count: allSnapshot.size }
    }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No notification ids provided' }, { status: 400 })
    }

    const batch = adminDb.batch()
    for (const id of ids) {
      const docRef = adminDb.collection(COLLECTION_NAME).doc(id)
      batch.delete(docRef)
    }
    await batch.commit()

    return { ok: true, count: ids.length }
  }
)
