// Notification error codes and custom error class

export const NOTIFICATION_ERROR_CODES = {
  // Configuration Errors
  WEBHOOK_NOT_CONFIGURED: 'WEBHOOK_NOT_CONFIGURED',
  WHATSAPP_NOT_CONFIGURED: 'WHATSAPP_NOT_CONFIGURED',
  INVALID_CONFIG: 'INVALID_CONFIG',

  // Validation Errors
  INVALID_PAYLOAD: 'INVALID_PAYLOAD',
  MISSING_WORKSPACE_ID: 'MISSING_WORKSPACE_ID',
  MISSING_RECIPIENT: 'MISSING_RECIPIENT',

  // Delivery Errors
  WEBHOOK_FAILED: 'WEBHOOK_FAILED',
  WHATSAPP_SEND_FAILED: 'WHATSAPP_SEND_FAILED',
  FIRESTORE_WRITE_FAILED: 'FIRESTORE_WRITE_FAILED',
  CONVEX_QUERY_FAILED: 'CONVEX_QUERY_FAILED',

  // Rate Limiting
  RATE_LIMITED: 'RATE_LIMITED',
  WHATSAPP_RATE_LIMITED: 'WHATSAPP_RATE_LIMITED',

  // Network Errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',

  // Unknown
  UNKNOWN: 'UNKNOWN',
} as const

export type NotificationErrorCode = (typeof NOTIFICATION_ERROR_CODES)[keyof typeof NOTIFICATION_ERROR_CODES]

export type NotificationChannel = 'email' | 'slack' | 'whatsapp' | 'firestore' | 'unknown'

export interface NotificationErrorOptions {
  message: string
  errorCode: NotificationErrorCode
  httpStatus?: number
  channel?: NotificationChannel
  retryAfterMs?: number
  metadata?: Record<string, unknown>
}

export class NotificationError extends Error {
  readonly errorCode: NotificationErrorCode
  readonly httpStatus?: number
  readonly isRetryable: boolean
  readonly channel: NotificationChannel
  readonly retryAfterMs?: number
  readonly metadata?: Record<string, unknown>

  constructor(options: NotificationErrorOptions) {
    super(options.message)
    this.name = 'NotificationError'
    this.errorCode = options.errorCode
    this.httpStatus = options.httpStatus
    this.channel = options.channel ?? 'unknown'
    this.retryAfterMs = options.retryAfterMs
    this.metadata = options.metadata

    // Determine if error is retryable
    this.isRetryable = this.checkIsRetryable()
  }

  private checkIsRetryable(): boolean {
    const retryableErrors: string[] = [
      NOTIFICATION_ERROR_CODES.WEBHOOK_FAILED,
      NOTIFICATION_ERROR_CODES.WHATSAPP_SEND_FAILED,
      NOTIFICATION_ERROR_CODES.FIRESTORE_WRITE_FAILED,
      NOTIFICATION_ERROR_CODES.CONVEX_QUERY_FAILED,
      NOTIFICATION_ERROR_CODES.RATE_LIMITED,
      NOTIFICATION_ERROR_CODES.WHATSAPP_RATE_LIMITED,
      NOTIFICATION_ERROR_CODES.NETWORK_ERROR,
      NOTIFICATION_ERROR_CODES.TIMEOUT,
    ]

    if (retryableErrors.includes(this.errorCode)) return true

    // Server errors (5xx) are generally retryable
    if (this.httpStatus !== undefined && this.httpStatus >= 500 && this.httpStatus < 600) return true

    // Rate limit (429) is retryable after delay
    if (this.httpStatus === 429) return true

    return false
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      errorCode: this.errorCode,
      httpStatus: this.httpStatus,
      channel: this.channel,
      isRetryable: this.isRetryable,
      retryAfterMs: this.retryAfterMs,
      metadata: this.metadata,
    }
  }
}
