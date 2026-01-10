import { z } from 'zod'
import { createApiHandler } from '@/lib/api-handler'
import { BadRequestError, NotFoundError, UnauthorizedError } from '@/lib/api-errors'
import { getAdIntegration } from '@/lib/firestore/admin'
import { fetchMetaAudienceTargeting } from '@/services/integrations/meta-ads'

// =============================================================================
// SCHEMAS
// =============================================================================

const querySchema = z.object({
    campaignId: z.string().optional(),
    adSetId: z.string().optional(),
})

// =============================================================================
// GET - Fetch Audience Targeting
// =============================================================================

export const GET = createApiHandler(
    {
        querySchema,
        rateLimit: 'standard',
    },
    async (req, { auth, query }) => {
        if (!auth.uid) {
            throw new UnauthorizedError('Authentication required')
        }

        const { campaignId, adSetId } = query

        const integration = await getAdIntegration({ userId: auth.uid, providerId: 'facebook' })
        if (!integration) {
            throw new NotFoundError('Meta (facebook) integration not found')
        }

        const accessToken = integration.accessToken
        const adAccountId = integration.accountId

        if (!accessToken || !adAccountId) {
            throw new BadRequestError('Meta credentials not configured')
        }

        const targeting = await fetchMetaAudienceTargeting({
            accessToken,
            adAccountId,
            campaignId,
        })

        // If adSetId is provided, filter the results
        if (adSetId) {
            return {
                targeting: targeting.filter(t => t.adSetId === adSetId)
            }
        }

        return { targeting }
    }
)
