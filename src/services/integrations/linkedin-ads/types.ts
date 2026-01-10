// =============================================================================
// LINKEDIN ADS API TYPES
// =============================================================================

import { NormalizedMetric } from '@/types/integrations'

// =============================================================================
// ERROR CODES
// =============================================================================

export const LINKEDIN_ERROR_CODES = {
  // HTTP Status Codes
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,

  // LinkedIn Specific
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  INVALID_PARAMETER: 'INVALID_PARAMETER',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  ACCOUNT_NOT_FOUND: 'ACCOUNT_NOT_FOUND',
} as const

export type LinkedInErrorCode = (typeof LINKEDIN_ERROR_CODES)[keyof typeof LINKEDIN_ERROR_CODES]

// =============================================================================
// ERROR TYPES
// =============================================================================

export interface LinkedInApiErrorDetail {
  code?: string
  message?: string
  status?: number
  serviceErrorCode?: number
}

export interface LinkedInApiErrorResponse {
  status?: number
  serviceErrorCode?: number
  code?: string
  message?: string
}

// =============================================================================
// API TYPES
// =============================================================================

export interface LinkedInAdsOptions {
  accessToken: string
  accountId: string
  timeframeDays: number
  maxRetries?: number
  refreshAccessToken?: () => Promise<string>
  onRateLimitHit?: (retryAfterMs: number) => void
  onTokenRefresh?: () => void
}

export type { RetryConfig } from '../shared/retry'

export interface LinkedInAdAccount {
  id: string
  name: string
  status?: string
  currency?: string
}

export type LinkedInAnalyticsRow = {
  timeRange?: {
    start?: string
    end?: string
  }
  costInLocalCurrency?: unknown
  impressions?: unknown
  clicks?: unknown
  conversions?: unknown
  externalWebsiteConversionsValue?: unknown
  creative?: string
  campaign?: string
  campaignGroup?: string
  [key: string]: unknown
}

// =============================================================================
// CAMPAIGN TYPES
// =============================================================================

export type LinkedInCampaign = {
  id: string
  name: string
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DRAFT' | 'CANCELED'
  dailyBudget?: number
  totalBudget?: number
  costType?: string
  objectiveType?: string
  campaignGroupId?: string
}

export type LinkedInCampaignGroup = {
  id: string
  name: string
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DRAFT' | 'CANCELED'
  dailyBudget?: number
  totalBudget?: number
  costType?: string
}

export type LinkedInAd = {
  id: string
  campaignId: string
  campaignGroupId?: string
  name?: string
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DRAFT'
  creativeId: string
  type?: string
}

export type LinkedInCreativeMetric = {
  creativeId: string
  campaignId: string
  campaignGroupId?: string
  date: string
  impressions: number
  clicks: number
  spend: number
  conversions: number
  revenue: number
}

// =============================================================================
// CREATIVE TYPES
// =============================================================================

export type LinkedInCreative = {
  creativeId: string
  campaignId: string
  campaignGroupId?: string
  campaignName?: string
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DRAFT'
  type: 'SPONSORED_STATUS_UPDATE' | 'SPONSORED_INMAILS' | 'TEXT_AD' | 'DYNAMIC' | 'VIDEO' | 'OTHER'
  title?: string
  description?: string
  headline?: string
  callToAction?: string
  landingPageUrl?: string
  imageUrl?: string
  videoUrl?: string
}

// =============================================================================
// AUDIENCE TARGETING TYPES
// =============================================================================

export type LinkedInAudienceTargeting = {
  campaignId: string
  campaignName?: string
  // Demographics
  ageRanges: string[]
  genders: string[]
  // Professional
  industries: Array<{ id: string; name: string }>
  companySizes: string[]
  jobTitles: Array<{ id: string; name: string }>
  jobFunctions: Array<{ id: string; name: string }>
  jobSeniorities: string[]
  skills: Array<{ id: string; name: string }>
  degrees: string[]
  fieldsOfStudy: Array<{ id: string; name: string }>
  memberSchools: Array<{ id: string; name: string }>
  // Company
  companyNames: Array<{ id: string; name: string }>
  companyFollowers: boolean
  companyConnections: Array<{ id: string; name: string }>
  // Location
  locations: Array<{ id: string; name: string; type: string }>
  excludedLocations: Array<{ id: string; name: string }>
  // Audiences
  matchedAudiences: Array<{ id: string; name: string; type: string }>
  excludedAudiences: Array<{ id: string; name: string }>
  // Interests
  memberInterests: Array<{ id: string; name: string }>
  memberTraits: Array<{ id: string; name: string }>
  memberGroups: Array<{ id: string; name: string }>
}

// =============================================================================
// RE-EXPORT
// =============================================================================

export type { NormalizedMetric }

