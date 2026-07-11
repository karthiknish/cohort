import { createFileRoute } from '@tanstack/react-router'
import { adaptApiHandler } from '@/lib/api-handler-start'
import { z } from 'zod'
import { completeGoogleOAuthFlow, resolveGoogleAdsOAuthRedirectUri, validateGoogleOAuthState } from '@/services/google-oauth'
import { isValidRedirectUrl } from '@/lib/utils'
import { jsonResponse, redirectResponse } from '@/lib/server-response'
import { logError, asErrorMessage } from '@/lib/convex-errors'

const callbackQuerySchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
  error: z.string().optional(),
  error_description: z.string().optional(),
})

const handlers = adaptApiHandler(
  { auth: 'none', querySchema: callbackQuerySchema, rateLimit: 'sensitive' },
  async (req, { query }) => {
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      'http://localhost:3000'
    try {
      const { error, error_description: errorDescription, code, state } = query
      if (error) {
        logError(new Error(errorDescription || error || 'Unknown Google OAuth error'), '[google.oauth.callback] OAuth error from Google')
        const errorUrl = new URL('/dashboard/ads', appUrl)
        errorUrl.searchParams.set('oauth_error', 'google_error')
        errorUrl.searchParams.set('provider', 'google')
        errorUrl.searchParams.set('message', errorDescription || error)
        return redirectResponse(errorUrl.toString())
      }
      if (!code) {
        return redirectResponse(`${appUrl}/dashboard/ads?oauth_error=missing_code&provider=google`)
      }
      const redirectUri = resolveGoogleAdsOAuthRedirectUri(appUrl)
      if (!redirectUri) {
        return redirectResponse(`${appUrl}/dashboard/ads?oauth_error=config_error&provider=google`)
      }
      let context
      try {
        context = validateGoogleOAuthState(state ?? '')
      } catch (stateError) {
        logError(stateError, '[google.oauth.callback] State validation failed')
        return redirectResponse(`${appUrl}/dashboard/ads?oauth_error=invalid_state&provider=google`)
      }
      if (!context.state) {
        return redirectResponse(`${appUrl}/dashboard/ads?oauth_error=invalid_state&provider=google`)
      }
      await completeGoogleOAuthFlow({ code, userId: context.state, redirectUri, clientId: context.clientId ?? null, codeVerifier: context.codeVerifier ?? undefined })
      let redirectTarget = context.redirect ?? `${appUrl}/dashboard/ads`
      const url = new URL(redirectTarget, appUrl)
      url.searchParams.set('oauth_success', 'true')
      url.searchParams.set('provider', 'google')
      if (context.clientId) url.searchParams.set('clientId', context.clientId)
      redirectTarget = url.toString()
      if (!isValidRedirectUrl(redirectTarget)) {
        return redirectResponse(new URL('/dashboard/ads?oauth_success=true&provider=google', req.url))
      }
      return redirectResponse(new URL(redirectTarget, req.url))
    } catch (error: unknown) {
      const rawMessage = asErrorMessage(error)
      const messageLower = rawMessage.toLowerCase()
      const userFacingMessage = (() => {
        if (messageLower.includes('convex admin client is not configured'))
          return 'Google Ads integration is not configured on this environment.'
        if (messageLower.includes('authentication required') || messageLower.includes('unauthorized'))
          return 'Your session expired. Please sign in again and retry connecting Google Ads.'
        if (messageLower.includes('invalid state'))
          return 'Login session expired. Please try connecting again.'
        return rawMessage
      })()
      logError(error, '[google.oauth.callback] Error completing OAuth flow')
      const errorUrl = new URL('/dashboard/ads', appUrl)
      errorUrl.searchParams.set('oauth_error', 'oauth_failed')
      errorUrl.searchParams.set('provider', 'google')
      errorUrl.searchParams.set('message', userFacingMessage)
      return redirectResponse(errorUrl.toString())
    }
  },
)

export const Route = createFileRoute('/api/integrations/google/oauth/callback')({
  server: { handlers },
})
