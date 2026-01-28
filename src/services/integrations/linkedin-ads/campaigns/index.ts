// =============================================================================
// LINKEDIN ADS CAMPAIGNS - Module Index
// =============================================================================
// This module exports all campaign-related functions for LinkedIn Ads.
// The file has been split into logical sub-modules for maintainability.

// List operations
export {
  listLinkedInCampaigns,
  listLinkedInCampaignGroups,
  fetchLinkedInAds,
} from './list'

// Update operations
export {
  updateLinkedInCampaignStatus,
  updateLinkedInAdStatus,
  updateLinkedInCampaignBudget,
  updateLinkedInCampaignGroupStatus,
  updateLinkedInCampaignGroupBudget,
  updateLinkedInCampaignBidding,
  removeLinkedInCampaign,
} from './update'

// Creative and metrics operations
export {
  resolveLinkedInUrns,
  fetchLinkedInCreativeMetrics,
  fetchLinkedInCreatives,
} from './creatives'

// Audience targeting operations
export {
  fetchLinkedInAudienceTargeting,
  createLinkedInAudience,
} from './audiences'
