// =============================================================================
// META ADS CAMPAIGNS - Modular campaign operations
// =============================================================================

// Core campaign operations
export {
  listMetaCampaigns,
  createMetaCampaign,
  updateMetaCampaign,
  updateMetaCampaignStatus,
  updateMetaCampaignBudget,
  removeMetaCampaign,
  updateMetaCampaignBidding,
} from './core'

export type {
  CreateCampaignOptions,
  UpdateCampaignOptions,
  UpdateCampaignBiddingOptions,
} from './types'

// Ad set operations
export {
  listMetaAdSets,
  createMetaAdSet,
  updateMetaAdSet,
  updateMetaAdSetStatus,
} from './adsets'

export type {
  CreateAdSetOptions,
  UpdateAdSetOptions,
} from './types'

// Ad operations
export {
  listMetaAds,
  updateMetaAdStatus,
  fetchMetaAdMetrics,
} from './ads'

// Creative operations
export {
  fetchMetaCreatives,
} from './creatives'

// Targeting operations
export {
  fetchMetaAudienceTargeting,
} from './targeting'

// Audience operations
export {
  createMetaAudience,
  listMetaAudiences,
  deleteMetaAudience,
} from './audiences'

export type {
  CreateAudienceOptions,
} from './types'

// Campaign objectives
export {
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
} from './objectives'

export type {
  LeadGenAdSetRequirements,
  LeadGenCreativeRequirements,
  SalesAdSetRequirements,
  TrafficAdSetRequirements,
  EngagementAdSetRequirements,
  AwarenessAdSetRequirements,
  AppPromotionAdSetRequirements,
} from './objectives'

// Types
export type {
  CampaignObjective,
  CampaignObjectiveConfig,
} from './types'
