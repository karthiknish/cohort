import { NextRequest, NextResponse } from 'next/server'
import { Timestamp, collection, getDocs } from 'firebase/firestore'

import { db } from '@/lib/firebase'
import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'

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

    const integrationsRef = collection(db, 'users', userId, 'adIntegrations')
    const snapshot = await getDocs(integrationsRef)

    const toISO = (value: unknown) => {
      if (!value) return null
      if (value instanceof Timestamp) {
        return value.toDate().toISOString()
      }
      // Handle Firestore timestamp-like objects
      if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as any).toDate === 'function') {
        return (value as Timestamp).toDate().toISOString()
      }
      return value as string
    }

    const statuses = snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as Record<string, any>
      return {
        providerId: docSnap.id,
        status: (data.lastSyncStatus as string | undefined) ?? 'never',
        lastSyncedAt: toISO(data.lastSyncedAt),
        lastSyncRequestedAt: toISO(data.lastSyncRequestedAt),
        message: (data.lastSyncMessage as string | undefined) ?? null,
        linkedAt: toISO(data.linkedAt),
      }
    })

    return NextResponse.json({ statuses })
  } catch (error: any) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[integrations/status] failed to load', error)
    return NextResponse.json({ error: 'Failed to load integration statuses' }, { status: 500 })
  }
}
