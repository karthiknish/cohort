/**
 * Domain-Specific User-Friendly Error Messages
 * Provides contextual, helpful error messages for specific operations
 */

// =============================================================================
// OPERATION-SPECIFIC ERROR MESSAGES
// =============================================================================

export const OPERATION_ERROR_MESSAGES = {
  // Authentication & Account
  signIn: {
    failed: 'Unable to sign you in. Please check your email and password.',
    expired: 'Your session has ended. Please sign in again to continue.',
    required: 'Please sign in to access this feature.',
    locked: 'Your account has been temporarily locked. Please try again in a few minutes.',
  },
  signUp: {
    failed: 'Unable to create your account. Please try again.',
    emailExists: 'An account with this email already exists. Try signing in instead.',
    weakPassword: 'Please choose a stronger password with at least 8 characters, including letters and numbers.',
  },
  password: {
    resetFailed: 'Unable to reset your password. Please try again or contact support.',
    changeFailed: 'Unable to change your password. Please try again.',
    mismatch: 'The passwords you entered don\'t match. Please try again.',
  },

  // Data Operations
  save: {
    failed: 'Unable to save your changes. Please try again.',
    conflict: 'Someone else may have edited this. Please refresh and try again.',
    offline: 'Unable to save while offline. Your changes will sync when you reconnect.',
  },
  load: {
    failed: 'Unable to load this content. Please refresh the page.',
    notFound: 'This item may have been moved or deleted.',
    timeout: 'This is taking too long. Please check your connection and try again.',
  },
  delete: {
    failed: 'Unable to delete this item. Please try again.',
    inUse: 'This item is being used elsewhere and cannot be deleted.',
    protected: 'This item is protected and cannot be deleted.',
  },
  update: {
    failed: 'Unable to update this item. Please try again.',
    stale: 'This item was modified by someone else. Please refresh to see the latest version.',
  },

  // File Operations
  upload: {
    failed: 'Unable to upload your file. Please try again.',
    tooLarge: 'This file is too large. Please try a smaller file (under 10MB).',
    invalidType: 'This file type is not supported. Please use a different format.',
    quota: 'You\'ve reached your storage limit. Please delete some files to continue.',
  },
  download: {
    failed: 'Unable to download this file. Please try again.',
    notFound: 'This file is no longer available.',
  },

  // Integration & Sync
  sync: {
    failed: 'Unable to sync your data. Please try again.',
    authRequired: 'Please reconnect your account to continue syncing.',
    rateLimit: 'Too many sync requests. Please wait a moment and try again.',
  },
  connect: {
    failed: 'Unable to connect. Please check your credentials and try again.',
    timeout: 'Connection timed out. Please check your network and try again.',
    unauthorized: 'Your connection credentials have expired. Please reconnect.',
  },
  disconnect: {
    failed: 'Unable to disconnect. Please try again.',
  },

  // Collaboration
  invite: {
    failed: 'Unable to send invitation. Please try again.',
    invalidEmail: 'Please enter a valid email address.',
    alreadyMember: 'This person is already a member of your team.',
  },
  share: {
    failed: 'Unable to share this item. Please try again.',
    noPermission: 'You don\'t have permission to share this item.',
  },

  // Payments & Billing
  payment: {
    failed: 'Payment could not be processed. Please check your payment details.',
    declined: 'Your payment was declined. Please try a different payment method.',
    expired: 'Your payment method has expired. Please update your billing information.',
  },
  subscription: {
    failed: 'Unable to update your subscription. Please try again.',
    cancelled: 'Your subscription has been cancelled.',
  },

  // Export & Import
  export: {
    failed: 'Unable to export your data. Please try again.',
    tooLarge: 'Too much data to export at once. Please select a smaller date range.',
  },
  import: {
    failed: 'Unable to import this data. Please check the file format.',
    invalidFormat: 'This file format is not supported. Please use CSV or Excel.',
    partial: 'Some items could not be imported. Please review and try again.',
  },
} as const

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

type OperationCategory = keyof typeof OPERATION_ERROR_MESSAGES
type OperationErrorKey<T extends OperationCategory> = keyof (typeof OPERATION_ERROR_MESSAGES)[T]

/**
 * Get a user-friendly error message for a specific operation
 */
export function getOperationErrorMessage<T extends OperationCategory>(
  category: T,
  errorType: OperationErrorKey<T>
): string {
  return OPERATION_ERROR_MESSAGES[category][errorType] as string
}

/**
 * Common fallback messages when specific operation is unknown
 */
export const FALLBACK_MESSAGES = {
  generic: "Something didn't work as expected. Please try again, or contact support if the problem continues.",
  network: "We can't reach the server right now. Please check your internet connection and try again.",
  permission: "You don't have permission to do this. If you need access, please contact your administrator.",
  session: 'Your session has expired. Please sign in again to continue.',
  validation: 'Please check the form for errors and correct the highlighted fields.',
  notFound: "We couldn't find what you're looking for. It may have been moved or deleted.",
  rateLimit: "You're making requests too quickly. Please wait a moment before trying again.",
  serverError: "Something unexpected happened on our end. We're looking into it — please try again in a moment.",
  maintenance: "We're temporarily down for maintenance. Please check back shortly.",
} as const

/**
 * Get a contextual error message based on the action being performed
 */
export function getContextualErrorMessage(
  action: string,
  errorType: 'failed' | 'notFound' | 'unauthorized' | 'network' | 'timeout' = 'failed'
): string {
  const actionLower = action.toLowerCase()

  if (errorType === 'network') {
    return FALLBACK_MESSAGES.network
  }

  if (errorType === 'unauthorized') {
    return FALLBACK_MESSAGES.session
  }

  if (errorType === 'notFound') {
    return `The ${actionLower} you're looking for could not be found. It may have been moved or deleted.`
  }

  if (errorType === 'timeout') {
    return `${action} is taking longer than expected. Please check your connection and try again.`
  }

  return `Unable to ${actionLower}. Please try again, or contact support if the problem continues.`
}
