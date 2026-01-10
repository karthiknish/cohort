// =============================================================================
// GOOGLE ADS AUDIENCE TARGETING - Fetch and create audience targeting
// =============================================================================

import { googleAdsSearch } from './client'
import { GoogleAdsApiError } from './errors'
import {
    GOOGLE_API_BASE,
    GoogleAudienceTargeting,
    GoogleAdsApiErrorResponse,
} from './types'

export async function fetchGoogleAudienceTargeting(options: {
    accessToken: string
    developerToken: string
    customerId: string
    campaignId?: string
    adGroupId?: string
    loginCustomerId?: string | null
    maxRetries?: number
}): Promise<GoogleAudienceTargeting[]> {
    const {
        accessToken,
        developerToken,
        customerId,
        campaignId,
        adGroupId,
        loginCustomerId,
        maxRetries = 3,
    } = options

    const filters: string[] = ["ad_group_criterion.status != 'REMOVED'"]
    if (campaignId) filters.push(`campaign.id = ${campaignId}`)
    if (adGroupId) filters.push(`ad_group.id = ${adGroupId}`)

    const adGroupQuery = `
    SELECT
      ad_group.id,
      ad_group.name,
      campaign.id,
      campaign.name,
      ad_group_criterion.criterion_id,
      ad_group_criterion.type,
      ad_group_criterion.status,
      ad_group_criterion.negative,
      ad_group_criterion.age_range.type,
      ad_group_criterion.gender.type,
      ad_group_criterion.parental_status.type,
      ad_group_criterion.income_range.type,
      ad_group_criterion.user_interest.user_interest_category,
      ad_group_criterion.user_list.user_list,
      ad_group_criterion.keyword.text,
      ad_group_criterion.keyword.match_type,
      ad_group_criterion.placement.url,
      ad_group_criterion.topic.path,
      ad_group_criterion.language.language_constant,
      ad_group_criterion.combined_audience.combined_audience,
      ad_group_criterion.custom_audience.custom_audience,
      ad_group_criterion.device.type
    FROM ad_group_criterion
    WHERE ${filters.join(' AND ')}
    LIMIT 1000
  `.replace(/\s+/g, ' ').trim()

    const campaignFilters: string[] = ["campaign_criterion.status != 'REMOVED'"]
    if (campaignId) campaignFilters.push(`campaign.id = ${campaignId}`)

    const campaignQuery = `
    SELECT
      campaign.id,
      campaign.name,
      campaign_criterion.criterion_id,
      campaign_criterion.type,
      campaign_criterion.status,
      campaign_criterion.negative,
      campaign_criterion.location.geo_target_constant,
      campaign_criterion.language.language_constant,
      campaign_criterion.device.type,
      campaign_criterion.age_range.type,
      campaign_criterion.gender.type,
      campaign_criterion.user_list.user_list,
      campaign_criterion.custom_audience.custom_audience,
      campaign_criterion.combined_audience.combined_audience
    FROM campaign_criterion
    WHERE ${campaignFilters.join(' AND ')}
    LIMIT 1000
  `.replace(/\s+/g, ' ').trim()

    const [adGroupRows, campaignRows] = await Promise.all([
        googleAdsSearch({
            accessToken,
            developerToken,
            customerId,
            loginCustomerId,
            query: adGroupQuery,
            pageSize: 1000,
            maxPages: 10,
            maxRetries,
        }),
        adGroupId ? [] : googleAdsSearch({
            accessToken,
            developerToken,
            customerId,
            loginCustomerId,
            query: campaignQuery,
            pageSize: 1000,
            maxPages: 10,
            maxRetries,
        }),
    ])

    const targetingMap = new Map<string, GoogleAudienceTargeting>()

    function getOrCreateTargeting(id: string, type: 'adGroup' | 'campaign', name?: string, campaignId?: string, campaignName?: string): GoogleAudienceTargeting {
        const key = `${type}:${id}`
        if (!targetingMap.has(key)) {
            targetingMap.set(key, {
                entityId: id,
                entityType: type,
                adGroupId: type === 'adGroup' ? id : undefined,
                adGroupName: type === 'adGroup' ? name : undefined,
                campaignId: campaignId ?? id,
                campaignName: campaignName ?? (type === 'campaign' ? name : undefined),
                ageRanges: [],
                genders: [],
                parentalStatus: [],
                incomeRanges: [],
                affinityAudiences: [],
                inMarketAudiences: [],
                customAudiences: [],
                remarketingLists: [],
                locations: [],
                excludedLocations: [],
                languages: [],
                devices: [],
                platforms: [],
                keywords: [],
                topics: [],
                placements: [],
            })
        }
        return targetingMap.get(key)!
    }

    // Process Ad Group Rows
    for (const row of adGroupRows) {
        const adGroup = row.adGroup as { id?: string; name?: string } | undefined
        const campaign = row.campaign as { id?: string; name?: string } | undefined
        const criterion = row.adGroupCriterion as any

        if (!adGroup?.id) continue
        const targeting = getOrCreateTargeting(adGroup.id, 'adGroup', adGroup.name, campaign?.id, campaign?.name)
        processCriterion(targeting, criterion)
    }

    // Process Campaign Rows
    for (const row of campaignRows) {
        const campaign = row.campaign as { id?: string; name?: string } | undefined
        const criterion = row.campaignCriterion as any

        if (!campaign?.id) continue
        const targeting = getOrCreateTargeting(campaign.id, 'campaign', campaign.name)
        processCriterion(targeting, criterion)
    }

    function processCriterion(targeting: GoogleAudienceTargeting, criterion: any) {
        const type = criterion?.type
        const negative = criterion?.negative === true

        if (type === 'AGE_RANGE' && criterion?.ageRange?.type) {
            targeting.ageRanges.push(criterion.ageRange.type)
        } else if (type === 'GENDER' && criterion?.gender?.type) {
            targeting.genders.push(criterion.gender.type)
        } else if (type === 'PARENTAL_STATUS' && criterion?.parentalStatus?.type) {
            targeting.parentalStatus.push(criterion.parentalStatus.type)
        } else if (type === 'INCOME_RANGE' && criterion?.incomeRange?.type) {
            targeting.incomeRanges.push(criterion.incomeRange.type)
        } else if (type === 'USER_INTEREST' && criterion?.userInterest?.userInterestCategory) {
            const category = criterion.userInterest.userInterestCategory
            if (category.includes('AFFINITY')) {
                targeting.affinityAudiences.push({ id: category, name: category })
            } else {
                targeting.inMarketAudiences.push({ id: category, name: category })
            }
        } else if (type === 'USER_LIST' && criterion?.userList?.userList) {
            targeting.remarketingLists.push({
                id: criterion.userList.userList,
                name: criterion.userList.userList
            })
        } else if (type === 'CUSTOM_AUDIENCE' && criterion?.customAudience?.customAudience) {
            targeting.customAudiences.push({
                id: criterion.customAudience.customAudience,
                name: 'Custom Audience'
            })
        } else if (type === 'COMBINED_AUDIENCE' && criterion?.combinedAudience?.combinedAudience) {
            targeting.customAudiences.push({
                id: criterion.combinedAudience.combinedAudience,
                name: 'Combined Audience'
            })
        } else if (type === 'KEYWORD' && criterion?.keyword?.text) {
            targeting.keywords.push({
                text: criterion.keyword.text,
                matchType: criterion.keyword.matchType ?? 'BROAD',
            })
        } else if (type === 'PLACEMENT' && criterion?.placement?.url) {
            targeting.placements.push({
                url: criterion.placement.url,
                type: 'WEBSITE',
            })
        } else if (type === 'TOPIC' && criterion?.topic?.path) {
            targeting.topics.push({
                id: criterion.topic.path.join('/'),
                name: criterion.topic.path.join(' > '),
            })
        } else if (type === 'LANGUAGE' && criterion?.language?.languageConstant) {
            targeting.languages.push(criterion.language.languageConstant)
        } else if (type === 'LOCATION' && criterion?.location?.geoTargetConstant) {
            const loc = { id: criterion.location.geoTargetConstant, name: 'Location', type: 'LOCATION' }
            if (negative) {
                targeting.excludedLocations.push(loc)
            } else {
                targeting.locations.push(loc)
            }
        } else if (type === 'DEVICE' && criterion?.device?.type) {
            targeting.devices.push(criterion.device.type)
        }
    }

    return Array.from(targetingMap.values())
}

