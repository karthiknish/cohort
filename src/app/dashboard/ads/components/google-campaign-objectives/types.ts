// =============================================================================
// GOOGLE ADS CAMPAIGN OBJECTIVE TYPES
// =============================================================================

export type GoogleCampaignObjective =
  | 'SALES'
  | 'LEADS'
  | 'WEBSITE_TRAFFIC'
  | 'BRAND_AWARENESS_AND_REACH'
  | 'APP_PROMOTION'

export interface GoogleCampaignFormData {
  name: string
  objective: GoogleCampaignObjective
  advertisingChannelType?: string
  status: 'ENABLED' | 'PAUSED'
  providerId?: string
  dailyBudget?: number
  biddingStrategyType?: string
  targetCpa?: number
  targetRoas?: number
  startDate?: string
  endDate?: string
  
  // Sales specific
  conversionGoal?: string
  conversionValueRules?: Array<{
    category?: string
    valueMultiplier?: number
  }>
  
  // Leads specific
  leadFormExtension?: string
  phoneNumber?: string
  callReporting?: boolean
  
  // Traffic specific
  landingPageUrl?: string
  trackingTemplate?: string
  
  // Brand awareness specific
  targetImpressionShareLocation?: string
  targetImpressionSharePercentage?: number
  frequencyCapLevel?: string
  frequencyCapEvents?: number
  frequencyCapTimeUnit?: 'DAY' | 'WEEK' | 'MONTH'
  
  // App promotion specific
  appId?: string
  appStore?: 'GOOGLE_PLAY' | 'APPLE_APP_STORE'
  appCampaignSubtype?: string
  
  // Targeting
  targeting?: {
    keywords?: string[]
    negativeKeywords?: string[]
    audiences?: string[]
    demographics?: {
      ageRanges?: string[]
      genders?: string[]
      parentalStatus?: string[]
      householdIncome?: string[]
    }
  }
}

export interface GoogleObjectiveComponentProps {
  formData: GoogleCampaignFormData
  onChange: (updates: Partial<GoogleCampaignFormData>) => void
  disabled?: boolean
}

export const GOOGLE_OBJECTIVE_CONFIGS = [
  {
    value: 'SALES' as const,
    label: 'Sales',
    description: 'Drive online sales with bidding optimized for conversions and revenue',
    icon: 'ShoppingCart',
    color: '#22c55e',
    channelTypes: ['Search', 'Display', 'Shopping', 'Performance Max', 'Demand Gen'],
  },
  {
    value: 'LEADS' as const,
    label: 'Leads',
    description: 'Generate leads with bidding optimized for form submissions',
    icon: 'Users',
    color: '#3b82f6',
    channelTypes: ['Search', 'Display', 'Performance Max', 'Demand Gen', 'Video'],
  },
  {
    value: 'WEBSITE_TRAFFIC' as const,
    label: 'Website Traffic',
    description: 'Drive quality visits to your website',
    icon: 'ExternalLink',
    color: '#f59e0b',
    channelTypes: ['Search', 'Display', 'Discovery', 'Performance Max', 'Demand Gen'],
  },
  {
    value: 'BRAND_AWARENESS_AND_REACH' as const,
    label: 'Brand Awareness',
    description: 'Build brand recognition with reach-focused campaigns',
    icon: 'Eye',
    color: '#8b5cf6',
    channelTypes: ['Display', 'Video', 'Discovery', 'Demand Gen'],
  },
  {
    value: 'APP_PROMOTION' as const,
    label: 'App Promotion',
    description: 'Drive app installs and in-app actions',
    icon: 'Smartphone',
    color: '#06b6d4',
    channelTypes: ['App Campaigns'],
  },
]

