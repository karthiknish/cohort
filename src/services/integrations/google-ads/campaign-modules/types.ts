// =============================================================================
// GOOGLE ADS CAMPAIGN MODULES TYPES
// =============================================================================

// =============================================================================
// CAMPAIGN OBJECTIVES (Google Ads API v22)
// =============================================================================

export type GoogleCampaignObjective =
  | 'SALES'
  | 'LEADS'
  | 'WEBSITE_TRAFFIC'
  | 'PRODUCT_AND_BRAND_CONSIDERATION'
  | 'BRAND_AWARENESS_AND_REACH'
  | 'APP_PROMOTION'
  | 'LOCAL_STORE_VISITS_AND_PROMOTIONS'

export const GOOGLE_CAMPAIGN_OBJECTIVES = {
  SALES: 'SALES',
  LEADS: 'LEADS',
  WEBSITE_TRAFFIC: 'WEBSITE_TRAFFIC',
  PRODUCT_AND_BRAND_CONSIDERATION: 'PRODUCT_AND_BRAND_CONSIDERATION',
  BRAND_AWARENESS_AND_REACH: 'BRAND_AWARENESS_AND_REACH',
  APP_PROMOTION: 'APP_PROMOTION',
  LOCAL_STORE_VISITS_AND_PROMOTIONS: 'LOCAL_STORE_VISITS_AND_PROMOTIONS',
} as const

export interface GoogleCampaignObjectiveConfig {
  objective: GoogleCampaignObjective
  displayName: string
  description: string
  advertisingChannelTypes: string[]
  biddingStrategies: string[]
  defaultBiddingStrategy: string
  supportedCampaignTypes: string[]
  features: {
    supportsAudiences: boolean
    supportsKeywords: boolean
    supportsPlacements: boolean
    supportsTopics: boolean
    supportsDemographics: boolean
  }
}

// =============================================================================
// CREATE/UPDATE OPTIONS
// =============================================================================

export interface CreateGoogleCampaignOptions {
  accessToken: string
  developerToken: string
  customerId: string
  name: string
  objective: GoogleCampaignObjective
  advertisingChannelType: string
  status?: 'ENABLED' | 'PAUSED'
  dailyBudget?: number
  biddingStrategyType?: string
  targetCpa?: number
  targetRoas?: number
  startDate?: string
  endDate?: string
  loginCustomerId?: string | null
  maxRetries?: number
}

export interface UpdateGoogleCampaignOptions {
  accessToken: string
  developerToken: string
  customerId: string
  campaignId: string
  name?: string
  status?: 'ENABLED' | 'PAUSED'
  dailyBudget?: number
  biddingStrategyType?: string
  targetCpa?: number
  targetRoas?: number
  loginCustomerId?: string | null
  maxRetries?: number
}

export interface CreateGoogleAdGroupOptions {
  accessToken: string
  developerToken: string
  customerId: string
  campaignId: string
  name: string
  status?: 'ENABLED' | 'PAUSED'
  cpcBidMicros?: number
  targetCpaMicros?: number
  loginCustomerId?: string | null
  maxRetries?: number
}

export interface UpdateGoogleAdGroupOptions {
  accessToken: string
  developerToken: string
  customerId: string
  adGroupId: string
  name?: string
  status?: 'ENABLED' | 'PAUSED'
  cpcBidMicros?: number
  targetCpaMicros?: number
  loginCustomerId?: string | null
  maxRetries?: number
}

// =============================================================================
// BIDDING STRATEGY CONFIGS
// =============================================================================

export const GOOGLE_BIDDING_STRATEGIES = {
  // Manual bidding
  MANUAL_CPC: 'MANUAL_CPC',
  MANUAL_CPM: 'MANUAL_CPM',
  MANUAL_CPV: 'MANUAL_CPV',
  
  // Automated bidding
  MAXIMIZE_CONVERSIONS: 'MAXIMIZE_CONVERSIONS',
  MAXIMIZE_CONVERSION_VALUE: 'MAXIMIZE_CONVERSION_VALUE',
  TARGET_CPA: 'TARGET_CPA',
  TARGET_ROAS: 'TARGET_ROAS',
  TARGET_IMPRESSION_SHARE: 'TARGET_IMPRESSION_SHARE',
  
  // Smart bidding
  MAXIMIZE_CLICKS: 'MAXIMIZE_CLICKS',
  TARGET_SPEND: 'TARGET_SPEND',
  
  // App campaigns
  OPTIMIZE_IN_APP_CONVERSIONS: 'OPTIMIZE_IN_APP_CONVERSIONS',
  OPTIMIZE_IN_APP_CONVERSIONS_WITHOUT_TARGET_CPA: 'OPTIMIZE_IN_APP_CONVERSIONS_WITHOUT_TARGET_CPA',
  OPTIMIZE_TOTAL_VALUE: 'OPTIMIZE_TOTAL_VALUE',
  OPTIMIZE_TOTAL_VALUE_WITHOUT_TARGET_ROAS: 'OPTIMIZE_TOTAL_VALUE_WITHOUT_TARGET_ROAS',
} as const

// Bidding strategies by objective
export const BIDDING_STRATEGIES_BY_OBJECTIVE: Record<GoogleCampaignObjective, string[]> = {
  SALES: [
    'TARGET_ROAS',
    'MAXIMIZE_CONVERSION_VALUE',
    'MAXIMIZE_CONVERSIONS',
    'TARGET_CPA',
    'MANUAL_CPC',
  ],
  LEADS: [
    'TARGET_CPA',
    'MAXIMIZE_CONVERSIONS',
    'MANUAL_CPC',
    'MAXIMIZE_CLICKS',
  ],
  WEBSITE_TRAFFIC: [
    'MAXIMIZE_CLICKS',
    'TARGET_CPA',
    'MANUAL_CPC',
  ],
  PRODUCT_AND_BRAND_CONSIDERATION: [
    'MAXIMIZE_CLICKS',
    'TARGET_CPA',
    'MANUAL_CPC',
  ],
  BRAND_AWARENESS_AND_REACH: [
    'TARGET_IMPRESSION_SHARE',
    'MANUAL_CPM',
    'MANUAL_CPV',
  ],
  APP_PROMOTION: [
    'OPTIMIZE_IN_APP_CONVERSIONS',
    'OPTIMIZE_IN_APP_CONVERSIONS_WITHOUT_TARGET_CPA',
    'OPTIMIZE_TOTAL_VALUE',
    'OPTIMIZE_TOTAL_VALUE_WITHOUT_TARGET_ROAS',
  ],
  LOCAL_STORE_VISITS_AND_PROMOTIONS: [
    'MAXIMIZE_CONVERSIONS',
    'MANUAL_CPC',
  ],
}
