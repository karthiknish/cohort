import { ConvexError, type Value } from 'convex/values'

/**
 * Standardized error codes for the application.
 * These codes help clients identify and handle specific error types.
 */
export const ErrorCode = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_DISABLED: 'USER_DISABLED',
  ADMIN_REQUIRED: 'ADMIN_REQUIRED',
  WORKSPACE_ACCESS_DENIED: 'WORKSPACE_ACCESS_DENIED',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',

  // Validation errors
  INVALID_INPUT: 'INVALID_INPUT',
  INVALID_STATE: 'INVALID_STATE',
  VALIDATION_ERROR: 'VALIDATION_ERROR',

  // External service errors
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  INTEGRATION_ERROR: 'INTEGRATION_ERROR',
  INTEGRATION_NOT_FOUND: 'INTEGRATION_NOT_FOUND',
  INTEGRATION_EXPIRED: 'INTEGRATION_EXPIRED',
  INTEGRATION_NOT_CONFIGURED: 'INTEGRATION_NOT_CONFIGURED',

  // Payment/Billing errors
  PAYMENT_ERROR: 'PAYMENT_ERROR',
  STRIPE_ERROR: 'STRIPE_ERROR',
  PLAN_NOT_AVAILABLE: 'PLAN_NOT_AVAILABLE',

  // Rate limiting
  RATE_LIMITED: 'RATE_LIMITED',

  // Generic
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
} as const

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode]

/**
 * Structured error data passed to ConvexError.
 * Uses index signature to satisfy Convex Value type constraint.
 */
export type AppErrorData = {
  [key: string]: Value | undefined
  code: ErrorCode
  message: string
  details?: Record<string, Value>
}

/**
 * Create a standardized ConvexError with structured data.
 * This allows clients to programmatically handle errors.
 */
export function appError(
  code: ErrorCode,
  message: string,
  details?: Record<string, Value>
): ConvexError<AppErrorData> {
  return new ConvexError<AppErrorData>({ code, message, details })
}

/**
 * Convenience error creators for common cases
 */
export const Errors = {
  unauthorized: (message = 'Authentication required') =>
    appError(ErrorCode.UNAUTHORIZED, message),

  forbidden: (message = 'Access denied') =>
    appError(ErrorCode.FORBIDDEN, message),

  userNotFound: (message = 'User not found') =>
    appError(ErrorCode.USER_NOT_FOUND, message),

  userDisabled: (message = 'User account is disabled or suspended') =>
    appError(ErrorCode.USER_DISABLED, message),

  adminRequired: (message = 'Admin access required') =>
    appError(ErrorCode.ADMIN_REQUIRED, message),

  workspaceAccessDenied: (message = 'Workspace access denied') =>
    appError(ErrorCode.WORKSPACE_ACCESS_DENIED, message),

  notFound: (resource: string, id?: string) =>
    appError(
      ErrorCode.NOT_FOUND,
      id ? `${resource} not found: ${id}` : `${resource} not found`,
      id ? { resource, id } : { resource }
    ),

  alreadyExists: (resource: string, details?: Record<string, Value>) =>
    appError(ErrorCode.ALREADY_EXISTS, `${resource} already exists`, { resource, ...details }),

  conflict: (message: string, details?: Record<string, Value>) =>
    appError(ErrorCode.CONFLICT, message, details),

  invalidInput: (message: string, details?: Record<string, Value>) =>
    appError(ErrorCode.INVALID_INPUT, message, details),

  invalidState: (message: string, details?: Record<string, Value>) =>
    appError(ErrorCode.INVALID_STATE, message, details),

  validation: (message: string, field?: string) =>
    appError(ErrorCode.VALIDATION_ERROR, message, field ? { field } : undefined),

  integrationNotFound: (provider: string) =>
    appError(ErrorCode.INTEGRATION_NOT_FOUND, `${provider} integration not found`, { provider }),

  integrationExpired: (provider: string) =>
    appError(ErrorCode.INTEGRATION_EXPIRED, `${provider} token expired; reconnect integration`, { provider }),

  integrationNotConfigured: (provider: string, detail?: string) =>
    appError(
      ErrorCode.INTEGRATION_NOT_CONFIGURED,
      detail || `${provider} integration not configured`,
      { provider }
    ),

  integrationMissingToken: (provider: string) =>
    appError(ErrorCode.INTEGRATION_ERROR, `${provider} integration is missing access token`, { provider }),

  externalService: (service: string, message: string, details?: Record<string, Value>) =>
    appError(ErrorCode.EXTERNAL_SERVICE_ERROR, `${service}: ${message}`, { service, ...details }),

  stripe: (message: string, details?: Record<string, Value>) =>
    appError(ErrorCode.STRIPE_ERROR, message, details),

  planNotAvailable: (message = 'Plan is not available') =>
    appError(ErrorCode.PLAN_NOT_AVAILABLE, message),

  rateLimited: (message = 'Rate limit exceeded') =>
    appError(ErrorCode.RATE_LIMITED, message),

  internal: (message = 'An internal error occurred') =>
    appError(ErrorCode.INTERNAL_ERROR, message),

  notImplemented: (feature: string) =>
    appError(ErrorCode.NOT_IMPLEMENTED, `${feature} is not implemented`),
}

/**
 * Extract a user-friendly error message from any error.
 */
export function asErrorMessage(error: unknown): string {
  if (error instanceof ConvexError) {
    const data = error.data as AppErrorData
    return data?.message ?? 'An error occurred'
  }
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unexpected error occurred'
}

/**
 * Check if an error is a specific app error code
 */
export function isAppError(error: unknown, code?: ErrorCode): error is ConvexError<AppErrorData> {
  if (!(error instanceof ConvexError)) return false
  if (!code) return true
  const data = error.data as AppErrorData
  return data?.code === code
}

/**
 * Wrap an async function with standardized error handling.
 * Converts unknown errors to ConvexError with INTERNAL_ERROR code.
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context?: string
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (error instanceof ConvexError) {
      throw error
    }
    console.error(`[${context ?? 'error'}]`, error)
    throw Errors.internal(asErrorMessage(error))
  }
}

/**
 * Log and rethrow an error with additional context.
 * Useful for adding context to errors in catch blocks.
 */
export function logAndThrow(error: unknown, context: string): never {
  console.error(`[${context}]`, error)
  if (error instanceof ConvexError) {
    throw error
  }
  throw Errors.internal(asErrorMessage(error))
}
