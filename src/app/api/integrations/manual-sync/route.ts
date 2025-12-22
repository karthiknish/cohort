import { z } from 'zod'

import { scheduleIntegrationSync } from '@/lib/integration-auto-sync'
import { createApiHandler } from '@/lib/api-handler'

const manualSyncSchema = z.object({
  providerId: z.string().min(1),
  timeframeDays: z.number().finite().min(1).optional(),
})

export const POST = createApiHandler(
  {
    bodySchema: manualSyncSchema,
  },
  async (req, { auth, body }) => {
    if (!auth.uid) {
      return { error: 'Authentication required', status: 401 }
    }

    const scheduled = await scheduleIntegrationSync({
      userId: auth.uid,
      providerId: body.providerId,
      force: true,
      timeframeDays: body.timeframeDays,
    })

    if (!scheduled) {
      return { scheduled: false, message: 'Sync already running or provider unavailable.' }
    }

    return { scheduled: true }
  }
)
