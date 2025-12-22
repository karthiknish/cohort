import { z } from 'zod'

import { deleteAdIntegration } from '@/lib/firestore-integrations-admin'
import { createApiHandler } from '@/lib/api-handler'

const disconnectSchema = z.object({
  providerId: z.string().min(1),
})

export const POST = createApiHandler(
  {
    bodySchema: disconnectSchema,
  },
  async (req, { auth, body }) => {
    if (!auth.uid) {
      return { error: 'User context required', status: 401 }
    }

    await deleteAdIntegration({ userId: auth.uid, providerId: body.providerId })

    return { success: true }
  }
)
