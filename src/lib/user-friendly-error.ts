export type UserFacingError = {
  message: string
  actions: string[]
  code?: string
  status?: number
  details?: Record<string, string[]>
  isValidation?: boolean
}

import { getSuggestedActions, getUserFriendlyMessage, isValidationStatus } from '@/lib/errors/messages'
import { UnifiedError } from '@/lib/errors/unified-error'

export class ApiClientError extends UnifiedError {
  constructor(
    message: string,
    options: { status?: number; code?: string; details?: Record<string, string[]>; cause?: unknown } = {}
  ) {
    super({
      message: message || getUserFriendlyMessage(options.status ?? 500),
      status: options.status,
      code: options.code,
      details: options.details,
      cause: options.cause,
    })
    this.name = 'ApiClientError'
  }
}

function isNetworkError(error: unknown): boolean {
  if (error instanceof ApiClientError && error.code === 'NETWORK_ERROR') return true
  if (error instanceof TypeError && /fetch|network/i.test(error.message)) return true
  if (error instanceof Error && /offline|connection|network/i.test(error.message)) return true
  return false
}

function isPermissionError(status?: number, code?: string): boolean {
  return status === 403 || code === 'FORBIDDEN'
}

function isUnauthorized(status?: number, code?: string): boolean {
  return status === 401 || code === 'UNAUTHORIZED'
}

function isValidationError(status?: number, code?: string, details?: Record<string, string[]>): boolean {
  return code === 'VALIDATION_ERROR' || isValidationStatus(status ?? 0) || !!details
}

function isRateLimit(status?: number, code?: string): boolean {
  return status === 429 || code === 'RATE_LIMIT_EXCEEDED'
}

function isTimeoutError(status?: number, code?: string, error?: unknown): boolean {
  if (status === 408 || status === 504) return true
  if (code === 'TIMEOUT' || code === 'REQUEST_TIMEOUT' || code === 'GATEWAY_TIMEOUT') return true
  if (error instanceof Error && /timeout|timed out/i.test(error.message)) return true
  return false
}

function isFileSizeError(status?: number, code?: string, error?: unknown): boolean {
  if (status === 413) return true
  if (code === 'PAYLOAD_TOO_LARGE' || code === 'FILE_TOO_LARGE') return true
  if (error instanceof Error && /too large|size limit|file size/i.test(error.message)) return true
  return false
}

function isConflictError(status?: number, code?: string): boolean {
  return status === 409 || code === 'CONFLICT'
}

export function buildUserFacingError(error: unknown, fallback: string): UserFacingError {
  const baseActions = ['Try again', 'Contact support', 'Report bug']
  const unified = UnifiedError.from(error, { message: fallback || 'Something went wrong.' })
  const status = unified.status
  const code = unified.code
  const details = unified.details

  // If we were given a plain Error (not a UnifiedError/ApiClientError) that already contains a
  // user-facing message, prefer that message over generic status-based copy.
  // This prevents throwing `new Error('X')` in UI flows from being rewritten into a 500 message.
  if (
    error instanceof Error &&
    !(error instanceof UnifiedError) &&
    typeof error.message === 'string' &&
    error.message.trim().length > 0
  ) {
    return {
      message: error.message,
      actions: baseActions,
      code: undefined,
      status: undefined,
      details,
    }
  }

  if (isNetworkError(error)) {
    return {
      message: 'We could not reach the server. Check your connection, then try again.',
      actions: ['Check your connection', 'Try again', 'Contact support'],
      code: code || 'NETWORK_ERROR',
      status: status || undefined,
      details,
    }
  }

  if (isPermissionError(status, code)) {
    return {
      message: getUserFriendlyMessage(403),
      actions: ['Contact your admin', 'Request access', 'Contact support'],
      code: code || 'FORBIDDEN',
      status,
      details,
    }
  }

  if (isUnauthorized(status, code)) {
    return {
      message: getUserFriendlyMessage(401),
      actions: ['Sign in', 'Contact support'],
      code: code || 'UNAUTHORIZED',
      status,
      details,
    }
  }

  if (isRateLimit(status, code)) {
    return {
      message: getUserFriendlyMessage(429),
      actions: getSuggestedActions(429),
      code: code || 'RATE_LIMIT_EXCEEDED',
      status,
      details,
    }
  }

  if (isValidationError(status, code, details)) {
    return {
      message: getUserFriendlyMessage(422),
      actions: ['Review highlighted fields', 'Try again'],
      code: code || 'VALIDATION_ERROR',
      status,
      details,
      isValidation: true,
    }
  }

  const message = status ? getUserFriendlyMessage(status) : fallback || 'Something went wrong.'
  return {
    message,
    actions: status ? getSuggestedActions(status) : baseActions,
    code: code || (status ? String(status) : undefined),
    status,
    details,
  }
}

export function formatUserFacingErrorMessage(error: unknown, fallback: string): string {
  const friendly = buildUserFacingError(error, fallback)
  const actionsText = friendly.actions.length ? ` Here's what you can do: ${friendly.actions.map((label) => `[${label}]`).join(' ')}` : ''
  return `${friendly.message}${actionsText}`
}
