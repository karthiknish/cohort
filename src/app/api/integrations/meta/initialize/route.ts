import { z } from 'zod'

import {
  getAdIntegration,
  updateIntegrationCredentials,
} from '@/lib/firestore/admin'
import {
  ensureMetaAccessToken,
  IntegrationTokenError,
} from '@/lib/integration-token-refresh'
import { fetchMetaAdAccounts } from '@/services/integrations/meta-ads'
import { createApiHandler } from '@/lib/api-handler'
import { ValidationError, NotFoundError } from '@/lib/api-errors'

const bodySchema = z.object({}).strict()

const querySchema = z.object({
  clientId: z.string().optional(),
})

export const POST = createApiHandler({ bodySchema, querySchema, rateLimit: 'sensitive' }, async (req, { auth, query }) => {
  if (!auth.uid) {
    throw new ValidationError('User context is required')
  }

  const clientId = typeof query.clientId === 'string' && query.clientId.trim().length > 0
    ? query.clientId.trim()
    : null

  try {
    const integration = await getAdIntegration({ userId: auth.uid, providerId: 'facebook', clientId })
    if (!integration) {
      throw new NotFoundError('Meta integration not found')
    }

    const accessToken = await ensureMetaAccessToken({ userId: auth.uid, clientId })
    const accounts = await fetchMetaAdAccounts({ accessToken })

    if (!accounts.length) {
      throw new NotFoundError('No Meta ad accounts available for this user')
    }

    const preferredAccount =
      accounts.find((account) => account.account_status === 1) ?? accounts[0]

    await updateIntegrationCredentials({
      userId: auth.uid,
      providerId: 'facebook',
      clientId,
      accountId: preferredAccount.id,
      accountName: preferredAccount.name,
    })

    return {
      accountId: preferredAccount.id,
      accountName: preferredAccount.name,
      accounts,
    }
  } catch (error: unknown) {
    if (error instanceof IntegrationTokenError) {
      throw new ValidationError(error.message ?? 'Token refresh failed')
    }

    throw error
  }
})
