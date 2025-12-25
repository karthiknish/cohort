import { NextRequest } from 'next/server'
import { Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { adminDb } from '@/lib/firebase-admin'
import { createApiHandler } from '@/lib/api-handler'
import { UnauthorizedError, ValidationError } from '@/lib/api-errors'
import { toISO } from '@/lib/utils'

const statusQuerySchema = z.object({
  userId: z.string().optional(),
})

export const GET = createApiHandler(
  {
    querySchema: statusQuerySchema,
    rateLimit: 'standard',
  },
  async (req, { auth, query }) => {
    let userId: string | null = null
    if (auth.isCron) {
      userId = query.userId ?? null
      if (!userId) {
        throw new ValidationError('Cron requests must specify userId')
      }
    } else {
      userId = auth.uid ?? null
    }

    if (!userId) {
      throw new UnauthorizedError('Unable to resolve user context')
    }

    const snapshot = await adminDb.collection('users').doc(userId).collection('adIntegrations').get()

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
