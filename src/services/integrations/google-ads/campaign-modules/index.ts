// =============================================================================
// GOOGLE ADS CAMPAIGN MODULES - Organized campaign operations
// =============================================================================

// Types
export type {
  GoogleCampaignObjective,
  GoogleCampaignObjectiveConfig,
  CreateGoogleCampaignOptions,
  UpdateGoogleCampaignOptions,
  CreateGoogleAdGroupOptions,
  UpdateGoogleAdGroupOptions,
} from './types'

export {
  GOOGLE_CAMPAIGN_OBJECTIVES,
  GOOGLE_BIDDING_STRATEGIES,
  BIDDING_STRATEGIES_BY_OBJECTIVE,
} from './types'

// Objectives
export {
  // Configs
  GOOGLE_SALES_OBJECTIVE_CONFIG,
  GOOGLE_LEADS_OBJECTIVE_CONFIG,
  GOOGLE_WEBSITE_TRAFFIC_OBJECTIVE_CONFIG,
  GOOGLE_BRAND_AWARENESS_OBJECTIVE_CONFIG,
  GOOGLE_APP_PROMOTION_OBJECTIVE_CONFIG,
  GOOGLE_OBJECTIVE_CONFIGS,
  GOOGLE_AVAILABLE_OBJECTIVES,
  getGoogleObjectiveConfig,
  
  // Constants
  SALES_CONVERSION_GOALS,
  LEAD_FORM_EXTENSIONS,
  TRAFFIC_SOURCES,
  IMPRESSION_SHARE_TARGETS,
  FREQUENCY_CAP_LEVELS,
  APP_CAMPAIGN_SUBTYPES,
  APP_STORES,
  
  // Types
  type SalesCampaignSettings,
  type LeadsCampaignSettings,
  type WebsiteTrafficCampaignSettings,
  type BrandAwarenessCampaignSettings,
  type AppPromotionCampaignSettings,
} from './objectives'
