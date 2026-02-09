/**
 * Centralized Error Detection Utilities
 * Single source of truth for error type detection across the codebase
 */

import { NetworkError as ApiNetworkError } from './api-errors'

export function isNetworkError(error: unknown): boolean {
  if (!error) return false

  if (error instanceof ApiNetworkError) return true

  if (error instanceof TypeError) {
    const message = error.message.toLowerCase()
    return (
      message.includes('fetch') ||
      message.includes('network') ||
      message.includes('internet') ||
      message.includes('offline') ||
      message.includes('connection')
    )
  }

  if (error instanceof Error) {
    if (error.name === 'AbortError') return false
    const message = error.message.toLowerCase()
    if (message.includes('network')) return true
    if (message.includes('fetch failed')) return true
    if (message.includes('failed to fetch')) return true
  }

  if (typeof error === 'object' && error !== null) {
    const code = (error as { code?: string }).code
    if (code === 'auth/network-request-failed') return true
    if (code === 'NETWORK_ERROR') return true
    if (code === 'ECONNREFUSED') return true
    if (code === 'ENOTFOUND') return true
    if (code === 'ETIMEDOUT') return true
  }

  return false
}

export function isAuthError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false

  const status = (error as { status?: number }).status
  if (status === 401 || status === 403) return true

  const code = (error as { code?: string }).code
  if (!code) return false

  const authCodes = [
    'UNAUTHORIZED',
    'FORBIDDEN',
    'SESSION_EXPIRED',
    'INVALID_TOKEN',
    'ACCOUNT_DISABLED',
    'ACCOUNT_SUSPENDED',
    'auth/user-disabled',
    'auth/session-expired',
    'auth/token-expired',
    'auth/invalid-token',
  ]

  return authCodes.some((ac) => code.includes(ac))
}

export function isRateLimitError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false

  const status = (error as { status?: number }).status
  if (status === 429) return true

  const code = (error as { code?: string }).code
  if (!code) return false

  return (
    code === 'RATE_LIMIT_EXCEEDED' ||
    code === 'TOO_MANY_REQUESTS' ||
    code === 'auth/too-many-requests'
  )
}

export function isServerError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false

  const status = (error as { status?: number }).status
  if (status !== undefined && status >= 500 && status < 600) return true

  const code = (error as { code?: string }).code
  if (code === 'SERVICE_UNAVAILABLE' || code === 'INTERNAL_ERROR') return true

  return false
}

export function isRetryableError(error: unknown): boolean {
  if (isNetworkError(error)) return true
  if (isRateLimitError(error)) return true
  if (isServerError(error)) return true

  if (!error || typeof error !== 'object') return false

  const status = (error as { status?: number }).status
  if (status === 408) return true

  const retryable = (error as { isRetryable?: boolean }).isRetryable
  if (typeof retryable === 'boolean') return retryable

  return false
}

export function isClientError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false

  const status = (error as { status?: number }).status
  if (status !== undefined && status >= 400 && status < 500) return true

  return false
}

export function getErrorMessage(error: unknown): string {
  if (!error) return 'An unexpected error occurred'

  if (typeof error === 'string') return error

  if (error instanceof Error) {
    return error.message || 'An error occurred'
  }

  if (typeof error === 'object') {
    const message = (error as { message?: string }).message
    if (message) return message

    const errorMessage = (error as { error?: string }).error
    if (errorMessage) return errorMessage
  }

  return 'An unexpected error occurred'
}

export function getErrorCode(error: unknown): string {
  if (!error || typeof error !== 'object') return 'UNKNOWN'

  const code = (error as { code?: string }).code
  if (code) return code

  const status = (error as { status?: number }).status
  if (status) {
    if (status === 400) return 'BAD_REQUEST'
    if (status === 401) return 'UNAUTHORIZED'
    if (status === 403) return 'FORBIDDEN'
    if (status === 404) return 'NOT_FOUND'
    if (status === 429) return 'RATE_LIMIT_EXCEEDED'
    if (status >= 500) return 'INTERNAL_ERROR'
  }

  return 'UNKNOWN'
}

export function getErrorStatus(error: unknown): number {
  if (!error || typeof error !== 'object') return 500

  const status = (error as { status?: number }).status
  if (status) return status

  const code = (error as { code?: string }).code
  if (code === 'UNAUTHORIZED' || code === 'SESSION_EXPIRED') return 401
  if (code === 'FORBIDDEN') return 403
  if (code === 'NOT_FOUND') return 404
  if (code === 'RATE_LIMIT_EXCEEDED' || code === 'TOO_MANY_REQUESTS') return 429
  if (code === 'NETWORK_ERROR') return 0

  return 500
}
