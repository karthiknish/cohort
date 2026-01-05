import { createApiHandler } from '@/lib/api-handler'
import { NotFoundError } from '@/lib/api-errors'

export const DELETE = createApiHandler(
  {
    adminOnly: true,
    rateLimit: 'sensitive',
  },
  async (req, { params }) => {
    const { id } = params
    const { invitationsCollection } = await import('@/lib/firebase-admin')
    
    const docRef = invitationsCollection.doc(id as string)
    const snapshot = await docRef.get()

    if (!snapshot.exists) {
      throw new NotFoundError('Invitation not found')
    }

    await docRef.delete()

    return { ok: true }
  }
)
