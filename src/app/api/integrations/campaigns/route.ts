import { z } from 'zod'
import { createApiHandler } from '@/lib/api-handler'
import { BadRequestError, NotFoundError, UnauthorizedError } from '@/lib/api-errors'
import { getAdIntegration } from '@/lib/firestore-integrations-admin'
import { ensureGoogleAccessToken } from '@/lib/integration-token-refresh'

import {
  listGoogleCampaigns,
  updateGoogleCampaignStatus,
  updateGoogleCampaignBudgetByCampaign,
  removeGoogleCampaign,
  GoogleCampaign,
} from '@/services/integrations/google-ads'

import {
  listTikTokCampaigns,
  updateTikTokCampaignStatus,
  updateTikTokCampaignBudget,
  removeTikTokCampaign,
  TikTokCampaign,
} from '@/services/integrations/tiktok-ads'

import {
  listLinkedInCampaigns,
  updateLinkedInCampaignStatus,
  updateLinkedInCampaignBudget,
  removeLinkedInCampaign,
  LinkedInCampaign,
} from '@/services/integrations/linkedin-ads'

import {
  listMetaCampaigns,
  updateMetaCampaignStatus,
  updateMetaCampaignBudget,
  removeMetaCampaign,
  MetaCampaign,
} from '@/services/integrations/meta-ads'



// =============================================================================
// SCHEMAS
// =============================================================================

const getQuerySchema = z.object({
  providerId: z.enum(['google', 'tiktok', 'linkedin', 'facebook']),
  status: z.string().optional(),
})

const postBodySchema = z.object({
  providerId: z.enum(['google', 'tiktok', 'linkedin', 'facebook']),
  campaignId: z.string(),
  action: z.enum(['enable', 'pause', 'updateBudget', 'remove']),
  budget: z.number().optional(),
  budgetMode: z.string().optional(),
})


// =============================================================================
// TYPES
// =============================================================================

type NormalizedCampaign = {
  id: string
  name: string
  providerId: string
  status: string
  budget?: number
  budgetType?: string
  objective?: string
}

// =============================================================================
// HELPERS
// =============================================================================

function normalizeGoogleCampaigns(campaigns: GoogleCampaign[]): NormalizedCampaign[] {
  return campaigns.map((c) => ({
    id: c.id,
    name: c.name,
    providerId: 'google',
    status: c.status,
    budget: c.budgetAmountMicros ? c.budgetAmountMicros / 1_000_000 : undefined,
    budgetType: c.biddingStrategyType,
    objective: c.advertisingChannelType,
  }))
}

function normalizeTikTokCampaigns(campaigns: TikTokCampaign[]): NormalizedCampaign[] {
  return campaigns.map((c) => ({
    id: c.id,
    name: c.name,
    providerId: 'tiktok',
    status: c.status,
    budget: c.budget,
    budgetType: c.budgetMode,
    objective: c.objective,
  }))
}

function normalizeLinkedInCampaigns(campaigns: LinkedInCampaign[]): NormalizedCampaign[] {
  return campaigns.map((c) => ({
    id: c.id,
    name: c.name,
    providerId: 'linkedin',
    status: c.status,
    budget: c.dailyBudget ?? c.totalBudget,
    budgetType: c.dailyBudget ? 'daily' : 'total',
    objective: c.objectiveType,
  }))
}

// =============================================================================
// GET - List Campaigns
// =============================================================================

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

    const integration = await getAdIntegration({ userId: auth.uid, providerId })
    if (!integration) {
      throw new NotFoundError(`${providerId} integration not found`)
    }

    let campaigns: NormalizedCampaign[] = []

    if (providerId === 'google') {
      const accessToken = await ensureGoogleAccessToken({ userId: auth.uid })
      const developerToken = integration.developerToken ?? process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? ''
      const customerId = integration.accountId ?? ''
      const loginCustomerId = integration.loginCustomerId

      if (!customerId) {
        throw new BadRequestError('Google Ads customer ID not configured')
      }

      const googleCampaigns = await listGoogleCampaigns({
        accessToken,
        developerToken,
        customerId,
        loginCustomerId,
      })

      campaigns = normalizeGoogleCampaigns(googleCampaigns)
    } else if (providerId === 'tiktok') {
      const accessToken = integration.accessToken
      const advertiserId = integration.accountId

      if (!accessToken || !advertiserId) {
        throw new BadRequestError('TikTok access token or advertiser ID not configured')
      }

      const tiktokCampaigns = await listTikTokCampaigns({
        accessToken,
        advertiserId,
      })

      campaigns = normalizeTikTokCampaigns(tiktokCampaigns)
    } else if (providerId === 'linkedin') {
      const accessToken = integration.accessToken
      const accountId = integration.accountId

      if (!accessToken || !accountId) {
        throw new BadRequestError('LinkedIn access token or account ID not configured')
      }

      const linkedInCampaigns = await listLinkedInCampaigns({
        accessToken,
        accountId,
      })

      campaigns = normalizeLinkedInCampaigns(linkedInCampaigns)
    } else if (providerId === 'facebook') {
      const accessToken = integration.accessToken
      const adAccountId = integration.accountId

      if (!accessToken || !adAccountId) {
        throw new BadRequestError('Meta access token or ad account ID not configured')
      }

      const metaCampaigns = await listMetaCampaigns({
        accessToken,
        adAccountId,
      })

      campaigns = metaCampaigns.map((c): NormalizedCampaign => ({
        id: c.id,
        name: c.name,
        providerId: 'facebook',
        status: c.status,
        budget: c.dailyBudget ?? c.lifetimeBudget,
        budgetType: c.dailyBudget ? 'daily' : c.lifetimeBudget ? 'lifetime' : undefined,
        objective: c.objective,
      }))
    }

    return { campaigns }
  }
)

