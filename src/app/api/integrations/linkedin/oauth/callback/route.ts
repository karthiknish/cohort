import { NextResponse } from 'next/server'
import { z } from 'zod'

import { completeLinkedInOAuthFlow, validateLinkedInOAuthState } from '@/services/linkedin-oauth'
import { createApiHandler } from '@/lib/api-handler'
import { isValidRedirectUrl } from '@/lib/utils'

const callbackQuerySchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
  error: z.string().optional(),
  error_description: z.string().optional(),
})

export const GET = createApiHandler(
  {
    auth: 'none',
    querySchema: callbackQuerySchema,
    rateLimit: 'sensitive',
  },
  async (req, { query }) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    try {
      // Check for OAuth error from LinkedIn
      const { error, error_description: errorDescription, code, state } = query

      if (error) {
        console.error('[linkedin.oauth.callback] OAuth error from LinkedIn:', { error, errorDescription })
        return NextResponse.redirect(
          `${appUrl}/dashboard/integrations?error=linkedin_error&message=${encodeURIComponent(errorDescription || error)}`
        )
      }

      if (!code) {
        console.error('[linkedin.oauth.callback] Missing authorization code')
        return NextResponse.redirect(`${appUrl}/dashboard/integrations?error=missing_code`)
      }

      const redirectUri = process.env.LINKEDIN_OAUTH_REDIRECT_URI
      if (!redirectUri) {
        console.error('[linkedin.oauth.callback] LINKEDIN_OAUTH_REDIRECT_URI not configured')
        return NextResponse.redirect(`${appUrl}/dashboard/integrations?error=config_error`)
      }

      // Validate state to prevent CSRF attacks
      let context
      try {
        context = validateLinkedInOAuthState(state ?? '')
      } catch (stateError) {
        console.error('[linkedin.oauth.callback] State validation failed:', stateError)
        return NextResponse.redirect(`${appUrl}/dashboard/integrations?error=invalid_state`)
      }

      if (!context.state) {
        console.error('[linkedin.oauth.callback] Invalid state - missing user ID')
        return NextResponse.redirect(`${appUrl}/dashboard/integrations?error=invalid_state`)
      }

      // Complete the OAuth flow
      await completeLinkedInOAuthFlow({ code, userId: context.state, redirectUri })

      console.log(`[linkedin.oauth.callback] Successfully completed OAuth for user ${context.state}`)

      const redirectTarget = context.redirect ?? `${appUrl}/dashboard/integrations`

      // Final safety check on redirect target
      if (!isValidRedirectUrl(redirectTarget)) {
        return NextResponse.redirect(new URL('/dashboard/integrations', req.url))
      }

      return NextResponse.redirect(new URL(redirectTarget, req.url))
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('[linkedin.oauth.callback] Error completing OAuth flow:', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      })

      // Redirect to dashboard with error
      const encodedError = encodeURIComponent(errorMessage)
      return NextResponse.redirect(
        `${appUrl}/dashboard/integrations?error=oauth_failed&message=${encodedError}`
      )
    }
  }
)
