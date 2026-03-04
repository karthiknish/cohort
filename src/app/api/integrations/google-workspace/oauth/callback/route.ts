import { NextResponse } from 'next/server'
import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { isValidRedirectUrl } from '@/lib/utils'
import { upsertGoogleWorkspaceTokens } from '@/lib/meetings-admin'
import {
  exchangeGoogleWorkspaceCodeForTokens,
  parseGoogleScopeList,
  resolveGoogleWorkspaceOAuthCredentials,
  resolveGoogleWorkspaceOAuthRedirectUri,
  validateGoogleWorkspaceOAuthState,
} from '@/services/google-workspace'

const callbackQuerySchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
  error: z.string().optional(),
  error_description: z.string().optional(),
})

function decodeEmailFromIdToken(idToken: string | undefined): string | null {
  if (!idToken) return null

  try {
    const parts = idToken.split('.')
    if (parts.length < 2) return null

    const payload = parts[1]!
    const decoded = JSON.parse(Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')) as {
      email?: unknown
    }

    return typeof decoded.email === 'string' ? decoded.email : null
  } catch {
    return null
  }
}

async function fetchGoogleUserEmail(accessToken: string): Promise<string | null> {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      return null
    }

    const payload = (await response.json()) as { email?: unknown }
    return typeof payload.email === 'string' ? payload.email : null
  } catch {
    return null
  }
}

export const GET = createApiHandler(
  {
    auth: 'none',
    querySchema: callbackQuerySchema,
    rateLimit: 'sensitive',
  },
  async (req, { query }) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const fallbackSuccess = `${appUrl}/dashboard/meetings?oauth_success=true&provider=google-workspace`

    try {
      if (query.error) {
        const errorUrl = new URL('/dashboard/meetings', appUrl)
        errorUrl.searchParams.set('oauth_error', 'google_workspace_error')
        errorUrl.searchParams.set('provider', 'google-workspace')
        errorUrl.searchParams.set('message', query.error_description || query.error)
        return NextResponse.redirect(errorUrl.toString())
      }

      if (!query.code) {
        return NextResponse.redirect(`${appUrl}/dashboard/meetings?oauth_error=missing_code&provider=google-workspace`)
      }

      const redirectUri = resolveGoogleWorkspaceOAuthRedirectUri(appUrl)
      const { clientId: googleClientId, clientSecret: googleClientSecret } = resolveGoogleWorkspaceOAuthCredentials()

      if (!redirectUri || !googleClientId || !googleClientSecret) {
        return NextResponse.redirect(`${appUrl}/dashboard/meetings?oauth_error=config_error&provider=google-workspace`)
      }

      const context = validateGoogleWorkspaceOAuthState(query.state ?? '')

      const tokenResponse = await exchangeGoogleWorkspaceCodeForTokens({
        clientId: googleClientId,
        clientSecret: googleClientSecret,
        redirectUri,
        code: query.code,
      })

      const expiresInMs = typeof tokenResponse.expires_in === 'number' ? tokenResponse.expires_in * 1000 : null
      const accessTokenExpiresAtMs = expiresInMs ? Date.now() + expiresInMs : null
      const scopes = parseGoogleScopeList(tokenResponse.scope)

      const userEmail =
        (await fetchGoogleUserEmail(tokenResponse.access_token)) ?? decodeEmailFromIdToken(tokenResponse.id_token)

      await upsertGoogleWorkspaceTokens({
        userId: context.state,
        userEmail,
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        idToken: tokenResponse.id_token,
        scopes,
        accessTokenExpiresAtMs,
      })

      const redirectTarget = context.redirect ?? `${appUrl}/dashboard/meetings`
      const successUrl = new URL(redirectTarget, appUrl)
      successUrl.searchParams.set('oauth_success', 'true')
      successUrl.searchParams.set('provider', 'google-workspace')

      if (!isValidRedirectUrl(successUrl.toString())) {
        return NextResponse.redirect(fallbackSuccess)
      }

      return NextResponse.redirect(successUrl.toString())
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'OAuth callback failed'
      const errorUrl = new URL('/dashboard/meetings', appUrl)
      errorUrl.searchParams.set('oauth_error', 'oauth_failed')
      errorUrl.searchParams.set('provider', 'google-workspace')
      errorUrl.searchParams.set('message', message)
      return NextResponse.redirect(errorUrl.toString())
    }
  }
)
