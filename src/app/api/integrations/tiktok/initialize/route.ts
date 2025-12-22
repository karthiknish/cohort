import {
  getAdIntegration,
  updateIntegrationCredentials,
} from '@/lib/firestore-integrations-admin'
import {
  ensureTikTokAccessToken,
  IntegrationTokenError,
} from '@/lib/integration-token-refresh'
import { fetchTikTokAdAccounts } from '@/services/integrations/tiktok-ads'
import { createApiHandler } from '@/lib/api-handler'

export const POST = createApiHandler({}, async (req, { auth }) => {
  if (!auth.uid) {
    return { error: 'User context is required', status: 400 }
  }

  try {
    const integration = await getAdIntegration({ userId: auth.uid, providerId: 'tiktok' })

    if (!integration) {
      return { error: 'TikTok integration not found', status: 404 }
    }

    const accessToken = await ensureTikTokAccessToken({ userId: auth.uid })

    const accounts = await fetchTikTokAdAccounts({
      accessToken,
    })

    if (!accounts.length) {
      return { error: 'No TikTok advertisers available for this user', status: 404 }
    }

    const preferredAccount =
      accounts.find((account) => account.status?.toUpperCase() === 'ENABLE') ?? accounts[0]

    await updateIntegrationCredentials({
      userId: auth.uid,
      providerId: 'tiktok',
      accountId: preferredAccount.id,
    })

    return {
      accountId: preferredAccount.id,
      accountName: preferredAccount.name,
      accounts,
    }
  } catch (error: unknown) {
    if (error instanceof IntegrationTokenError) {
      return { error: error.message, status: 400 }
    }

    throw error
  }
})
