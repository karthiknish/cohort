import { z } from 'zod'
import { createApiHandler } from '@/lib/api-handler'
import { BadRequestError, NotFoundError, UnauthorizedError } from '@/lib/api-errors'
import { getAdIntegration } from '@/lib/firestore/admin'
import { ensureGoogleAccessToken, ensureMetaAccessToken, IntegrationTokenError } from '@/lib/integration-token-refresh'

import {
  fetchGoogleAudienceTargeting,
  GoogleAudienceTargeting,
} from '@/services/integrations/google-ads'

import {
  fetchTikTokAudienceTargeting,
  TikTokAudienceTargeting,
} from '@/services/integrations/tiktok-ads'

import {
  fetchLinkedInAudienceTargeting,
  LinkedInAudienceTargeting,
} from '@/services/integrations/linkedin-ads'

import {
  fetchMetaAudienceTargeting,
  MetaAudienceTargeting,
} from '@/services/integrations/meta-ads'

// =============================================================================
// SCHEMAS
// =============================================================================

const querySchema = z.object({
  providerId: z.enum(['google', 'tiktok', 'linkedin', 'facebook']),
  clientId: z.string().optional(),
  campaignId: z.string().optional(),
  adGroupId: z.string().optional(),
})

// =============================================================================
// TYPES
// =============================================================================

type NormalizedTargeting = {
  providerId: string
  entityId: string
  entityName?: string
  entityType: 'adGroup' | 'campaign'
  demographics: {
    ageRanges: string[]
    genders: string[]
    languages: string[]
  }
  audiences: {
    included: Array<{ id: string; name: string; type: string }>
    excluded: Array<{ id: string; name: string }>
  }
  locations: {
    included: Array<{ id: string; name: string; type: string }>
    excluded: Array<{ id: string; name: string }>
  }
  interests: Array<{ id: string; name: string; category?: string }>
  keywords: Array<{ text: string; matchType?: string }>
  devices: string[]
  placements: string[]
  professional?: {
    industries: Array<{ id: string; name: string }>
    jobTitles: Array<{ id: string; name: string }>
    companySizes: string[]
    seniorities: string[]
  }
  metaPlacements?: {
    facebook?: string[]
    instagram?: string[]
    audienceNetwork?: string[]
    messenger?: string[]
  }
}

// =============================================================================
// HELPERS
// =============================================================================

function normalizeGoogleTargeting(items: GoogleAudienceTargeting[]): NormalizedTargeting[] {
  return items.map((t) => ({
    providerId: 'google',
    entityId: t.adGroupId,
    entityName: t.adGroupName,
    entityType: 'adGroup' as const,
    demographics: {
      ageRanges: t.ageRanges,
      genders: t.genders,
      languages: t.languages,
    },
    audiences: {
      included: [
        ...t.affinityAudiences.map(a => ({ ...a, type: 'affinity' })),
        ...t.inMarketAudiences.map(a => ({ ...a, type: 'inMarket' })),
        ...t.customAudiences.map(a => ({ ...a, type: 'custom' })),
        ...t.remarketingLists.map(a => ({ ...a, type: 'remarketing' })),
      ],
      excluded: [],
    },
    locations: {
      included: t.locations,
      excluded: t.excludedLocations,
    },
    interests: t.topics.map(topic => ({ ...topic, category: 'topic' })),
    keywords: t.keywords,
    devices: [...t.devices, ...t.platforms],
    placements: t.placements.map(p => p.url),
  }))
}

function normalizeTikTokTargeting(items: TikTokAudienceTargeting[]): NormalizedTargeting[] {
  return items.map((t) => ({
    providerId: 'tiktok',
    entityId: t.adGroupId,
    entityName: t.adGroupName,
    entityType: 'adGroup' as const,
    demographics: {
      ageRanges: t.ageGroups,
      genders: t.genders,
      languages: t.languages,
    },
    audiences: {
      included: [
        ...t.customAudiences,
        ...t.lookalikAudiences.map(a => ({ id: a.id, name: a.name, type: 'lookalike' })),
      ],
      excluded: [],
    },
    locations: {
      included: t.locations,
      excluded: t.excludedLocations,
    },
    interests: [
      ...t.interestCategories.map(i => ({ ...i, category: 'interest' })),
      ...t.behaviors.map(b => ({ id: b.id, name: b.name, category: b.category })),
    ],
    keywords: t.interestKeywords.map(k => ({ text: k })),
    devices: [...t.operatingSystems, ...t.deviceModels],
    placements: t.placements,
  }))
}

function normalizeLinkedInTargeting(items: LinkedInAudienceTargeting[]): NormalizedTargeting[] {
  return items.map((t) => ({
    providerId: 'linkedin',
    entityId: t.campaignId,
    entityName: t.campaignName,
    entityType: 'campaign' as const,
    demographics: {
      ageRanges: t.ageRanges,
      genders: t.genders,
      languages: [],
    },
    audiences: {
      included: t.matchedAudiences,
      excluded: t.excludedAudiences,
    },
    locations: {
      included: t.locations,
      excluded: t.excludedLocations,
    },
    interests: [
      ...t.memberInterests,
      ...t.memberTraits,
    ],
    keywords: [],
    devices: [],
    placements: [],
    professional: {
      industries: t.industries,
      jobTitles: t.jobTitles,
      companySizes: t.companySizes,
      seniorities: t.jobSeniorities,
    },
  }))
}

