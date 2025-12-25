import { createApiHandler } from '@/lib/api-handler'
import { NotFoundError, ValidationError } from '@/lib/api-errors'

export const DELETE = createApiHandler(
  { 
    adminOnly: true,
    workspace: 'required',
    rateLimit: 'sensitive'
  },
  async (req, { workspace, params }) => {
    const clientId = (params.id as string)?.trim()

    if (!clientId) {
      throw new ValidationError('Client id is required')
    }

    const docRef = workspace!.clientsCollection.doc(clientId)
    const snapshot = await docRef.get()

    if (!snapshot.exists) {
      throw new NotFoundError('Client not found')
    }

    await docRef.delete()

    return { ok: true }
  }
)
