import {
  getAdIntegration,
  updateIntegrationCredentials,
} from '@/lib/firestore/admin'
import {
  ensureTikTokAccessToken,
  IntegrationTokenError,
} from '@/lib/integration-token-refresh'
import { fetchTikTokAdAccounts } from '@/services/integrations/tiktok-ads'
import { createApiHandler } from '@/lib/api-handler'
import { z } from 'zod'
import { ValidationError, NotFoundError } from '@/lib/api-errors'

const bodySchema = z.object({}).strict()

export const POST = createApiHandler({ bodySchema, rateLimit: 'sensitive' }, async (req, { auth }) => {
  if (!auth.uid) {
    throw new ValidationError('User context is required')
  }

  try {
    const integration = await getAdIntegration({ userId: auth.uid, providerId: 'tiktok' })

    if (!integration) {
      throw new NotFoundError('TikTok integration not found')
    }

    const accessToken = await ensureTikTokAccessToken({ userId: auth.uid })

    const accounts = await fetchTikTokAdAccounts({
      accessToken,
    })

    if (!accounts.length) {
      throw new NotFoundError('No TikTok advertisers available for this user')
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
      throw new ValidationError(error.message ?? 'Token refresh failed')
    }

    throw error
  }
})
