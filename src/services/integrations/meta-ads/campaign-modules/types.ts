// =============================================================================
// CAMPAIGNS TYPES - Type definitions for campaign operations
// =============================================================================

import { 
  AdvantageState, 
  PlacementSoftOptOut 
} from '../types'

// =============================================================================
// CAMPAIGN OBJECTIVES (Meta Marketing API v24.0)
// =============================================================================

export type CampaignObjective = 
  | 'OUTCOME_SALES'
  | 'OUTCOME_LEADS'
  | 'OUTCOME_TRAFFIC'
  | 'OUTCOME_ENGAGEMENT'
  | 'OUTCOME_AWARENESS'
  | 'OUTCOME_APP_PROMOTION'
  | 'OUTCOME_PAGE_LIKES'
  | 'SALES'
  | 'LEADS'
  | 'TRAFFIC'
  | 'ENGAGEMENT'
  | 'AWARENESS'
  | 'APP_PROMOTION'
  | 'PAGE_LIKES'
  | 'LINK_CLICKS'
  | 'CONVERSIONS'
  | 'STORE_TRAFFIC'
  | 'MESSAGES'
  | 'LEAD_GENERATION'
  | 'APP_INSTALLS'
  | 'VIDEO_VIEWS'
  | 'REACH'
  | 'BRAND_AWARENESS'
  | 'POST_ENGAGEMENT'
  | 'PAGE_ENGAGEMENT'
  | 'EVENT_RESPONSES'
  | 'OFFER_CLAIMS'
  | 'PRODUCT_CATALOG_SALES'

export const CAMPAIGN_OBJECTIVES = {
  SALES: 'OUTCOME_SALES',
  LEADS: 'OUTCOME_LEADS',
  TRAFFIC: 'OUTCOME_TRAFFIC',
  ENGAGEMENT: 'OUTCOME_ENGAGEMENT',
  AWARENESS: 'OUTCOME_AWARENESS',
  APP_PROMOTION: 'OUTCOME_APP_PROMOTION',
  PAGE_LIKES: 'OUTCOME_PAGE_LIKES',
} as const

export interface CampaignObjectiveConfig {
  objective: CampaignObjective
  displayName: string
  optimizationGoals: string[]
  billingEvents: string[]
  supportedCreativeTypes: string[]
  defaultCallToAction: string
  requiresCustomAudience?: boolean
  supportsLeadGen?: boolean
  supportsDynamicCreative?: boolean
  supportedPlacements: string[]
}

// =============================================================================
// CREATE/UPDATE OPTIONS
// =============================================================================

export interface CreateCampaignOptions {
  accessToken: string
  adAccountId: string
  name: string
  objective: CampaignObjective
  status?: 'ACTIVE' | 'PAUSED'
  dailyBudget?: number
  lifetimeBudget?: number
  startTime?: string
  stopTime?: string
  specialAdCategories?: string[]
  // v24.0 Advantage+ fields
  advantageState?: AdvantageState
  isAdsetBudgetSharingEnabled?: boolean
  maxRetries?: number
}

export interface UpdateCampaignOptions {
  accessToken: string
  campaignId: string
  name?: string
  status?: 'ACTIVE' | 'PAUSED'
  dailyBudget?: number
  lifetimeBudget?: number
  maxRetries?: number
}

export interface CreateAdSetOptions {
  accessToken: string
  adAccountId: string
  campaignId: string
  name: string
  status?: 'ACTIVE' | 'PAUSED'
  dailyBudget?: number
  lifetimeBudget?: number
  optimizationGoal?: string
  billingEvent?: string
  bidAmount?: number
  targeting?: {
    ageMin?: number
    ageMax?: number
    genders?: number[]
    geoLocations?: {
      countries?: string[]
      regions?: Array<{ key: string }>
      cities?: Array<{ key: string }>
    }
    interests?: Array<{ id: string }>
    behaviors?: Array<{ id: string }>
    customAudiences?: Array<{ id: string }>
  }
  promotedObject?: {
    page_id?: string
    product_catalog_id?: string
    custom_event_type?: string
    application_id?: string
    object_store_url?: string
  }
  // v24.0 Advantage+ placements limited spend
  placementSoftOptOut?: PlacementSoftOptOut
  maxRetries?: number
}

export interface UpdateAdSetOptions {
  accessToken: string
  adSetId: string
  name?: string
  status?: 'ACTIVE' | 'PAUSED'
  dailyBudget?: number
  lifetimeBudget?: number
  bidAmount?: number
  maxRetries?: number
}

export interface UpdateCampaignBiddingOptions {
  accessToken: string
  campaignId: string
  biddingType: string
  biddingValue: number
  maxRetries?: number
}

export interface CreateAudienceOptions {
  accessToken: string
  adAccountId: string
  name: string
  description?: string
  segments: string[]
  maxRetries?: number
}
