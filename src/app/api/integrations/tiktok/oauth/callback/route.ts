import { z } from 'zod'
import { NextResponse } from 'next/server'

import { completeTikTokOAuthFlow, validateTikTokOAuthState } from '@/services/tiktok-business'
import { createApiHandler } from '@/lib/api-handler'
import { ServiceUnavailableError, ValidationError, BadRequestError } from '@/lib/api-errors'
import { isValidRedirectUrl } from '@/lib/utils'

const querySchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
})

export const GET = createApiHandler(
  {
    auth: 'none',
    querySchema,
    rateLimit: 'sensitive',
  },
  async (req, { query }) => {
    const { code, state } = query

    if (!code) {
      throw new ValidationError('Missing authorization code')
    }

    const redirectUri = process.env.TIKTOK_OAUTH_REDIRECT_URI
    if (!redirectUri) {
      throw new ServiceUnavailableError('TikTok OAuth not configured')
    }

    const context = validateTikTokOAuthState(state ?? '')

    if (!context.state) {
      throw new ValidationError('Invalid OAuth state')
    }

    await completeTikTokOAuthFlow({ code, userId: context.state, redirectUri })

    const redirectTarget = context.redirect ?? '/dashboard'

    // Final safety check on redirect target
    if (!isValidRedirectUrl(redirectTarget)) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.redirect(new URL(redirectTarget, req.url))
  }
)
