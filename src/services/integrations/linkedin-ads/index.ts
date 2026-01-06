// =============================================================================
// LINKEDIN ADS - Main entry point (re-exports)
// =============================================================================

// Types
export * from './types'

// Errors
export * from './errors'

// Client utilities
export {
  executeLinkedInApiRequest,
  normalizeCurrency,
  coerceNumber,
  buildTimeRange,
  DEFAULT_RETRY_CONFIG,
} from './client'

// Metrics
export {
  fetchLinkedInAdAccounts,
  fetchLinkedInAdsMetrics,
  checkLinkedInIntegrationHealth,
} from './metrics'

// Campaigns
export {
  listLinkedInCampaigns,
  updateLinkedInCampaignStatus,
  updateLinkedInCampaignBudget,
  updateLinkedInCampaignBidding,
  removeLinkedInCampaign,
  fetchLinkedInCreativeMetrics,
  fetchLinkedInCreatives,
  fetchLinkedInAudienceTargeting,
  createLinkedInAudience,
} from './campaigns'