export const GOOGLE_BIDDING_STRATEGIES: Record<string, { value: string; label: string; description: string }[]> = {
  SALES: [
    { value: 'TARGET_ROAS', label: 'Target ROAS', description: 'Maximize conversion value at your target return on ad spend' },
    { value: 'MAXIMIZE_CONVERSION_VALUE', label: 'Maximize Conversion Value', description: 'Get the most conversion value within your budget' },
    { value: 'MAXIMIZE_CONVERSIONS', label: 'Maximize Conversions', description: 'Get the most conversions within your budget' },
    { value: 'TARGET_CPA', label: 'Target CPA', description: 'Get conversions at your target cost per acquisition' },
    { value: 'MANUAL_CPC', label: 'Manual CPC', description: 'Set your own maximum cost-per-click bids' },
  ],
  LEADS: [
    { value: 'TARGET_CPA', label: 'Target CPA', description: 'Get conversions at your target cost per acquisition' },
    { value: 'MAXIMIZE_CONVERSIONS', label: 'Maximize Conversions', description: 'Get the most conversions within your budget' },
    { value: 'MANUAL_CPC', label: 'Manual CPC', description: 'Set your own maximum cost-per-click bids' },
    { value: 'MAXIMIZE_CLICKS', label: 'Maximize Clicks', description: 'Get the most clicks within your budget' },
  ],
  WEBSITE_TRAFFIC: [
    { value: 'MAXIMIZE_CLICKS', label: 'Maximize Clicks', description: 'Get the most clicks within your budget' },
    { value: 'TARGET_CPA', label: 'Target CPA', description: 'Get conversions at your target cost per acquisition' },
    { value: 'MANUAL_CPC', label: 'Manual CPC', description: 'Set your own maximum cost-per-click bids' },
  ],
  BRAND_AWARENESS_AND_REACH: [
    { value: 'TARGET_IMPRESSION_SHARE', label: 'Target Impression Share', description: 'Show your ads at the top of search results' },
    { value: 'MANUAL_CPM', label: 'Manual CPM', description: 'Set cost-per-thousand impressions' },
    { value: 'MANUAL_CPV', label: 'Manual CPV', description: 'Set cost-per-view for video ads' },
  ],
  APP_PROMOTION: [
    { value: 'OPTIMIZE_IN_APP_CONVERSIONS', label: 'Optimize In-App Conversions', description: 'Focus on in-app actions with target CPA' },
    { value: 'OPTIMIZE_IN_APP_CONVERSIONS_WITHOUT_TARGET_CPA', label: 'Maximize In-App Conversions', description: 'Get the most in-app actions' },
    { value: 'OPTIMIZE_TOTAL_VALUE', label: 'Optimize Total Value', description: 'Focus on in-app value with target ROAS' },
    { value: 'OPTIMIZE_TOTAL_VALUE_WITHOUT_TARGET_ROAS', label: 'Maximize Total Value', description: 'Get the most in-app value' },
  ],
}

export const CONVERSION_GOALS = [
  { value: 'PURCHASE', label: 'Purchases', description: 'Complete purchase transactions' },
  { value: 'ADD_TO_CART', label: 'Add to Cart', description: 'Items added to shopping cart' },
  { value: 'BEGIN_CHECKOUT', label: 'Begin Checkout', description: 'Started checkout process' },
  { value: 'SUBMIT_LEAD_FORM', label: 'Submit Lead Form', description: 'Submitted lead forms' },
]

export const APP_CAMPAIGN_SUBTYPES = [
  { value: 'APP_INSTALLS', label: 'App Installs', description: 'Focus on new user acquisition' },
  { value: 'APP_ENGAGEMENT', label: 'App Engagement', description: 'Re-engage existing users' },
  { value: 'APP_PRE_REGISTRATION', label: 'App Pre-Registration', description: 'Build buzz before launch' },
]

export const APP_STORES = [
  { value: 'GOOGLE_PLAY', label: 'Google Play Store', description: 'Android apps' },
  { value: 'APPLE_APP_STORE', label: 'Apple App Store', description: 'iOS apps' },
]
