import { NextRequest, NextResponse } from 'next/server'

import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import {
  getAdIntegration,
  updateIntegrationCredentials,
} from '@/lib/firestore-integrations-admin'
import {
  ensureMetaAccessToken,
  IntegrationTokenError,
} from '@/lib/integration-token-refresh'
import { fetchMetaAdAccounts } from '@/services/integrations/meta-ads'

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)

    if (!auth.uid) {
      return NextResponse.json({ error: 'User context is required' }, { status: 400 })
    }

    const integration = await getAdIntegration({ userId: auth.uid, providerId: 'facebook' })
    if (!integration) {
      return NextResponse.json({ error: 'Meta integration not found' }, { status: 404 })
    }

    const accessToken = await ensureMetaAccessToken({ userId: auth.uid })
    const accounts = await fetchMetaAdAccounts({ accessToken })

    if (!accounts.length) {
      return NextResponse.json({ error: 'No Meta ad accounts available for this user' }, { status: 404 })
    }

    const preferredAccount =
      accounts.find((account) => account.account_status === 1) ?? accounts[0]

    await updateIntegrationCredentials({
      userId: auth.uid,
      providerId: 'facebook',
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

    console.error('[meta.initialize] error', error)
    return NextResponse.json({ error: 'Failed to initialize Meta integration' }, { status: 500 })
  }
}
