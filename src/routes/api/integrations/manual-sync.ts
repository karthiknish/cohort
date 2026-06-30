import { createFileRoute } from '@tanstack/react-router'
import { adaptApiHandler } from '@/lib/api-handler-start'
import { z } from 'zod'
import { scheduleIntegrationSync } from '@/lib/integration-auto-sync'
import { UnauthorizedError } from '@/lib/api-errors'

const manualSyncSchema = z.object({
  providerId: z.string().min(1),
  timeframeDays: z.number().finite().min(1).optional(),
})

const handlers = adaptApiHandler(
  { bodySchema: manualSyncSchema, rateLimit: 'sensitive' },
  async (_req, { auth, body }) => {
    if (!auth.uid) throw new UnauthorizedError('Authentication required')
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
  },
)

export const Route = createFileRoute('/api/integrations/manual-sync')({
  server: { handlers },
})
