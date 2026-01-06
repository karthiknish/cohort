import { NextResponse } from 'next/server'
import { z } from 'zod'

import { completeGoogleOAuthFlow, validateGoogleOAuthState } from '@/services/google-oauth'
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
      // Check for OAuth error from Google
      const { error, error_description: errorDescription, code, state } = query

      if (error) {
        console.error('[google.oauth.callback] OAuth error from Google:', { error, errorDescription })
        const errorUrl = new URL('/dashboard/integrations', appUrl)
        errorUrl.searchParams.set('oauth_error', 'google_error')
        errorUrl.searchParams.set('provider', 'google')
        errorUrl.searchParams.set('message', errorDescription || error)
        return NextResponse.redirect(errorUrl.toString())
      }

      if (!code) {
        console.error('[google.oauth.callback] Missing authorization code')
        return NextResponse.redirect(`${appUrl}/dashboard/integrations?oauth_error=missing_code&provider=google`)
      }

      const redirectUri = process.env.GOOGLE_ADS_OAUTH_REDIRECT_URI
      if (!redirectUri) {
        console.error('[google.oauth.callback] GOOGLE_ADS_OAUTH_REDIRECT_URI not configured')
        return NextResponse.redirect(`${appUrl}/dashboard/integrations?oauth_error=config_error&provider=google`)
      }

      // Validate state to prevent CSRF attacks
      let context
      try {
        context = validateGoogleOAuthState(state ?? '')
      } catch (stateError) {
        console.error('[google.oauth.callback] State validation failed:', stateError)
        return NextResponse.redirect(`${appUrl}/dashboard/integrations?error=invalid_state`)
      }

      if (!context.state) {
        console.error('[google.oauth.callback] Invalid state - missing user ID')
        return NextResponse.redirect(`${appUrl}/dashboard/integrations?error=invalid_state`)
      }

      // Complete the OAuth flow
      await completeGoogleOAuthFlow({ code, userId: context.state, redirectUri })

      console.log(`[google.oauth.callback] Successfully completed OAuth for user ${context.state}`)

      let redirectTarget = context.redirect ?? `${appUrl}/dashboard/integrations`

      // Standardize success signaling via query parameters
      const url = new URL(redirectTarget, appUrl)
      url.searchParams.set('oauth_success', 'true')
      url.searchParams.set('provider', 'google')
      redirectTarget = url.toString()

      // Final safety check on redirect target
      if (!isValidRedirectUrl(redirectTarget)) {
        return NextResponse.redirect(new URL('/dashboard/integrations?oauth_success=true&provider=google', req.url))
      }

      return NextResponse.redirect(new URL(redirectTarget, req.url))
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('[google.oauth.callback] Error completing OAuth flow:', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      })

      // Redirect to dashboard with error signaling
      const errorUrl = new URL('/dashboard/integrations', appUrl)
      errorUrl.searchParams.set('oauth_error', 'oauth_failed')
      errorUrl.searchParams.set('provider', 'google')
      errorUrl.searchParams.set('message', errorMessage)
      
      return NextResponse.redirect(errorUrl.toString())
    }
  }
)
