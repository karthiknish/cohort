// =============================================================================
// META ADS SERVICE - Re-exports all modules
// =============================================================================
//
// Marketing API is broader than this package. Coverage vs official docs:
// docs/integrations/meta-marketing-api-coverage.md
// Hub: https://developers.facebook.com/docs/marketing-api/
//
// Types
export type { MetaAdsOptions, RetryConfig, MetaInsightAction, MetaInsightsRow, MetaApiErrorResponse, MetaInsightsResponse, MetaAdCreative, MetaAdInsight, MetaAdData, MetaAdsListResponse, MetaAdAccount, MetaCampaign, MetaAdSet, MetaAdMetric, MetaCreative, MetaAudienceTargeting, MetaPagingState, MetaErrorCode, NormalizedMetric, } from './types';
export { META_ERROR_CODES } from './types';
// Errors
export { MetaApiError } from './errors';
// Client utilities
export { META_API_VERSION, META_API_BASE, DEFAULT_RETRY_CONFIG, buildTimeRange, coerceNumber, isRetryableStatus, sleep, calculateBackoffDelay, appendMetaAuthParams, executeMetaApiRequest, } from './client';
// Utils
export { optimizeMetaImageUrl, isMetaCdnUrl, metaPageIdFromObjectStoryId, facebookPostPermalinkFromObjectStoryId, resolveMetaSocialPermalink, } from './utils';
// Metrics
export { fetchMetaAdAccounts, fetchMetaAdsMetrics, checkMetaIntegrationHealth, metaInsightRowsToNormalizedMetrics, } from './metrics';
// Campaigns
export { listMetaCampaigns, createMetaCampaign, updateMetaCampaignStatus, updateMetaCampaignBudget, updateMetaCampaignBidding, removeMetaCampaign, listMetaAdSets, createMetaAdSet, updateMetaAdSet, updateMetaAdSetStatus, listMetaAudiences, deleteMetaAudience, updateMetaAdStatus, fetchMetaAdMetrics, fetchMetaCreatives, extractMetaCreativeContent, inferMetaDisplayAdType, fetchMetaAudienceTargeting, createMetaAudience, createMetaLookalikeAudience, uploadMetaAudienceUsers, } from './campaigns';
export { searchMetaAdInterests, searchMetaAdGeolocations } from './targeting-search';
export type { MetaTargetingSearchResult } from './targeting-search';
export { listMetaLeadgenForms, createMetaLeadgenForm } from './leadgen-forms';
export type { MetaLeadgenForm } from './leadgen-forms';
export { listMetaPagePosts, listMetaPageEvents } from './page-engagement-resources';
export type { MetaPagePost, MetaPageEvent } from './page-engagement-resources';
export { sendMetaCapiEvents, sendMetaOfflineEvents } from './capi';
export type { MetaCapiEventInput, MetaCapiSendResult } from './capi';
export { executeMetaBatch } from './batch';
export type { MetaBatchRequestItem, MetaBatchResponseItem } from './batch';
export { listMetaBusinesses, listMetaBusinessAdAccounts, } from './business-manager';
export type { MetaBusiness, MetaBusinessAdAccount } from './business-manager';
export { searchMetaAdLibrary } from './ad-library';
export type { MetaAdLibraryAd } from './ad-library';
export { listMetaAdAccountWebhookSubscriptions, updateMetaAdAccountWebhookSubscriptions, clearMetaAdAccountWebhookSubscriptions, } from './webhooks';
export { listMetaAdPixels, getMetaPixelDetails, getMetaPixelStats, } from './pixels';
export type { MetaAdPixel, MetaPixelDetails, MetaPixelStatRow } from './pixels';
export { buildMetaTargetingFromNormalized } from './meta-targeting-serialize';
export type { MetaTargetingSource } from './meta-targeting-serialize';
// Creatives
export { createMetaAdCreative, createMetaAd, deleteMetaAdCreative, recreateMetaAdCreativeForEdit, updateMetaAd, updateMetaAdCreative, fetchMetaPageActors, mergeMetaDestinationSpec, sanitizeMetaDestinationSpec, toMetaApiDestinationSpec, normalizeMetaObjectTypeForCreate, uploadMediaToMeta, uploadVideoToMeta, } from './creatives';
export type { MetaApiDestinationSpec, MetaStoredDestinationSpec, CreateAdCreativeOptions, CreateAdOptions, DeleteAdCreativeOptions, FetchMetaPageActorsOptions, MetaPageActor, RecreateMetaAdCreativeOptions, UpdateAdOptions, UpdateAdCreativeOptions, UploadMediaOptions, } from './creatives';
// Insights
export { calculateMetaAdsInsights, calculateMetaAdsMetrics, generateMetaAdsInsights, } from './insights';
export type { MetaAdsRawMetrics } from './insights';
// Async insights (Ad Report Run) — optional heavy / long-window path
export { startMetaAccountInsightsReport, getMetaAsyncInsightsReportStatus, fetchMetaAsyncInsightsReportRows, waitForMetaAsyncInsightsReport, runMetaAccountInsightsReportToCompletion, } from './async-insights';
export type { MetaAsyncInsightsJobStatus } from './async-insights';
