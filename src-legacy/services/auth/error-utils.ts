/**
 * Auth error code → user-friendly message mapping.
 *
 * The original module also translated errors into typed ApiError subclasses
 * (`parseAuthError`, `isNetworkError`, …), but those lived on the legacy
 * `AuthService` singleton which has been removed in favor of the official
 * Convex + Better Auth structure. Only the message mapping remains — it is
 * the one piece the auth UI consumes directly.
 */
export type AuthErrorCode =
  // Better Auth codes
  | 'INVALID_CREDENTIALS' | 'USER_NOT_FOUND' | 'EMAIL_NOT_VERIFIED' | 'ACCOUNT_DISABLED'
  | 'ACCOUNT_SUSPENDED' | 'ACCOUNT_PENDING' | 'SESSION_EXPIRED' | 'INVALID_TOKEN'
  | 'WEAK_PASSWORD' | 'EMAIL_ALREADY_EXISTS' | 'INVALID_EMAIL' | 'TOO_MANY_REQUESTS'
  | 'NETWORK_ERROR' | 'OAUTH_CANCELLED' | 'OAUTH_POPUP_BLOCKED' | 'OAUTH_ERROR'
  // Generic HTTP codes
  | 'UNAUTHORIZED' | 'FORBIDDEN' | 'SERVICE_UNAVAILABLE';

const errorMap: Record<string, string> = {
  // Sign-in / General Auth
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled. Please contact support.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-credential': 'Invalid email or password. Please try again.',
  'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',
  // Sign-up
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password is too weak. Use at least 8 characters with letters and numbers.',
  // OAuth / Popups
  'auth/popup-closed-by-user': 'Sign-in was cancelled.',
  'auth/popup-blocked': 'Sign-in popup was blocked by your browser. Please allow popups for this site.',
  'auth/unauthorized-domain': 'This domain is not authorized for sign-in.',
  'auth/account-exists-with-different-credential': 'An account already exists using a different sign-in method.',
  'auth/cancelled-popup-request': 'Only one sign-in window can be open at a time.',
  // Network / Session
  'auth/network-request-failed': 'Network error. Please check your internet connection.',
  'auth/timeout': 'Request timed out. Please try again.',
  'auth/requires-recent-login': 'Please sign in again to perform this sensitive action.',
  'auth/session-expired': 'Your session has expired. Please sign in again.',
  'auth/token-expired': 'Your session has expired. Please sign in again.',
  // Internal / Config
  'auth/internal-error': 'An internal error occurred. Please try again later.',
  'auth/invalid-api-key': 'Configuration error. Please contact support.',
  'auth/app-not-authorized': 'This app is not authorized for authentication.',
  // Better Auth codes
  'INVALID_CREDENTIALS': 'Invalid email or password.',
  'USER_NOT_FOUND': 'No account found with this email.',
  'EMAIL_NOT_VERIFIED': 'Please verify your email address to continue.',
  'ACCOUNT_DISABLED': 'Your account has been disabled. Please contact support.',
  'ACCOUNT_SUSPENDED': 'Your account has been suspended. Please contact support.',
  'account_disabled': 'Your account has been disabled. Please contact support.',
  'account_suspended': 'Your account has been suspended. Please contact support.',
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
  'invalid_code': 'Google sign-in could not be completed. Try again, or confirm redirect URI http://localhost:3000/api/auth/callback/google is registered in Google Cloud Console.',
  'state_mismatch': 'Sign-in session expired. Please try Google sign-in again.',
  'state_not_found': 'Sign-in session expired. Please try Google sign-in again.',
  'unable_to_get_user_info': 'Could not read your Google profile. Try again or use email sign-in.',
  'UNKNOWN': 'Google sign-in failed. Please try again.',
  // Generic codes
  'UNAUTHORIZED': 'Authentication required. Please sign in.',
  'FORBIDDEN': 'You do not have permission to perform this action.',
  'SERVICE_UNAVAILABLE': 'Service temporarily unavailable. Please try again later.',
  'AUTH_SERVICE_MISCONFIGURED': 'Authentication service is misconfigured. Ensure Convex SITE_URL and BETTER_AUTH_SECRET match this deployment, then check server logs.',
};

