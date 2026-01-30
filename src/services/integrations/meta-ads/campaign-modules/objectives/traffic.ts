// =============================================================================
// TRAFFIC OBJECTIVE - Traffic campaign configuration
// =============================================================================

import { CampaignObjectiveConfig } from '../types'

export const TRAFFIC_OBJECTIVE_CONFIG: CampaignObjectiveConfig = {
  objective: 'OUTCOME_TRAFFIC',
  displayName: 'Traffic',
  optimizationGoals: [
    'LINK_CLICKS',
    'LANDING_PAGE_VIEWS',
    'REACH',
    'IMPRESSIONS',
  ],
  billingEvents: [
    'IMPRESSIONS',
    'LINK_CLICKS',
  ],
  supportedCreativeTypes: [
    'link',
    'image',
    'video',
    'carousel',
  ],
  defaultCallToAction: 'LEARN_MORE',
  supportsDynamicCreative: true,
  supportedPlacements: [
    'facebook',
    'instagram',
    'messenger',
    'audience_network',
  ],
}

// Traffic objective specific ad set requirements
export interface TrafficAdSetRequirements {
  promotedObject?: {
    // Optional pixel for landing page views optimization
    pixel_id?: string
  }
  optimizationGoal: 'LINK_CLICKS' | 'LANDING_PAGE_VIEWS' | 'REACH'
}

// Traffic campaign destinations
export const TRAFFIC_DESTINATIONS = [
  { value: 'WEBSITE', label: 'Website' },
  { value: 'APP', label: 'App' },
  { value: 'MESSENGER', label: 'Messenger' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
] as const
