// =============================================================================
// GOOGLE ADS CAMPAIGN OBJECTIVES - Export all components
// =============================================================================

// Types
export {
  GOOGLE_OBJECTIVE_CONFIGS,
  GOOGLE_BIDDING_STRATEGIES,
  CONVERSION_GOALS,
  APP_CAMPAIGN_SUBTYPES,
  APP_STORES,
  type GoogleCampaignObjective,
  type GoogleCampaignFormData,
  type GoogleObjectiveComponentProps,
} from './types'

// Selector
export { GoogleObjectiveSelector } from './objective-selector'

// Objective sections
export { GoogleSalesSection } from './sales-section'
export { GoogleLeadsSection } from './leads-section'
export { GoogleTrafficSection } from './traffic-section'
export { GoogleBrandAwarenessSection } from './brand-awareness-section'
export { GoogleAppPromotionSection } from './app-promotion-section'

// Renderer
export { GoogleObjectiveRenderer } from './objective-renderer'
