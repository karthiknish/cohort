// =============================================================================
// GOOGLE ADS - Main entry point (re-exports)
// =============================================================================
// Types
export * from './types';
// Errors
export * from './errors';
// Client utilities
export { googleAdsSearch, executeGoogleAdsApiRequest, normalizeCost, DEFAULT_RETRY_CONFIG } from './client';
// Metrics
export { fetchGoogleAdsMetrics, fetchGoogleAdAccounts, checkGoogleAdsIntegrationHealth, } from './metrics';
export { fetchGoogleCampaignInsights, buildGoogleCampaignInsightsGaql } from './campaign-insights';
export type { GoogleCampaignInsightsResult } from './campaign-insights';
// Campaigns
export { listGoogleCampaigns, createGoogleCampaign, updateGoogleCampaignStatus, updateGoogleCampaignBudget, updateGoogleCampaignBudgetByCampaign, updateGoogleCampaignBidding, removeGoogleCampaign, updateGoogleAdStatus, fetchGoogleAdGroupMetrics, fetchGoogleAdMetrics, fetchGoogleCreatives, buildGoogleCreativesGaql, buildGooglePmaxAssetGroupsGaql, buildGoogleYoutubeVideoAssetsGaql, fetchGoogleAudienceTargeting, createGoogleAudience, } from './campaigns';
// Insights
export { calculateGoogleAdsInsights, calculateGoogleAdsMetrics, generateGoogleAdsInsights, } from './insights';
export type { GoogleAdsRawMetrics } from './insights';
