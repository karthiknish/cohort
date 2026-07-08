import { createFileRoute } from '@tanstack/react-router'
import { adaptApiHandler } from '@/lib/api-handler-start'
import { z } from 'zod'
import { isValidRedirectUrl } from '@/lib/utils'
import { completeGoogleAnalyticsOAuthFlow, resolveGoogleAnalyticsOAuthRedirectUri, validateGoogleOAuthState } from '@/services/google-oauth'
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
        logError(new Error(errorDescription || error || 'Unknown Google Analytics OAuth error'), '[google-analytics.oauth.callback] OAuth error from Google Analytics')
        const errorUrl = new URL('/dashboard/analytics', appUrl)
        errorUrl.searchParams.set('oauth_error', 'google_analytics_error')
        errorUrl.searchParams.set('provider', 'google-analytics')
        errorUrl.searchParams.set('message', errorDescription || error)
        return redirectResponse(errorUrl.toString())
      }
      if (!code) {
        return redirectResponse(`${appUrl}/dashboard/analytics?oauth_error=missing_code&provider=google-analytics`)
      }
      const redirectUri = resolveGoogleAnalyticsOAuthRedirectUri(appUrl)
      if (!redirectUri) {
        return redirectResponse(`${appUrl}/dashboard/analytics?oauth_error=config_error&provider=google-analytics`)
      }
      let context
      try {
        context = validateGoogleOAuthState(state ?? '')
      } catch (stateError) {
        logError(stateError, '[google-analytics.oauth.callback] State validation failed')
        return redirectResponse(`${appUrl}/dashboard/analytics?oauth_error=invalid_state&provider=google-analytics`)
      }
      if (!context.state) {
        return redirectResponse(`${appUrl}/dashboard/analytics?oauth_error=invalid_state&provider=google-analytics`)
      }
      await completeGoogleAnalyticsOAuthFlow({ code, userId: context.state, redirectUri, clientId: context.clientId ?? null })
      let redirectTarget = context.redirect ?? `${appUrl}/dashboard/analytics`
      const url = new URL(redirectTarget, appUrl)
      url.searchParams.set('oauth_success', 'true')
      url.searchParams.set('provider', 'google-analytics')
      if (context.clientId) url.searchParams.set('clientId', context.clientId)
      redirectTarget = url.toString()
      if (!isValidRedirectUrl(redirectTarget)) {
        return redirectResponse(new URL('/dashboard/analytics?oauth_success=true&provider=google-analytics', req.url))
      }
      return redirectResponse(new URL(redirectTarget, req.url))
    } catch (error: unknown) {
      const errorMessage = asErrorMessage(error)
      logError(error, '[google-analytics.oauth.callback] Error completing OAuth flow')
      const errorUrl = new URL('/dashboard/analytics', appUrl)
      errorUrl.searchParams.set('oauth_error', 'oauth_failed')
      errorUrl.searchParams.set('provider', 'google-analytics')
      errorUrl.searchParams.set('message', errorMessage)
      return redirectResponse(errorUrl.toString())
    }
  },
)

export const Route = createFileRoute('/api/integrations/google-analytics/oauth/callback')({
  server: { handlers },
})
