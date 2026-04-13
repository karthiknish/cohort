// =============================================================================
// LEADS OBJECTIVE - Lead generation campaign configuration
// =============================================================================

import type { CampaignObjectiveConfig } from '../types'

export const LEADS_OBJECTIVE_CONFIG: CampaignObjectiveConfig = {
  objective: 'OUTCOME_LEADS',
  displayName: 'Leads',
  optimizationGoals: [
    'LEAD_GENERATION',
    'LINK_CLICKS',
    'REACH',
    'IMPRESSIONS',
  ],
  billingEvents: [
    'IMPRESSIONS',
    'LINK_CLICKS',
  ],
  supportedCreativeTypes: [
    'lead_generation',
    'link',
    'image',
    'video',
    'carousel',
  ],
  defaultCallToAction: 'SIGN_UP',
  supportsLeadGen: true,
  supportsDynamicCreative: true,
  supportedPlacements: [
    'facebook',
    'instagram',
    'messenger',
    'audience_network',
  ],
}

// Lead gen specific ad set requirements
export interface LeadGenAdSetRequirements {
  promotedObject: {
    page_id: string
    // For lead gen, we need a page but not necessarily a pixel
    custom_event_type?: 'LEAD' | 'COMPLETE_REGISTRATION'
  }
  // Lead gen requires instant forms
  requiresInstantForm: true
  // Lead gen has specific optimization goals
  optimizationGoal: 'LEAD_GENERATION'
}

// Lead gen creative requirements
export interface LeadGenCreativeRequirements {
  objectStorySpec: {
    page_id: string
    link_data?: {
      call_to_action: {
        type: string
        value: {
          leadgen_form_id: string
        }
      }
    }
  }
  // Asset feed spec for dynamic creative lead gen
  assetFeedSpec?: {
    images?: Array<{ hash?: string; url?: string }>
    bodies?: Array<{ text: string }>
    titles?: Array<{ text: string }>
    link_urls?: Array<{ website_url?: string }>
  }
}

type LeadGenStorySpec = {
  object_story_spec?: {
    link_data?: {
      call_to_action?: {
        value?: { leadgen_form_id?: string }
      }
      child_attachments?: Array<{
        call_to_action?: {
          value?: { leadgen_form_id?: string }
        }
      }>
    }
    video_data?: {
      call_to_action?: {
        value?: { leadgen_form_id?: string }
      }
    }
    template_data?: {
      call_to_action?: {
        value?: { leadgen_form_id?: string }
      }
    }
  }
}

// Helper to extract lead gen form ID (ad level, creative root, link / video / template CTA)
export function extractLeadGenFormId(
  ad?: { leadgen_form_id?: string } | null,
  creative?: (LeadGenStorySpec & { leadgen_form_id?: string }) | null
): string | undefined {
  if (ad?.leadgen_form_id) return ad.leadgen_form_id
  if (creative && typeof creative.leadgen_form_id === 'string' && creative.leadgen_form_id.length > 0) {
    return creative.leadgen_form_id
  }
  const spec = creative?.object_story_spec
  const fromChild = spec?.link_data?.child_attachments
    ?.map((row) => row?.call_to_action?.value?.leadgen_form_id)
    .find((id): id is string => typeof id === 'string' && id.length > 0)

  return (
    spec?.link_data?.call_to_action?.value?.leadgen_form_id
    || fromChild
    || spec?.video_data?.call_to_action?.value?.leadgen_form_id
    || spec?.template_data?.call_to_action?.value?.leadgen_form_id
  )
}

// Helper to check if an ad is a lead gen ad
export function isLeadGenAd(
  creative?: LeadGenStorySpec | null,
  ad?: { leadgen_form_id?: string } | null
): boolean {
  return !!extractLeadGenFormId(ad ?? undefined, creative ?? undefined)
}
