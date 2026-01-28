// =============================================================================
// LINKEDIN ADS CAMPAIGNS - List Operations
// =============================================================================

import {
  normalizeCurrency,
  coerceNumber,
} from '../client'
import { linkedinAdsClient } from '@/services/integrations/shared/base-client'
import {
  LinkedInCampaign,
  LinkedInCampaignGroup,
  LinkedInAd,
} from '../types'

// =============================================================================
// LIST CAMPAIGNS
// =============================================================================

export async function listLinkedInCampaigns(options: {
  accessToken: string
  accountId: string
  statusFilter?: ('ACTIVE' | 'PAUSED' | 'ARCHIVED')[]
  maxRetries?: number
}): Promise<LinkedInCampaign[]> {
  const {
    accessToken,
    accountId,
    statusFilter = ['ACTIVE', 'PAUSED'],
    maxRetries = 3,
  } = options

  const params = new URLSearchParams({
    q: 'search',
    'search.account.values[0]': `urn:li:sponsoredAccount:${accountId}`,
    count: '100',
  })

  statusFilter.forEach((status, index) => {
    params.set(`search.status.values[${index}]`, status)
  })

  const url = `https://api.linkedin.com/v2/adCampaignsV2?${params.toString()}`

  const { payload } = await linkedinAdsClient.executeRequest<{
    elements?: Array<{
      id?: string
      name?: string
      status?: string
      dailyBudget?: { amount?: string; currencyCode?: string }
      totalBudget?: { amount?: string; currencyCode?: string }
      costType?: string
      objectiveType?: string
    }>
  }>({
    url,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
      'Linkedin-Version': '202310',
    },
    operation: 'listCampaigns',
    maxRetries,
  })

  const elements = Array.isArray(payload?.elements) ? payload.elements : []

  return elements.map((item: any) => {
    const id = typeof item.id === 'string' ? item.id.replace('urn:li:sponsoredCampaign:', '') : ''
    const campaignGroupId = item.campaignGroup?.replace('urn:li:sponsoredCampaignGroup:', '')

    return {
      id,
      name: item.name ?? '',
      status: (item.status ?? 'PAUSED') as 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DRAFT' | 'CANCELED',
      dailyBudget: item.dailyBudget?.amount ? parseFloat(item.dailyBudget.amount) : undefined,
      totalBudget: item.totalBudget?.amount ? parseFloat(item.totalBudget.amount) : undefined,
      costType: item.costType,
      objectiveType: item.objectiveType,
      campaignGroupId,
    }
  })
}

// =============================================================================
// LIST CAMPAIGN GROUPS
// =============================================================================

export async function listLinkedInCampaignGroups(options: {
  accessToken: string
  accountId: string
  statusFilter?: ('ACTIVE' | 'PAUSED' | 'ARCHIVED')[]
  maxRetries?: number
}): Promise<LinkedInCampaignGroup[]> {
  const {
    accessToken,
    accountId,
    statusFilter = ['ACTIVE', 'PAUSED'],
    maxRetries = 3,
  } = options

  const params = new URLSearchParams({
    q: 'search',
    'search.account.values[0]': `urn:li:sponsoredAccount:${accountId}`,
    count: '100',
  })

  statusFilter.forEach((status, index) => {
    params.set(`search.status.values[${index}]`, status)
  })

  const url = `https://api.linkedin.com/v2/adCampaignGroupsV2?${params.toString()}`

  const { payload } = await linkedinAdsClient.executeRequest<{
    elements?: Array<{
      id?: string
      name?: string
      status?: string
      totalBudget?: { amount?: string; currencyCode?: string }
    }>
  }>({
    url,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
      'Linkedin-Version': '202310',
    },
    operation: 'listCampaignGroups',
    maxRetries,
  })

  const elements = Array.isArray(payload?.elements) ? payload.elements : []

  return elements.map((item) => {
    const id = typeof item.id === 'string' ? item.id.replace('urn:li:sponsoredCampaignGroup:', '') : ''

    return {
      id,
      name: item.name ?? '',
      status: (item.status ?? 'PAUSED') as 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DRAFT' | 'CANCELED',
      totalBudget: item.totalBudget?.amount ? parseFloat(item.totalBudget.amount) : undefined,
    }
  })
}

// =============================================================================
// LIST ADS
// =============================================================================

export async function fetchLinkedInAds(options: {
  accessToken: string
  accountId: string
  campaignId?: string
  statusFilter?: ('ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DRAFT')[]
  maxRetries?: number
}): Promise<LinkedInAd[]> {
  const {
    accessToken,
    accountId,
    campaignId,
    statusFilter = ['ACTIVE', 'PAUSED'],
    maxRetries = 3,
  } = options

  const params = new URLSearchParams({
    q: 'search',
    'search.account.values[0]': `urn:li:sponsoredAccount:${accountId}`,
    count: '100',
  })

  statusFilter.forEach((status, index) => {
    params.set(`search.status.values[${index}]`, status)
  })

  if (campaignId) {
    params.set('search.campaign.values[0]', `urn:li:sponsoredCampaign:${campaignId}`)
  }

  const url = `https://api.linkedin.com/v2/adAdsV2?${params.toString()}`

  const { payload } = await linkedinAdsClient.executeRequest<{
    elements?: Array<{
      id?: string
      campaign?: string
      status?: string
      creative?: string
      type?: string
      name?: string
    }>
  }>({
    url,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
      'Linkedin-Version': '202310',
    },
    operation: 'fetchAds',
    maxRetries,
  })

  const elements = Array.isArray(payload?.elements) ? payload.elements : []

  return elements.map((item) => {
    const id = typeof item.id === 'string' ? item.id.replace('urn:li:sponsoredAd:', '') : ''
    const campaignIdFromItem = item.campaign?.replace('urn:li:sponsoredCampaign:', '') ?? ''
    const creativeId = item.creative?.replace('urn:li:sponsoredCreative:', '') ?? ''

    return {
      id,
      campaignId: campaignIdFromItem,
      name: item.name,
      status: (item.status ?? 'PAUSED') as 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DRAFT',
      creativeId,
      type: item.type,
    }
  })
}
