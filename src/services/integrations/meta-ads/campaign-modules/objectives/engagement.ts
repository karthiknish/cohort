// =============================================================================
// ENGAGEMENT OBJECTIVE - Engagement campaign configuration
// =============================================================================

import { CampaignObjectiveConfig } from '../types'

export const ENGAGEMENT_OBJECTIVE_CONFIG: CampaignObjectiveConfig = {
  objective: 'OUTCOME_ENGAGEMENT',
  displayName: 'Engagement',
  optimizationGoals: [
    'POST_ENGAGEMENT',
    'PAGE_ENGAGEMENT',
    'EVENT_RESPONSES',
    'LINK_CLICKS',
    'REACH',
    'IMPRESSIONS',
  ],
  billingEvents: [
    'IMPRESSIONS',
    'POST_ENGAGEMENT',
  ],
  supportedCreativeTypes: [
    'link',
    'image',
    'video',
    'carousel',
    'event',
    'offer',
  ],
  defaultCallToAction: 'LEARN_MORE',
  supportsDynamicCreative: true,
  supportedPlacements: [
    'facebook',
    'instagram',
    'messenger',
  ],
}

// Engagement types
export const ENGAGEMENT_TYPES = [
  { value: 'POST_ENGAGEMENT', label: 'Post Engagement' },
  { value: 'PAGE_ENGAGEMENT', label: 'Page Engagement' },
  { value: 'EVENT_RESPONSES', label: 'Event Responses' },
  { value: 'OFFER_CLAIMS', label: 'Offer Claims' },
] as const

// Engagement objective specific requirements
export interface EngagementAdSetRequirements {
  promotedObject?: {
    page_id?: string
    event_id?: string
    offer_id?: string
  }
  optimizationGoal: 'POST_ENGAGEMENT' | 'PAGE_ENGAGEMENT' | 'EVENT_RESPONSES' | 'OFFER_CLAIMS'
}
