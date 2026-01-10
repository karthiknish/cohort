// =============================================================================
// GOOGLE ADS API TYPES
// =============================================================================

import { NormalizedMetric } from '@/types/integrations'

export const GOOGLE_API_VERSION = 'v15'
export const GOOGLE_API_BASE = `https://googleads.googleapis.com/${GOOGLE_API_VERSION}`

// =============================================================================
// ERROR CODES
// Reference: https://developers.google.com/google-ads/api/docs/common-errors
// =============================================================================

export const GOOGLE_ADS_ERROR_CODES = {
  // Authentication Errors
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  OAUTH_TOKEN_INVALID: 'OAUTH_TOKEN_INVALID',
  OAUTH_TOKEN_EXPIRED: 'OAUTH_TOKEN_EXPIRED',
  OAUTH_TOKEN_REVOKED: 'OAUTH_TOKEN_REVOKED',
  CUSTOMER_NOT_ENABLED: 'CUSTOMER_NOT_ENABLED',
  USER_PERMISSION_DENIED: 'USER_PERMISSION_DENIED',
  DEVELOPER_TOKEN_NOT_APPROVED: 'DEVELOPER_TOKEN_NOT_APPROVED',
  DEVELOPER_TOKEN_PROHIBITED: 'DEVELOPER_TOKEN_PROHIBITED',

  // Rate Limiting
  RATE_EXCEEDED: 'RATE_EXCEEDED',
  RESOURCE_EXHAUSTED: 'RESOURCE_EXHAUSTED',
  RESOURCE_TEMPORARILY_EXHAUSTED: 'RESOURCE_TEMPORARILY_EXHAUSTED',

  // Request Errors
  REQUEST_ERROR: 'REQUEST_ERROR',
  INVALID_CUSTOMER_ID: 'INVALID_CUSTOMER_ID',
  CUSTOMER_NOT_FOUND: 'CUSTOMER_NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  TRANSIENT_ERROR: 'TRANSIENT_ERROR',
  UNKNOWN: 'UNKNOWN',

  // Query Errors
  QUERY_ERROR: 'QUERY_ERROR',
  UNSPECIFIED: 'UNSPECIFIED',
} as const

export type GoogleAdsErrorCode = (typeof GOOGLE_ADS_ERROR_CODES)[keyof typeof GOOGLE_ADS_ERROR_CODES]

// =============================================================================
// ERROR TYPES
// =============================================================================

export interface GoogleAdsErrorDetail {
  errorCode?: {
    [key: string]: string | undefined
  }
  message?: string
  trigger?: string
  location?: {
    fieldPathElements?: Array<{ fieldName?: string; index?: number }>
  }
}

export interface GoogleAdsApiErrorResponse {
  error?: {
    code?: number
    message?: string
    status?: string
    details?: Array<{
      '@type'?: string
      errors?: GoogleAdsErrorDetail[]
      requestId?: string
    }>
  }
}

// =============================================================================
// API TYPES
// =============================================================================

export interface GoogleAdsOptions {
  accessToken: string
  developerToken?: string | null
  customerId: string
  loginCustomerId?: string | null
  managerCustomerId?: string | null
  timeframeDays: number
  pageSize?: number
  maxPages?: number
  maxRetries?: number
  refreshAccessToken?: () => Promise<string>
  onRateLimitHit?: (retryAfterMs: number) => void
  onTokenRefresh?: () => void
}

export type { RetryConfig } from '../shared/retry'

export type GoogleAdsResult = {
  segments?: {
    date?: string
  }
  metrics?: {
    costMicros?: unknown
    cost_micros?: unknown
    conversions?: unknown
    conversionsValue?: unknown
    conversions_value?: unknown
    impressions?: unknown
    clicks?: unknown
  }
  campaign?: {
    id?: string
    name?: string
    status?: string
    startDate?: string
    endDate?: string
    advertisingChannelType?: string
    biddingStrategyType?: string
    targetCpa?: { targetCpaMicros?: string }
    targetRoas?: { targetRoas?: number }
    maximizeConversions?: { targetCpaMicros?: string }
    maximizeConversionValue?: { targetRoas?: number }
    adSchedule?: Array<{
      dayOfWeek?: string
      startHour?: number
      startMinute?: string
      endHour?: number
      endMinute?: string
    }>
  }
  campaignBudget?: {
    id?: string
    amountMicros?: string
  }
  adGroup?: {
    id?: string
    name?: string
  }
  adGroupAd?: {
    ad?: {
      id?: string
      finalUrls?: string[]
      responsiveSearchAd?: {
        headlines?: Array<{ text?: string }>
        descriptions?: Array<{ text?: string }>
      }
    }
  }
  customer?: {
    id?: string
    descriptiveName?: string
    currencyCode?: string
    manager?: boolean
  }
  customerClient?: {
    clientCustomer?: string
    descriptiveName?: string
    currencyCode?: string
    manager?: boolean
  }
  [key: string]: unknown
}

