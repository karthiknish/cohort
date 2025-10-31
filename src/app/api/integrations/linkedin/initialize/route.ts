import { NextRequest, NextResponse } from 'next/server'

import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import { getAdIntegration, updateIntegrationCredentials } from '@/lib/firestore-integrations-admin'
import { fetchLinkedInAdAccounts } from '@/services/integrations/linkedin-ads'

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)

    if (!auth.uid) {
      return NextResponse.json({ error: 'User context is required' }, { status: 400 })
    }

    const integration = await getAdIntegration({ userId: auth.uid, providerId: 'linkedin' })
    if (!integration?.accessToken) {
      return NextResponse.json({ error: 'LinkedIn integration is missing an access token' }, { status: 400 })
    }

    const accounts = await fetchLinkedInAdAccounts({ accessToken: integration.accessToken })

    if (!accounts.length) {
      return NextResponse.json({ error: 'No LinkedIn ad accounts available for this user' }, { status: 404 })
    }

    const preferredAccount =
      accounts.find((account) => account.status?.toUpperCase() === 'ACTIVE') ?? accounts[0]

    await updateIntegrationCredentials({
      userId: auth.uid,
      providerId: 'linkedin',
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

    if (error instanceof Error) {
      const message = error.message ?? 'Failed to initialize LinkedIn Ads integration'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to initialize LinkedIn Ads integration' }, { status: 500 })
  }
}
