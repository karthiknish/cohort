// =============================================================================
// LINKEDIN ADS CAMPAIGNS - Audience Targeting Operations
// =============================================================================

import { linkedinAdsClient } from '@/services/integrations/shared/base-client'
import { LinkedInAudienceTargeting } from '../types'

type TargetingFacet = {
  type?: string
  values?: string[]
  excluded?: boolean
}

// =============================================================================
// FETCH AUDIENCE TARGETING
// =============================================================================

export async function fetchLinkedInAudienceTargeting(options: {
  accessToken: string
  accountId: string
  campaignId?: string
  maxRetries?: number
}): Promise<LinkedInAudienceTargeting[]> {
  const {
    accessToken,
    accountId,
    campaignId,
    maxRetries = 3,
  } = options

  const params = new URLSearchParams({
    q: 'search',
    'search.account.values[0]': `urn:li:sponsoredAccount:${accountId}`,
    count: '100',
  })

  if (campaignId) {
    params.set('ids[0]', `urn:li:sponsoredCampaign:${campaignId}`)
  }

  const url = `https://api.linkedin.com/v2/adCampaignsV2?${params.toString()}`

  const { payload } = await linkedinAdsClient.executeRequest<{
    elements?: Array<{
      id?: string
      name?: string
      targetingCriteria?: {
        include?: {
          and?: Array<{
            or?: TargetingFacet
          }>
        }
        exclude?: {
          or?: TargetingFacet
        }
      }
    }>
  }>({
    url,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
      'LinkedIn-Version': '202310',
    },
    operation: 'fetchAudienceTargeting',
    maxRetries,
  })

  const elements = Array.isArray(payload?.elements) ? payload.elements : []

  return elements.map((item) => {
    const campaignIdValue = item.id?.replace('urn:li:sponsoredCampaign:', '') ?? ''
    const criteria = item.targetingCriteria

    const targeting: LinkedInAudienceTargeting = {
      campaignId: campaignIdValue,
      campaignName: item.name,
      ageRanges: [],
      genders: [],
      industries: [],
      companySizes: [],
      jobTitles: [],
      jobFunctions: [],
      jobSeniorities: [],
      skills: [],
      degrees: [],
      fieldsOfStudy: [],
      memberSchools: [],
      companyNames: [],
      companyFollowers: false,
      companyConnections: [],
      locations: [],
      excludedLocations: [],
      matchedAudiences: [],
      excludedAudiences: [],
      memberInterests: [],
      memberTraits: [],
      memberGroups: [],
    }

    // Parse include criteria
    const includeCriteria = criteria?.include?.and ?? []
    for (const criterionGroup of includeCriteria) {
      const facet = criterionGroup.or
      if (!facet?.type || !facet?.values) continue

      const type = facet.type
      const values = facet.values

      if (type.includes('ageRange')) {
        targeting.ageRanges.push(...values)
      } else if (type.includes('gender')) {
        targeting.genders.push(...values)
      } else if (type.includes('industry')) {
        values.forEach(v => targeting.industries.push({ id: v, name: v }))
      } else if (type.includes('companySize')) {
        targeting.companySizes.push(...values)
      } else if (type.includes('title')) {
        values.forEach(v => targeting.jobTitles.push({ id: v, name: v }))
      } else if (type.includes('function')) {
        values.forEach(v => targeting.jobFunctions.push({ id: v, name: v }))
      } else if (type.includes('seniority')) {
        targeting.jobSeniorities.push(...values)
      } else if (type.includes('skill')) {
        values.forEach(v => targeting.skills.push({ id: v, name: v }))
      } else if (type.includes('location')) {
        values.forEach(v => targeting.locations.push({ id: v, name: v, type: 'LOCATION' }))
      } else if (type.includes('interest')) {
        values.forEach(v => targeting.memberInterests.push({ id: v, name: v }))
      } else if (type.includes('audience')) {
        values.forEach(v => targeting.matchedAudiences.push({ id: v, name: v, type: 'matched' }))
      }
    }

    // Parse exclude criteria
    const excludeFacet = criteria?.exclude?.or
    if (excludeFacet?.type?.includes('audience') && excludeFacet?.values) {
      excludeFacet.values.forEach(v => targeting.excludedAudiences.push({ id: v, name: v }))
    }

    return targeting
  })
}

// =============================================================================
// CREATE AUDIENCE (AD SEGMENT)
// =============================================================================

export async function createLinkedInAudience(options: {
  accessToken: string
  accountId: string
  name: string
  description?: string
  segments: string[]
  maxRetries?: number
}): Promise<{ success: boolean; id: string }> {
  const {
    accessToken,
    accountId,
    name,
    description,
    maxRetries = 3,
  } = options

  const url = `https://api.linkedin.com/v2/adSegments`

  const body = {
    account: `urn:li:sponsoredAccount:${accountId}`,
    name,
    description: description || `Created via Cohort Ads Hub`,
    type: 'MATCHED_AUDIENCE',
    status: 'ACTIVE'
  }

  const { payload } = await linkedinAdsClient.executeRequest<{ id?: string }>({
    url,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
      'Linkedin-Version': '202310',
    },
    body: JSON.stringify(body),
    operation: 'createAudience',
    maxRetries,
  })

  return {
    success: true,
    id: payload.id || ''
  }
}
