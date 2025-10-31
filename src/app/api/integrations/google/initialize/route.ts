import { NextRequest, NextResponse } from 'next/server'

import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import { getAdIntegration, updateIntegrationCredentials } from '@/lib/firestore-integrations-admin'
import { ensureGoogleAccessToken, IntegrationTokenError } from '@/lib/integration-token-refresh'
import { fetchGoogleAdAccounts } from '@/services/integrations/google-ads'

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)

    if (!auth.uid) {
      return NextResponse.json({ error: 'User context is required' }, { status: 400 })
    }

    const integration = await getAdIntegration({ userId: auth.uid, providerId: 'google' })
    if (!integration) {
      return NextResponse.json({ error: 'Google Ads integration not found' }, { status: 404 })
    }

    const accessToken = await ensureGoogleAccessToken({ userId: auth.uid })
    const developerToken = integration.developerToken ?? process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? null

    const accounts = await fetchGoogleAdAccounts({
      accessToken,
      developerToken,
    })

    if (!accounts.length) {
      return NextResponse.json({ error: 'No Google Ads accounts available for this user' }, { status: 404 })
    }

    const primaryAccount = accounts.find((account) => !account.manager) ?? accounts[0]

    const accountId = primaryAccount.id
    const loginCustomerId = primaryAccount.loginCustomerId ?? (primaryAccount.manager ? primaryAccount.id : null)
    const managerCustomerId = primaryAccount.managerCustomerId ?? (primaryAccount.manager ? primaryAccount.id : null)

    await updateIntegrationCredentials({
      userId: auth.uid,
      providerId: 'google',
      accountId,
      loginCustomerId: loginCustomerId ?? undefined,
      managerCustomerId: managerCustomerId ?? undefined,
      developerToken: developerToken ?? undefined,
    })

    return NextResponse.json({
      accountId,
      accountName: primaryAccount.name,
      loginCustomerId,
      managerCustomerId,
      accounts,
    })
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (error instanceof IntegrationTokenError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (error instanceof Error && error.message.toLowerCase().includes('developer token')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.error('[google.initialize] error', error)
    return NextResponse.json({ error: 'Failed to initialize Google Ads integration' }, { status: 500 })
  }
}
