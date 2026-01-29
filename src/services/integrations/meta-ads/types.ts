// =============================================================================
// META ADS API TYPES
// =============================================================================

import { NormalizedMetric } from '@/types/integrations'

// =============================================================================
// ERROR CODES
// Reference: https://developers.facebook.com/docs/marketing-api/error-reference
// =============================================================================

export const META_ERROR_CODES = {
  // OAuth & Authentication
  OAUTH_EXCEPTION: 190,
  INVALID_ACCESS_TOKEN: 190,
  ACCESS_TOKEN_EXPIRED: 463,
  PASSWORD_CHANGED: 464,

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 4,
  TOO_MANY_CALLS: 17,
  USER_RATE_LIMIT: 17,
  APP_RATE_LIMIT: 4,
  ACCOUNT_RATE_LIMIT: 32,

  // Permission Errors
  PERMISSION_DENIED: 10,
  PERMISSION_ERROR: 200,
  UNSUPPORTED_GET_REQUEST: 100,

  // API Errors
  UNKNOWN_ERROR: 1,
  SERVICE_UNAVAILABLE: 2,
  METHOD_UNKNOWN: 3,
  APPLICATION_REQUEST_LIMIT: 4,
  TOO_MANY_DATA_REQUESTS: 613,

  // Business Errors
  AD_ACCOUNT_NOT_FOUND: 1487390,
  AD_ACCOUNT_ACCESS_DENIED: 275,
  CAMPAIGN_NOT_FOUND: 100,

  // Transient Errors
  TEMPORARY_ERROR: 2,
  ASYNC_JOB_UNKNOWN: 2601,
} as const

export type MetaErrorCode = (typeof META_ERROR_CODES)[keyof typeof META_ERROR_CODES]

// =============================================================================
// API TYPES
// =============================================================================

export interface MetaAdsOptions {
  accessToken: string
  adAccountId: string
  timeframeDays: number
  maxPages?: number
  maxRetries?: number
  refreshAccessToken?: () => Promise<string>
  onRateLimitHit?: (retryAfterMs: number) => void
  onTokenRefresh?: () => void
}

export type { RetryConfig } from '../shared/retry'

export type MetaInsightAction = {
  action_type?: string
  value?: unknown
}

export type MetaInsightsRow = {
  date_start?: string
  date_stop?: string
  campaign_id?: string
  campaign_name?: string
  adset_id?: string
  adset_name?: string
  ad_id?: string
  ad_name?: string
  spend?: unknown
  impressions?: unknown
  clicks?: unknown
  actions?: MetaInsightAction[]
  action_values?: MetaInsightAction[]
  reach?: unknown
}

export type MetaApiErrorResponse = {
  error?: {
    message?: string
    type?: string
    code?: number
    error_subcode?: number
    fbtrace_id?: string
  }
}

export type MetaInsightsResponse = {
  data?: MetaInsightsRow[]
  paging?: {
    cursors?: {
      before?: string
      after?: string
    }
    next?: string
  }
}

export type MetaAdCreative = {
  id?: string
  name?: string
  thumbnail_url?: string
  image_url?: string
  full_picture?: string
  image_hash?: string
  images?: {
    data?: Array<{
      hash?: string
      url?: string
      width?: number
      height?: number
    }>
  }
  platform_customizations?: {
    instagram?: {
      image_url?: string
      image_hash?: string
      video_id?: string
    }
    facebook?: {
      image_url?: string
      image_hash?: string
      video_id?: string
    }
  }
  source_instagram_media_id?: string
  instagram_permalink_url?: string
  effective_instagram_media_id?: string
  portrait_customizations?: {
    facebook?: string
    instagram?: string
    audience_network?: string
    messenger?: string
    whatsup?: string
  }
  degrees_of_freedom_spec?: {
    creative_features?: string[]
    language?: string
  }
  interactive_components_spec?: Array<{
    type?: string
    payload?: Record<string, unknown>
  }>
  asset_feed_spec?: string
  ad_disclaimer_spec?: {
    text?: string
    disclaimer_type?: string
  }
  call_to_action_type?: string
  object_type?: string
  destination_spec?: {
    url?: string
    fallback_url?: string
    additional_urls?: string[]
  }
  object_story_spec?: {
    page_id?: string
    instagram_actor_id?: string
    link_data?: {
      link?: string
      message?: string
      picture?: string
      image_hash?: string
      name?: string
      caption?: string
      description?: string
      call_to_action?: {
        type?: string
        name?: string
        value?: {
          link?: string
          application?: string
          leadgen_form_id?: string
        }
      }
    }
    video_data?: {
      video_id?: string
      message?: string
      title?: string
      call_to_action?: {
        type?: string
        name?: string
        value?: {
          link?: string
          application?: string
          leadgen_form_id?: string
        }
      }
    }
  }
}

export type MetaAdInsight = {
  actions?: MetaInsightAction[]
  action_values?: MetaInsightAction[]
  spend?: unknown
  impressions?: unknown
  clicks?: unknown
}

export type MetaAdData = {
  id?: string
  name?: string
  status?: string
  effective_status?: string
  adset_id?: string
  campaign_id?: string
  adcreatives?: {
    data?: MetaAdCreative[]
  }
  insights?: {
    data?: MetaAdInsight[]
  }
}

