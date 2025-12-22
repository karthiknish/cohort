/**
 * Maps Firebase auth error codes to user-friendly messages.
 * This ensures technical details (like "Firebase" or internal error codes) are not exposed to the user.
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

  // Map Firebase error codes to user-friendly messages
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
    
    // Internal / Config
    'auth/internal-error': 'An internal error occurred. Please try again later.',
    'auth/invalid-api-key': 'Configuration error. Please contact support.',
    'auth/app-not-authorized': 'This app is not authorized to use Firebase Authentication.',
  }

  if (errorCode && errorMap[errorCode]) {
    return errorMap[errorCode]
  }

  // If we have a message from the error object, attempt to clean it
  if (errorMessage && typeof errorMessage === 'string') {
    // Firebase messages usually look like "Firebase: Error (auth/invalid-email)."
    // We want to strip the "Firebase: " prefix and any trailing error codes in parentheses
    let clean = errorMessage
      .replace(/^Firebase:\s*/i, '')
      .replace(/\s*\(auth\/[^)]+\)\.?$/i, '')
      .trim()
    
    // If the message is just "Error" or "Auth Error", use the fallback
    if (clean.toLowerCase() === 'error' || clean.toLowerCase() === 'auth error' || clean.length === 0) {
      return fallbackMessage
    }
    
    return clean
  }

  return fallbackMessage
}
