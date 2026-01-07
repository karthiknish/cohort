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

export const POST = createApiHandler({ bodySchema, rateLimit: 'sensitive' }, async (req, { auth }) => {
  if (!auth.uid) {
    throw new ValidationError('User context is required')
  }

  try {
    const integration = await getAdIntegration({ userId: auth.uid, providerId: 'facebook' })
    if (!integration) {
      throw new NotFoundError('Meta integration not found')
    }

    const accessToken = await ensureMetaAccessToken({ userId: auth.uid })
    const accounts = await fetchMetaAdAccounts({ accessToken })

    if (!accounts.length) {
      throw new NotFoundError('No Meta ad accounts available for this user')
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
      throw new ValidationError(error.message ?? 'Token refresh failed')
    }

    throw error
  }
})
