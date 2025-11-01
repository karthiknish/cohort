import { NextRequest, NextResponse } from 'next/server'

import { scheduleIntegrationSync, scheduleSyncsForAllUsers, scheduleSyncsForUser } from '@/lib/integration-auto-sync'
import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'

type ScheduleRequest = {
  userId?: string
  providerId?: string
  providerIds?: string[]
  force?: boolean
  allUsers?: boolean
}

function ensureAdmin(auth: { email: string | null }) {
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  if (!auth.email || !adminEmails.includes(auth.email.toLowerCase())) {
    throw new AuthenticationError('Admin access required', 403)
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)

    if (!auth.isCron) {
      ensureAdmin(auth)
    }

    let payload: ScheduleRequest = {}
    try {
      if (request.headers.get('content-type')?.includes('application/json')) {
        payload = (await request.json()) as ScheduleRequest
      }
    } catch (error) {
      console.warn('[integrations/schedule] unable to parse request body', error)
    }

    const force = Boolean(payload.force)
    let sanitizedProviderIds = Array.isArray(payload.providerIds)
      ? payload.providerIds.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      : undefined

    if (payload.providerId && !sanitizedProviderIds) {
      sanitizedProviderIds = [payload.providerId]
    }

    if (payload.allUsers) {
      if (!auth.isCron) {
        throw new AuthenticationError('Global scheduling restricted to cron requests', 403)
      }

      const result = await scheduleSyncsForAllUsers({ force, providerIds: sanitizedProviderIds })
      return NextResponse.json({ scope: 'all-users', ...result })
    }

    let targetUserId = payload.userId ?? request.nextUrl.searchParams.get('userId') ?? null
    if (!auth.isCron) {
      targetUserId = payload.userId ?? request.nextUrl.searchParams.get('userId') ?? auth.uid
    }

    if (!targetUserId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    if (sanitizedProviderIds && sanitizedProviderIds.length === 1) {
      const providerId = sanitizedProviderIds[0]
      const scheduled = await scheduleIntegrationSync({ userId: targetUserId, providerId, force })
      return NextResponse.json({ userId: targetUserId, providerId, scheduled })
    }

    const result = await scheduleSyncsForUser({ userId: targetUserId, providerIds: sanitizedProviderIds, force })
    return NextResponse.json({ userId: targetUserId, ...result })
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('[integrations/schedule] failed to schedule sync jobs', error)
    const message = error instanceof Error ? error.message : 'Failed to schedule sync jobs'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}