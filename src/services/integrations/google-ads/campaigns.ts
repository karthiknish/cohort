// =============================================================================
// GOOGLE ADS CAMPAIGNS - Re-export from modular files
// =============================================================================
//
// This file re-exports all campaign-related functions from their respective
// modules. This maintains backward compatibility with existing imports from
// '@/services/integrations/google-ads/campaigns'.
//
// For new code, prefer importing from the specific module files.
// =============================================================================

// Campaign CRUD operations
export {
  listGoogleCampaigns,
  updateGoogleCampaignStatus,
  updateGoogleCampaignBudget,
  getGoogleCampaignBudgetId,
  updateGoogleCampaignBudgetByCampaign,
  updateGoogleCampaignBidding,
  removeGoogleCampaign,
} from './campaign-crud'

// Ad group metrics
export { fetchGoogleAdGroupMetrics } from './ad-group-metrics'

// Ad metrics
export { fetchGoogleAdMetrics } from './ad-metrics'

// Creatives
export { fetchGoogleCreatives } from './creatives'

// Audience targeting
export {
  fetchGoogleAudienceTargeting,
  createGoogleAudience,
} from './audience-targeting'
