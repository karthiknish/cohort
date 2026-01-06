// =============================================================================
// TIKTOK ADS API TYPES
// =============================================================================

import { NormalizedMetric } from '@/types/integrations'

// =============================================================================
// ERROR CODES
// Reference: https://business-api.tiktok.com/portal/docs?id=1737172488964097
// =============================================================================

export const TIKTOK_ERROR_CODES = {
  // Success
  OK: 0,
  
  // Authentication Errors
  UNAUTHORIZED: 40001,
  ACCESS_TOKEN_INVALID: 40002,
  ACCESS_TOKEN_EXPIRED: 40003,
  TOKEN_REVOKED: 40004,
  PERMISSION_DENIED: 40100,
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 40100,
  QPS_LIMIT: 40101,
  DAILY_LIMIT: 40102,
  
  // Request Errors
  INVALID_PARAMS: 40000,
  RESOURCE_NOT_FOUND: 40400,
  METHOD_NOT_ALLOWED: 40500,
  
  // Server Errors
  INTERNAL_ERROR: 50000,
  SERVICE_UNAVAILABLE: 50300,
  GATEWAY_TIMEOUT: 50400,
  
  // Business Errors
  ADVERTISER_NOT_FOUND: 40401,
  CAMPAIGN_NOT_FOUND: 40402,
  INSUFFICIENT_BALANCE: 40301,
} as const

export type TikTokErrorCode = (typeof TIKTOK_ERROR_CODES)[keyof typeof TIKTOK_ERROR_CODES]

// =============================================================================
// ERROR TYPES
// =============================================================================

export interface TikTokApiErrorResponse {
  code?: number
  message?: string
  request_id?: string
  data?: unknown
}

// =============================================================================
// API TYPES
// =============================================================================

export interface TikTokAdAccount {
  id: string
  name: string
  status?: string
  currency?: string
  timezone?: string
}

export interface TikTokMetricsOptions {
  accessToken: string
  advertiserId: string
  timeframeDays: number
  maxPages?: number
  maxRetries?: number
  refreshAccessToken?: () => Promise<string>
  onRateLimitHit?: (retryAfterMs: number) => void
  onTokenRefresh?: () => void
}

export interface RetryConfig {
  maxRetries: number
  baseDelayMs: number
  maxDelayMs: number
  jitterFactor: number
}

export type TikTokReportRow = {
  metrics?: Record<string, unknown>
  dimensions?: Record<string, unknown>
}

export type TikTokReportResponse = {
  code?: number
  message?: string
  request_id?: string
  data?: {
    list?: TikTokReportRow[]
    page_info?: {
      page?: number
      page_size?: number
      total_number?: number
      total_page?: number
      has_more?: boolean
    }
    cursor?: string
  }
}

// =============================================================================
// CAMPAIGN TYPES
// =============================================================================

export type TikTokCampaign = {
  id: string
  name: string
  status: 'ENABLE' | 'DISABLE' | 'DELETE'
  budgetMode: 'BUDGET_MODE_DAY' | 'BUDGET_MODE_TOTAL' | 'BUDGET_MODE_INFINITE'
  budget?: number
  objective?: string
}

export type TikTokAdMetric = {
  adId: string
  adGroupId: string
  campaignId: string
  adName?: string
  adGroupName?: string
  campaignName?: string
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

export type TikTokCreative = {
  adId: string
  adGroupId: string
  campaignId: string
  adName?: string
  adGroupName?: string
  campaignName?: string
  status: 'ENABLE' | 'DISABLE' | 'DELETE'
  format?: string
  imageUrl?: string
  videoId?: string
  videoUrl?: string
  thumbnailUrl?: string
  title?: string
  description?: string
  callToAction?: string
  landingPageUrl?: string
  displayName?: string
  profileImage?: string
}

// =============================================================================
// AUDIENCE TARGETING TYPES
// =============================================================================

export type TikTokAudienceTargeting = {
  adGroupId: string
  adGroupName?: string
  campaignId: string
  campaignName?: string
  // Demographics
  ageGroups: string[]
  genders: string[]
  languages: string[]
  // Location
  locations: Array<{ id: string; name: string; type: string }>
  excludedLocations: Array<{ id: string; name: string }>
  // Interests & Behaviors
  interestCategories: Array<{ id: string; name: string }>
  interestKeywords: string[]
  behaviors: Array<{ id: string; name: string; category: string }>
  // Audiences
  customAudiences: Array<{ id: string; name: string; type: string }>
  lookalikAudiences: Array<{ id: string; name: string; sourceType: string }>
  // Device & Network
  operatingSystems: string[]
  deviceModels: string[]
  networkTypes: string[]
  carriers: string[]
  // Placements
  placements: string[]
  // Schedule
  scheduledDelivery?: {
    timezone: string
    dayParting: Array<{ day: string; hours: number[] }>
  }
}

// =============================================================================
// RE-EXPORT
// =============================================================================

export type { NormalizedMetric }

