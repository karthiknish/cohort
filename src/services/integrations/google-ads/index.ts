// =============================================================================
// GOOGLE ADS - Main entry point (re-exports)
// =============================================================================

// Types
export * from './types'

// Errors
export * from './errors'

// Client utilities
export { googleAdsSearch, executeGoogleAdsApiRequest, normalizeCost, DEFAULT_RETRY_CONFIG } from './client'

// Metrics
export {
  fetchGoogleAdsMetrics,
  fetchGoogleAdAccounts,
  checkGoogleAdsIntegrationHealth,
} from './metrics'

// Campaigns
export {
  listGoogleCampaigns,
  updateGoogleCampaignStatus,
  updateGoogleCampaignBudget,
  updateGoogleCampaignBudgetByCampaign,
  updateGoogleCampaignBidding,
  removeGoogleCampaign,
  updateGoogleAdStatus,
  fetchGoogleAdGroupMetrics,
  fetchGoogleAdMetrics,
  fetchGoogleCreatives,
  fetchGoogleAudienceTargeting,
  createGoogleAudience,
} from './campaigns'

// Insights
export {
  calculateGoogleAdsInsights,
  calculateGoogleAdsMetrics,
  generateGoogleAdsInsights,
} from './insights'
export type { GoogleAdsRawMetrics } from './insights'
