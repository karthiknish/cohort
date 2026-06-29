import { createFileRoute } from '@tanstack/react-router'
import { adaptApiHandler } from '@/lib/api-handler-start'
import { z } from 'zod'
import { completeLinkedInOAuthFlow, validateLinkedInOAuthState } from '@/services/linkedin-oauth'
import { isValidRedirectUrl } from '@/lib/utils'
import { NextResponse } from '@/lib/http-server-types'

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
        console.error('[linkedin.oauth.callback] OAuth error from LinkedIn:', { error, errorDescription })
        const errorUrl = new URL('/dashboard/ads', appUrl)
        errorUrl.searchParams.set('oauth_error', 'linkedin_error')
        errorUrl.searchParams.set('provider', 'linkedin')
        errorUrl.searchParams.set('message', errorDescription || error)
        return NextResponse.redirect(errorUrl.toString())
      }
      if (!code) {
        return NextResponse.redirect(`${appUrl}/dashboard/ads?oauth_error=missing_code&provider=linkedin`)
      }
      const redirectUri = process.env.LINKEDIN_OAUTH_REDIRECT_URI
      if (!redirectUri) {
        return NextResponse.redirect(`${appUrl}/dashboard/ads?oauth_error=config_error&provider=linkedin`)
      }
      let context
      try {
        context = validateLinkedInOAuthState(state ?? '')
      } catch (stateError) {
        console.error('[linkedin.oauth.callback] State validation failed:', stateError)
        return NextResponse.redirect(`${appUrl}/dashboard/ads?error=invalid_state`)
      }
      if (!context.state) {
        return NextResponse.redirect(`${appUrl}/dashboard/ads?error=invalid_state`)
      }
      await completeLinkedInOAuthFlow({ code, userId: context.state, redirectUri, clientId: context.clientId ?? null })
      let redirectTarget = context.redirect ?? `${appUrl}/dashboard/ads`
      const url = new URL(redirectTarget, appUrl)
      url.searchParams.set('oauth_success', 'true')
      url.searchParams.set('provider', 'linkedin')
      if (context.clientId) url.searchParams.set('clientId', context.clientId)
      redirectTarget = url.toString()
      if (!isValidRedirectUrl(redirectTarget)) {
        return NextResponse.redirect(new URL('/dashboard/ads?oauth_success=true&provider=linkedin', req.url))
      }
      return NextResponse.redirect(new URL(redirectTarget, req.url))
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('[linkedin.oauth.callback] Error completing OAuth flow:', { error: errorMessage, stack: error instanceof Error ? error.stack : undefined })
      const errorUrl = new URL('/dashboard/ads', appUrl)
      errorUrl.searchParams.set('oauth_error', 'oauth_failed')
      errorUrl.searchParams.set('provider', 'linkedin')
      errorUrl.searchParams.set('message', errorMessage)
      return NextResponse.redirect(errorUrl.toString())
    }
  },
)

export const Route = createFileRoute('/api/integrations/linkedin/oauth/callback')({
  server: { handlers },
})
