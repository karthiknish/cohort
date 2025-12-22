import { getAdIntegration, updateIntegrationCredentials } from '@/lib/firestore-integrations-admin'
import { ensureGoogleAccessToken, IntegrationTokenError } from '@/lib/integration-token-refresh'
import { fetchGoogleAdAccounts } from '@/services/integrations/google-ads'
import { createApiHandler } from '@/lib/api-handler'

export const POST = createApiHandler({}, async (req, { auth }) => {
  if (!auth.uid) {
    return { error: 'User context is required', status: 400 }
  }

  try {
    const integration = await getAdIntegration({ userId: auth.uid, providerId: 'google' })
    if (!integration) {
      return { error: 'Google Ads integration not found', status: 404 }
    }

    const accessToken = await ensureGoogleAccessToken({ userId: auth.uid })
    const developerToken = integration.developerToken ?? process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? null

    const accounts = await fetchGoogleAdAccounts({
      accessToken,
      developerToken,
    })

    if (!accounts.length) {
      return { error: 'No Google Ads accounts available for this user', status: 404 }
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

    return {
      accountId,
      accountName: primaryAccount.name,
      loginCustomerId,
      managerCustomerId,
      accounts,
    }
  } catch (error) {
    if (error instanceof IntegrationTokenError) {
      return { error: error.message, status: 400 }
    }

    if (error instanceof Error && error.message.toLowerCase().includes('developer token')) {
      return { error: error.message, status: 400 }
    }

    throw error
  }
})
