import { NextRequest, NextResponse } from 'next/server'
import { Timestamp, collection, getDocs, limit, orderBy, query } from 'firebase/firestore'

import { db } from '@/lib/firebase'
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
}

function toISO(value: unknown): string | null {
  if (!value) return null
  if (value instanceof Timestamp) {
    return value.toDate().toISOString()
  }
  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as any).toDate === 'function') {
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

    const metricsRef = collection(db, 'users', userId, 'adMetrics')
    const metricsQuery = query(metricsRef, orderBy('createdAt', 'desc'), limit(100))
    const snapshot = await getDocs(metricsQuery)

    const records: MetricRecord[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as Record<string, any>
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
      }
    })

    return NextResponse.json(records)
  } catch (error: any) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[metrics] failed to load metrics', error)
    return NextResponse.json({ error: 'Failed to load ad metrics' }, { status: 500 })
  }
}
