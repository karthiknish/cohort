import {
  InvalidCredentialsError,
  InvalidEmailError,
  WeakPasswordError,
  EmailAlreadyExistsError,
  AccountDisabledError,
  AccountSuspendedError,
  AccountPendingError,
  SessionExpiredError,
  NetworkError,
  NetworkTimeoutError,
  OAuthCancelledError,
  OAuthPopupBlockedError,
  OAuthError,
  RateLimitError,
  ServiceUnavailableError,
  UnauthorizedError,
} from '@/lib/api-errors'

/**
 * Auth error codes from various sources (Firebase, Better Auth, generic)
 */
export type AuthErrorCode =
  // Firebase/Legacy codes
  | 'auth/invalid-email'
  | 'auth/user-disabled'
  | 'auth/user-not-found'
  | 'auth/wrong-password'
  | 'auth/invalid-credential'
  | 'auth/too-many-requests'
  | 'auth/operation-not-allowed'
  | 'auth/email-already-in-use'
  | 'auth/weak-password'
  | 'auth/popup-closed-by-user'
  | 'auth/popup-blocked'
  | 'auth/unauthorized-domain'
  | 'auth/account-exists-with-different-credential'
  | 'auth/cancelled-popup-request'
  | 'auth/network-request-failed'
  | 'auth/timeout'
  | 'auth/requires-recent-login'
  | 'auth/internal-error'
  | 'auth/invalid-api-key'
  | 'auth/app-not-authorized'
  | 'auth/session-expired'
  | 'auth/token-expired'
  // Better Auth codes
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_FOUND'
  | 'EMAIL_NOT_VERIFIED'
  | 'ACCOUNT_DISABLED'
  | 'ACCOUNT_SUSPENDED'
  | 'ACCOUNT_PENDING'
  | 'SESSION_EXPIRED'
  | 'INVALID_TOKEN'
  | 'WEAK_PASSWORD'
  | 'EMAIL_ALREADY_EXISTS'
  | 'INVALID_EMAIL'
  | 'TOO_MANY_REQUESTS'
  | 'NETWORK_ERROR'
  | 'OAUTH_CANCELLED'
  | 'OAUTH_POPUP_BLOCKED'
  | 'OAUTH_ERROR'
  // Generic HTTP codes
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'SERVICE_UNAVAILABLE'

/**
 * Maps auth error codes to user-friendly messages.
 * Handles Firebase, Better Auth, and generic error codes.
 */
const errorMap: Record<string, string> = {
  // Sign-in / General Auth (Firebase)
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled. Please contact support.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-credential': 'Invalid email or password. Please try again.',
  'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',

  // Sign-up (Firebase)
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password is too weak. Use at least 8 characters with letters and numbers.',

  // OAuth / Popups (Firebase)
  'auth/popup-closed-by-user': 'Sign-in was cancelled.',
  'auth/popup-blocked': 'Sign-in popup was blocked by your browser. Please allow popups for this site.',
  'auth/unauthorized-domain': 'This domain is not authorized for sign-in.',
  'auth/account-exists-with-different-credential': 'An account already exists using a different sign-in method.',
  'auth/cancelled-popup-request': 'Only one sign-in window can be open at a time.',

  // Network / Session (Firebase)
  'auth/network-request-failed': 'Network error. Please check your internet connection.',
  'auth/timeout': 'Request timed out. Please try again.',
  'auth/requires-recent-login': 'Please sign in again to perform this sensitive action.',
  'auth/session-expired': 'Your session has expired. Please sign in again.',
  'auth/token-expired': 'Your session has expired. Please sign in again.',

  // Internal / Config (Firebase)
  'auth/internal-error': 'An internal error occurred. Please try again later.',
  'auth/invalid-api-key': 'Configuration error. Please contact support.',
  'auth/app-not-authorized': 'This app is not authorized for authentication.',

  // Better Auth codes
  'INVALID_CREDENTIALS': 'Invalid email or password.',
  'USER_NOT_FOUND': 'No account found with this email.',
  'EMAIL_NOT_VERIFIED': 'Please verify your email address to continue.',
  'ACCOUNT_DISABLED': 'Your account has been disabled. Please contact support.',
  'ACCOUNT_SUSPENDED': 'Your account has been suspended. Please contact support.',
  'ACCOUNT_PENDING': 'Your account is pending approval.',
  'SESSION_EXPIRED': 'Your session has expired. Please sign in again.',
  'INVALID_TOKEN': 'Invalid authentication token. Please sign in again.',
  'WEAK_PASSWORD': 'Password is too weak. Use at least 8 characters with letters and numbers.',
  'EMAIL_ALREADY_EXISTS': 'An account with this email already exists.',
  'INVALID_EMAIL': 'Please enter a valid email address.',
  'TOO_MANY_REQUESTS': 'Too many requests. Please wait a moment and try again.',
  'NETWORK_ERROR': 'Network error. Please check your internet connection.',
  'OAUTH_CANCELLED': 'Sign-in was cancelled.',
  'OAUTH_POPUP_BLOCKED': 'Sign-in popup was blocked by your browser. Please allow popups for this site.',
  'OAUTH_ERROR': 'OAuth authentication failed. Please try again.',

  // Generic codes
  'UNAUTHORIZED': 'Authentication required. Please sign in.',
  'FORBIDDEN': 'You do not have permission to perform this action.',
  'SERVICE_UNAVAILABLE': 'Service temporarily unavailable. Please try again later.',
}

