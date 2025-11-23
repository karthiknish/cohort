import { NextRequest, NextResponse } from 'next/server'

import { deleteAdIntegration } from '@/lib/firestore-integrations-admin'
import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      return NextResponse.json({ error: 'User context required' }, { status: 401 })
    }

    const payload = await request.json() as { providerId?: string }

    const providerId = typeof payload.providerId === 'string' && payload.providerId.trim().length > 0 ? payload.providerId.trim() : null
    if (!providerId) {
      return NextResponse.json({ error: 'providerId is required' }, { status: 400 })
    }

    await deleteAdIntegration({ userId: auth.uid, providerId })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('[integrations/disconnect] failed', error)
    return NextResponse.json({ error: 'Failed to disconnect integration' }, { status: 500 })
  }
}
