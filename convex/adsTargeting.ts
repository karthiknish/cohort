import { action } from './_generated/server'
import { v } from 'convex/values'
import { ErrorCode, Errors, isAppError, withErrorHandling } from './errors'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) {
    throw Errors.auth.unauthorized()
  }
}

function normalizeClientId(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function isTokenExpiringSoon(expiresAtMs: number | null | undefined): boolean {
  if (typeof expiresAtMs !== 'number' || !Number.isFinite(expiresAtMs)) return false
  const fiveMinutes = 5 * 60 * 1000
  return expiresAtMs - Date.now() <= fiveMinutes
}

export type NormalizedTargeting = {
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

function buildInsights(targeting: NormalizedTargeting[]) {
  return {
    totalEntities: targeting.length,
    demographicCoverage: {
      hasAgeTargeting: targeting.some((t) => t.demographics.ageRanges.length > 0),
      hasGenderTargeting: targeting.some((t) => t.demographics.genders.length > 0),
      hasLocationTargeting: targeting.some((t) => t.locations.included.length > 0),
    },
    audienceStats: {
      totalAudiences: targeting.reduce((sum, t) => sum + t.audiences.included.length, 0),
      hasCustomAudiences: targeting.some((t) => t.audiences.included.some((a) => a.type === 'custom')),
      hasRemarketingLists: targeting.some((t) => t.audiences.included.some((a) => a.type === 'remarketing')),
    },
    interestStats: {
      totalInterests: targeting.reduce((sum, t) => sum + t.interests.length, 0),
      totalKeywords: targeting.reduce((sum, t) => sum + t.keywords.length, 0),
    },
  }
}

function normalizeGoogleTargeting(items: import('@/services/integrations/google-ads').GoogleAudienceTargeting[]): NormalizedTargeting[] {
  return items.map((t) => ({
    providerId: 'google',
    entityId: t.entityId,
    entityName: t.adGroupName || t.campaignName || t.entityId,
    entityType: t.entityType,
    demographics: {
      ageRanges: t.ageRanges,
      genders: t.genders,
      languages: t.languages,
    },
    audiences: {
      included: [
        ...t.affinityAudiences.map((a) => ({ ...a, type: 'affinity' })),
        ...t.inMarketAudiences.map((a) => ({ ...a, type: 'inMarket' })),
        ...t.customAudiences.map((a) => ({ ...a, type: 'custom' })),
        ...t.remarketingLists.map((a) => ({ ...a, type: 'remarketing' })),
      ],
      excluded: [],
    },
    locations: {
      included: t.locations,
      excluded: t.excludedLocations,
    },
    interests: t.topics.map((topic) => ({ ...topic, category: 'topic' })),
    keywords: t.keywords,
    devices: [...t.devices, ...t.platforms],
    placements: t.placements.map((p) => p.url),
  }))
}

function normalizeTikTokTargeting(items: import('@/services/integrations/tiktok-ads').TikTokAudienceTargeting[]): NormalizedTargeting[] {
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
        ...t.lookalikAudiences.map((a) => ({ id: a.id, name: a.name, type: 'lookalike' })),
      ],
      excluded: [],
    },
    locations: {
      included: t.locations,
      excluded: t.excludedLocations,
    },
    interests: [
      ...t.interestCategories.map((i) => ({ ...i, category: 'interest' })),
      ...t.behaviors.map((b) => ({ id: b.id, name: b.name, category: b.category })),
    ],
    keywords: t.interestKeywords.map((k) => ({ text: k })),
    devices: [...t.operatingSystems, ...t.deviceModels],
    placements: t.placements,
  }))
}

