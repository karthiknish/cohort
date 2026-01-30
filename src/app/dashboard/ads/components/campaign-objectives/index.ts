// =============================================================================
// CAMPAIGN OBJECTIVES - Export all objective components
// =============================================================================

// Types and configs
export {
  CAMPAIGN_OBJECTIVES,
  CONVERSION_EVENTS,
  APP_EVENT_TYPES,
  ENGAGEMENT_TYPES,
  DESTINATION_TYPES,
  type CampaignObjective,
  type CampaignObjectiveConfig,
  type CampaignFormData,
  type ObjectiveComponentProps,
} from './types'

// Selector components
export { ObjectiveSelector, CompactObjectiveSelector } from './objective-selector'

// Objective-specific sections
export { SalesObjectiveSection } from './sales-objective-section'
export { LeadsObjectiveSection } from './leads-objective-section'
export { TrafficObjectiveSection } from './traffic-objective-section'
export { EngagementObjectiveSection } from './engagement-objective-section'
export { AwarenessObjectiveSection } from './awareness-objective-section'
export { AppPromotionSection } from './app-promotion-section'

// Dynamic renderer
export { ObjectiveRenderer } from './objective-renderer'
