import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { BadRequestError, ServiceUnavailableError, UnauthorizedError } from '@/lib/api-errors'
import { isValidRedirectUrl } from '@/lib/utils'
import {
  buildGoogleAnalyticsOAuthUrl,
  createGoogleOAuthState,
  resolveGoogleAnalyticsOAuthCredentials,
  resolveGoogleAnalyticsOAuthRedirectUri,
} from '@/services/google-oauth'

const querySchema = z.object({
  redirect: z.string().optional(),
  clientId: z.string().optional(),
})

export const GET = createApiHandler(
  {
    querySchema,
    rateLimit: 'standard',
  },
  async (_req, { auth, query }) => {
    if (!auth.uid) {
      throw new UnauthorizedError('Authentication required')
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const { clientId: googleClientId } = resolveGoogleAnalyticsOAuthCredentials()
    const redirectUri = resolveGoogleAnalyticsOAuthRedirectUri(appUrl)

    if (!googleClientId || !redirectUri) {
      throw new ServiceUnavailableError('Google Analytics OAuth is not configured')
    }

    const redirect = query.redirect ?? `${appUrl}/dashboard/analytics`
    if (!isValidRedirectUrl(redirect)) {
      throw new BadRequestError('Invalid redirect URL')
    }

    const integrationClientId = typeof query.clientId === 'string' && query.clientId.trim().length > 0
      ? query.clientId.trim()
      : null

    const state = createGoogleOAuthState({
      state: auth.uid,
      redirect,
      clientId: integrationClientId,
    })

    const url = buildGoogleAnalyticsOAuthUrl({
      clientId: googleClientId,
      redirectUri,
      state,
    })

    return { url }
  }
)
