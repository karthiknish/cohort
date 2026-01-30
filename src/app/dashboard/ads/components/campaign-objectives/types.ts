// =============================================================================
// CAMPAIGN OBJECTIVE TYPES - Shared types for objective-specific components
// =============================================================================

export type CampaignObjective =
  | 'OUTCOME_SALES'
  | 'OUTCOME_LEADS'
  | 'OUTCOME_TRAFFIC'
  | 'OUTCOME_ENGAGEMENT'
  | 'OUTCOME_AWARENESS'
  | 'OUTCOME_APP_PROMOTION'

export interface CampaignObjectiveConfig {
  objective: CampaignObjective
  displayName: string
  description: string
  icon: string
  color: string
  optimizationGoals: string[]
  supportedCreativeTypes: string[]
  defaultCallToAction: string
  requiresConversionPixel?: boolean
  requiresAppId?: boolean
  supportsLeadForms?: boolean
}

export interface CampaignFormData {
  name: string
  objective: CampaignObjective
  status: 'ACTIVE' | 'PAUSED'
  providerId?: string
  dailyBudget?: number
  lifetimeBudget?: number
  startTime?: string
  stopTime?: string
  
  // Objective-specific fields
  optimizationGoal?: string
  billingEvent?: string
  
  // Sales/Conversions
  conversionEvent?: string
  pixelId?: string
  
  // Leads
  leadFormId?: string
  instantFormEnabled?: boolean
  
  // App Promotion
  appId?: string
  appStoreUrl?: string
  appEventType?: string
  
  // Traffic
  destinationUrl?: string
  destinationType?: 'WEBSITE' | 'APP' | 'MESSENGER' | 'WHATSAPP'
  
  // Engagement
  engagementType?: 'POST_ENGAGEMENT' | 'PAGE_ENGAGEMENT' | 'EVENT_RESPONSES'
  postId?: string
  eventId?: string
  
  // Targeting
  targeting?: {
    ageMin?: number
    ageMax?: number
    genders?: number[]
    geoLocations?: string[]
    interests?: string[]
    customAudiences?: string[]
  }
  
  // Placements
  placements?: string[]
}

export interface ObjectiveComponentProps {
  formData: CampaignFormData
  onChange: (updates: Partial<CampaignFormData>) => void
  disabled?: boolean
  providerId: string
}

export const CAMPAIGN_OBJECTIVES: CampaignObjectiveConfig[] = [
  {
    objective: 'OUTCOME_SALES',
    displayName: 'Sales',
    description: 'Find people likely to purchase your products or services',
    icon: 'ShoppingCart',
    color: '#22c55e',
    optimizationGoals: ['OFFSITE_CONVERSIONS', 'CONVERSIONS', 'LINK_CLICKS', 'LANDING_PAGE_VIEWS'],
    supportedCreativeTypes: ['link', 'image', 'video', 'carousel', 'collection'],
    defaultCallToAction: 'SHOP_NOW',
    requiresConversionPixel: true,
  },
  {
    objective: 'OUTCOME_LEADS',
    displayName: 'Leads',
    description: 'Collect leads for your business with forms',
    icon: 'Users',
    color: '#3b82f6',
    optimizationGoals: ['LEAD_GENERATION', 'LINK_CLICKS', 'REACH'],
    supportedCreativeTypes: ['lead_generation', 'link', 'image', 'video'],
    defaultCallToAction: 'SIGN_UP',
    supportsLeadForms: true,
  },
  {
    objective: 'OUTCOME_TRAFFIC',
    displayName: 'Traffic',
    description: 'Send people to a website, app or event',
    icon: 'ExternalLink',
    color: '#f59e0b',
    optimizationGoals: ['LINK_CLICKS', 'LANDING_PAGE_VIEWS', 'REACH', 'IMPRESSIONS'],
    supportedCreativeTypes: ['link', 'image', 'video', 'carousel'],
    defaultCallToAction: 'LEARN_MORE',
  },
  {
    objective: 'OUTCOME_ENGAGEMENT',
    displayName: 'Engagement',
    description: 'Get more messages, video views or post engagement',
    icon: 'Heart',
    color: '#ec4899',
    optimizationGoals: ['POST_ENGAGEMENT', 'PAGE_ENGAGEMENT', 'EVENT_RESPONSES', 'REACH'],
    supportedCreativeTypes: ['link', 'image', 'video', 'carousel', 'event'],
    defaultCallToAction: 'LEARN_MORE',
  },
  {
    objective: 'OUTCOME_AWARENESS',
    displayName: 'Awareness',
    description: 'Introduce your brand to new people',
    icon: 'Eye',
    color: '#8b5cf6',
    optimizationGoals: ['AD_RECALL_LIFT', 'REACH', 'IMPRESSIONS'],
    supportedCreativeTypes: ['link', 'image', 'video', 'carousel'],
    defaultCallToAction: 'LEARN_MORE',
  },
  {
    objective: 'OUTCOME_APP_PROMOTION',
    displayName: 'App Promotion',
    description: 'Find new users for your app',
    icon: 'Smartphone',
    color: '#06b6d4',
    optimizationGoals: ['APP_INSTALLS', 'APP_ENGAGEMENT', 'LINK_CLICKS'],
    supportedCreativeTypes: ['app_install', 'image', 'video', 'carousel'],
    defaultCallToAction: 'INSTALL_NOW',
    requiresAppId: true,
  },
]

export const CONVERSION_EVENTS = [
  { value: 'PURCHASE', label: 'Purchases', description: 'Complete purchase' },
  { value: 'INITIATE_CHECKOUT', label: 'Initiate Checkout', description: 'Start checkout process' },
  { value: 'ADD_TO_CART', label: 'Add to Cart', description: 'Add item to cart' },
  { value: 'ADD_PAYMENT_INFO', label: 'Add Payment Info', description: 'Enter payment details' },
  { value: 'ADD_TO_WISHLIST', label: 'Add to Wishlist', description: 'Add item to wishlist' },
  { value: 'COMPLETE_REGISTRATION', label: 'Complete Registration', description: 'Finish signup' },
  { value: 'CONTENT_VIEW', label: 'Content View', description: 'View key content' },
] as const

export const APP_EVENT_TYPES = [
  { value: 'MOBILE_APP_INSTALL', label: 'App Installs', description: 'Install your app' },
  { value: 'MOBILE_APP_ENGAGEMENT', label: 'App Engagement', description: 'Engage with your app' },
  { value: 'MOBILE_APP_RETENTION', label: 'App Retention', description: 'Return to your app' },
] as const

export const ENGAGEMENT_TYPES = [
  { value: 'POST_ENGAGEMENT', label: 'Post Engagement', description: 'Engage with posts' },
  { value: 'PAGE_ENGAGEMENT', label: 'Page Engagement', description: 'Engage with page' },
  { value: 'EVENT_RESPONSES', label: 'Event Responses', description: 'Respond to events' },
  { value: 'OFFER_CLAIMS', label: 'Offer Claims', description: 'Claim offers' },
] as const

export const DESTINATION_TYPES = [
  { value: 'WEBSITE', label: 'Website', description: 'Send traffic to your website' },
  { value: 'APP', label: 'App', description: 'Open your mobile app' },
  { value: 'MESSENGER', label: 'Messenger', description: 'Start Messenger conversation' },
  { value: 'WHATSAPP', label: 'WhatsApp', description: 'Start WhatsApp conversation' },
] as const
