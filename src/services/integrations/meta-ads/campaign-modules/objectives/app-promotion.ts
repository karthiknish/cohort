// =============================================================================
// APP PROMOTION OBJECTIVE - App install/engagement campaign configuration
// =============================================================================

import { CampaignObjectiveConfig } from '../types'

export const APP_PROMOTION_OBJECTIVE_CONFIG: CampaignObjectiveConfig = {
  objective: 'OUTCOME_APP_PROMOTION',
  displayName: 'App Promotion',
  optimizationGoals: [
    'APP_INSTALLS',
    'APP_ENGAGEMENT',
    'LINK_CLICKS',
    'REACH',
    'IMPRESSIONS',
  ],
  billingEvents: [
    'IMPRESSIONS',
    'APP_INSTALLS',
    'LINK_CLICKS',
  ],
  supportedCreativeTypes: [
    'app_install',
    'image',
    'video',
    'carousel',
    'playable',
  ],
  defaultCallToAction: 'INSTALL_NOW',
  supportsDynamicCreative: true,
  supportedPlacements: [
    'facebook',
    'instagram',
    'audience_network',
    'messenger',
  ],
}

// App promotion specific requirements
export interface AppPromotionAdSetRequirements {
  promotedObject: {
    application_id: string
    object_store_url: string
  }
  optimizationGoal: 'APP_INSTALLS' | 'APP_ENGAGEMENT' | 'LINK_CLICKS'
  appEventType?: 
    | 'MOBILE_APP_INSTALL'
    | 'MOBILE_APP_ENGAGEMENT'
    | 'MOBILE_APP_RETENTION'
}

// App event types for optimization
export const APP_EVENT_TYPES = [
  { value: 'MOBILE_APP_INSTALL', label: 'App Installs' },
  { value: 'MOBILE_APP_ENGAGEMENT', label: 'App Engagement' },
  { value: 'MOBILE_APP_RETENTION', label: 'App Retention' },
] as const

// Supported app stores
export const APP_STORES = [
  { value: 'APP_STORE', label: 'Apple App Store' },
  { value: 'GOOGLE_PLAY', label: 'Google Play Store' },
] as const
