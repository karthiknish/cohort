import { createFileRoute } from '@tanstack/react-router'
import { adaptApiHandler } from '@/lib/api-handler-start'
import { z } from 'zod'
import { completeLinkedInOAuthFlow, validateLinkedInOAuthState } from '@/services/linkedin-oauth'
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
        logError(new Error(errorDescription || error || 'Unknown LinkedIn OAuth error'), '[linkedin.oauth.callback] OAuth error from LinkedIn')
        const errorUrl = new URL('/dashboard/ads', appUrl)
        errorUrl.searchParams.set('oauth_error', 'linkedin_error')
        errorUrl.searchParams.set('provider', 'linkedin')
        errorUrl.searchParams.set('message', errorDescription || error)
        return redirectResponse(errorUrl.toString())
      }
      if (!code) {
        return redirectResponse(`${appUrl}/dashboard/ads?oauth_error=missing_code&provider=linkedin`)
      }
      const redirectUri = process.env.LINKEDIN_OAUTH_REDIRECT_URI
      if (!redirectUri) {
        return redirectResponse(`${appUrl}/dashboard/ads?oauth_error=config_error&provider=linkedin`)
      }
      let context
      try {
        context = validateLinkedInOAuthState(state ?? '')
      } catch (stateError) {
        logError(stateError, '[linkedin.oauth.callback] State validation failed')
        return redirectResponse(`${appUrl}/dashboard/ads?oauth_error=invalid_state&provider=linkedin`)
      }
      if (!context.state) {
        return redirectResponse(`${appUrl}/dashboard/ads?oauth_error=invalid_state&provider=linkedin`)
      }
      await completeLinkedInOAuthFlow({ code, userId: context.state, redirectUri, clientId: context.clientId ?? null, codeVerifier: context.codeVerifier ?? undefined })
      let redirectTarget = context.redirect ?? `${appUrl}/dashboard/ads`
      const url = new URL(redirectTarget, appUrl)
      url.searchParams.set('oauth_success', 'true')
      url.searchParams.set('provider', 'linkedin')
      if (context.clientId) url.searchParams.set('clientId', context.clientId)
      redirectTarget = url.toString()
      if (!isValidRedirectUrl(redirectTarget)) {
        return redirectResponse(new URL('/dashboard/ads?oauth_success=true&provider=linkedin', req.url))
      }
      return redirectResponse(new URL(redirectTarget, req.url))
    } catch (error: unknown) {
      const errorMessage = asErrorMessage(error)
      logError(error, '[linkedin.oauth.callback] Error completing OAuth flow')
      const errorUrl = new URL('/dashboard/ads', appUrl)
      errorUrl.searchParams.set('oauth_error', 'oauth_failed')
      errorUrl.searchParams.set('provider', 'linkedin')
      errorUrl.searchParams.set('message', errorMessage)
      return redirectResponse(errorUrl.toString())
    }
  },
)

export const Route = createFileRoute('/api/integrations/linkedin/oauth/callback')({
  server: { handlers },
})
