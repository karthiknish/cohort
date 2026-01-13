import { NextResponse } from 'next/server'
import { z } from 'zod'

import { completeMetaOAuthFlow, validateMetaOAuthState } from '@/services/meta-business'
import { createApiHandler } from '@/lib/api-handler'
import { isValidRedirectUrl } from '@/lib/utils'

// Meta OAuth error codes reference:
// https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived

const callbackQuerySchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
  error: z.string().optional(),
  error_reason: z.string().optional(),
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
      // Check for OAuth error from Meta
      const { error, error_reason: errorReason, error_description: errorDescription, code, state } = query

      if (error) {
        console.error('[meta.oauth.callback] OAuth error from Meta:', { error, errorReason, errorDescription })
        const errorUrl = new URL('/dashboard/ads', appUrl)
        errorUrl.searchParams.set('oauth_error', 'meta_error')
        errorUrl.searchParams.set('provider', 'facebook')
        errorUrl.searchParams.set('message', errorDescription || error)
        return NextResponse.redirect(errorUrl.toString())
      }

      if (!code) {
        console.error('[meta.oauth.callback] Missing authorization code')
        return NextResponse.redirect(`${appUrl}/dashboard/ads?oauth_error=missing_code&provider=facebook`)
      }

      const redirectUri = process.env.META_OAUTH_REDIRECT_URI
      if (!redirectUri) {
        console.error('[meta.oauth.callback] META_OAUTH_REDIRECT_URI not configured')
        return NextResponse.redirect(`${appUrl}/dashboard/ads?oauth_error=config_error&provider=facebook`)
      }

      // Validate state to prevent CSRF attacks
      let context
      try {
        context = validateMetaOAuthState(state ?? '')
      } catch (stateError) {
        console.error('[meta.oauth.callback] State validation failed:', stateError)
        return NextResponse.redirect(`${appUrl}/dashboard/ads?error=invalid_state`)
      }

      if (!context.state) {
        console.error('[meta.oauth.callback] Invalid state - missing user ID')
        return NextResponse.redirect(`${appUrl}/dashboard/ads?error=invalid_state`)
      }

      // Complete the OAuth flow
      await completeMetaOAuthFlow({
        code,
        userId: context.state,
        clientId: context.clientId ?? null,
        redirectUri,
      })

      console.log(`[meta.oauth.callback] Successfully completed OAuth for user ${context.state}`)

      let redirectTarget = context.redirect ?? `${appUrl}/dashboard/ads`

      // Standardize success signaling via query parameters
      const url = new URL(redirectTarget, appUrl)
      url.searchParams.set('oauth_success', 'true')
      url.searchParams.set('provider', 'facebook')
      if (context.clientId) {
        url.searchParams.set('clientId', context.clientId)
      }
      redirectTarget = url.toString()

      // Final safety check on redirect target
      if (!isValidRedirectUrl(redirectTarget)) {
        return NextResponse.redirect(new URL('/dashboard/ads?oauth_success=true&provider=facebook', req.url))
      }

      return NextResponse.redirect(new URL(redirectTarget, req.url))
    } catch (error: unknown) {
      const rawMessage = error instanceof Error ? error.message : 'Unknown error'

      const messageLower = rawMessage.toLowerCase()

      const userFacingMessage = (() => {
        if (messageLower.includes('convex admin client is not configured')) {
          return 'Ads integration is not configured on this environment.'
        }

        if (messageLower.includes('authentication required') || messageLower.includes('unauthorized')) {
          return 'Your session expired. Please sign in again and retry connecting Meta.'
        }

        if (messageLower.includes('invalid state')) {
          return 'Login session expired. Please try connecting again.'
        }

        return rawMessage
      })()

      console.error('[meta.oauth.callback] Error completing OAuth flow:', {
        error: rawMessage,
        stack: error instanceof Error ? error.stack : undefined,
      })

      // Redirect to dashboard with error signaling
      const errorUrl = new URL('/dashboard/ads', appUrl)
      errorUrl.searchParams.set('oauth_error', 'oauth_failed')
      errorUrl.searchParams.set('provider', 'facebook')
      errorUrl.searchParams.set('message', userFacingMessage)

      return NextResponse.redirect(errorUrl.toString())
    }
  }
)
