import { z } from 'zod'

import { getAdIntegration, updateIntegrationCredentials } from '@/lib/firestore/admin'
import { ensureGoogleAccessToken, IntegrationTokenError } from '@/lib/integration-token-refresh'
import { fetchGoogleAdAccounts } from '@/services/integrations/google-ads'
import { createApiHandler } from '@/lib/api-handler'
import { ValidationError, NotFoundError } from '@/lib/api-errors'

const querySchema = z.object({
  clientId: z.string().optional(),
})

const bodySchema = z.object({}).strict()

export const POST = createApiHandler({ bodySchema, querySchema, rateLimit: 'sensitive' }, async (req, { auth, query }) => {
  if (!auth.uid) {
    throw new ValidationError('User context is required')
  }

  try {
    const clientId = typeof query.clientId === 'string' && query.clientId.trim().length > 0
      ? query.clientId.trim()
      : null
    const integration = await getAdIntegration({ userId: auth.uid, providerId: 'google', clientId })
    if (!integration) {
      throw new NotFoundError('Google Ads integration not found')
    }

    const accessToken = await ensureGoogleAccessToken({ userId: auth.uid, clientId })
    const developerToken = integration.developerToken ?? process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? null

    const accounts = await fetchGoogleAdAccounts({
      accessToken,
      developerToken,
    })

    if (!accounts.length) {
      throw new NotFoundError('No Google Ads accounts available for this user')
    }

    const primaryAccount = accounts.find((account) => !account.manager) ?? accounts[0]

    const accountId = primaryAccount.id
    const loginCustomerId = primaryAccount.loginCustomerId ?? (primaryAccount.manager ? primaryAccount.id : null)
    const managerCustomerId = primaryAccount.managerCustomerId ?? (primaryAccount.manager ? primaryAccount.id : null)

    await updateIntegrationCredentials({
      userId: auth.uid,
      providerId: 'google',
      clientId,
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
      throw new ValidationError(error.message ?? 'Token refresh failed')
    }

    if (error instanceof Error && error.message.toLowerCase().includes('developer token')) {
      throw new ValidationError(error.message)
    }

    throw error
  }
})
