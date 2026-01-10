import { z } from 'zod'
import { createApiHandler } from '@/lib/api-handler'
import { BadRequestError, NotFoundError, UnauthorizedError } from '@/lib/api-errors'
import { getAdIntegration } from '@/lib/firestore/admin'
import {
    listLinkedInCampaignGroups,
    updateLinkedInCampaignGroupStatus,
    updateLinkedInCampaignGroupBudget,
} from '@/services/integrations/linkedin-ads'

const getQuerySchema = z.object({
    providerId: z.enum(['linkedin']),
    clientId: z.string().optional(),
})

const postBodySchema = z.object({
    providerId: z.enum(['linkedin']),
    clientId: z.string().optional(),
    campaignGroupId: z.string(),
    action: z.enum(['enable', 'pause', 'updateBudget']),
    budget: z.number().optional(),
})

export const GET = createApiHandler(
    {
        querySchema: getQuerySchema,
        rateLimit: 'standard',
    },
    async (req, { auth, query }) => {
        if (!auth.uid) {
            throw new UnauthorizedError('Authentication required')
        }

        const { providerId } = query
        const clientId = query.clientId || null

        const integration = await getAdIntegration({ userId: auth.uid, providerId, clientId })
        if (!integration) {
            throw new NotFoundError(`${providerId} integration not found`)
        }

        if (providerId === 'linkedin') {
            const accessToken = integration.accessToken
            const accountId = integration.accountId

            if (!accessToken || !accountId) {
                throw new BadRequestError('LinkedIn credentials not configured')
            }

            const groups = await listLinkedInCampaignGroups({ accessToken, accountId })
            return { groups }
        }

        return { groups: [] }
    }
)

export const POST = createApiHandler(
    {
        bodySchema: postBodySchema,
        rateLimit: 'standard',
    },
    async (req, { auth, body }) => {
        if (!auth.uid) {
            throw new UnauthorizedError('Authentication required')
        }

        const { providerId, campaignGroupId, action, budget } = body
        const clientId = body.clientId || null

        const integration = await getAdIntegration({ userId: auth.uid, providerId, clientId })
        if (!integration) {
            throw new NotFoundError(`${providerId} integration not found`)
        }

        if (providerId === 'linkedin') {
            const accessToken = integration.accessToken
            if (!accessToken) throw new BadRequestError('LinkedIn access token missing')

            if (action === 'enable' || action === 'pause') {
                await updateLinkedInCampaignGroupStatus({
                    accessToken,
                    campaignGroupId,
                    status: action === 'enable' ? 'ACTIVE' : 'PAUSED',
                })
            } else if (action === 'updateBudget' && budget !== undefined) {
                await updateLinkedInCampaignGroupBudget({
                    accessToken,
                    campaignGroupId,
                    totalBudget: budget,
                })
            }
        }

        return { success: true }
    }
)