/**
 * Maps Firebase/Better Auth auth error codes to user-friendly messages.
 * This ensures technical details are not exposed to the user.
 */
export function getFriendlyAuthErrorMessage(error: unknown): string {
  if (!error) return 'An unexpected error occurred. Please try again.'

  // If it's already a string, return it as is (assuming it's already been sanitized)
  if (typeof error === 'string') return error

  // Default fallback
  const fallbackMessage = 'Authentication failed. Please try again.'

  if (typeof error !== 'object' || error === null) {
    return fallbackMessage
  }

  const errorCode = (error as { code?: string }).code
  const errorMessage = (error as { message?: string }).message
  const errorStatus = (error as { status?: number }).status

  // Check for HTTP status-based errors
  if (errorStatus) {
    if (errorStatus === 401) return 'Authentication required. Please sign in.'
    if (errorStatus === 403) return 'You do not have permission to perform this action.'
    if (errorStatus === 429) return 'Too many requests. Please wait a moment and try again.'
    if (errorStatus === 503) return 'Service temporarily unavailable. Please try again later.'
    if (errorStatus === 408) return 'Request timed out. Please try again.'
  }

  // Check mapped error codes
  if (errorCode && errorMap[errorCode]) {
    return errorMap[errorCode]
  }

  // If we have a message from the error object, attempt to clean it
  if (errorMessage && typeof errorMessage === 'string') {
    // Firebase messages usually look like "Firebase: Error (auth/invalid-email)."
    // Better Auth might have similar patterns
    const clean = errorMessage
      .replace(/^Firebase:\s*/i, '')
      .replace(/^BetterAuth:\s*/i, '')
      .replace(/\s*\(auth\/[^)]+\)\.?$/i, '')
      .replace(/\s*\([A-Z_]+\)\.?$/i, '')
      .trim()

    // If the message is just "Error" or "Auth Error", use the fallback
    if (clean.toLowerCase() === 'error' || clean.toLowerCase() === 'auth error' || clean.length === 0) {
      return fallbackMessage
    }

    return clean
  }

  return fallbackMessage
}

/**
 * Converts an unknown error into a typed API error based on error code/message
 */
