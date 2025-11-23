import { NextRequest, NextResponse } from 'next/server'
import { FieldPath, Timestamp } from 'firebase-admin/firestore'

import { adminDb } from '@/lib/firebase-admin'
import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'

interface MetricRecord {
  id: string
  providerId: string
  date: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue?: number | null
  createdAt?: string | null
  clientId?: string | null
}

interface MetricListResponse {
  metrics: MetricRecord[]
  nextCursor: string | null
}

const PAGE_SIZE_DEFAULT = 100
const PAGE_SIZE_MAX = 500

function toISO(value: unknown): string | null {
  if (!value) return null
  if (value instanceof Timestamp) {
    return value.toDate().toISOString()
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate?: () => Date }).toDate === 'function'
  ) {
    return (value as Timestamp).toDate().toISOString()
  }
  if (typeof value === 'string') {
    return value
  }
  return null
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)

    let userId: string | null = null
    if (authResult.isCron) {
      userId = request.nextUrl.searchParams.get('userId')
      if (!userId) {
        return NextResponse.json({ error: 'Cron requests must specify userId' }, { status: 400 })
      }
    } else {
      userId = authResult.uid
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unable to resolve user context' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const clientIds = searchParams.getAll('clientIds').flatMap((raw) => raw.split(',').map((value) => value.trim()).filter(Boolean))
    const clientIdFilter = clientIds.length === 1 ? clientIds[0] : null
    const pageSizeParam = searchParams.get('pageSize')
    const afterParam = searchParams.get('after')

    const pageSize = Math.min(Math.max(Number(pageSizeParam) || PAGE_SIZE_DEFAULT, 1), PAGE_SIZE_MAX)

    const baseCollection = adminDb
      .collection('users')
      .doc(userId)
      .collection('adMetrics')

    let query = baseCollection.orderBy('createdAt', 'desc').orderBy(FieldPath.documentId(), 'desc')

    if (clientIdFilter) {
      query = baseCollection
        .where('clientId', '==', clientIdFilter)
        .orderBy('createdAt', 'desc')
        .orderBy(FieldPath.documentId(), 'desc')
    }

    query = query.limit(pageSize + 1)

    if (afterParam) {
      const [timestamp, docId] = afterParam.split('|')
      if (timestamp && docId) {
        const afterDate = new Date(timestamp)
        if (!Number.isNaN(afterDate.getTime())) {
          query = query.startAfter(Timestamp.fromDate(afterDate), docId)
        }
      }
    }

    const snapshot = await query.get()
    const docs = snapshot.docs

    const mapped = docs.slice(0, pageSize).map((docSnap) => {
      const data = docSnap.data() as Record<string, unknown>
      return {
        id: docSnap.id,
        providerId: (data.providerId as string | undefined) ?? 'unknown',
        date: (data.date as string | undefined) ?? 'unknown',
        spend: Number(data.spend ?? 0),
        impressions: Number(data.impressions ?? 0),
        clicks: Number(data.clicks ?? 0),
        conversions: Number(data.conversions ?? 0),
        revenue: data.revenue !== undefined ? Number(data.revenue) : null,
        createdAt: toISO(data.createdAt ?? null),
        clientId: typeof data.clientId === 'string' ? data.clientId : null,
      }
    })
    let metrics = mapped
    if (clientIds.length > 1) {
      metrics = metrics.filter((record) => record.clientId && clientIds.includes(record.clientId))
    }
    const nextCursorDoc = docs.length > pageSize ? docs[pageSize] : null
    const nextCursor = nextCursorDoc
      ? (() => {
          const createdAt = toISO(nextCursorDoc.get('createdAt'))
          return createdAt ? `${createdAt}|${nextCursorDoc.id}` : null
        })()
      : null

    const payload: MetricListResponse = {
      metrics,
      nextCursor,
    }

    return NextResponse.json(payload)
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[metrics] failed to load metrics', error)
    return NextResponse.json({ error: 'Failed to load ad metrics' }, { status: 500 })
  }
}
