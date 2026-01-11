import { UnifiedError } from '@/lib/errors/unified-error'

/**
 * Base class for all API errors (legacy name)
 *
 * Backed by UnifiedError to keep one error system.
 */
export class ApiError extends UnifiedError {
  constructor(message: string, status: number, code = 'INTERNAL_ERROR', details?: Record<string, string[]>) {
    super({ message, status, code, details })
    this.name = new.target.name
  }
}

/**
 * 400 Bad Request - Validation or input errors
 */
export class ValidationError extends ApiError {
  constructor(message = 'Validation failed', details?: Record<string, string[]>) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

/**
 * 400 Bad Request - Generic invalid request
 */
export class BadRequestError extends ApiError {
  constructor(message = 'Bad request') {
    super(message, 400, 'BAD_REQUEST');
  }
}

/**
 * 401 Unauthorized - Authentication required
 */
export class UnauthorizedError extends ApiError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * 403 Forbidden - Permission denied
 */
export class ForbiddenError extends ApiError {
  constructor(message = 'Permission denied') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * 404 Not Found - Resource does not exist
 */
export class NotFoundError extends ApiError {
  public readonly resourceType?: string;
  public readonly resourceId?: string;

  constructor(message?: string, resourceType?: string, resourceId?: string) {
    // Build message dynamically if resource info is provided
    let finalMessage = message || 'Resource not found';
    if (!message && resourceType && resourceId) {
      finalMessage = `${resourceType} with ID '${resourceId}' not found`;
    } else if (!message && resourceType) {
      finalMessage = `${resourceType} not found`;
    }
    
    super(finalMessage, 404, 'NOT_FOUND');
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }
}

/**
 * 409 Conflict - Resource already exists or state conflict
 */
export class ConflictError extends ApiError {
  constructor(message = 'Conflict occurred') {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * 429 Too Many Requests - Rate limit exceeded
 */
export class RateLimitError extends ApiError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

/**
 * 503 Service Unavailable - Downstream or temporary failure
 */
export class ServiceUnavailableError extends ApiError {
  constructor(message = 'Service temporarily unavailable') {
    super(message, 503, 'SERVICE_UNAVAILABLE');
  }
}

/**
 * 401 Session Expired - Session has timed out
 */
export class SessionExpiredError extends ApiError {
  constructor(message = 'Your session has expired. Please sign in again.') {
    super(message, 401, 'SESSION_EXPIRED');
  }
}

/**
 * 401 Invalid Token - Token is malformed or invalid
 */
export class InvalidTokenError extends ApiError {
  constructor(message = 'Invalid authentication token') {
    super(message, 401, 'INVALID_TOKEN');
  }
}

/**
 * 403 Account Disabled - User account has been disabled
 */
export class AccountDisabledError extends ApiError {
  constructor(message = 'Your account has been disabled. Please contact support.') {
    super(message, 403, 'ACCOUNT_DISABLED');
  }
}

/**
 * 403 Account Suspended - User account has been suspended
 */
export class AccountSuspendedError extends ApiError {
  constructor(message = 'Your account has been suspended. Please contact support.') {
    super(message, 403, 'ACCOUNT_SUSPENDED');
  }
}

/**
 * 403 Account Pending - User account is pending approval
 */
export class AccountPendingError extends ApiError {
  constructor(message = 'Your account is pending approval.') {
    super(message, 403, 'ACCOUNT_PENDING');
  }
}

/**
 * 403 Email Not Verified - Email verification required
 */
export class EmailNotVerifiedError extends ApiError {
  constructor(message = 'Please verify your email address to continue.') {
    super(message, 403, 'EMAIL_NOT_VERIFIED');
  }
}

/**
 * 400 Invalid Credentials - Wrong email or password
 */
export class InvalidCredentialsError extends ApiError {
  constructor(message = 'Invalid email or password') {
    super(message, 400, 'INVALID_CREDENTIALS');
  }
}

/**
 * 400 Weak Password - Password does not meet requirements
 */
export class WeakPasswordError extends ApiError {
  constructor(message = 'Password is too weak. Use at least 8 characters with letters and numbers.') {
    super(message, 400, 'WEAK_PASSWORD');
  }
}

/**
 * 409 Email Already Exists - Account with email already exists
 */
export class EmailAlreadyExistsError extends ApiError {
  constructor(message = 'An account with this email already exists.') {
    super(message, 409, 'EMAIL_ALREADY_EXISTS');
  }
}

/**
 * 400 Invalid Email - Email format is invalid
 */
export class InvalidEmailError extends ApiError {
  constructor(message = 'Please enter a valid email address.') {
    super(message, 400, 'INVALID_EMAIL');
  }
}

/**
 * 408 Network Timeout - Request timed out
 */
export class NetworkTimeoutError extends ApiError {
  constructor(message = 'Request timed out. Please check your connection and try again.') {
    super(message, 408, 'NETWORK_TIMEOUT');
  }
}

/**
 * 503 Network Error - Network connectivity issue
 */
export class NetworkError extends ApiError {
  constructor(message = 'Network error. Please check your internet connection.') {
    super(message, 503, 'NETWORK_ERROR');
  }
}

/**
 * 400 OAuth Error - OAuth flow failed
 */
export class OAuthError extends ApiError {
  constructor(message = 'OAuth authentication failed. Please try again.') {
    super(message, 400, 'OAUTH_ERROR');
  }
}

/**
 * 400 OAuth Cancelled - User cancelled OAuth flow
 */
export class OAuthCancelledError extends ApiError {
  constructor(message = 'Sign-in was cancelled.') {
    super(message, 400, 'OAUTH_CANCELLED');
  }
}

/**
 * 400 OAuth Popup Blocked - Browser blocked OAuth popup
 */
export class OAuthPopupBlockedError extends ApiError {
  constructor(message = 'Sign-in popup was blocked by your browser. Please allow popups for this site.') {
    super(message, 400, 'OAUTH_POPUP_BLOCKED');
  }
}

/**
 * 400 Password Reset Required - User must reset password
 */
export class PasswordResetRequiredError extends ApiError {
  constructor(message = 'You must reset your password before signing in.') {
    super(message, 400, 'PASSWORD_RESET_REQUIRED');
  }
}

/**
 * 400 Invalid Reset Code - Password reset code is invalid or expired
 */
export class InvalidResetCodeError extends ApiError {
  constructor(message = 'The password reset link is invalid or has expired.') {
    super(message, 400, 'INVALID_RESET_CODE');
  }
}
