import { NextRequest, NextResponse } from 'next/server'

import { authenticateRequest, assertAdmin, AuthenticationError } from '@/lib/server-auth'
import { resolveWorkspaceContext } from '@/lib/workspace'

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      throw new AuthenticationError('Authentication required', 401)
    }

    assertAdmin(auth)

    const { id } = await context.params
    const clientId = id?.trim()

    if (!clientId) {
      return NextResponse.json({ error: 'Client id is required' }, { status: 400 })
    }

    const workspace = await resolveWorkspaceContext(auth)
    const docRef = workspace.clientsCollection.doc(clientId)
    const snapshot = await docRef.get()

    if (!snapshot.exists) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    await docRef.delete()

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('[clients] DELETE failed', error)
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 })
  }
}
