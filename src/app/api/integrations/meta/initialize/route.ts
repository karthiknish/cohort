import {
  getAdIntegration,
  updateIntegrationCredentials,
} from '@/lib/firestore-integrations-admin'
import {
  ensureMetaAccessToken,
  IntegrationTokenError,
} from '@/lib/integration-token-refresh'
import { fetchMetaAdAccounts } from '@/services/integrations/meta-ads'
import { createApiHandler } from '@/lib/api-handler'

export const POST = createApiHandler({}, async (req, { auth }) => {
  if (!auth.uid) {
    return { error: 'User context is required', status: 400 }
  }

  try {
    const integration = await getAdIntegration({ userId: auth.uid, providerId: 'facebook' })
    if (!integration) {
      return { error: 'Meta integration not found', status: 404 }
    }

    const accessToken = await ensureMetaAccessToken({ userId: auth.uid })
    const accounts = await fetchMetaAdAccounts({ accessToken })

    if (!accounts.length) {
      return { error: 'No Meta ad accounts available for this user', status: 404 }
    }

    const preferredAccount =
      accounts.find((account) => account.account_status === 1) ?? accounts[0]

    await updateIntegrationCredentials({
      userId: auth.uid,
      providerId: 'facebook',
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
