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
  listLinkedInCampaignGroups,
  updateLinkedInCampaignStatus,
  updateLinkedInCampaignBudget,
  updateLinkedInCampaignBidding,
  updateLinkedInCampaignGroupStatus,
  updateLinkedInCampaignGroupBudget,
  removeLinkedInCampaign,
  updateLinkedInAdStatus,
  fetchLinkedInCreativeMetrics,
  fetchLinkedInCreatives,
  fetchLinkedInAds,
  resolveLinkedInUrns,
  fetchLinkedInAudienceTargeting,
  createLinkedInAudience,
} from './campaigns'

// Insights
export {
  calculateLinkedInAdsInsights,
  calculateLinkedInAdsMetrics,
  generateLinkedInAdsInsights,
} from './insights'
export type { LinkedInAdsRawMetrics } from './insights'
