import { z } from 'zod'
import { createApiHandler } from '@/lib/api-handler'
import { BadRequestError, NotFoundError, UnauthorizedError } from '@/lib/api-errors'
import { getAdIntegration } from '@/lib/firestore-integrations-admin'
import { ensureGoogleAccessToken } from '@/lib/integration-token-refresh'

import { createGoogleAudience } from '@/services/integrations/google-ads'
import { createTikTokAudience } from '@/services/integrations/tiktok-ads'
import { createLinkedInAudience } from '@/services/integrations/linkedin-ads'
import { createMetaAudience } from '@/services/integrations/meta-ads'

const postBodySchema = z.object({
  providerId: z.enum(['google', 'tiktok', 'linkedin', 'facebook']),
  name: z.string(),
  description: z.string().optional(),
  segments: z.array(z.string()),
})

export const POST = createApiHandler(
  {
    bodySchema: postBodySchema,
    rateLimit: 'standard',
  },
  async (req, { auth, body }) => {
    if (!auth.uid) {
      throw new UnauthorizedError('Authentication required')
    }

    const { providerId, name, description, segments } = body

    const integration = await getAdIntegration({ userId: auth.uid, providerId })
    if (!integration) {
      throw new NotFoundError(`${providerId} integration not found`)
    }

    let result: { success: boolean; id?: string; resourceName?: string }

    if (providerId === 'google') {
      const accessToken = await ensureGoogleAccessToken({ userId: auth.uid })
      const developerToken = integration.developerToken ?? process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? ''
      result = await createGoogleAudience({
        accessToken,
        developerToken,
        customerId: integration.accountId ?? '',
        name,
        description,
        segments,
        loginCustomerId: integration.loginCustomerId,
      })
    } else if (providerId === 'tiktok') {
      result = await createTikTokAudience({
        accessToken: integration.accessToken ?? '',
        advertiserId: integration.accountId ?? '',
        name,
        description,
        segments,
      })
    } else if (providerId === 'linkedin') {
      result = await createLinkedInAudience({
        accessToken: integration.accessToken ?? '',
        accountId: integration.accountId ?? '',
        name,
        description,
        segments,
      })
    } else if (providerId === 'facebook') {
      result = await createMetaAudience({
        accessToken: integration.accessToken ?? '',
        adAccountId: integration.accountId ?? '',
        name,
        description,
        segments,
      })
    } else {
      throw new BadRequestError('Unsupported provider')
    }

    return { 
      success: true, 
      message: `Audience "${name}" created on ${providerId}`,
      id: result.id || result.resourceName,
    }
  }
)
