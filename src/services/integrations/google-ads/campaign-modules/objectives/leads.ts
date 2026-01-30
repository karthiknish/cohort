// =============================================================================
// LEADS OBJECTIVE - Generate leads
// =============================================================================

import { GoogleCampaignObjectiveConfig } from '../types'

export const GOOGLE_LEADS_OBJECTIVE_CONFIG: GoogleCampaignObjectiveConfig = {
  objective: 'LEADS',
  displayName: 'Leads',
  description: 'Generate leads with bidding strategies optimized for form submissions and sign-ups',
  advertisingChannelTypes: ['SEARCH', 'DISPLAY', 'PERFORMANCE_MAX', 'DEMAND_GEN', 'VIDEO'],
  biddingStrategies: [
    'TARGET_CPA',
    'MAXIMIZE_CONVERSIONS',
    'MANUAL_CPC',
    'MAXIMIZE_CLICKS',
  ],
  defaultBiddingStrategy: 'TARGET_CPA',
  supportedCampaignTypes: [
    'Search',
    'Display',
    'Performance Max',
    'Demand Gen',
    'Video',
  ],
  features: {
    supportsAudiences: true,
    supportsKeywords: true,
    supportsPlacements: true,
    supportsTopics: true,
    supportsDemographics: true,
  },
}

// Lead form extensions
export const LEAD_FORM_EXTENSIONS = [
  { value: 'LEAD_FORM', label: 'Lead Form Extension', description: 'Native lead forms on Search, Display, and YouTube' },
  { value: 'CALL_EXTENSION', label: 'Call Extension', description: 'Click-to-call for phone leads' },
  { value: 'MESSAGE_EXTENSION', label: 'Message Extension', description: 'Click-to-message for SMS leads' },
] as const

// Lead campaign settings
export interface LeadsCampaignSettings {
  leadFormExtension?: string
  conversionActions: string[]
  // Call settings
  phoneNumber?: string
  callReporting?: boolean
  // Lead quality settings
  leadQualityScore?: 'HIGH' | 'MEDIUM' | 'LOW'
}
