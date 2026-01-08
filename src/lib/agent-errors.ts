'use client'

/**
 * Agent-specific error classes for better error handling and categorization.
 */

export type AgentErrorType = 'network' | 'rate-limit' | 'auth' | 'server' | 'validation' | 'unknown'

export interface AgentErrorDetails {
  type: AgentErrorType
  message: string
  retryAfter?: number // seconds until retry is allowed (for rate limiting)
  retryable: boolean
  originalError?: unknown
}

/**
 * Base class for Agent Mode errors
 */
export class AgentError extends Error {
  readonly type: AgentErrorType
  readonly retryAfter?: number
  readonly retryable: boolean
  readonly originalError?: unknown

  constructor(details: AgentErrorDetails) {
    super(details.message)
    this.name = 'AgentError'
    this.type = details.type
    this.retryAfter = details.retryAfter
    this.retryable = details.retryable
    this.originalError = details.originalError
  }

  toJSON() {
    return {
      type: this.type,
      message: this.message,
      retryAfter: this.retryAfter,
      retryable: this.retryable,
    }
  }
}

/**
 * Network connectivity error (offline, DNS failure, etc.)
 */
export class AgentNetworkError extends AgentError {
  constructor(message = 'Network error. Please check your connection.', originalError?: unknown) {
    super({
      type: 'network',
      message,
      retryable: true,
      originalError,
    })
    this.name = 'AgentNetworkError'
  }
}

/**
 * Rate limit exceeded (429)
 */
export class AgentRateLimitError extends AgentError {
  constructor(retryAfter = 60, originalError?: unknown) {
    super({
      type: 'rate-limit',
      message: `Too many requests. Please wait ${retryAfter} seconds.`,
      retryAfter,
      retryable: true,
      originalError,
    })
    this.name = 'AgentRateLimitError'
  }
}

/**
 * Authentication error (401, expired token)
 */
export class AgentAuthError extends AgentError {
  constructor(message = 'Session expired. Please sign in again.', originalError?: unknown) {
    super({
      type: 'auth',
      message,
      retryable: false,
      originalError,
    })
    this.name = 'AgentAuthError'
  }
}

/**
 * Server error (5xx)
 */
export class AgentServerError extends AgentError {
  constructor(message = 'Server error. Please try again in a moment.', originalError?: unknown) {
    super({
      type: 'server',
      message,
      retryable: true,
      originalError,
    })
    this.name = 'AgentServerError'
  }
}

/**
 * Input validation error
 */
export class AgentValidationError extends AgentError {
  constructor(message: string, originalError?: unknown) {
    super({
      type: 'validation',
      message,
      retryable: false,
      originalError,
    })
    this.name = 'AgentValidationError'
  }
}

/**
 * Parse API response to determine error type
 */
export function parseAgentError(error: unknown, response?: Response | null): AgentError {
  // Network/fetch errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new AgentNetworkError('Unable to connect. Check your internet connection.', error)
  }

  // Response-based errors
  if (response) {
    const status = response.status
    const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10)

    if (status === 429) {
      return new AgentRateLimitError(retryAfter, error)
    }

    if (status === 401) {
      return new AgentAuthError('Your session has expired. Please sign in again.', error)
    }

    if (status === 403) {
      return new AgentAuthError('Access denied. You may not have permission for this action.', error)
    }

    if (status >= 500) {
      return new AgentServerError('The server is temporarily unavailable. Please try again.', error)
    }

    if (status >= 400) {
      const message = error instanceof Error ? error.message : 'Invalid request'
      return new AgentValidationError(message, error)
    }
  }

  // Fallback for unknown errors
  return new AgentError({
    type: 'unknown',
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
    retryable: true,
    originalError: error,
  })
}

/**
 * Human-friendly error messages for display
 */
export const ERROR_DISPLAY_MESSAGES: Record<AgentErrorType, string> = {
  'network': 'Connection lost. Tap retry when you\'re back online.',
  'rate-limit': 'Slow down! Too many messages. Please wait a moment.',
  'auth': 'Session expired. Please refresh the page to sign in.',
  'server': 'Something went wrong on our end. We\'re on it!',
  'validation': 'That message didn\'t work. Try rephrasing it.',
  'unknown': 'Something went wrong. Please try again.',
}
