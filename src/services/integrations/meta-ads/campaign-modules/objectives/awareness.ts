// =============================================================================
// AWARENESS OBJECTIVE - Brand awareness campaign configuration
// =============================================================================

import { CampaignObjectiveConfig } from '../types'

export const AWARENESS_OBJECTIVE_CONFIG: CampaignObjectiveConfig = {
  objective: 'OUTCOME_AWARENESS',
  displayName: 'Awareness',
  optimizationGoals: [
    'AD_RECALL_LIFT',
    'REACH',
    'IMPRESSIONS',
  ],
  billingEvents: [
    'IMPRESSIONS',
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

// Brand lift optimization (for larger budgets)
export interface AwarenessAdSetRequirements {
  // Brand lift studies require special setup
  optimizationGoal: 'AD_RECALL_LIFT' | 'REACH' | 'IMPRESSIONS'
  frequencyControl?: {
    // Maximum impressions per user over time
    impressionCap?: number
    timeUnit?: 'DAY' | 'WEEK' | 'MONTH'
  }
}

// Reach and frequency buying (for predictable delivery)
export interface ReachFrequencyConfig {
  reach: number
  frequency: number
  endTime: string
}
