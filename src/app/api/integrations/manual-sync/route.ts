import { z } from 'zod'

import { scheduleIntegrationSync } from '@/lib/integration-auto-sync'
import { createApiHandler } from '@/lib/api-handler'
import { UnauthorizedError } from '@/lib/api-errors'

const manualSyncSchema = z.object({
  providerId: z.string().min(1),
  timeframeDays: z.number().finite().min(1).optional(),
})

export const POST = createApiHandler(
  {
    bodySchema: manualSyncSchema,
    rateLimit: 'sensitive',
  },
  async (req, { auth, body }) => {
    if (!auth.uid) {
      throw new UnauthorizedError('Authentication required')
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
