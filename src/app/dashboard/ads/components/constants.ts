/**
 * Constants for the Ads page and related components.
 * Centralizes magic numbers and repeated values.
 */

// =============================================================================
// HTTP STATUS CODES
// =============================================================================

/** HTTP 204 No Content - successful response with no body */
export const HTTP_NO_CONTENT = 204

// =============================================================================
// DATE RANGE DEFAULTS
// =============================================================================

/** Default number of days to show in date range (30 days) */
export const DEFAULT_DATE_RANGE_DAYS = 30

// =============================================================================
// PROVIDER IDENTIFIERS
// =============================================================================

export const PROVIDER_IDS = {
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
  META: 'meta',
  LINKEDIN: 'linkedin',
  TIKTOK: 'tiktok',
} as const

export type ProviderId = typeof PROVIDER_IDS[keyof typeof PROVIDER_IDS]

// =============================================================================
// API ENDPOINTS
// =============================================================================

export const API_ENDPOINTS = {
  INTEGRATIONS: {
    STATUS: '/api/integrations/status',
    SETTINGS: '/api/integrations/settings',
    MANUAL_SYNC: '/api/integrations/manual-sync',
    PROCESS: '/api/integrations/process',
    GOOGLE_INIT: '/api/integrations/google/initialize',
    LINKEDIN_INIT: '/api/integrations/linkedin/initialize',
    META_INIT: '/api/integrations/meta/initialize',
    TIKTOK_INIT: '/api/integrations/tiktok/initialize',
  },
  METRICS: '/api/metrics',
} as const

// =============================================================================
// ERROR MESSAGES
// =============================================================================

export const ERROR_MESSAGES = {
  SIGN_IN_REQUIRED: 'Your session has expired. Please sign in again to continue.',
  SYNC_FAILED: 'Unable to run sync job. The platform may be temporarily unavailable.',
  CONNECTION_FAILED: 'Unable to connect. Please check your internet connection and try again.',
  LOAD_METRICS_FAILED: 'Failed to load marketing data. Refresh the page to try again.',
  LOAD_MORE_FAILED: 'Failed to load additional rows. Scroll up and try again.',
  GOOGLE_INIT_FAILED: 'Failed to initialize Google Ads. Make sure you have an active Google Ads account.',
  LINKEDIN_INIT_FAILED: 'Failed to initialize LinkedIn Ads. Ensure you have LinkedIn Campaign Manager access.',
  META_INIT_FAILED: 'Failed to finish Meta Ads setup. Make sure you have access to a Meta Business account.',
  TIKTOK_INIT_FAILED: 'Failed to finish TikTok Ads setup. Ensure you have TikTok Ads Manager access.',
  QUEUE_SYNC_FAILED: 'Failed to queue sync job. Please try again in a few moments.',
  PROCESS_SYNC_FAILED: 'Sync processor encountered an issue. Your data will sync on the next scheduled run.',
  DISCONNECT_FAILED: 'Unable to disconnect. Please refresh the page and try again.',
  SAVE_SETTINGS_FAILED: 'Unable to update automation settings. Please check your connection and try again.',
} as const

// =============================================================================
// DETAILED ERROR GUIDANCE
// =============================================================================

export const ERROR_GUIDANCE = {
  // OAuth specific errors
  POPUP_BLOCKED: {
    title: 'Popup blocked',
    message: 'Your browser blocked the login popup.',
    action: 'Allow popups for this site and try again.',
  },
  OAUTH_CANCELLED: {
    title: 'Login cancelled',
    message: 'You closed the login window before completing.',
    action: 'Click connect again to retry.',
  },
  OAUTH_DENIED: {
    title: 'Permission denied',
    message: 'You declined the required permissions.',
    action: 'To sync your ad data, we need read access to your ad accounts.',
  },
  OAUTH_EXPIRED: {
    title: 'Session expired',
    message: 'The login process took too long.',
    action: 'Click connect to start a fresh login.',
  },

  // Platform-specific errors
  NO_AD_ACCOUNTS: {
    title: 'No ad accounts found',
    message: 'We couldn\'t find any ad accounts linked to your profile.',
    action: 'Make sure you have admin or advertiser access to at least one ad account.',
  },
  ACCOUNT_SUSPENDED: {
    title: 'Account issue detected',
    message: 'Your ad account may be suspended or have restrictions.',
    action: 'Check your ad platform for any account alerts.',
  },
  RATE_LIMITED: {
    title: 'Too many attempts',
    message: 'We\'ve made too many requests to the ad platform.',
    action: 'Wait a few minutes before trying again.',
  },

  // Network errors
  NETWORK_ERROR: {
    title: 'Connection issue',
    message: 'Unable to reach the server.',
    action: 'Check your internet connection and try again.',
  },
  TIMEOUT: {
    title: 'Request timed out',
    message: 'The request took too long to complete.',
    action: 'Try again. If the problem persists, the platform may be experiencing issues.',
  },

  // Configuration errors
  NOT_CONFIGURED: {
    title: 'Integration not available',
    message: 'This integration hasn\'t been configured yet.',
    action: 'Contact support to enable this integration.',
  },
} as const

