import { ConvexError } from 'convex/values'
import * as Sentry from '@sentry/nextjs'

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
 * Logs an error to the console and Sentry with rich context.
 * Use this in catch blocks before displaying a toast to the user.
 */
export function logError(error: unknown, context?: string): void {
  const code = extractErrorCode(error)
  const details = extractErrorDetails(error)
  const message = asErrorMessage(error)

  // 1. Console logging for local debugging
  console.group(`[Error]${context ? ` ${context}` : ''}`)
  console.error('Message:', message)
  if (code) console.error('Code:', code)
  if (details) console.error('Details:', details)
  console.error('Raw Error:', error)
  console.groupEnd()

  // 2. Sentry logging for production monitoring
  Sentry.withScope((scope) => {
    if (context) scope.setTag('context', context)
    if (code) scope.setTag('error_code', code)
    if (details) scope.setContext('error_details', details)
    
    // Distinguish between intentional backend errors and crashes
    if (error instanceof ConvexError) {
      scope.setLevel('info') // ConvexErrors are usually expected/handled
      Sentry.captureMessage(message)
    } else {
      Sentry.captureException(error)
    }
  })
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
