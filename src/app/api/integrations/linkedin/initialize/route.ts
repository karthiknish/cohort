import { z } from 'zod'

import { getAdIntegration, updateIntegrationCredentials } from '@/lib/firestore/admin'
import { fetchLinkedInAdAccounts } from '@/services/integrations/linkedin-ads'
import { createApiHandler } from '@/lib/api-handler'
import { NotFoundError, UnauthorizedError, ValidationError } from '@/lib/api-errors'

const bodySchema = z.object({}).strict()

export const POST = createApiHandler({ bodySchema, rateLimit: 'sensitive' }, async (req, { auth }) => {
  if (!auth.uid) {
    throw new UnauthorizedError('User context is required')
  }

  const integration = await getAdIntegration({ userId: auth.uid, providerId: 'linkedin' })
  if (!integration?.accessToken) {
    throw new ValidationError('LinkedIn integration is missing an access token')
  }

  const accounts = await fetchLinkedInAdAccounts({ accessToken: integration.accessToken })

  if (!accounts.length) {
    throw new NotFoundError('No LinkedIn ad accounts available for this user')
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
