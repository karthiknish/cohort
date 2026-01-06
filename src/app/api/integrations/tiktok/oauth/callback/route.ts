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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    try {
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

      let redirectTarget = context.redirect ?? '/dashboard'

      // Standardize success signaling via query parameters
      const url = new URL(redirectTarget, appUrl)
      url.searchParams.set('oauth_success', 'true')
      url.searchParams.set('provider', 'tiktok')
      redirectTarget = url.toString()

      // Final safety check on redirect target
      if (!isValidRedirectUrl(redirectTarget)) {
        return NextResponse.redirect(new URL('/dashboard?oauth_success=true&provider=tiktok', req.url))
      }

      return NextResponse.redirect(new URL(redirectTarget, req.url))
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('[tiktok.oauth.callback] Error completing OAuth flow:', errorMessage)

      // Redirect to dashboard with error signaling
      const errorUrl = new URL('/dashboard/integrations', appUrl)
      errorUrl.searchParams.set('oauth_error', 'oauth_failed')
      errorUrl.searchParams.set('provider', 'tiktok')
      errorUrl.searchParams.set('message', errorMessage)
      
      return NextResponse.redirect(errorUrl.toString())
    }
  }
)
