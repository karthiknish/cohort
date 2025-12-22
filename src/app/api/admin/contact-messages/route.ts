import { NextRequest, NextResponse } from 'next/server'
import { FieldPath, FieldValue, Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { adminDb } from '@/lib/firebase-admin'
import { createApiHandler } from '@/lib/api-handler'

const statusSchema = z.enum(['new', 'in_progress', 'resolved'])

function toISO(value: unknown): string | null {
  if (!value) return null
  try {
    const timestamp = (value as { toDate?: () => Date }).toDate?.()
    if (timestamp) {
      return timestamp.toISOString()
    }
  } catch {
    // noop
  }
  if (typeof value === 'string') {
    return value
  }
  return null
}

export const GET = createApiHandler(
  {
    adminOnly: true,
  },
  async (req) => {
    const url = new URL(req.url)
    const statusParam = url.searchParams.get('status')
    const statusFilter =
      statusParam && statusSchema.safeParse(statusParam).success ? statusParam : null
    const sizeParam = url.searchParams.get('pageSize')
    const pageSize = Math.min(Math.max(Number(sizeParam) || 20, 1), 100)
    const cursorParam = url.searchParams.get('cursor')

    let messagesQuery = adminDb
      .collection('contactMessages')
      .orderBy('createdAt', 'desc')
      .orderBy(FieldPath.documentId(), 'desc')
      .limit(pageSize)

    if (statusFilter) {
      messagesQuery = adminDb
        .collection('contactMessages')
        .where('status', '==', statusFilter)
        .orderBy('createdAt', 'desc')
        .orderBy(FieldPath.documentId(), 'desc')
        .limit(pageSize)
    }

    if (cursorParam) {
      const [cursorTime, cursorId] = cursorParam.split('|')
      if (cursorTime && cursorId) {
        const cursorDate = new Date(cursorTime)
        if (!Number.isNaN(cursorDate.getTime())) {
          messagesQuery = messagesQuery.startAfter(Timestamp.fromDate(cursorDate), cursorId)
        }
      }
    }

    const snapshot = await messagesQuery.get()

    const results = snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as Record<string, unknown>
      return {
        id: docSnap.id,
        name: typeof data.name === 'string' ? data.name : '',
        email: typeof data.email === 'string' ? data.email : '',
        company: typeof data.company === 'string' ? data.company : null,
        message: typeof data.message === 'string' ? data.message : '',
        status: statusSchema.safeParse(data.status).success
          ? (data.status as ContactMessageStatus)
          : 'new',
        createdAt: toISO(data.createdAt),
      }
    })

    const lastDoc = snapshot.docs[snapshot.docs.length - 1]
    let nextCursor: string | null = null
    if (lastDoc && snapshot.docs.length === pageSize) {
      const lastData = lastDoc.data() as Record<string, unknown>
      const createdAt = toISO(lastData.createdAt)
      if (createdAt) {
        nextCursor = `${createdAt}|${lastDoc.id}`
      }
    }

    return { messages: results, nextCursor }
  }
)

export const PATCH = createApiHandler(
  {
    adminOnly: true,
    bodySchema: z.object({
      id: z.string().min(1),
      status: statusSchema,
    }),
  },
  async (req, { body }) => {
    const { id, status } = body
    const messageRef = adminDb.collection('contactMessages').doc(id)

    await messageRef.update({
      status,
      updatedAt: FieldValue.serverTimestamp(),
    })

    return { ok: true }
  }
)

type ContactMessageStatus = z.infer<typeof statusSchema>