export type MetaAdsListResponse = {
  data?: MetaAdData[]
  paging?: {
    cursors?: { after?: string }
    next?: string
  }
}

// =============================================================================
// AD ACCOUNT TYPE
// =============================================================================

export type MetaAdAccount = {
  id: string
  name: string
  account_status?: number
  currency?: string
}

// =============================================================================
// CAMPAIGN TYPES
// =============================================================================

/**
 * Advantage+ campaign state values for v24.0 API
 * Reference: https://developers.facebook.com/docs/marketing-api/advantage-campaigns/
 */
export type AdvantageState =
  | 'advantage_plus_sales'
  | 'advantage_plus_app'
  | 'classic'

/**
 * Placement soft opt-out configuration for v24.0 API
 * Allows allocating up to 5% of spend to typically excluded placements
 * Reference: https://developers.facebook.com/docs/marketing-api/marketing-api-changelog/version24.0/
 */
export type PlacementSoftOptOut = {
  facebook_positions?: string[]  // Positions to allow limited spend (e.g., ['feed', 'stories'])
  instagram_positions?: string[]
  audience_network_positions?: string[]
  messenger_positions?: string[]
}

export type MetaCampaign = {
  id: string
  name: string
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED'
  objective?: string
  dailyBudget?: number
  lifetimeBudget?: number
  startTime?: string
  stopTime?: string
  bidStrategy?: string
  // v24.0 Advantage+ fields
  advantageState?: AdvantageState
  isAdsetBudgetSharingEnabled?: boolean
}

export type MetaAdSet = {
  id: string
  name: string
  campaignId: string
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED'
  dailyBudget?: number
  lifetimeBudget?: number
  bidAmount?: number
  optimization_goal?: string
  // v24.0 fields
  placementSoftOptOut?: PlacementSoftOptOut
}

/**
 * Destination spec for website destination optimization (v24.0)
 * Allows Meta to automatically determine the best landing page
 */
export type DestinationSpec = {
  url?: string
  fallback_url?: string
  additional_urls?: string[]
}

export type MetaAdMetric = {
  adId: string
  adSetId: string
  campaignId: string
  adName?: string
  adSetName?: string
  campaignName?: string
  date: string
  impressions: number
  clicks: number
  spend: number
  conversions: number
  revenue: number
  reach?: number
}

// =============================================================================
// CREATIVE TYPES
// =============================================================================

export type MetaCreative = {
  adId: string
  adSetId: string
  campaignId: string
  adName?: string
  adSetName?: string
  campaignName?: string
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED'
  creativeId?: string
  creativeName?: string
  type?: string  // 'sponsored_content', 'video', 'image', 'lead_generation', etc.
  thumbnailUrl?: string
  imageUrl?: string
  videoSourceUrl?: string
  videoThumbnailUrl?: string
  callToAction?: string
  landingPageUrl?: string
  videoId?: string
  message?: string
  pageName?: string
  pageProfileImageUrl?: string
  headlines?: string[]
  // v24.0 additional fields
  instagramPermalinkUrl?: string
  sourceInstagramMediaId?: string
  effectiveInstagramMediaId?: string
  objectType?: string
  // Lead gen specific fields
  isLeadGen?: boolean
  leadgenFormId?: string
}

// =============================================================================
// AUDIENCE TARGETING TYPES
// =============================================================================

export type MetaAudienceTargeting = {
  adSetId: string
  adSetName?: string
  campaignId: string
  campaignName?: string
  // Demographics
  ageMin?: number
  ageMax?: number
  genders: number[]
  // Locations
  geoLocations: Array<{ name: string; type: string; key: string }>
  excludedGeoLocations: Array<{ name: string; type: string }>
  // Interests & Behaviors
  interests: Array<{ id: string; name: string }>
  behaviors: Array<{ id: string; name: string }>
  // Custom Audiences
  customAudiences: Array<{ id: string; name: string }>
  excludedCustomAudiences: Array<{ id: string; name: string }>
  lookalikeAudiences: Array<{ id: string; name: string }>
  // Connections
  connections: Array<{ id: string; name: string }>
  excludedConnections: Array<{ id: string; name: string }>
  // Placements
  publisherPlatforms: string[]
  devicePlatforms: string[]
  facebookPositions?: string[]
  instagramPositions?: string[]
  audienceNetworkPositions?: string[]
  messengerPositions?: string[]
  // Detailed Targeting (Advanced)
  flexible_spec?: Array<{
    interests?: Array<{ id: string; name: string }>
    behaviors?: Array<{ id: string; name: string }>
    demographics?: Array<{ id: string; name: string }>
    life_events?: Array<{ id: string; name: string }>
    industries?: Array<{ id: string; name: string }>
    work_positions?: Array<{ id: string; name: string }>
    work_employers?: Array<{ id: string; name: string }>
  }>
  exclusions?: {
    interests?: Array<{ id: string; name: string }>
    behaviors?: Array<{ id: string; name: string }>
  }
}

// =============================================================================
// PAGING STATE
// =============================================================================

export type MetaPagingState = {
  after?: string
  next?: string
}

// =============================================================================
// RE-EXPORT
// =============================================================================

export type { NormalizedMetric }
