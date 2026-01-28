/**
 * Constants for the Ads page and related components.
 * Centralizes magic numbers and repeated values.
 *
 * Theme-related constants have been moved to @/lib/themes
 */

// Re-export theme-related types and constants for convenience
export {
  PROVIDER_IDS,
  PROVIDER_INFO,
  PROVIDER_THEMES,
  PROVIDER_COLORS,
  type ProviderId,
  type ProviderInfo,
  type ProviderInfoKey,
} from '@/lib/themes'

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
// API ENDPOINTS
// =============================================================================

export const API_ENDPOINTS = {
  INTEGRATIONS: {
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
