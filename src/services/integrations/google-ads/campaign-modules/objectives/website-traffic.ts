// =============================================================================
// WEBSITE TRAFFIC OBJECTIVE - Drive website visits
// =============================================================================

import { GoogleCampaignObjectiveConfig } from '../types'

export const GOOGLE_WEBSITE_TRAFFIC_OBJECTIVE_CONFIG: GoogleCampaignObjectiveConfig = {
  objective: 'WEBSITE_TRAFFIC',
  displayName: 'Website Traffic',
  description: 'Drive quality visits to your website with click-optimized bidding',
  advertisingChannelTypes: ['SEARCH', 'DISPLAY', 'DISCOVERY', 'PERFORMANCE_MAX', 'DEMAND_GEN'],
  biddingStrategies: [
    'MAXIMIZE_CLICKS',
    'TARGET_CPA',
    'MANUAL_CPC',
  ],
  defaultBiddingStrategy: 'MAXIMIZE_CLICKS',
  supportedCampaignTypes: [
    'Search',
    'Display',
    'Discovery',
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

// Traffic sources
export const TRAFFIC_SOURCES = [
  { value: 'SEARCH', label: 'Search Network', description: 'Google Search and Search Partners' },
  { value: 'DISPLAY', label: 'Display Network', description: 'Millions of websites and apps' },
  { value: 'DISCOVERY', label: 'Discovery', description: 'Gmail, YouTube Home, and Discover' },
  { value: 'YOUTUBE', label: 'YouTube', description: 'YouTube videos and search' },
] as const

// Traffic campaign settings
export interface WebsiteTrafficCampaignSettings {
  landingPageUrl: string
  trackingTemplate?: string
  customParameters?: Record<string, string>
  // Page feed for DSA
  pageFeed?: string[]
  // Audience signals
  inMarketAudiences?: string[]
  affinityAudiences?: string[]
}
