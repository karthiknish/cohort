import { NextResponse } from 'next/server'
import { z } from 'zod'

import { completeMetaOAuthFlow, validateMetaOAuthState } from '@/services/meta-business'
import { createApiHandler } from '@/lib/api-handler'

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
  },
  async (req, { query }) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    
    try {
      // Check for OAuth error from Meta
      const { error, error_reason: errorReason, error_description: errorDescription, code, state } = query

    if (!code) {
      console.error('[meta.oauth.callback] Missing authorization code')
      return NextResponse.redirect(`${appUrl}/dashboard/integrations?error=missing_code`)
    }

    const redirectUri = process.env.META_OAUTH_REDIRECT_URI
    if (!redirectUri) {
      console.error('[meta.oauth.callback] META_OAUTH_REDIRECT_URI not configured')
      return NextResponse.redirect(`${appUrl}/dashboard/integrations?error=config_error`)
    }

    // Validate state to prevent CSRF attacks
    let context
    try {
      context = validateMetaOAuthState(state ?? '')
    } catch (stateError) {
      console.error('[meta.oauth.callback] State validation failed:', stateError)
      return NextResponse.redirect(`${appUrl}/dashboard/integrations?error=invalid_state`)
    }

    if (!context.state) {
      console.error('[meta.oauth.callback] Invalid state - missing user ID')
      return NextResponse.redirect(`${appUrl}/dashboard/integrations?error=invalid_state`)
    }

    // Complete the OAuth flow
    await completeMetaOAuthFlow({ code, userId: context.state, redirectUri })

    console.log(`[meta.oauth.callback] Successfully completed OAuth for user ${context.state}`)

    const redirectTarget = context.redirect ?? `${appUrl}/dashboard/integrations`
    const response = NextResponse.redirect(redirectTarget)
    
    // Set success cookie for UI feedback
    response.cookies.set('meta_oauth_success', '1', { 
      path: '/', 
      maxAge: 60,
      httpOnly: false, // Allow JS to read for UI feedback
      sameSite: 'lax',
    })
    
    return response
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[meta.oauth.callback] Error completing OAuth flow:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    })
    
    // Redirect to dashboard with error
    const encodedError = encodeURIComponent(errorMessage)
    return NextResponse.redirect(`${appUrl}/dashboard/integrations?error=oauth_failed&message=${encodedError}`)
  }
})