export function parseAuthError(error: unknown): Error {
  if (!error || typeof error !== 'object') {
    return new UnauthorizedError(getFriendlyAuthErrorMessage(error))
  }

  const errorCode = (error as { code?: string }).code ?? ''
  const errorMessage = (error as { message?: string }).message ?? ''
  const errorStatus = (error as { status?: number }).status
  const lowerMessage = errorMessage.toLowerCase()

  // Check for network errors first
  if (
    errorCode === 'auth/network-request-failed' ||
    errorCode === 'NETWORK_ERROR' ||
    lowerMessage.includes('network') ||
    lowerMessage.includes('fetch failed') ||
    lowerMessage.includes('failed to fetch')
  ) {
    return new NetworkError()
  }

  // Timeout errors
  if (
    errorCode === 'auth/timeout' ||
    lowerMessage.includes('timeout') ||
    lowerMessage.includes('timed out') ||
    errorStatus === 408
  ) {
    return new NetworkTimeoutError()
  }

  // Rate limit errors
  if (
    errorCode === 'auth/too-many-requests' ||
    errorCode === 'TOO_MANY_REQUESTS' ||
    errorStatus === 429
  ) {
    return new RateLimitError()
  }

  // Invalid credentials
  if (
    errorCode === 'auth/invalid-credential' ||
    errorCode === 'auth/wrong-password' ||
    errorCode === 'auth/user-not-found' ||
    errorCode === 'INVALID_CREDENTIALS' ||
    errorCode === 'USER_NOT_FOUND' ||
    lowerMessage.includes('invalid credentials') ||
    lowerMessage.includes('invalid email or password')
  ) {
    return new InvalidCredentialsError()
  }

  // Invalid email
  if (errorCode === 'auth/invalid-email' || errorCode === 'INVALID_EMAIL') {
    return new InvalidEmailError()
  }

  // Weak password
  if (errorCode === 'auth/weak-password' || errorCode === 'WEAK_PASSWORD') {
    return new WeakPasswordError()
  }

  // Email already exists
  if (errorCode === 'auth/email-already-in-use' || errorCode === 'EMAIL_ALREADY_EXISTS') {
    return new EmailAlreadyExistsError()
  }

  // Account disabled
  if (
    errorCode === 'auth/user-disabled' ||
    errorCode === 'ACCOUNT_DISABLED' ||
    lowerMessage.includes('disabled')
  ) {
    return new AccountDisabledError()
  }

  // Account suspended
  if (errorCode === 'ACCOUNT_SUSPENDED' || lowerMessage.includes('suspended')) {
    return new AccountSuspendedError()
  }

  // Account pending
  if (errorCode === 'ACCOUNT_PENDING' || lowerMessage.includes('pending')) {
    return new AccountPendingError()
  }

  // Session expired
  if (
    errorCode === 'auth/session-expired' ||
    errorCode === 'auth/token-expired' ||
    errorCode === 'SESSION_EXPIRED' ||
    errorCode === 'INVALID_TOKEN' ||
    lowerMessage.includes('session expired') ||
    lowerMessage.includes('token expired')
  ) {
    return new SessionExpiredError()
  }

  // OAuth cancelled
  if (
    errorCode === 'auth/popup-closed-by-user' ||
    errorCode === 'auth/cancelled-popup-request' ||
    errorCode === 'OAUTH_CANCELLED'
  ) {
    return new OAuthCancelledError()
  }

  // OAuth popup blocked
  if (errorCode === 'auth/popup-blocked' || errorCode === 'OAUTH_POPUP_BLOCKED') {
    return new OAuthPopupBlockedError()
  }

  // General OAuth error
  if (
    errorCode === 'auth/account-exists-with-different-credential' ||
    errorCode === 'auth/unauthorized-domain' ||
    errorCode === 'OAUTH_ERROR' ||
    lowerMessage.includes('oauth')
  ) {
    return new OAuthError(getFriendlyAuthErrorMessage(error))
  }

  // Service unavailable
  if (
    errorCode === 'auth/internal-error' ||
    errorCode === 'SERVICE_UNAVAILABLE' ||
    errorStatus === 503
  ) {
    return new ServiceUnavailableError()
  }

  // Default to unauthorized
  return new UnauthorizedError(getFriendlyAuthErrorMessage(error))
}

/**
 * Checks if an error is a network-related error
 */
export function isNetworkError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false

  const errorCode = (error as { code?: string }).code ?? ''
  const errorMessage = (error as { message?: string }).message ?? ''
  const lowerMessage = errorMessage.toLowerCase()

  return (
    errorCode === 'auth/network-request-failed' ||
    errorCode === 'NETWORK_ERROR' ||
    lowerMessage.includes('network') ||
    lowerMessage.includes('fetch failed') ||
    lowerMessage.includes('failed to fetch') ||
    error instanceof NetworkError
  )
}

/**
 * Checks if an error is a session/token expiration error
 */
export function isSessionExpiredError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false

  const errorCode = (error as { code?: string }).code ?? ''
  const errorMessage = (error as { message?: string }).message ?? ''
  const lowerMessage = errorMessage.toLowerCase()

  return (
    errorCode === 'auth/session-expired' ||
    errorCode === 'auth/token-expired' ||
    errorCode === 'SESSION_EXPIRED' ||
    errorCode === 'INVALID_TOKEN' ||
    lowerMessage.includes('session expired') ||
    lowerMessage.includes('token expired') ||
    error instanceof SessionExpiredError
  )
}

/**
 * Checks if an error is retryable (network issues, rate limits, etc.)
 */
export function isRetryableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false

  const errorCode = (error as { code?: string }).code ?? ''
  const errorStatus = (error as { status?: number }).status

  return (
    isNetworkError(error) ||
    errorCode === 'auth/too-many-requests' ||
    errorCode === 'TOO_MANY_REQUESTS' ||
    errorCode === 'auth/internal-error' ||
    errorCode === 'SERVICE_UNAVAILABLE' ||
    errorStatus === 429 ||
    errorStatus === 503 ||
    errorStatus === 408
  )
}

/**
 * Checks if an error is related to user account status (disabled, suspended, pending)
 */
export function isAccountStatusError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false

  const errorCode = (error as { code?: string }).code ?? ''

  return (
    errorCode === 'auth/user-disabled' ||
    errorCode === 'ACCOUNT_DISABLED' ||
    errorCode === 'ACCOUNT_SUSPENDED' ||
    errorCode === 'ACCOUNT_PENDING' ||
    error instanceof AccountDisabledError ||
    error instanceof AccountSuspendedError ||
    error instanceof AccountPendingError
  )
}

/**
 * Legacy helper for Firebase error detection
 */
export function isFirebaseError(error: unknown): error is { code: string } {
  return typeof error === 'object' && error !== null && 'code' in error && typeof (error as { code?: unknown }).code === 'string'
}
