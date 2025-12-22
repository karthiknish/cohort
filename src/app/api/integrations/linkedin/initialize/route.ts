import { getAdIntegration, updateIntegrationCredentials } from '@/lib/firestore-integrations-admin'
import { fetchLinkedInAdAccounts } from '@/services/integrations/linkedin-ads'
import { createApiHandler } from '@/lib/api-handler'

export const POST = createApiHandler({}, async (req, { auth }) => {
  if (!auth.uid) {
    return { error: 'User context is required', status: 400 }
  }

  const integration = await getAdIntegration({ userId: auth.uid, providerId: 'linkedin' })
  if (!integration?.accessToken) {
    return { error: 'LinkedIn integration is missing an access token', status: 400 }
  }

  const accounts = await fetchLinkedInAdAccounts({ accessToken: integration.accessToken })

  if (!accounts.length) {
    return { error: 'No LinkedIn ad accounts available for this user', status: 404 }
  }

  const preferredAccount =
    accounts.find((account) => account.status?.toUpperCase() === 'ACTIVE') ?? accounts[0]

  await updateIntegrationCredentials({
    userId: auth.uid,
    providerId: 'linkedin',
    accountId: preferredAccount.id,
  })

  return {
    accountId: preferredAccount.id,
    accountName: preferredAccount.name,
    accounts,
  }
})
