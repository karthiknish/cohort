import { z } from 'zod'

import { deleteAdIntegration } from '@/lib/firestore-integrations-admin'
import { createApiHandler } from '@/lib/api-handler'
import { UnauthorizedError } from '@/lib/api-errors'

const disconnectSchema = z.object({
  providerId: z.string().min(1),
})

export const POST = createApiHandler(
  {
    bodySchema: disconnectSchema,
    rateLimit: 'sensitive',
  },
  async (req, { auth, body }) => {
    if (!auth.uid) {
      throw new UnauthorizedError('User context required')
    }

    await deleteAdIntegration({ userId: auth.uid, providerId: body.providerId })

    return { success: true }
  }
)
