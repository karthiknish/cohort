import { describe, expect, it } from 'vitest'

import { parseIntegrationError } from './integration-parser'

describe('parseIntegrationError (meta)', () => {
  it('prefers error_user_msg over generic message', () => {
    const response = new Response(null, { status: 400 })
    const error = parseIntegrationError(
      response,
      {
        error: {
          message: 'Invalid parameter',
          type: 'OAuthException',
          code: 100,
          error_subcode: 1885183,
          error_user_title: 'Ads creative post was created by an app that is in development mode',
          error_user_msg:
            'Ads creative post was created by an app that is in development mode. It must be in public to create this ad.',
        },
      },
      'meta',
    )

    expect(error.message).toBe(
      'Ads creative post was created by an app that is in development mode. It must be in public to create this ad.',
    )
  })

  it('falls back to error_user_title when error_user_msg is absent', () => {
    const response = new Response(null, { status: 400 })
    const error = parseIntegrationError(
      response,
      {
        error: {
          message: 'Invalid parameter',
          error_user_title: 'Something went wrong',
        },
      },
      'meta',
    )

    expect(error.message).toBe('Something went wrong')
  })
})
