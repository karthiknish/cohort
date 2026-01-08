import { z } from 'zod'
import { createMetaOAuthState } from '@/services/meta-business'
import { buildMetaBusinessLoginUrl } from '@/services/facebook-oauth'
import { createApiHandler } from '@/lib/api-handler'
import { ServiceUnavailableError, UnauthorizedError, BadRequestError } from '@/lib/api-errors'
import { isValidRedirectUrl } from '@/lib/utils'

const querySchema = z.object({
  redirect: z.string().optional(),
  clientId: z.string().optional(),
})

export const POST = createApiHandler(
  {
    querySchema,
    rateLimit: 'standard',
  },
  async (req, { auth, query }) => {
    if (!auth.uid) {
      throw new UnauthorizedError('Authentication required')
    }

    const appId = process.env.META_APP_ID
    const businessConfigId = process.env.META_BUSINESS_CONFIG_ID
    const redirectUri = process.env.META_OAUTH_REDIRECT_URI
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    if (!appId || !businessConfigId || !redirectUri) {
      throw new ServiceUnavailableError('Meta business login is not configured')
    }

    const redirect = query.redirect ?? `${appUrl}/dashboard/ads`

    // Validate redirect URL to prevent Open Redirect vulnerabilities
    if (!isValidRedirectUrl(redirect)) {
      throw new BadRequestError('Invalid redirect URL')
    }

    const clientId = typeof query.clientId === 'string' && query.clientId.trim().length > 0
      ? query.clientId.trim()
      : null

    const statePayload = createMetaOAuthState({ state: auth.uid, redirect, clientId })
    const loginUrl = buildMetaBusinessLoginUrl({
      businessConfigId,
      appId,
      redirectUri,
      state: statePayload,
    })

    // Debug logging for OAuth configuration
    console.log('[meta.oauth.url] OAuth Configuration Debug:', {
      META_APP_ID: appId,
      META_BUSINESS_CONFIG_ID: businessConfigId,
      META_OAUTH_REDIRECT_URI: redirectUri,
      GENERATED_LOGIN_URL: loginUrl,
      USER_ID: auth.uid,
      REDIRECT_AFTER_AUTH: redirect,
      CLIENT_ID: clientId,
    })

    return { url: loginUrl }
  })
