import { z } from 'zod'

import { ValidationError } from '@/lib/api-errors'
import { createApiHandler } from '@/lib/api-handler'
import { syncGoogleAnalyticsMetrics } from '@/services/integrations/google-analytics/sync'

const querySchema = z.object({
  clientId: z.string().optional(),
  days: z
    .string()
    .transform((value) => parseInt(value, 10))
    .optional(),
})

export const POST = createApiHandler(
  {
    workspace: 'required',
    querySchema,
    rateLimit: 'sensitive',
  },
  async (req, { auth, workspace, query }) => {
    if (!auth.uid) {
      throw new ValidationError('User context is required')
    }

    if (!workspace) {
      throw new ValidationError('Workspace context is required')
    }

    const clientId = typeof query.clientId === 'string' && query.clientId.trim().length > 0
      ? query.clientId.trim()
      : null

    const days = Number.isFinite(query.days) && (query.days as number) > 0
      ? (query.days as number)
      : 30

    return await syncGoogleAnalyticsMetrics({
      userId: auth.uid,
      clientId,
      days,
      requestId: req.headers.get('x-request-id'),
    })
  }
)
