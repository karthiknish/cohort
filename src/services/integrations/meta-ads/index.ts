// =============================================================================
// META ADS SERVICE - Re-exports all modules
// =============================================================================

// Types
export type {
  MetaAdsOptions,
  RetryConfig,
  MetaInsightAction,
  MetaInsightsRow,
  MetaApiErrorResponse,
  MetaInsightsResponse,
  MetaAdCreative,
  MetaAdInsight,
  MetaAdData,
  MetaAdsListResponse,
  MetaAdAccount,
  MetaCampaign,
  MetaAdSet,
  MetaAdMetric,
  MetaCreative,
  MetaAudienceTargeting,
  MetaPagingState,
  MetaErrorCode,
  NormalizedMetric,
} from './types'

export { META_ERROR_CODES } from './types'

// Errors
export { MetaApiError } from './errors'

// Client utilities
export {
  META_API_VERSION,
  META_API_BASE,
  DEFAULT_RETRY_CONFIG,
  buildTimeRange,
  coerceNumber,
  isRetryableStatus,
  sleep,
  calculateBackoffDelay,
  appendMetaAuthParams,
  executeMetaApiRequest,
} from './client'

// Metrics
export {
  fetchMetaAdAccounts,
  fetchMetaAdsMetrics,
  checkMetaIntegrationHealth,
} from './metrics'

// Campaigns
export {
  listMetaCampaigns,
  updateMetaCampaignStatus,
  updateMetaCampaignBudget,
  updateMetaCampaignBidding,
  removeMetaCampaign,
  updateMetaAdStatus,
  fetchMetaAdMetrics,
  fetchMetaCreatives,
  fetchMetaAudienceTargeting,
  createMetaAudience,
} from './campaigns'

// Creatives
export {
  createMetaAdCreative,
  createMetaAd,
  updateMetaAdCreative,
  uploadMediaToMeta,
} from './creatives'
export type {
  CreateAdCreativeOptions,
  CreateAdOptions,
  UpdateAdCreativeOptions,
  UploadMediaOptions,
} from './creatives'

// Insights
export {
  calculateMetaAdsInsights,
  calculateMetaAdsMetrics,
  generateMetaAdsInsights,
} from './insights'
export type { MetaAdsRawMetrics } from './insights'