/** Better Auth generic 500 body when Convex init or CORS/origin checks fail. */
const BETTER_AUTH_GENERIC_500 = "your request couldn't be completed";
const AUTH_MISCONFIGURED_MESSAGE: string = errorMap.AUTH_SERVICE_MISCONFIGURED
  ?? 'Authentication service is misconfigured. Ensure Convex SITE_URL and BETTER_AUTH_SECRET match this deployment, then check server logs.';

function isBetterAuthGenericFailureMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (lower.includes(BETTER_AUTH_GENERIC_500)
    || lower.includes('try again later')
    || lower.includes('[betterauth]')
    || lower.includes('better_auth_secret')
    || lower.includes('site_url'));
}

/**
 * Maps Firebase/Better Auth auth error codes to user-friendly messages.
 * This ensures technical details are not exposed to the user.
 */
export function getFriendlyAuthErrorMessage(error: unknown): string {
  if (!error)
    return 'An unexpected error occurred. Please try again.';
  if (typeof error === 'string') {
    if (errorMap[error])
      return errorMap[error];
    const normalized = error.toUpperCase().replace(/-/g, '_');
    if (errorMap[normalized])
      return errorMap[normalized];
    if (isBetterAuthGenericFailureMessage(error))
      return AUTH_MISCONFIGURED_MESSAGE;
    return error;
  }
  // Default fallback
  const fallbackMessage = 'Authentication failed. Please try again.';
  if (typeof error !== 'object' || error === null) {
    return fallbackMessage;
  }
  const errorCode = (error as { code?: string }).code;
  const errorMessage = (error as { message?: string }).message;
  const errorStatus = (error as { status?: number }).status;
  // Check for HTTP status-based errors
  if (errorStatus) {
    if (errorStatus === 401)
      return 'Authentication required. Please sign in.';
    if (errorStatus === 403)
      return 'You do not have permission to perform this action.';
    if (errorStatus === 429)
      return 'Too many requests. Please wait a moment and try again.';
    if (errorStatus === 503)
      return 'Service temporarily unavailable. Please try again later.';
    if (errorStatus === 408)
      return 'Request timed out. Please try again.';
    if (errorStatus === 500)
      return AUTH_MISCONFIGURED_MESSAGE;
  }
  // Check mapped error codes
  if (errorCode && errorMap[errorCode]) {
    return errorMap[errorCode];
  }
  // If we have a message from the error object, attempt to clean it
  if (errorMessage && typeof errorMessage === 'string') {
    if (isBetterAuthGenericFailureMessage(errorMessage)) {
      return AUTH_MISCONFIGURED_MESSAGE;
    }
    if (errorMessage.includes('redirect_uri_mismatch')) {
      return 'Google OAuth redirect URI mismatch. In Google Cloud Console, add http://localhost:3000/api/auth/callback/google (dev) or https://your-domain.com/api/auth/callback/google (prod), and set SITE_URL / BETTER_AUTH_URL to that same origin on your Convex deployment.';
    }
    // Firebase messages usually look like "Firebase: Error (auth/invalid-email)."
    // Better Auth might have similar patterns
    const clean = errorMessage
      .replace(/^Firebase:\s*/i, '')
      .replace(/^BetterAuth:\s*/i, '')
      .replace(/\s*\(auth\/[^)]+\)\.?$/i, '')
      .replace(/\s*\([A-Z_]+\)\.?$/i, '')
      .trim();
    // If the message is just "Error" or "Auth Error", use the fallback
    if (clean.toLowerCase() === 'error' || clean.toLowerCase() === 'auth error' || clean.length === 0) {
      return fallbackMessage;
    }
    return clean;
  }
  return fallbackMessage;
}
