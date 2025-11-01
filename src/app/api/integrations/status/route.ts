import { NextRequest, NextResponse } from 'next/server'
import { Timestamp } from 'firebase-admin/firestore'

import { adminDb } from '@/lib/firebase-admin'
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

    const snapshot = await adminDb
      .collection('users')
      .doc(userId)
      .collection('adIntegrations')
      .get()

    const toISO = (value: unknown) => {
      if (!value) return null
      if (value instanceof Timestamp) {
        return value.toDate().toISOString()
      }
      // Handle Firestore timestamp-like objects
      if (
        typeof value === 'object' &&
        value !== null &&
        'toDate' in value &&
        typeof (value as { toDate?: () => Date }).toDate === 'function'
      ) {
        return (value as Timestamp).toDate().toISOString()
      }
      return value as string
    }

    const statuses = snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as Record<string, unknown>
      return {
        providerId: docSnap.id,
        status: (data.lastSyncStatus as string | undefined) ?? 'never',
        lastSyncedAt: toISO(data.lastSyncedAt),
        lastSyncRequestedAt: toISO(data.lastSyncRequestedAt),
        message: (data.lastSyncMessage as string | undefined) ?? null,
        linkedAt: toISO(data.linkedAt),
        autoSyncEnabled: typeof data.autoSyncEnabled === 'boolean' ? data.autoSyncEnabled : null,
        syncFrequencyMinutes:
          typeof data.syncFrequencyMinutes === 'number' && Number.isFinite(data.syncFrequencyMinutes)
            ? data.syncFrequencyMinutes
            : null,
        scheduledTimeframeDays:
          typeof data.scheduledTimeframeDays === 'number' && Number.isFinite(data.scheduledTimeframeDays)
            ? data.scheduledTimeframeDays
            : null,
      }
    })

    return NextResponse.json({ statuses })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[integrations/status] failed to load', error)
    return NextResponse.json({ error: 'Failed to load integration statuses' }, { status: 500 })
  }
}