export type GoogleAdsSearchResponse = {
  results?: GoogleAdsResult[]
  nextPageToken?: string
  fieldMask?: string
}

export type CustomerSummary = {
  id: string
  name: string
  currencyCode?: string | null
  manager: boolean
}

export type GoogleAdAccount = {
  id: string
  name: string
  currencyCode?: string | null
  manager: boolean
  loginCustomerId?: string | null
  managerCustomerId?: string | null
}

export type GoogleAccessibleCustomersResponse = {
  resourceNames?: string[]
}

// =============================================================================
// CAMPAIGN TYPES
// =============================================================================

export type GoogleCampaign = {
  id: string
  name: string
  status: 'ENABLED' | 'PAUSED' | 'REMOVED'
  budgetAmountMicros?: number
  budgetId?: string
  biddingStrategyType?: string
  biddingStrategyInfo?: {
    targetCpaMicros?: number
    targetRoas?: number
  }
  adSchedule?: Array<{
    dayOfWeek: string
    startHour: number
    endHour: number
  }>
  startDate?: string
  endDate?: string
  advertisingChannelType?: string
}

export type GoogleAdGroup = {
  id: string
  campaignId: string
  name: string
  status: 'ENABLED' | 'PAUSED' | 'REMOVED'
  cpcBidMicros?: number
}

export type GoogleAdMetric = {
  adId: string
  adGroupId: string
  campaignId: string
  headline?: string
  description?: string
  finalUrl?: string
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

export type GoogleCreative = {
  adId: string
  adGroupId: string
  campaignId: string
  adGroupName?: string
  campaignName?: string
  type: 'RESPONSIVE_SEARCH_AD' | 'RESPONSIVE_DISPLAY_AD' | 'IMAGE_AD' | 'VIDEO_AD' | 'APP_AD' | 'CALL_ONLY_AD' | 'HOTEL_AD' | 'PERFORMANCE_MAX_AD' | 'SMART_DISPLAY_AD' | 'DISPLAY_AD' | 'SEARCH_AD' | 'OTHER'
  status: 'ENABLED' | 'PAUSED' | 'REMOVED'
  headlines: string[]
  descriptions: string[]
  finalUrls: string[]
  displayUrl?: string
  imageUrl?: string
  videoId?: string
  businessName?: string
  callToAction?: string
}

// =============================================================================
// AUDIENCE TARGETING TYPES
// =============================================================================

export type GoogleAudienceTargeting = {
  entityId: string
  entityType: 'adGroup' | 'campaign'
  adGroupId?: string
  adGroupName?: string
  campaignId: string
  campaignName?: string
  // Demographics
  ageRanges: string[]
  genders: string[]
  parentalStatus: string[]
  incomeRanges: string[]
  // Audiences
  affinityAudiences: Array<{ id: string; name: string }>
  inMarketAudiences: Array<{ id: string; name: string }>
  customAudiences: Array<{ id: string; name: string }>
  remarketingLists: Array<{ id: string; name: string }>
  // Geo & Language
  locations: Array<{ id: string; name: string; type: string }>
  excludedLocations: Array<{ id: string; name: string }>
  languages: string[]
  // Device & Placements
  devices: string[]
  platforms: string[]
  // Keywords & Topics
  keywords: Array<{ text: string; matchType: string }>
  topics: Array<{ id: string; name: string }>
  placements: Array<{ url: string; type: string }>
}

// =============================================================================
// RE-EXPORT
// =============================================================================

export type { NormalizedMetric }

