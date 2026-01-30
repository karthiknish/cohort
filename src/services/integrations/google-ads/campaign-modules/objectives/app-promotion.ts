// =============================================================================
// APP PROMOTION OBJECTIVE - Promote app installs and engagement
// =============================================================================

import { GoogleCampaignObjectiveConfig } from '../types'

export const GOOGLE_APP_PROMOTION_OBJECTIVE_CONFIG: GoogleCampaignObjectiveConfig = {
  objective: 'APP_PROMOTION',
  displayName: 'App Promotion',
  description: 'Drive app installs and in-app actions with specialized app campaign bidding',
  advertisingChannelTypes: ['APP'],
  biddingStrategies: [
    'OPTIMIZE_IN_APP_CONVERSIONS',
    'OPTIMIZE_IN_APP_CONVERSIONS_WITHOUT_TARGET_CPA',
    'OPTIMIZE_TOTAL_VALUE',
    'OPTIMIZE_TOTAL_VALUE_WITHOUT_TARGET_ROAS',
  ],
  defaultBiddingStrategy: 'OPTIMIZE_IN_APP_CONVERSIONS',
  supportedCampaignTypes: [
    'App Campaigns',
    'App Campaigns for Engagement',
    'App Campaigns for Pre-Registration',
  ],
  features: {
    supportsAudiences: true,
    supportsKeywords: false,
    supportsPlacements: false,
    supportsTopics: false,
    supportsDemographics: true,
  },
}

// App campaign subtypes
export const APP_CAMPAIGN_SUBTYPES = [
  { value: 'APP_INSTALLS', label: 'App Installs', description: 'Focus on new user acquisition' },
  { value: 'APP_ENGAGEMENT', label: 'App Engagement', description: 'Re-engage existing users' },
  { value: 'APP_PRE_REGISTRATION', label: 'App Pre-Registration', description: 'Build buzz before launch' },
] as const

// App stores
export const APP_STORES = [
  { value: 'GOOGLE_PLAY', label: 'Google Play', description: 'Android apps' },
  { value: 'APPLE_APP_STORE', label: 'Apple App Store', description: 'iOS apps' },
] as const

// App campaign settings
export interface AppPromotionCampaignSettings {
  appId: string
  appStore: 'GOOGLE_PLAY' | 'APPLE_APP_STORE'
  campaignSubtype: string
  // Conversion settings
  inAppConversionActions?: string[]
  // Creative settings
  videoAssets?: string[]
  imageAssets?: string[]
  headlineSuggestions?: string[]
  descriptionSuggestions?: string[]
}
