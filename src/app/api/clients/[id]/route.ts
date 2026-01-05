import { createApiHandler } from '@/lib/api-handler'
import { NotFoundError, ValidationError } from '@/lib/api-errors'
import { logAuditAction } from '@/lib/audit-logger'

export const DELETE = createApiHandler(
  { 
    adminOnly: true,
    workspace: 'required',
    rateLimit: 'sensitive'
  },
  async (req, { auth, workspace, params }) => {
    const clientId = (params.id as string)?.trim()

    if (!clientId) {
      throw new ValidationError('Client id is required')
    }

    const docRef = workspace!.clientsCollection.doc(clientId)
    const snapshot = await docRef.get()

    if (!snapshot.exists) {
      throw new NotFoundError('Client not found')
    }

    const clientData = snapshot.data()
    await docRef.update({ 
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    await logAuditAction({
      action: 'CLIENT_DELETE',
      actorId: auth.uid!,
      targetId: clientId,
      workspaceId: workspace!.workspaceId,
      metadata: {
        name: clientData?.name,
      },
    })

    return { success: true }
  }
)
