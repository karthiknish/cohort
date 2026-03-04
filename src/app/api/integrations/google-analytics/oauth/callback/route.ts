import { NextResponse } from 'next/server'
import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { isValidRedirectUrl } from '@/lib/utils'
import {
  completeGoogleAnalyticsOAuthFlow,
  resolveGoogleAnalyticsOAuthRedirectUri,
  validateGoogleOAuthState,
} from '@/services/google-oauth'

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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

    try {
      const { error, error_description: errorDescription, code, state } = query

      if (error) {
        const errorUrl = new URL('/dashboard/analytics', appUrl)
        errorUrl.searchParams.set('oauth_error', 'google_analytics_error')
        errorUrl.searchParams.set('provider', 'google-analytics')
        errorUrl.searchParams.set('message', errorDescription || error)
        return NextResponse.redirect(errorUrl.toString())
      }

      if (!code) {
        return NextResponse.redirect(`${appUrl}/dashboard/analytics?oauth_error=missing_code&provider=google-analytics`)
      }

      const redirectUri = resolveGoogleAnalyticsOAuthRedirectUri(appUrl)
      if (!redirectUri) {
        return NextResponse.redirect(`${appUrl}/dashboard/analytics?oauth_error=config_error&provider=google-analytics`)
      }

      let context
      try {
        context = validateGoogleOAuthState(state ?? '')
      } catch (stateError) {
        console.error('[google-analytics.oauth.callback] State validation failed:', stateError)
        return NextResponse.redirect(`${appUrl}/dashboard/analytics?oauth_error=invalid_state&provider=google-analytics`)
      }

      if (!context.state) {
        return NextResponse.redirect(`${appUrl}/dashboard/analytics?oauth_error=invalid_state&provider=google-analytics`)
      }

      await completeGoogleAnalyticsOAuthFlow({
        code,
        userId: context.state,
        redirectUri,
        clientId: context.clientId ?? null,
      })

      let redirectTarget = context.redirect ?? `${appUrl}/dashboard/analytics`
      const url = new URL(redirectTarget, appUrl)
      url.searchParams.set('oauth_success', 'true')
      url.searchParams.set('provider', 'google-analytics')
      if (context.clientId) {
        url.searchParams.set('clientId', context.clientId)
      }
      redirectTarget = url.toString()

      if (!isValidRedirectUrl(redirectTarget)) {
        return NextResponse.redirect(new URL('/dashboard/analytics?oauth_success=true&provider=google-analytics', req.url))
      }

      return NextResponse.redirect(new URL(redirectTarget, req.url))
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('[google-analytics.oauth.callback] Error completing OAuth flow:', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      })

      const errorUrl = new URL('/dashboard/analytics', appUrl)
      errorUrl.searchParams.set('oauth_error', 'oauth_failed')
      errorUrl.searchParams.set('provider', 'google-analytics')
      errorUrl.searchParams.set('message', errorMessage)
      return NextResponse.redirect(errorUrl.toString())
    }
  }
)
