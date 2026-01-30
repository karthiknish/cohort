// =============================================================================
// SALES OBJECTIVE - Sales/Conversions campaign configuration
// =============================================================================

import { CampaignObjectiveConfig } from '../types'

export const SALES_OBJECTIVE_CONFIG: CampaignObjectiveConfig = {
  objective: 'OUTCOME_SALES',
  displayName: 'Sales',
  optimizationGoals: [
    'OFFSITE_CONVERSIONS',
    'CONVERSIONS',
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
    'collection',
    'dynamic_ad',
  ],
  defaultCallToAction: 'SHOP_NOW',
  supportsDynamicCreative: true,
  supportedPlacements: [
    'facebook',
    'instagram',
    'messenger',
    'audience_network',
  ],
}

// Sales objective specific ad set requirements
export interface SalesAdSetRequirements {
  promotedObject: {
    pixel_id?: string
    custom_event_type?: 
      | 'PURCHASE' 
      | 'INITIATE_CHECKOUT' 
      | 'ADD_TO_CART' 
      | 'ADD_PAYMENT_INFO'
      | 'ADD_TO_WISHLIST'
      | 'COMPLETE_REGISTRATION'
      | 'CONTENT_VIEW'
    product_catalog_id?: string
    product_set_id?: string
  }
  // Sales campaigns typically optimize for conversions
  optimizationGoal: 'OFFSITE_CONVERSIONS' | 'CONVERSIONS'
}

// Conversion event types for sales campaigns
export const SALES_CONVERSION_EVENTS = [
  { value: 'PURCHASE', label: 'Purchases' },
  { value: 'INITIATE_CHECKOUT', label: 'Initiate Checkout' },
  { value: 'ADD_TO_CART', label: 'Add to Cart' },
  { value: 'ADD_PAYMENT_INFO', label: 'Add Payment Info' },
  { value: 'ADD_TO_WISHLIST', label: 'Add to Wishlist' },
  { value: 'COMPLETE_REGISTRATION', label: 'Complete Registration' },
  { value: 'CONTENT_VIEW', label: 'Content View' },
] as const

// Helper to get conversion event label
export function getConversionEventLabel(eventValue: string): string {
  const event = SALES_CONVERSION_EVENTS.find(e => e.value === eventValue)
  return event?.label || eventValue
}
