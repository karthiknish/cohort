import { z } from 'zod'

import { getAdIntegration, updateIntegrationCredentials } from '@/lib/firestore/admin'
import { fetchLinkedInAdAccounts } from '@/services/integrations/linkedin-ads'
import { createApiHandler } from '@/lib/api-handler'
import { NotFoundError, UnauthorizedError, ValidationError } from '@/lib/api-errors'
import {
  ensureLinkedInAccessToken,
  IntegrationTokenError,
} from '@/lib/integration-token-refresh'

const querySchema = z.object({
  clientId: z.string().optional(),
})

const bodySchema = z.object({}).strict()

export const POST = createApiHandler({ bodySchema, querySchema, rateLimit: 'sensitive' }, async (req, { auth, query }) => {
  if (!auth.uid) {
    throw new UnauthorizedError('User context is required')
  }

  const clientId = typeof query.clientId === 'string' && query.clientId.trim().length > 0
    ? query.clientId.trim()
    : null

  const integration = await getAdIntegration({ userId: auth.uid, providerId: 'linkedin', clientId })
  if (!integration?.accessToken) {
    throw new ValidationError('LinkedIn integration is missing an access token')
  }

  try {
    // Validate token and refresh if expiring soon (LinkedIn tokens expire after 60 days)
    const accessToken = await ensureLinkedInAccessToken({ userId: auth.uid, clientId })

    const accounts = await fetchLinkedInAdAccounts({ accessToken })

    if (!accounts.length) {
      throw new NotFoundError('No LinkedIn ad accounts available for this user')
    }

    const preferredAccount =
      accounts.find((account) => account.status?.toUpperCase() === 'ACTIVE') ?? accounts[0]

    await updateIntegrationCredentials({
      userId: auth.uid,
      providerId: 'linkedin',
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
      throw new ValidationError(error.message ?? 'LinkedIn token validation failed')
    }
    throw error
  }
})
