import { ConvexError, type Value } from 'convex/values'

/**
 * Standardized error codes for the application, organized by category.
 */
export const ErrorCode = {
  BASE: {
    BAD_REQUEST: 'BAD_REQUEST',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
    CONFLICT: 'CONFLICT',
  },
  AUTH: {
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    USER_DISABLED: 'USER_DISABLED',
    ADMIN_REQUIRED: 'ADMIN_REQUIRED',
    WORKSPACE_ACCESS_DENIED: 'WORKSPACE_ACCESS_DENIED',
    INVALID_TOKEN: 'INVALID_TOKEN',
  },
  RESOURCE: {
    NOT_FOUND: 'NOT_FOUND',
    ALREADY_EXISTS: 'ALREADY_EXISTS',
  },
  VALIDATION: {
    INVALID_INPUT: 'INVALID_INPUT',
    INVALID_STATE: 'INVALID_STATE',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
  },
  INTEGRATION: {
    ERROR: 'INTEGRATION_ERROR',
    NOT_FOUND: 'INTEGRATION_NOT_FOUND',
    EXPIRED: 'INTEGRATION_EXPIRED',
    NOT_CONFIGURED: 'INTEGRATION_NOT_CONFIGURED',
    MISSING_TOKEN: 'MISSING_TOKEN',
  },
  BILLING: {
    PAYMENT_ERROR: 'PAYMENT_ERROR',
    STRIPE_ERROR: 'STRIPE_ERROR',
    PLAN_NOT_AVAILABLE: 'PLAN_NOT_AVAILABLE',
  },
  RATE_LIMIT: {
    TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  },
} as const

// Extract flat error codes for type safety
type DeepValue<T> = T extends object ? T[keyof T] extends object ? DeepValue<T[keyof T]> : T[keyof T] : never
export type ErrorCodeValue = DeepValue<typeof ErrorCode>

/**
 * Structured error data passed to ConvexError.
 */
export type AppErrorData = {
  [key: string]: Value | undefined
  code: string
  message: string
  details?: Record<string, Value>
}

/**
 * Create a standardized ConvexError with structured data.
 */
export function appError(
  code: string,
  message: string,
  details?: Record<string, Value>
): ConvexError<AppErrorData> {
  return new ConvexError<AppErrorData>({ code, message, details })
}

/**
 * Hierarchical error creators for a more organized API.
 */
export const Errors = {
  base: {
    badRequest: (message = 'Bad request', details?: Record<string, Value>) =>
      appError(ErrorCode.BASE.BAD_REQUEST, message, details),
    internal: (message = 'An internal error occurred', details?: Record<string, Value>) =>
      appError(ErrorCode.BASE.INTERNAL_ERROR, message, details),
    notImplemented: (feature: string) =>
      appError(ErrorCode.BASE.NOT_IMPLEMENTED, `${feature} is not implemented`),
    conflict: (message: string, details?: Record<string, Value>) =>
      appError(ErrorCode.BASE.CONFLICT, message, details),
  },

  auth: {
    unauthorized: (message = 'Authentication required') =>
      appError(ErrorCode.AUTH.UNAUTHORIZED, message),
    forbidden: (message = 'Access denied') =>
      appError(ErrorCode.AUTH.FORBIDDEN, message),
    userNotFound: (message = 'User not found') =>
      appError(ErrorCode.AUTH.USER_NOT_FOUND, message),
    userDisabled: (message = 'User account is disabled or suspended') =>
      appError(ErrorCode.AUTH.USER_DISABLED, message),
    adminRequired: (message = 'Admin access required') =>
      appError(ErrorCode.AUTH.ADMIN_REQUIRED, message),
    workspaceAccessDenied: (message = 'Workspace access denied') =>
      appError(ErrorCode.AUTH.WORKSPACE_ACCESS_DENIED, message),
    invalidToken: (message = 'Invalid token') =>
      appError(ErrorCode.AUTH.INVALID_TOKEN, message),
  },

  resource: {
    notFound: (resource: string, id?: string) =>
      appError(
        ErrorCode.RESOURCE.NOT_FOUND,
        id ? `${resource} not found: ${id}` : `${resource} not found`,
        id ? { resource, id } : { resource }
      ),
    alreadyExists: (resource: string, details?: Record<string, Value>) =>
      appError(ErrorCode.RESOURCE.ALREADY_EXISTS, `${resource} already exists`, { resource, ...details }),
  },

  validation: {
    invalidInput: (message: string, details?: Record<string, Value>) =>
      appError(ErrorCode.VALIDATION.INVALID_INPUT, message, details),
    invalidState: (message: string, details?: Record<string, Value>) =>
      appError(ErrorCode.VALIDATION.INVALID_STATE, message, details),
    error: (message: string, field?: string) =>
      appError(ErrorCode.VALIDATION.VALIDATION_ERROR, message, field ? { field } : undefined),
  },

  integration: {
    error: (provider: string, message: string, details?: Record<string, Value>) =>
      appError(ErrorCode.INTEGRATION.ERROR, `${provider}: ${message}`, { provider, ...details }),
    notFound: (provider: string) =>
      appError(ErrorCode.INTEGRATION.NOT_FOUND, `${provider} integration not found`, { provider }),
    expired: (provider: string) =>
      appError(ErrorCode.INTEGRATION.EXPIRED, `${provider} token expired; reconnect integration`, { provider }),
    notConfigured: (provider: string, detail?: string) =>
      appError(
        ErrorCode.INTEGRATION.NOT_CONFIGURED,
        detail || `${provider} integration not configured`,
        { provider }
      ),
    missingToken: (provider: string) =>
      appError(ErrorCode.INTEGRATION.MISSING_TOKEN, `${provider} integration is missing access token`, { provider }),
  },

  billing: {
    paymentError: (message: string, details?: Record<string, Value>) =>
      appError(ErrorCode.BILLING.PAYMENT_ERROR, message, details),
    stripe: (message: string, details?: Record<string, Value>) =>
      appError(ErrorCode.BILLING.STRIPE_ERROR, message, details),
    planNotAvailable: (message = 'Plan is not available') =>
      appError(ErrorCode.BILLING.PLAN_NOT_AVAILABLE, message),
  },

  rateLimit: {
    tooManyRequests: (message = 'Rate limit exceeded') =>
      appError(ErrorCode.RATE_LIMIT.TOO_MANY_REQUESTS, message),
  },
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
 * Check if an error is a specific app error code.
 */
export function isAppError(error: unknown, code?: string): error is ConvexError<AppErrorData> {
  if (!(error instanceof ConvexError)) return false
  if (!code) return true
  const data = error.data as AppErrorData
  return data?.code === code
}

/**
 * Wrap an async function with standardized error handling.
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
    throw Errors.base.internal(asErrorMessage(error))
  }
}

/**
 * Log and rethrow an error with additional context.
 */
export function logAndThrow(error: unknown, context: string): never {
  console.error(`[${context}]`, error)
  if (error instanceof ConvexError) {
    throw error
  }
  throw Errors.base.internal(asErrorMessage(error))
}
