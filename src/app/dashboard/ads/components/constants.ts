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
  SIGN_IN_REQUIRED: 'Sign in again to run a sync.',
  SYNC_FAILED: 'Unable to run sync job',
  CONNECTION_FAILED: 'Unable to connect. Please try again.',
  LOAD_METRICS_FAILED: 'Failed to load marketing data',
  LOAD_MORE_FAILED: 'Failed to load additional rows',
  GOOGLE_INIT_FAILED: 'Failed to initialize Google Ads',
  LINKEDIN_INIT_FAILED: 'Failed to initialize LinkedIn Ads',
  META_INIT_FAILED: 'Failed to finish Meta Ads setup',
  TIKTOK_INIT_FAILED: 'Failed to finish TikTok Ads setup',
  QUEUE_SYNC_FAILED: 'Failed to queue sync job',
  PROCESS_SYNC_FAILED: 'Sync processor failed',
  DISCONNECT_FAILED: 'Unable to disconnect. Please try again.',
  SAVE_SETTINGS_FAILED: 'Unable to update automation settings',
} as const

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
} as const
