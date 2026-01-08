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

export function buildUserFacingError(error: unknown, fallback: string): UserFacingError {
  const baseActions = ['Try again', 'Contact support', 'Report bug']
  const unified = UnifiedError.from(error, { message: fallback || 'Something went wrong.' })
  const status = unified.status
  const code = unified.code
  const details = unified.details

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
