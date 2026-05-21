import { describe, expect, it } from 'vitest'

import {
  isGoogleInsufficientScopeError,
  isGoogleRateLimitError,
  parseGoogleApiErrorBody,
} from './google-api-error'

describe('google-api-error', () => {
  it('detects insufficient scope from structured error payload', () => {
    const payload = parseGoogleApiErrorBody(
      JSON.stringify({
        error: {
          code: 403,
          message: 'Request had insufficient authentication scopes.',
          status: 'PERMISSION_DENIED',
          details: [{ reason: 'ACCESS_TOKEN_SCOPE_INSUFFICIENT' }],
        },
      }),
    )

    expect(isGoogleInsufficientScopeError(payload)).toBe(true)
    expect(isGoogleRateLimitError(payload)).toBe(false)
  })

  it('detects rate limit from RESOURCE_EXHAUSTED', () => {
    const payload = parseGoogleApiErrorBody(
      JSON.stringify({
        error: {
          status: 'RESOURCE_EXHAUSTED',
          message: 'Quota exceeded',
        },
      }),
    )

    expect(isGoogleRateLimitError(payload, 429)).toBe(true)
  })
})
