// =============================================================================
// SALES OBJECTIVE - Drive online sales
// =============================================================================

import { GoogleCampaignObjectiveConfig } from '../types'

export const GOOGLE_SALES_OBJECTIVE_CONFIG: GoogleCampaignObjectiveConfig = {
  objective: 'SALES',
  displayName: 'Sales',
  description: 'Drive online sales with bidding strategies optimized for conversions and revenue',
  advertisingChannelTypes: ['SEARCH', 'DISPLAY', 'SHOPPING', 'PERFORMANCE_MAX', 'DEMAND_GEN'],
  biddingStrategies: [
    'TARGET_ROAS',
    'MAXIMIZE_CONVERSION_VALUE',
    'MAXIMIZE_CONVERSIONS',
    'TARGET_CPA',
    'MANUAL_CPC',
  ],
  defaultBiddingStrategy: 'TARGET_ROAS',
  supportedCampaignTypes: [
    'Search',
    'Display',
    'Shopping',
    'Performance Max',
    'Demand Gen',
  ],
  features: {
    supportsAudiences: true,
    supportsKeywords: true,
    supportsPlacements: true,
    supportsTopics: true,
    supportsDemographics: true,
  },
}

// Conversion goals for sales campaigns
export const SALES_CONVERSION_GOALS = [
  { value: 'PURCHASE', label: 'Purchases', description: 'Complete purchase transactions' },
  { value: 'ADD_TO_CART', label: 'Add to Cart', description: 'Items added to shopping cart' },
  { value: 'BEGIN_CHECKOUT', label: 'Begin Checkout', description: 'Started checkout process' },
  { value: 'SUBMIT_LEAD_FORM', label: 'Submit Lead Form', description: 'Submitted lead forms' },
] as const

// Sales campaign settings
export interface SalesCampaignSettings {
  conversionGoal: string
  conversionValueRules?: {
    category?: string
    valueMultiplier?: number
  }[]
  // Performance Max specific
  audienceSignals?: string[]
  assetGroups?: {
    name: string
    headlines: string[]
    descriptions: string[]
    images: string[]
    videos?: string[]
  }[]
}
