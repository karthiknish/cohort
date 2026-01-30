// =============================================================================
// GOOGLE ADS CAMPAIGN OBJECTIVES - Export all objective configurations
// =============================================================================

import { 
  GOOGLE_SALES_OBJECTIVE_CONFIG,
  type SalesCampaignSettings,
  SALES_CONVERSION_GOALS,
} from './sales'

import {
  GOOGLE_LEADS_OBJECTIVE_CONFIG,
  type LeadsCampaignSettings,
  LEAD_FORM_EXTENSIONS,
} from './leads'

import {
  GOOGLE_WEBSITE_TRAFFIC_OBJECTIVE_CONFIG,
  type WebsiteTrafficCampaignSettings,
  TRAFFIC_SOURCES,
} from './website-traffic'

import {
  GOOGLE_BRAND_AWARENESS_OBJECTIVE_CONFIG,
  type BrandAwarenessCampaignSettings,
  IMPRESSION_SHARE_TARGETS,
  FREQUENCY_CAP_LEVELS,
} from './brand-awareness'

import {
  GOOGLE_APP_PROMOTION_OBJECTIVE_CONFIG,
  type AppPromotionCampaignSettings,
  APP_CAMPAIGN_SUBTYPES,
  APP_STORES,
} from './app-promotion'

// Re-export all
export {
  GOOGLE_SALES_OBJECTIVE_CONFIG,
  type SalesCampaignSettings,
  SALES_CONVERSION_GOALS,
}

export {
  GOOGLE_LEADS_OBJECTIVE_CONFIG,
  type LeadsCampaignSettings,
  LEAD_FORM_EXTENSIONS,
}

export {
  GOOGLE_WEBSITE_TRAFFIC_OBJECTIVE_CONFIG,
  type WebsiteTrafficCampaignSettings,
  TRAFFIC_SOURCES,
}

export {
  GOOGLE_BRAND_AWARENESS_OBJECTIVE_CONFIG,
  type BrandAwarenessCampaignSettings,
  IMPRESSION_SHARE_TARGETS,
  FREQUENCY_CAP_LEVELS,
}

export {
  GOOGLE_APP_PROMOTION_OBJECTIVE_CONFIG,
  type AppPromotionCampaignSettings,
  APP_CAMPAIGN_SUBTYPES,
  APP_STORES,
}

// All objective configs map
export const GOOGLE_OBJECTIVE_CONFIGS = {
  SALES: GOOGLE_SALES_OBJECTIVE_CONFIG,
  LEADS: GOOGLE_LEADS_OBJECTIVE_CONFIG,
  WEBSITE_TRAFFIC: GOOGLE_WEBSITE_TRAFFIC_OBJECTIVE_CONFIG,
  BRAND_AWARENESS_AND_REACH: GOOGLE_BRAND_AWARENESS_OBJECTIVE_CONFIG,
  APP_PROMOTION: GOOGLE_APP_PROMOTION_OBJECTIVE_CONFIG,
} as const

// Helper to get objective config
export function getGoogleObjectiveConfig(objective: string) {
  return GOOGLE_OBJECTIVE_CONFIGS[objective as keyof typeof GOOGLE_OBJECTIVE_CONFIGS] || null
}

// Available objectives for UI
export const GOOGLE_AVAILABLE_OBJECTIVES = [
  { 
    value: 'SALES', 
    label: 'Sales', 
    description: 'Drive online sales',
    icon: 'ShoppingCart',
    color: '#22c55e',
  },
  { 
    value: 'LEADS', 
    label: 'Leads', 
    description: 'Generate leads',
    icon: 'Users',
    color: '#3b82f6',
  },
  { 
    value: 'WEBSITE_TRAFFIC', 
    label: 'Website Traffic', 
    description: 'Drive website visits',
    icon: 'ExternalLink',
    color: '#f59e0b',
  },
  { 
    value: 'BRAND_AWARENESS_AND_REACH', 
    label: 'Brand Awareness', 
    description: 'Build brand recognition',
    icon: 'Eye',
    color: '#8b5cf6',
  },
  { 
    value: 'APP_PROMOTION', 
    label: 'App Promotion', 
    description: 'Promote app installs',
    icon: 'Smartphone',
    color: '#06b6d4',
  },
]
