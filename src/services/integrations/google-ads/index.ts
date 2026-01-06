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
  removeGoogleCampaign,
  fetchGoogleAdGroupMetrics,
  fetchGoogleAdMetrics,
  fetchGoogleCreatives,
  fetchGoogleAudienceTargeting,
} from './campaigns'



