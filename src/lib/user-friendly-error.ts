export type UserFacingError = {
  message: string
  actions: string[]
  code?: string
  status?: number
  details?: Record<string, string[]>
  isValidation?: boolean
}

export class ApiClientError extends Error {
  status?: number
  code?: string
  details?: Record<string, string[]>

  constructor(message: string, options: { status?: number; code?: string; details?: Record<string, string[]>; cause?: unknown } = {}) {
    super(message || 'Request failed')
    this.name = 'ApiClientError'
    this.status = options.status
    this.code = options.code
    this.details = options.details
    if (options.cause) {
      // Preserve underlying error for debugging without leaking toasts
      ;(this as any).cause = options.cause
    }
  }
}

function defaultStatusMessage(status?: number): string {
  if (!status) return 'Something went wrong.'
  if (status === 401) return 'Please sign in and try again.'
  if (status === 403) return "You don't have permission to do that."
  if (status === 404) return 'We could not find what you were looking for.'
  if (status === 429) return 'Too many requests. Please wait and try again.'
  if (status >= 500) return 'Something went wrong on our side. Please try again.'
  return 'Request failed. Please try again.'
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
  return code === 'VALIDATION_ERROR' || status === 400 || status === 422 || !!details
}

function isRateLimit(status?: number, code?: string): boolean {
  return status === 429 || code === 'RATE_LIMIT_EXCEEDED'
}

export function buildUserFacingError(error: unknown, fallback: string): UserFacingError {
  const baseActions = ['Try again', 'Contact support', 'Report bug']

  const apiError = error instanceof ApiClientError ? error : undefined
  const status = apiError?.status
  const code = apiError?.code
  const details = apiError?.details

  if (isNetworkError(error)) {
    return {
      message: 'We could not reach the server. Check your connection, then try again.',
      actions: ['Check your connection', 'Try again', 'Contact support'],
      code: code ?? 'NETWORK_ERROR',
      status,
      details,
    }
  }

  if (isPermissionError(status, code)) {
    return {
      message: "You don't have permission to do that.",
      actions: ['Contact your admin', 'Request access', 'Contact support'],
      code: code ?? 'FORBIDDEN',
      status,
      details,
    }
  }

  if (isUnauthorized(status, code)) {
    return {
      message: 'Please sign in to continue.',
      actions: ['Sign in', 'Contact support'],
      code: code ?? 'UNAUTHORIZED',
      status,
      details,
    }
  }

  if (isRateLimit(status, code)) {
    return {
      message: 'You are sending requests too quickly. Please wait and try again.',
      actions: ['Wait a moment', 'Try again', 'Contact support'],
      code: code ?? 'RATE_LIMIT_EXCEEDED',
      status,
      details,
    }
  }

  if (isValidationError(status, code, details)) {
    return {
      message: 'Some fields need attention. Please correct the highlighted fields.',
      actions: ['Review highlighted fields', 'Try again'],
      code: code ?? 'VALIDATION_ERROR',
      status,
      details,
      isValidation: true,
    }
  }

  const fallbackMessage = fallback || 'Something went wrong.'
  const rawMessage = error instanceof Error ? error.message?.trim() : ''
  const message = rawMessage && !/^error\b/i.test(rawMessage) && rawMessage.toLowerCase() !== 'internal server error'
    ? rawMessage
    : fallbackMessage

  return {
    message,
    actions: baseActions,
    code: code ?? (status ? String(status) : undefined),
    status,
    details,
  }
}

export function formatUserFacingErrorMessage(error: unknown, fallback: string): string {
  const friendly = buildUserFacingError(error, fallback)
  const actionsText = friendly.actions.length ? ` Here's what you can do: ${friendly.actions.map((label) => `[${label}]`).join(' ')}` : ''
  return `${friendly.message}${actionsText}`
}