// =============================================================================
// CREATE AUDIENCE (USER LIST)
// =============================================================================

export async function createGoogleAudience(options: {
    accessToken: string
    developerToken: string
    customerId: string
    name: string
    description?: string
    segments: string[]
    loginCustomerId?: string | null
}): Promise<{ success: boolean; resourceName: string }> {
    const {
        accessToken,
        developerToken,
        customerId,
        name,
        description,
        loginCustomerId,
    } = options

    const url = `${GOOGLE_API_BASE}/customers/${customerId}/userLists:mutate`

    const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        'developer-token': developerToken,
        'Content-Type': 'application/json',
    }

    if (loginCustomerId) {
        headers['login-customer-id'] = loginCustomerId
    }

    const mutation = {
        operations: [{
            create: {
                name,
                description: description || `Created via Cohort Ads Hub`,
                membershipStatus: 'OPEN',
                membershipLifeSpan: '30', // Default 30 days
                crmBasedUserList: {
                    // This creates a basic CRM-based list placeholder
                    // In a real app, you'd add members or rules here
                    appId: 'cohort-app',
                }
            }
        }]
    }

    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(mutation),
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as GoogleAdsApiErrorResponse
        throw new GoogleAdsApiError({
            message: errorData?.error?.message ?? 'Audience creation failed',
            httpStatus: response.status,
            errorCode: 'MUTATION_ERROR',
        })
    }

    const result = await response.json()
    return {
        success: true,
        resourceName: result.results?.[0]?.resourceName
    }
}
