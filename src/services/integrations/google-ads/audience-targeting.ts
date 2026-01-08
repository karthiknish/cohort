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

    let filters = ''
    if (campaignId) filters += ` AND campaign.id = ${campaignId}`
    if (adGroupId) filters += ` AND ad_group.id = ${adGroupId}`

    // Query ad group criteria for targeting
    const query = `
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
      ad_group_criterion.language.language_constant
    FROM ad_group_criterion
    WHERE ad_group_criterion.status != 'REMOVED'
    ${filters}
    LIMIT 1000
  `.replace(/\s+/g, ' ').trim()

    const rows = await googleAdsSearch({
        accessToken,
        developerToken,
        customerId,
        loginCustomerId,
        query,
        pageSize: 1000,
        maxPages: 1,
        maxRetries,
    })

    // Group by ad group
    const targetingMap = new Map<string, GoogleAudienceTargeting>()

    for (const row of rows) {
        const adGroup = row.adGroup as { id?: string; name?: string } | undefined
        const campaign = row.campaign as { id?: string; name?: string } | undefined
        const criterion = row.adGroupCriterion as {
            criterionId?: string
            type?: string
            status?: string
            negative?: boolean
            ageRange?: { type?: string }
            gender?: { type?: string }
            parentalStatus?: { type?: string }
            incomeRange?: { type?: string }
            userInterest?: { userInterestCategory?: string }
            userList?: { userList?: string }
            keyword?: { text?: string; matchType?: string }
            placement?: { url?: string }
            topic?: { path?: string[] }
            language?: { languageConstant?: string }
        } | undefined

        const adGroupIdValue = adGroup?.id ?? ''
        if (!adGroupIdValue) continue

        if (!targetingMap.has(adGroupIdValue)) {
            targetingMap.set(adGroupIdValue, {
                adGroupId: adGroupIdValue,
                adGroupName: adGroup?.name,
                campaignId: campaign?.id ?? '',
                campaignName: campaign?.name,
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

        const targeting = targetingMap.get(adGroupIdValue)!
        const type = criterion?.type

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
            // Affinity vs In-Market determined by category prefix
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
