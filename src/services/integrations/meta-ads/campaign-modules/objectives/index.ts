// =============================================================================
// CAMPAIGN OBJECTIVES - Export all objective configurations
// =============================================================================

import { 
  LEADS_OBJECTIVE_CONFIG,
  type LeadGenAdSetRequirements,
  type LeadGenCreativeRequirements,
  isLeadGenAd,
  extractLeadGenFormId,
} from './leads'

import {
  SALES_OBJECTIVE_CONFIG,
  type SalesAdSetRequirements,
  SALES_CONVERSION_EVENTS,
  getConversionEventLabel,
} from './sales'

import {
  TRAFFIC_OBJECTIVE_CONFIG,
  type TrafficAdSetRequirements,
  TRAFFIC_DESTINATIONS,
} from './traffic'

import {
  ENGAGEMENT_OBJECTIVE_CONFIG,
  type EngagementAdSetRequirements,
  ENGAGEMENT_TYPES,
} from './engagement'

import {
  AWARENESS_OBJECTIVE_CONFIG,
  type AwarenessAdSetRequirements,
  type ReachFrequencyConfig,
} from './awareness'

import {
  APP_PROMOTION_OBJECTIVE_CONFIG,
  type AppPromotionAdSetRequirements,
  APP_EVENT_TYPES,
  APP_STORES,
} from './app-promotion'

// Re-export all
export { 
  LEADS_OBJECTIVE_CONFIG,
  type LeadGenAdSetRequirements,
  type LeadGenCreativeRequirements,
  isLeadGenAd,
  extractLeadGenFormId,
}

export {
  SALES_OBJECTIVE_CONFIG,
  type SalesAdSetRequirements,
  SALES_CONVERSION_EVENTS,
  getConversionEventLabel,
}

export {
  TRAFFIC_OBJECTIVE_CONFIG,
  type TrafficAdSetRequirements,
  TRAFFIC_DESTINATIONS,
}

export {
  ENGAGEMENT_OBJECTIVE_CONFIG,
  type EngagementAdSetRequirements,
  ENGAGEMENT_TYPES,
}

export {
  AWARENESS_OBJECTIVE_CONFIG,
  type AwarenessAdSetRequirements,
  type ReachFrequencyConfig,
}

export {
  APP_PROMOTION_OBJECTIVE_CONFIG,
  type AppPromotionAdSetRequirements,
  APP_EVENT_TYPES,
  APP_STORES,
}

// All objective configs map
export const CAMPAIGN_OBJECTIVE_CONFIGS = {
  OUTCOME_LEADS: LEADS_OBJECTIVE_CONFIG,
  OUTCOME_SALES: SALES_OBJECTIVE_CONFIG,
  OUTCOME_TRAFFIC: TRAFFIC_OBJECTIVE_CONFIG,
  OUTCOME_ENGAGEMENT: ENGAGEMENT_OBJECTIVE_CONFIG,
  OUTCOME_AWARENESS: AWARENESS_OBJECTIVE_CONFIG,
  OUTCOME_APP_PROMOTION: APP_PROMOTION_OBJECTIVE_CONFIG,
  // Legacy aliases
  LEAD_GENERATION: LEADS_OBJECTIVE_CONFIG,
  CONVERSIONS: SALES_OBJECTIVE_CONFIG,
  LINK_CLICKS: TRAFFIC_OBJECTIVE_CONFIG,
  POST_ENGAGEMENT: ENGAGEMENT_OBJECTIVE_CONFIG,
  BRAND_AWARENESS: AWARENESS_OBJECTIVE_CONFIG,
  APP_INSTALLS: APP_PROMOTION_OBJECTIVE_CONFIG,
} as const

// Helper to get objective config by objective value
export function getObjectiveConfig(objective: string) {
  return CAMPAIGN_OBJECTIVE_CONFIGS[objective as keyof typeof CAMPAIGN_OBJECTIVE_CONFIGS] || null
}

// All available objectives for dropdowns
export const AVAILABLE_OBJECTIVES = [
  { value: 'OUTCOME_SALES', label: 'Sales', description: 'Find people likely to purchase your products or services' },
  { value: 'OUTCOME_LEADS', label: 'Leads', description: 'Collect leads for your business' },
  { value: 'OUTCOME_TRAFFIC', label: 'Traffic', description: 'Send people to a website, app or event' },
  { value: 'OUTCOME_ENGAGEMENT', label: 'Engagement', description: 'Get more messages, video views or post engagement' },
  { value: 'OUTCOME_AWARENESS', label: 'Awareness', description: 'Introduce your brand to new people' },
  { value: 'OUTCOME_APP_PROMOTION', label: 'App Promotion', description: 'Find new users for your app' },
]
