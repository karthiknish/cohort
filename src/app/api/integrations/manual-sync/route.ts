import { NextRequest, NextResponse } from 'next/server'

import { scheduleIntegrationSync } from '@/lib/integration-auto-sync'
import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'

interface ManualSyncRequest {
  providerId?: string
  timeframeDays?: number
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)

    if (!auth.uid) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    let payload: ManualSyncRequest = {}
    try {
      if (request.headers.get('content-type')?.includes('application/json')) {
        payload = (await request.json()) as ManualSyncRequest
      }
    } catch (error) {
      console.warn('[manual-sync] Failed to parse payload', error)
    }

    const providerId = typeof payload.providerId === 'string' ? payload.providerId.trim() : ''
    if (!providerId) {
      return NextResponse.json({ error: 'providerId is required' }, { status: 400 })
    }

    const timeframeDays =
      typeof payload.timeframeDays === 'number' && Number.isFinite(payload.timeframeDays)
        ? Math.max(1, Math.floor(payload.timeframeDays))
        : undefined

    const scheduled = await scheduleIntegrationSync({ userId: auth.uid, providerId, force: true, timeframeDays })

    if (!scheduled) {
      return NextResponse.json({ scheduled: false, message: 'Sync already running or provider unavailable.' })
    }

    return NextResponse.json({ scheduled: true })
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('[manual-sync] unable to queue sync', error)
    const message = error instanceof Error ? error.message : 'Failed to queue manual sync'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
