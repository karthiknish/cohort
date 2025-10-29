import { NextRequest, NextResponse } from 'next/server'
import {
  Timestamp,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
  where,
} from 'firebase/firestore'
import { z } from 'zod'

import { db } from '@/lib/firebase'
import { authenticateRequest, assertAdmin, AuthenticationError } from '@/lib/server-auth'

const statusSchema = z.enum(['new', 'in_progress', 'resolved'])

function toISO(value: unknown): string | null {
  if (!value) return null
  try {
    const timestamp = (value as { toDate?: () => Date }).toDate?.()
    if (timestamp) {
      return timestamp.toISOString()
    }
  } catch (error) {
    // noop
  }
  if (typeof value === 'string') {
    return value
  }
  return null
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    assertAdmin(auth)

    const url = new URL(request.url)
    const statusParam = url.searchParams.get('status')
    const statusFilter = statusParam && statusSchema.safeParse(statusParam).success ? statusParam : null
    const sizeParam = url.searchParams.get('pageSize')
    const pageSize = Math.min(Math.max(Number(sizeParam) || 20, 1), 100)
    const cursorParam = url.searchParams.get('cursor')

    const baseCollection = collection(db, 'contactMessages')
    let messagesQuery = query(
      baseCollection,
      orderBy('createdAt', 'desc'),
      orderBy('__name__', 'desc'),
      limit(pageSize)
    )

    if (statusFilter) {
      messagesQuery = query(
        baseCollection,
        where('status', '==', statusFilter),
        orderBy('createdAt', 'desc'),
        orderBy('__name__', 'desc'),
        limit(pageSize)
      )
    }

    if (cursorParam) {
      const [cursorTime, cursorId] = cursorParam.split('|')
      if (cursorTime && cursorId) {
        const cursorDate = new Date(cursorTime)
        if (!Number.isNaN(cursorDate.getTime())) {
          messagesQuery = query(messagesQuery, startAfter(Timestamp.fromDate(cursorDate), cursorId))
        }
      }
    }

    const snapshot = await getDocs(messagesQuery)

    const results = snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as Record<string, any>
      return {
        id: docSnap.id,
        name: data.name ?? '',
        email: data.email ?? '',
        company: data.company ?? null,
        message: data.message ?? '',
        status: data.status ?? 'new',
        createdAt: toISO(data.createdAt),
      }
    })

    const lastDoc = snapshot.docs[snapshot.docs.length - 1]
    let nextCursor: string | null = null
    if (lastDoc && snapshot.docs.length === pageSize) {
      const lastData = lastDoc.data() as Record<string, any>
      const createdAt = toISO(lastData.createdAt)
      if (createdAt) {
        nextCursor = `${createdAt}|${lastDoc.id}`
      }
    }

    return NextResponse.json({ messages: results, nextCursor })
  } catch (error: any) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[admin/contact-messages] get failed', error)
    return NextResponse.json({ error: 'Failed to load contact messages' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    assertAdmin(auth)

    const body = await request.json().catch(() => null)
    const schema = z.object({
      id: z.string().min(1),
      status: statusSchema,
    })
    const parseResult = schema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 })
    }

    const { id, status } = parseResult.data
    const messageRef = doc(db, 'contactMessages', id)

    await updateDoc(messageRef, {
      status,
    })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[admin/contact-messages] patch failed', error)
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 })
  }
}
