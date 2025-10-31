import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { z } from 'zod'

import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import { resolveWorkspaceContext } from '@/lib/workspace'

const updateSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
  action: z.enum(['read', 'dismiss']).default('read'),
})

export async function PATCH(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      throw new AuthenticationError('Authentication required', 401)
    }

    const payload = updateSchema.parse(await request.json().catch(() => null))

    const workspace = await resolveWorkspaceContext(auth)

    const batch = workspace.workspaceRef.firestore.batch()
    payload.ids.forEach((id) => {
      const ref = workspace.workspaceRef.collection('notifications').doc(id)
      if (payload.action === 'dismiss') {
        batch.update(ref, {
          acknowledgedBy: FieldValue.arrayUnion(auth.uid),
          readBy: FieldValue.arrayUnion(auth.uid),
          updatedAt: FieldValue.serverTimestamp(),
        })
      } else {
        batch.update(ref, {
          readBy: FieldValue.arrayUnion(auth.uid),
          updatedAt: FieldValue.serverTimestamp(),
        })
      }
    })

    await batch.commit()

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid payload', details: error.flatten() }, { status: 400 })
    }

    console.error('[notifications/ack] PATCH failed', error)
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 })
  }
}
