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
    const integration = await getAdIntegration({ userId: auth.uid, providerId: 'tiktok', clientId })

    if (!integration) {
      throw new NotFoundError('TikTok integration not found')
    }

    const accessToken = await ensureTikTokAccessToken({ userId: auth.uid, clientId })

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
      clientId,
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
