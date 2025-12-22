import { NextRequest, NextResponse } from 'next/server'
import { Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { adminDb } from '@/lib/firebase-admin'
import { createApiHandler } from '@/lib/api-handler'

const statusQuerySchema = z.object({
  userId: z.string().optional(),
})

export const GET = createApiHandler(
  {
    querySchema: statusQuerySchema,
  },
  async (req, { auth, query }) => {
    let userId: string | null = null
    if (auth.isCron) {
      userId = query.userId ?? null
      if (!userId) {
        return NextResponse.json({ error: 'Cron requests must specify userId' }, { status: 400 })
      }
    } else {
      userId = auth.uid ?? null
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unable to resolve user context' }, { status: 401 })
    }

    const snapshot = await adminDb.collection('users').doc(userId).collection('adIntegrations').get()

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
        accountId: typeof data.accountId === 'string' && data.accountId.length > 0 ? data.accountId : null,
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

    return { statuses }
  }
)