export type ErrorGuidanceKey = keyof typeof ERROR_GUIDANCE

// =============================================================================
// SUCCESS MESSAGES
// =============================================================================

export const SUCCESS_MESSAGES = {
  SYNC_COMPLETE: (providerName: string) => `${providerName} metrics refreshed.`,
  SYNC_COMPLETE_WITH_RETRIES: (providerName: string, retries: number) => 
    `${providerName} metrics refreshed after ${retries} retry(s).`,
  DISCONNECTED: (providerName: string) => `${providerName} has been disconnected.`,
  AUTOMATION_UPDATED: (providerName: string) => `${providerName} sync settings saved.`,
  META_CONNECTED: 'Meta Ads connected!',
  TIKTOK_CONNECTED: 'TikTok Ads connected!',
  GOOGLE_CONNECTED: 'Google Ads connected!',
  LINKEDIN_CONNECTED: 'LinkedIn Ads connected!',
} as const

// =============================================================================
// TOAST TITLES
// =============================================================================

export const TOAST_TITLES = {
  SYNC_FAILED: 'Sync failed',
  CONNECTION_FAILED: 'Connection failed',
  SYNC_COMPLETE: 'Sync complete',
  DISCONNECTED: 'Disconnected',
  DISCONNECT_FAILED: 'Disconnect failed',
  SAVE_FAILED: 'Save failed',
  AUTOMATION_UPDATED: 'Automation updated',
  SESSION_EXPIRED: 'Session expired',
  UNABLE_TO_SYNC: 'Unable to sync',
  NOTHING_TO_SYNC: 'Nothing to sync right now',
  NO_SETTINGS: 'No settings to save',
  META_SETUP_FAILED: 'Meta setup failed',
  TIKTOK_SETUP_FAILED: 'TikTok setup failed',
  CONNECTING: 'Connecting...',
} as const

// =============================================================================
// CONNECTION STEP LABELS
// =============================================================================

export const CONNECTION_STEPS = {
  REDIRECTING: 'Redirecting to login...',
  AUTHENTICATING: 'Authenticating with platform...',
  FETCHING_ACCOUNTS: 'Fetching your ad accounts...',
  SELECTING_ACCOUNT: 'Selecting default account...',
  SYNCING_DATA: 'Starting initial data sync...',
  COMPLETE: 'Connection complete!',
} as const

// =============================================================================
// PROVIDER DESCRIPTIONS & BENEFITS
// =============================================================================

export const PROVIDER_INFO = {
  [PROVIDER_IDS.GOOGLE]: {
    name: 'Google Ads',
    shortName: 'Google',
    description: 'Import campaign performance, budgets, and ROAS insights directly from Google Ads.',
    benefits: [
      'Campaign spend and budget tracking',
      'Conversion and ROAS metrics',
      'Search, Display, and YouTube performance',
    ],
    requirements: [
      'Active Google Ads account',
      'Admin or Standard access to the account',
    ],
    loginMethod: 'popup' as const,
    estimatedSetupTime: '30 seconds',
  },
  [PROVIDER_IDS.FACEBOOK]: {
    name: 'Meta Ads Manager',
    shortName: 'Meta',
    description: 'Pull spend, results, and creative breakdowns from Meta and Instagram campaigns.',
    benefits: [
      'Facebook and Instagram ad performance',
      'Creative-level reporting',
      'Audience and placement insights',
    ],
    requirements: [
      'Meta Business account',
      'Admin access to at least one ad account',
    ],
    loginMethod: 'redirect' as const,
    estimatedSetupTime: '1 minute',
  },
  [PROVIDER_IDS.LINKEDIN]: {
    name: 'LinkedIn Ads',
    shortName: 'LinkedIn',
    description: 'Sync lead-gen form results and campaign analytics from LinkedIn.',
    benefits: [
      'Sponsored content performance',
      'Lead generation metrics',
      'B2B audience insights',
    ],
    requirements: [
      'LinkedIn Campaign Manager access',
      'Admin or Account Manager role',
    ],
    loginMethod: 'popup' as const,
    estimatedSetupTime: '30 seconds',
  },
  [PROVIDER_IDS.TIKTOK]: {
    name: 'TikTok Ads',
    shortName: 'TikTok',
    description: 'Bring in spend, engagement, and conversion insights from TikTok campaign flights.',
    benefits: [
      'Campaign and ad group performance',
      'Video engagement metrics',
      'Conversion tracking',
    ],
    requirements: [
      'TikTok Ads Manager account',
      'Advertiser access or higher',
    ],
    loginMethod: 'redirect' as const,
    estimatedSetupTime: '1 minute',
  },
} as const

export type ProviderInfoKey = keyof typeof PROVIDER_INFO