function normalizeMetaTargeting(items: MetaAudienceTargeting[]): NormalizedTargeting[] {
  return items.map((t) => ({
    providerId: 'facebook',
    entityId: t.adSetId,
    entityName: t.adSetName,
    entityType: 'adGroup' as const,
    demographics: {
      ageRanges: t.ageMin && t.ageMax ? [`${t.ageMin}-${t.ageMax}`] : [],
      genders: t.genders.map(g => g === 1 ? 'male' : g === 2 ? 'female' : 'all'),
      languages: [],
    },
    audiences: {
      included: [
        ...t.customAudiences.map(a => ({ ...a, type: 'custom' })),
        ...t.lookalikeAudiences.map(a => ({ ...a, type: 'lookalike' })),
      ],
      excluded: t.excludedCustomAudiences,
    },
    locations: {
      included: t.geoLocations.map(l => ({ id: l.key, name: l.name, type: l.type })),
      excluded: t.excludedGeoLocations.map(l => ({ id: l.name, name: l.name })),
    },
    interests: [
      ...t.interests.map(i => ({ ...i, category: 'interest' })),
      ...t.behaviors.map(b => ({ ...b, category: 'behavior' })),
      ...(t.flexible_spec ?? []).flatMap(spec => [
        ...(spec.interests ?? []).map(i => ({ ...i, category: 'interest' })),
        ...(spec.behaviors ?? []).map(b => ({ ...b, category: 'behavior' })),
        ...(spec.demographics ?? []).map(d => ({ ...d, category: 'demographic' })),
        ...(spec.life_events ?? []).map(l => ({ ...l, category: 'life_event' })),
        ...(spec.industries ?? []).map(i => ({ ...i, category: 'industry' })),
        ...(spec.work_positions ?? []).map(w => ({ ...w, category: 'job_title' })),
        ...(spec.work_employers ?? []).map(e => ({ ...e, category: 'employer' })),
      ]),
    ],
    keywords: [],
    devices: t.devicePlatforms,
    placements: t.publisherPlatforms,
    metaPlacements: {
      facebook: t.facebookPositions,
      instagram: t.instagramPositions,
      audienceNetwork: t.audienceNetworkPositions,
      messenger: t.messengerPositions,
    }
  }))
}

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

    const { providerId, campaignId, adGroupId } = query
    const clientId = typeof query.clientId === 'string' && query.clientId.trim().length > 0
      ? query.clientId.trim()
      : null

    const integration = await getAdIntegration({ userId: auth.uid, providerId, clientId })
    if (!integration) {
      throw new NotFoundError(`${providerId} integration not found`)
    }

    let targeting: NormalizedTargeting[] = []

    if (providerId === 'google') {
      let accessToken: string
      try {
        accessToken = await ensureGoogleAccessToken({ userId: auth.uid, clientId })
      } catch (error: unknown) {
        if (error instanceof IntegrationTokenError) {
          throw new BadRequestError(error.message)
        }
        throw error
      }
      const developerToken = integration.developerToken ?? process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? ''
      const customerId = integration.accountId ?? ''
      const loginCustomerId = integration.loginCustomerId

      if (!customerId) {
        throw new BadRequestError('Google Ads customer ID not configured')
      }

      const googleTargeting = await fetchGoogleAudienceTargeting({
        accessToken,
        developerToken,
        customerId,
        campaignId,
        adGroupId,
        loginCustomerId,
      })

      targeting = normalizeGoogleTargeting(googleTargeting)
    } else if (providerId === 'tiktok') {
      const accessToken = integration.accessToken
      const advertiserId = integration.accountId

      if (!accessToken || !advertiserId) {
        throw new BadRequestError('TikTok credentials not configured')
      }

      const tiktokTargeting = await fetchTikTokAudienceTargeting({
        accessToken,
        advertiserId,
        campaignId,
        adGroupIds: adGroupId ? [adGroupId] : undefined,
      })

      targeting = normalizeTikTokTargeting(tiktokTargeting)
    } else if (providerId === 'linkedin') {
      const accessToken = integration.accessToken
      const accountId = integration.accountId

      if (!accessToken || !accountId) {
        throw new BadRequestError('LinkedIn credentials not configured')
      }

      const linkedInTargeting = await fetchLinkedInAudienceTargeting({
        accessToken,
        accountId,
        campaignId,
      })

      targeting = normalizeLinkedInTargeting(linkedInTargeting)
    } else if (providerId === 'facebook') {
      let accessToken: string
      try {
        accessToken = await ensureMetaAccessToken({ userId: auth.uid, clientId })
      } catch (error: unknown) {
        if (error instanceof IntegrationTokenError) {
          throw new BadRequestError(error.message)
        }
        throw error
      }
      const adAccountId = integration.accountId

      if (!adAccountId) {
        throw new BadRequestError('Meta ad account ID not configured. Finish setup to select an ad account.')
      }

      const metaTargeting = await fetchMetaAudienceTargeting({
        accessToken,
        adAccountId,
        campaignId,
      })

      targeting = normalizeMetaTargeting(metaTargeting)
    }

    // Generate insights summary
    const insights = {
      totalEntities: targeting.length,
      demographicCoverage: {
        hasAgeTargeting: targeting.some(t => t.demographics.ageRanges.length > 0),
        hasGenderTargeting: targeting.some(t => t.demographics.genders.length > 0),
        hasLocationTargeting: targeting.some(t => t.locations.included.length > 0),
      },
      audienceStats: {
        totalAudiences: targeting.reduce((sum, t) => sum + t.audiences.included.length, 0),
        hasCustomAudiences: targeting.some(t => t.audiences.included.some(a => a.type === 'custom')),
        hasRemarketingLists: targeting.some(t => t.audiences.included.some(a => a.type === 'remarketing')),
      },
      interestStats: {
        totalInterests: targeting.reduce((sum, t) => sum + t.interests.length, 0),
        totalKeywords: targeting.reduce((sum, t) => sum + t.keywords.length, 0),
      },
    }

    return { targeting, insights }
  }
)