function normalizeLinkedInTargeting(items: import('@/services/integrations/linkedin-ads').LinkedInAudienceTargeting[]): NormalizedTargeting[] {
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
    interests: [...t.memberInterests, ...t.memberTraits],
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

function normalizeMetaTargeting(items: import('@/services/integrations/meta-ads').MetaAudienceTargeting[]): NormalizedTargeting[] {
  return items.map((t) => ({
    providerId: 'facebook',
    entityId: t.adSetId,
    entityName: t.adSetName,
    entityType: 'adGroup' as const,
    demographics: {
      ageRanges: t.ageMin && t.ageMax ? [`${t.ageMin}-${t.ageMax}`] : [],
      genders: t.genders.map((g) => (g === 1 ? 'male' : g === 2 ? 'female' : 'all')),
      languages: [],
    },
    audiences: {
      included: [
        ...t.customAudiences.map((a) => ({ ...a, type: 'custom' })),
        ...t.lookalikeAudiences.map((a) => ({ ...a, type: 'lookalike' })),
      ],
      excluded: t.excludedCustomAudiences,
    },
    locations: {
      included: t.geoLocations.map((l) => ({ id: l.key, name: l.name, type: l.type })),
      excluded: t.excludedGeoLocations.map((l) => ({ id: l.name, name: l.name })),
    },
    interests: [
      ...t.interests.map((i) => ({ ...i, category: 'interest' })),
      ...t.behaviors.map((b) => ({ ...b, category: 'behavior' })),
      ...(t.flexible_spec ?? []).flatMap((spec) => [
        ...(Array.isArray(spec.interests) ? spec.interests : []).map((i) => ({ ...i, category: 'interest' })),
        ...(Array.isArray(spec.behaviors) ? spec.behaviors : []).map((b) => ({ ...b, category: 'behavior' })),
        ...(Array.isArray(spec.demographics) ? spec.demographics : []).map((d) => ({ ...d, category: 'demographic' })),
        ...(Array.isArray(spec.life_events) ? spec.life_events : []).map((l) => ({ ...l, category: 'life_event' })),
        ...(Array.isArray(spec.industries) ? spec.industries : []).map((i) => ({ ...i, category: 'industry' })),
        ...(Array.isArray(spec.work_positions) ? spec.work_positions : []).map((w) => ({ ...w, category: 'job_title' })),
        ...(Array.isArray(spec.work_employers) ? spec.work_employers : []).map((e) => ({ ...e, category: 'employer' })),
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
    },
  }))
}

export const getTargeting = action({
  args: {
    workspaceId: v.string(),
    providerId: v.union(v.literal('google'), v.literal('tiktok'), v.literal('linkedin'), v.literal('facebook')),
    clientId: v.optional(v.union(v.string(), v.null())),
    campaignId: v.optional(v.string()),
    adGroupId: v.optional(v.string()),
  },
  handler: async (ctx, args) => withErrorHandling(async () => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const clientId = normalizeClientId(args.clientId ?? null)

    let integration: any
    try {
      integration = await ctx.runQuery('adsIntegrations:getAdIntegration' as any, {
        workspaceId: args.workspaceId,
        providerId: args.providerId,
        clientId,
      })
    } catch (error) {
      if (isAppError(error, ErrorCode.RESOURCE.NOT_FOUND)) {
        const targeting: NormalizedTargeting[] = []
        return { targeting, insights: buildInsights(targeting) }
      }
      throw error
    }

    if (!integration.accessToken) {
      throw Errors.integration.missingToken(args.providerId)
    }

    if (isTokenExpiringSoon(integration.accessTokenExpiresAtMs)) {
      throw Errors.integration.expired(args.providerId)
    }

    let targeting: NormalizedTargeting[] = []

    if (args.providerId === 'google') {
      const { fetchGoogleAudienceTargeting } = await import('@/services/integrations/google-ads')

      const customerId = integration.accountId ?? ''
      if (!customerId) {
        throw Errors.integration.notConfigured('Google', 'Customer ID not configured')
      }

      const developerToken = integration.developerToken ?? process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? ''

      const googleTargeting = await fetchGoogleAudienceTargeting({
        accessToken: integration.accessToken,
        developerToken,
        customerId,
        campaignId: args.campaignId,
        adGroupId: args.adGroupId,
        loginCustomerId: integration.loginCustomerId,
      })

      targeting = normalizeGoogleTargeting(googleTargeting)
    } else if (args.providerId === 'tiktok') {
      const { fetchTikTokAudienceTargeting } = await import('@/services/integrations/tiktok-ads')

      const accessToken = integration.accessToken
      const advertiserId = integration.accountId

      if (!accessToken || !advertiserId) {
        throw Errors.integration.notConfigured('TikTok', 'Credentials not configured')
      }

      const tiktokTargeting = await fetchTikTokAudienceTargeting({
        accessToken,
        advertiserId,
        campaignId: args.campaignId,
        adGroupIds: args.adGroupId ? [args.adGroupId] : undefined,
      })

      targeting = normalizeTikTokTargeting(tiktokTargeting)
    } else if (args.providerId === 'linkedin') {
      const { fetchLinkedInAudienceTargeting } = await import('@/services/integrations/linkedin-ads')

      const accessToken = integration.accessToken
      const accountId = integration.accountId

      if (!accessToken || !accountId) {
        throw Errors.integration.notConfigured('LinkedIn', 'Credentials not configured')
      }

      const linkedInTargeting = await fetchLinkedInAudienceTargeting({
        accessToken,
        accountId,
        campaignId: args.campaignId,
      })

      targeting = normalizeLinkedInTargeting(linkedInTargeting)
    } else if (args.providerId === 'facebook') {
      const { fetchMetaAudienceTargeting } = await import('@/services/integrations/meta-ads')

      const adAccountId = integration.accountId
      if (!adAccountId) {
        throw Errors.integration.notConfigured('Meta', 'Ad account ID not configured')
      }

      const metaTargeting = await fetchMetaAudienceTargeting({
        accessToken: integration.accessToken,
        adAccountId,
        campaignId: args.campaignId,
      })

      targeting = normalizeMetaTargeting(metaTargeting)
    }

    return { targeting, insights: buildInsights(targeting) }
  }, 'adsTargeting:getTargeting', { maxRetries: 3 }),
})
