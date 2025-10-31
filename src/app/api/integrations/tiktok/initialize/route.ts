import { NextRequest, NextResponse } from 'next/server'

import {
  getAdIntegration,
  updateIntegrationCredentials,
} from '@/lib/firestore-integrations-admin'
import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import {
  ensureTikTokAccessToken,
  IntegrationTokenError,
} from '@/lib/integration-token-refresh'
import { fetchTikTokAdAccounts } from '@/services/integrations/tiktok-ads'

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)

    if (!auth.uid) {
      return NextResponse.json({ error: 'User context is required' }, { status: 400 })
    }

    const integration = await getAdIntegration({ userId: auth.uid, providerId: 'tiktok' })

    if (!integration) {
      return NextResponse.json({ error: 'TikTok integration not found' }, { status: 404 })
    }

    const accessToken = await ensureTikTokAccessToken({ userId: auth.uid })

    const accounts = await fetchTikTokAdAccounts({
      accessToken,
    })

    if (!accounts.length) {
      return NextResponse.json({ error: 'No TikTok advertisers available for this user' }, { status: 404 })
    }

    const preferredAccount =
      accounts.find((account) => account.status?.toUpperCase() === 'ENABLE') ?? accounts[0]

    await updateIntegrationCredentials({
      userId: auth.uid,
      providerId: 'tiktok',
      accountId: preferredAccount.id,
    })

    return NextResponse.json({
      accountId: preferredAccount.id,
      accountName: preferredAccount.name,
      accounts,
    })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (error instanceof IntegrationTokenError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.error('[tiktok.initialize] error', error)
    return NextResponse.json({ error: 'Failed to initialize TikTok integration' }, { status: 500 })
  }
}
