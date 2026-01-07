import { NextRequest, NextResponse } from 'next/server'
import { FieldPath, FieldValue, Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { adminDb } from '@/lib/firebase-admin'
import { createApiHandler } from '@/lib/api-handler'
import { toISO } from '@/lib/utils'

const statusSchema = z.enum(['new', 'in_progress', 'resolved'])

export const GET = createApiHandler(
  {
    adminOnly: true,
    rateLimit: 'standard',
  },
  async (req) => {
    const url = new URL(req.url)
    const statusParam = url.searchParams.get('status')
    const statusFilter =
      statusParam && statusSchema.safeParse(statusParam).success ? statusParam : null
    const sizeParam = url.searchParams.get('pageSize')
    const pageSize = Math.min(Math.max(Number(sizeParam) || 20, 1), 100)
    const afterParam = url.searchParams.get('after') ?? url.searchParams.get('cursor')
    const includeTotalsParam = url.searchParams.get('includeTotals')
    const includeTotals = includeTotalsParam === 'true' || includeTotalsParam === '1'

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

    if (afterParam) {
      const [cursorTime, cursorId] = afterParam.split('|')
      if (cursorTime && cursorId) {
        const cursorDate = new Date(cursorTime)
        if (!Number.isNaN(cursorDate.getTime())) {
          messagesQuery = messagesQuery.startAfter(Timestamp.fromDate(cursorDate), cursorId)
        }
      }
    }

    const startOfTodayUtc = (() => {
      const now = new Date()
      now.setUTCHours(0, 0, 0, 0)
      return Timestamp.fromDate(now)
    })()

    const [snapshot, totalsAgg, pendingAgg, todayAgg] = await Promise.all([
      messagesQuery.get(),
      includeTotals ? adminDb.collection('contactMessages').count().get() : Promise.resolve(null),
      includeTotals
        ? adminDb.collection('contactMessages').where('status', '==', 'new').count().get()
        : Promise.resolve(null),
      includeTotals
        ? adminDb.collection('contactMessages').where('createdAt', '>=', startOfTodayUtc).count().get()
        : Promise.resolve(null),
    ])

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

    if (!includeTotals) {
      return { messages: results, nextCursor }
    }

    const total = typeof totalsAgg?.data().count === 'number' ? totalsAgg.data().count : 0
    const pendingTotal = typeof pendingAgg?.data().count === 'number' ? pendingAgg.data().count : 0
    const todayTotal = typeof todayAgg?.data().count === 'number' ? todayAgg.data().count : 0

    return { messages: results, nextCursor, total, pendingTotal, todayTotal }
  }
)

export const PATCH = createApiHandler(
  {
    adminOnly: true,
    bodySchema: z.object({
      id: z.string().min(1),
      status: statusSchema,
    }),
    rateLimit: 'sensitive',
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
