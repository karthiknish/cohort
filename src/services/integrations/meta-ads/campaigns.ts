// =============================================================================
// META ADS CAMPAIGNS - Re-export from modular structure
// =============================================================================
// This file is kept for backward compatibility.
// New code should import from './campaign-modules' directly.

export {
  // Core campaigns
  listMetaCampaigns,
  createMetaCampaign,
  updateMetaCampaign,
  updateMetaCampaignStatus,
  updateMetaCampaignBudget,
  removeMetaCampaign,
  updateMetaCampaignBidding,
  type CreateCampaignOptions,
  type UpdateCampaignOptions,
  type UpdateCampaignBiddingOptions,
  
  // Ad sets
  listMetaAdSets,
  createMetaAdSet,
  updateMetaAdSet,
  updateMetaAdSetStatus,
  type CreateAdSetOptions,
  type UpdateAdSetOptions,
  
  // Ads
  listMetaAds,
  updateMetaAdStatus,
  fetchMetaAdMetrics,
  
  // Creatives
  fetchMetaCreatives,
  
  // Targeting
  fetchMetaAudienceTargeting,
  
  // Audiences
  createMetaAudience,
  listMetaAudiences,
  deleteMetaAudience,
  type CreateAudienceOptions,
  
  // Objectives
  LEADS_OBJECTIVE_CONFIG,
  SALES_OBJECTIVE_CONFIG,
  TRAFFIC_OBJECTIVE_CONFIG,
  ENGAGEMENT_OBJECTIVE_CONFIG,
  AWARENESS_OBJECTIVE_CONFIG,
  APP_PROMOTION_OBJECTIVE_CONFIG,
  CAMPAIGN_OBJECTIVE_CONFIGS,
  AVAILABLE_OBJECTIVES,
  getObjectiveConfig,
  isLeadGenAd,
  extractLeadGenFormId,
  getConversionEventLabel,
  SALES_CONVERSION_EVENTS,
  TRAFFIC_DESTINATIONS,
  ENGAGEMENT_TYPES,
  APP_EVENT_TYPES,
  APP_STORES,
  type CampaignObjective,
  type CampaignObjectiveConfig,
  type LeadGenAdSetRequirements,
  type LeadGenCreativeRequirements,
  type SalesAdSetRequirements,
  type TrafficAdSetRequirements,
  type EngagementAdSetRequirements,
  type AwarenessAdSetRequirements,
  type AppPromotionAdSetRequirements,
} from './campaign-modules'
