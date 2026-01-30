// =============================================================================
// GOOGLE ADS CAMPAIGNS - Re-export from modular structure
// =============================================================================
// This file is kept for backward compatibility.
// New code should import from './campaign-modules' directly.

// Campaign CRUD
export {
  listGoogleCampaigns,
  updateGoogleCampaignStatus,
  updateGoogleCampaignBudget,
  getGoogleCampaignBudgetId,
  updateGoogleCampaignBudgetByCampaign,
  updateGoogleCampaignBidding,
  removeGoogleCampaign,
  updateGoogleAdStatus,
} from './campaign-crud'

// Ad group metrics
export { fetchGoogleAdGroupMetrics } from './ad-group-metrics'

// Ad metrics
export { fetchGoogleAdMetrics } from './ad-metrics'

// Creatives
export { fetchGoogleCreatives } from './creatives'

// Audience targeting
export {
  fetchGoogleAudienceTargeting,
  createGoogleAudience,
} from './audience-targeting'

// Campaign modules (new)
export {
  // Objective configs
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
  GOOGLE_CAMPAIGN_OBJECTIVES,
  GOOGLE_BIDDING_STRATEGIES,
  BIDDING_STRATEGIES_BY_OBJECTIVE,
  
  // Types
  type GoogleCampaignObjective,
  type GoogleCampaignObjectiveConfig,
  type SalesCampaignSettings,
  type LeadsCampaignSettings,
  type WebsiteTrafficCampaignSettings,
  type BrandAwarenessCampaignSettings,
  type AppPromotionCampaignSettings,
  type CreateGoogleCampaignOptions,
  type UpdateGoogleCampaignOptions,
} from './campaign-modules'
