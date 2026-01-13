import { ConvexError } from 'convex/values'

/**
 * Standardized error data passed to ConvexError.
 * Must match the definition in convex/errors.ts
 */
export type AppErrorData = {
  code: string
  message: string
  details?: Record<string, any>
}

/**
 * Extract a user-friendly error message from any error,
 * including standardized ConvexError objects.
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
 * Extract the standardized error code from a ConvexError.
 */
export function extractErrorCode(error: unknown): string | null {
  if (error instanceof ConvexError) {
    const data = error.data as AppErrorData
    return data?.code ?? null
  }
  return null
}

/**
 * Extract the details from a ConvexError.
 */
export function extractErrorDetails(error: unknown): Record<string, any> | null {
  if (error instanceof ConvexError) {
    const data = error.data as AppErrorData
    return data?.details ?? null
  }
  return null
}
