// =============================================================================
// BRAND AWARENESS OBJECTIVE - Build brand recognition
// =============================================================================

import { GoogleCampaignObjectiveConfig } from '../types'

export const GOOGLE_BRAND_AWARENESS_OBJECTIVE_CONFIG: GoogleCampaignObjectiveConfig = {
  objective: 'BRAND_AWARENESS_AND_REACH',
  displayName: 'Brand Awareness and Reach',
  description: 'Build brand recognition with reach-focused bidding and video campaigns',
  advertisingChannelTypes: ['DISPLAY', 'VIDEO', 'DISCOVERY', 'DEMAND_GEN'],
  biddingStrategies: [
    'TARGET_IMPRESSION_SHARE',
    'MANUAL_CPM',
    'MANUAL_CPV',
  ],
  defaultBiddingStrategy: 'TARGET_IMPRESSION_SHARE',
  supportedCampaignTypes: [
    'Display',
    'Video',
    'Discovery',
    'Demand Gen',
  ],
  features: {
    supportsAudiences: true,
    supportsKeywords: false,
    supportsPlacements: true,
    supportsTopics: true,
    supportsDemographics: true,
  },
}

// Target impression share locations
export const IMPRESSION_SHARE_TARGETS = [
  { value: 'ABSOLUTE_TOP_OF_PAGE', label: 'Absolute Top of Page', description: 'Position 1 on search results' },
  { value: 'TOP_OF_PAGE', label: 'Top of Page', description: 'Top positions on search results' },
  { value: 'ANYWHERE_ON_PAGE', label: 'Anywhere on Page', description: 'Any position on search results' },
] as const

// Frequency cap settings
export const FREQUENCY_CAP_LEVELS = [
  { value: 'AD_GROUP', label: 'Ad Group', description: 'Limit per ad group' },
  { value: 'CAMPAIGN', label: 'Campaign', description: 'Limit per campaign' },
  { value: 'AD_GROUP_AD', label: 'Ad', description: 'Limit per individual ad' },
] as const

// Brand awareness campaign settings
export interface BrandAwarenessCampaignSettings {
  targetImpressionShare?: {
    location: string
    percentage: number
  }
  frequencyCap?: {
    level: string
    events: number
    timeUnit: 'DAY' | 'WEEK' | 'MONTH'
  }
  videoAdFormats?: ('IN_STREAM' | 'IN_FEED' | 'SHORTS' | 'BUMPER')[]
  brandLiftStudy?: boolean
}
