// =============================================================================
// TIKTOK ADS - Main entry point (re-exports)
// =============================================================================

// Types
export * from './types'

// Errors
export * from './errors'

// Client utilities
export { executeTikTokApiRequest, coerceNumber, DEFAULT_RETRY_CONFIG } from './client'

// Metrics
export {
  fetchTikTokAdAccounts,
  fetchTikTokAdsMetrics,
  checkTikTokIntegrationHealth,
} from './metrics'

// Campaigns
export {
  listTikTokCampaigns,
  updateTikTokCampaignStatus,
  updateTikTokCampaignBudget,
  removeTikTokCampaign,
  fetchTikTokAdMetrics,
  fetchTikTokCreatives,
  fetchTikTokAudienceTargeting,
} from './campaigns'


