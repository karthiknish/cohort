import { createFileRoute } from '@tanstack/react-router'
import { adaptApiHandler } from '@/lib/api-handler-start'
import { z } from 'zod'
import { completeMetaOAuthFlow, validateMetaOAuthState } from '@/services/meta-business'
import { isValidRedirectUrl } from '@/lib/utils'
import { jsonResponse, redirectResponse } from '@/lib/server-response'

const callbackQuerySchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
  error: z.string().optional(),
  error_reason: z.string().optional(),
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
      const { error, error_reason: errorReason, error_description: errorDescription, code, state } = query
      if (error) {
        console.error('[meta.oauth.callback] OAuth error from Meta:', { error, errorReason, errorDescription })
        let errorEntryPoint: 'socials' | 'ads' = 'ads'
        try {
          const ctx = validateMetaOAuthState(state ?? '')
          if (ctx.entryPoint === 'socials') errorEntryPoint = 'socials'
        } catch { /* ignore */ }
        const errorPath = errorEntryPoint === 'socials' ? '/dashboard/socials' : '/dashboard/ads'
        const errorUrl = new URL(errorPath, appUrl)
        errorUrl.searchParams.set('oauth_error', 'meta_error')
        errorUrl.searchParams.set('provider', 'facebook')
        errorUrl.searchParams.set('message', errorDescription || error)
        return redirectResponse(errorUrl.toString())
      }

      if (!code) {
        return redirectResponse(`${appUrl}/dashboard/ads?oauth_error=missing_code&provider=facebook`)
      }

      const redirectUri = process.env.META_OAUTH_REDIRECT_URI
      if (!redirectUri) {
        return redirectResponse(`${appUrl}/dashboard/ads?oauth_error=config_error&provider=facebook`)
      }

      let context
      try {
        context = validateMetaOAuthState(state ?? '')
      } catch (stateError) {
        console.error('[meta.oauth.callback] State validation failed:', stateError)
        return redirectResponse(`${appUrl}/dashboard/ads?oauth_error=invalid_state&provider=facebook`)
      }
      if (!context.state) {
        return redirectResponse(`${appUrl}/dashboard/ads?oauth_error=invalid_state&provider=facebook`)
      }

      await completeMetaOAuthFlow({
        code,
        userId: context.state,
        clientId: context.clientId ?? null,
        redirectUri,
        entryPoint: context.entryPoint,
      })

      const defaultSuccessPath = context.entryPoint === 'socials' ? '/dashboard/socials' : '/dashboard/ads'
      let redirectTarget = context.redirect ?? `${appUrl}${defaultSuccessPath}`
      const url = new URL(redirectTarget, appUrl)
      url.searchParams.set('oauth_success', 'true')
      url.searchParams.set('provider', 'facebook')
      if (context.clientId) url.searchParams.set('clientId', context.clientId)
      if (context.surface) url.searchParams.set('surface', context.surface)
      redirectTarget = url.toString()

      if (!isValidRedirectUrl(redirectTarget)) {
        const fallbackPath = context.entryPoint === 'socials' ? '/dashboard/socials' : '/dashboard/ads'
        return redirectResponse(new URL(`${fallbackPath}?oauth_success=true&provider=facebook`, req.url))
      }
      return redirectResponse(new URL(redirectTarget, req.url))
    } catch (error: unknown) {
      const rawMessage = error instanceof Error ? error.message : 'Unknown error'
      const messageLower = rawMessage.toLowerCase()
      const userFacingMessage = (() => {
        if (messageLower.includes('convex admin client is not configured'))
          return 'Ads integration is not configured on this environment.'
        if (messageLower.includes('authentication required') || messageLower.includes('unauthorized'))
          return 'Your session expired. Please sign in again and retry connecting Meta.'
        if (messageLower.includes('invalid state'))
          return 'Login session expired. Please try connecting again.'
        return rawMessage
      })()
      console.error('[meta.oauth.callback] Error completing OAuth flow:', {
        error: rawMessage,
        stack: error instanceof Error ? error.stack : undefined,
      })
      let errorPath = '/dashboard/ads'
      try {
        const ctx = validateMetaOAuthState(query.state ?? '')
        if (ctx.entryPoint === 'socials') errorPath = '/dashboard/socials'
      } catch { /* keep ads default */ }
      const errorUrl = new URL(errorPath, appUrl)
      errorUrl.searchParams.set('oauth_error', 'oauth_failed')
      errorUrl.searchParams.set('provider', 'facebook')
      errorUrl.searchParams.set('message', userFacingMessage)
      return redirectResponse(errorUrl.toString())
    }
  },
)

export const Route = createFileRoute('/api/integrations/meta/oauth/callback')({
  server: { handlers },
})
