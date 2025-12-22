import { createApiHandler } from '@/lib/api-handler'

export const DELETE = createApiHandler(
  { 
    adminOnly: true,
    workspace: 'required'
  },
  async (req, { workspace, params }) => {
    const clientId = (params.id as string)?.trim()

    if (!clientId) {
      return { error: 'Client id is required', status: 400 }
    }

    const docRef = workspace!.clientsCollection.doc(clientId)
    const snapshot = await docRef.get()

    if (!snapshot.exists) {
      return { error: 'Client not found', status: 404 }
    }

    await docRef.delete()

    return { ok: true }
  }
)