// =============================================================================
// POST - Update Campaign (Status or Budget)
// =============================================================================

export const POST = createApiHandler(
  {
    bodySchema: postBodySchema,
    rateLimit: 'standard',
    requireIdempotency: true,
  },
  async (req, { auth, body }) => {
    if (!auth.uid) {
      throw new UnauthorizedError('Authentication required')
    }

    const { providerId, campaignId, action, budget, budgetMode } = body

    const integration = await getAdIntegration({ userId: auth.uid, providerId })
    if (!integration) {
      throw new NotFoundError(`${providerId} integration not found`)
    }

    if (providerId === 'google') {
      const accessToken = await ensureGoogleAccessToken({ userId: auth.uid })
      const developerToken = integration.developerToken ?? process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? ''
      const customerId = integration.accountId ?? ''
      const loginCustomerId = integration.loginCustomerId

      if (action === 'enable' || action === 'pause') {
        await updateGoogleCampaignStatus({
          accessToken,
          developerToken,
          customerId,
          campaignId,
          status: action === 'enable' ? 'ENABLED' : 'PAUSED',
          loginCustomerId,
        })
      } else if (action === 'updateBudget' && budget !== undefined) {
        // Convert budget to micros (Google uses micros - multiply by 1,000,000)
        const amountMicros = Math.round(budget * 1_000_000)
        await updateGoogleCampaignBudgetByCampaign({
          accessToken,
          developerToken,
          customerId,
          campaignId,
          amountMicros,
          loginCustomerId,
        })
      } else if (action === 'remove') {
        await removeGoogleCampaign({
          accessToken,
          developerToken,
          customerId,
          campaignId,
          loginCustomerId,
        })
      }
    } else if (providerId === 'tiktok') {
      const accessToken = integration.accessToken
      const advertiserId = integration.accountId

      if (!accessToken || !advertiserId) {
        throw new BadRequestError('TikTok credentials not configured')
      }

      if (action === 'enable' || action === 'pause') {
        await updateTikTokCampaignStatus({
          accessToken,
          advertiserId,
          campaignId,
          status: action === 'enable' ? 'ENABLE' : 'DISABLE',
        })
      } else if (action === 'updateBudget' && budget !== undefined) {
        await updateTikTokCampaignBudget({
          accessToken,
          advertiserId,
          campaignId,
          budget,
          budgetMode: budgetMode as 'BUDGET_MODE_DAY' | 'BUDGET_MODE_TOTAL' | undefined,
        })
      } else if (action === 'remove') {
        await removeTikTokCampaign({
          accessToken,
          advertiserId,
          campaignId,
        })
      }
    } else if (providerId === 'linkedin') {
      const accessToken = integration.accessToken

      if (!accessToken) {
        throw new BadRequestError('LinkedIn credentials not configured')
      }

      if (action === 'enable' || action === 'pause') {
        await updateLinkedInCampaignStatus({
          accessToken,
          campaignId,
          status: action === 'enable' ? 'ACTIVE' : 'PAUSED',
        })
      } else if (action === 'updateBudget' && budget !== undefined) {
        await updateLinkedInCampaignBudget({
          accessToken,
          campaignId,
          dailyBudget: budget,
        })
      } else if (action === 'remove') {
        await removeLinkedInCampaign({
          accessToken,
          campaignId,
        })
      }
    } else if (providerId === 'facebook') {
      const accessToken = integration.accessToken

      if (!accessToken) {
        throw new BadRequestError('Meta credentials not configured')
      }

      if (action === 'enable' || action === 'pause') {
        await updateMetaCampaignStatus({
          accessToken,
          campaignId,
          status: action === 'enable' ? 'ACTIVE' : 'PAUSED',
        })
      } else if (action === 'updateBudget' && budget !== undefined) {
        await updateMetaCampaignBudget({
          accessToken,
          campaignId,
          dailyBudget: budget,
        })
      } else if (action === 'remove') {
        await removeMetaCampaign({
          accessToken,
          campaignId,
        })
      }
    }

    return { success: true, campaignId, action }
  }
)

