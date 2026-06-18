import { createFileRoute } from '@tanstack/react-router'
import { adaptApiHandler } from '@/lib/api-handler-start'
import { z } from 'zod'
import { completeGoogleOAuthFlow, resolveGoogleAdsOAuthRedirectUri, validateGoogleOAuthState } from '@/services/google-oauth'
import { isValidRedirectUrl } from '@/lib/utils'

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
        console.error('[google.oauth.callback] OAuth error from Google:', { error, errorDescription })
        const { NextResponse } = await import('next/server')
        const errorUrl = new URL('/dashboard/ads', appUrl)
        errorUrl.searchParams.set('oauth_error', 'google_error')
        errorUrl.searchParams.set('provider', 'google')
        errorUrl.searchParams.set('message', errorDescription || error)
        return NextResponse.redirect(errorUrl.toString())
      }
      if (!code) {
        const { NextResponse } = await import('next/server')
        return NextResponse.redirect(`${appUrl}/dashboard/ads?oauth_error=missing_code&provider=google`)
      }
      const redirectUri = resolveGoogleAdsOAuthRedirectUri(appUrl)
      if (!redirectUri) {
        const { NextResponse } = await import('next/server')
        return NextResponse.redirect(`${appUrl}/dashboard/ads?oauth_error=config_error&provider=google`)
      }
      let context
      try {
        context = validateGoogleOAuthState(state ?? '')
      } catch (stateError) {
        console.error('[google.oauth.callback] State validation failed:', stateError)
        const { NextResponse } = await import('next/server')
        return NextResponse.redirect(`${appUrl}/dashboard/ads?oauth_error=invalid_state&provider=google`)
      }
      if (!context.state) {
        const { NextResponse } = await import('next/server')
        return NextResponse.redirect(`${appUrl}/dashboard/ads?oauth_error=invalid_state&provider=google`)
      }
      await completeGoogleOAuthFlow({ code, userId: context.state, redirectUri, clientId: context.clientId ?? null })
      let redirectTarget = context.redirect ?? `${appUrl}/dashboard/ads`
      const url = new URL(redirectTarget, appUrl)
      url.searchParams.set('oauth_success', 'true')
      url.searchParams.set('provider', 'google')
      if (context.clientId) url.searchParams.set('clientId', context.clientId)
      redirectTarget = url.toString()
      if (!isValidRedirectUrl(redirectTarget)) {
        const { NextResponse } = await import('next/server')
        return NextResponse.redirect(new URL('/dashboard/ads?oauth_success=true&provider=google', req.url))
      }
      const { NextResponse } = await import('next/server')
      return NextResponse.redirect(new URL(redirectTarget, req.url))
    } catch (error: unknown) {
      const rawMessage = error instanceof Error ? error.message : 'Unknown error'
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
      console.error('[google.oauth.callback] Error completing OAuth flow:', {
        error: rawMessage,
        stack: error instanceof Error ? error.stack : undefined,
      })
      const { NextResponse } = await import('next/server')
      const errorUrl = new URL('/dashboard/ads', appUrl)
      errorUrl.searchParams.set('oauth_error', 'oauth_failed')
      errorUrl.searchParams.set('provider', 'google')
      errorUrl.searchParams.set('message', userFacingMessage)
      return NextResponse.redirect(errorUrl.toString())
    }
  },
)

export const Route = createFileRoute('/api/integrations/google/oauth/callback')({
  server: { handlers },
})
