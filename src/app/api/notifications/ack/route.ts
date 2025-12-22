import { FieldValue } from 'firebase-admin/firestore'
import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'

const updateSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
  action: z.enum(['read', 'dismiss']).default('read'),
})

export const PATCH = createApiHandler(
  { 
    workspace: 'required',
    bodySchema: updateSchema
  },
  async (req, { auth, workspace, body: payload }) => {
    const batch = workspace!.workspaceRef.firestore.batch()
    payload.ids.forEach((id) => {
      const ref = workspace!.workspaceRef.collection('notifications').doc(id)
      if (payload.action === 'dismiss') {
        batch.update(ref, {
          acknowledgedBy: FieldValue.arrayUnion(auth.uid!),
          readBy: FieldValue.arrayUnion(auth.uid!),
          updatedAt: FieldValue.serverTimestamp(),
        })
      } else {
        batch.update(ref, {
          readBy: FieldValue.arrayUnion(auth.uid!),
          updatedAt: FieldValue.serverTimestamp(),
        })
      }
    })

    await batch.commit()

    return { ok: true }
  }
)
