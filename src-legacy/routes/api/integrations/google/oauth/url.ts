import { createFileRoute } from '@tanstack/react-router'
import { adaptApiHandler } from '@/lib/api-handler-start'
import { z } from 'zod'
import { buildGoogleOAuthUrl, createGoogleOAuthState, resolveGoogleAdsOAuthCredentials, resolveGoogleAdsOAuthRedirectUri } from '@/services/google-oauth'
import { BadRequestError, ServiceUnavailableError, UnauthorizedError } from '@/lib/api-errors'
import { isValidRedirectUrl } from '@/lib/utils'

const querySchema = z.object({
  redirect: z.string().optional(),
  clientId: z.string().optional(),
})

const handlers = adaptApiHandler(
  { auth: 'required', querySchema, rateLimit: 'standard' },
  async (_req, { auth, query }) => {
    if (!auth.uid) throw new UnauthorizedError('Authentication required')
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      'http://localhost:3000'
    const { clientId: googleClientId } = resolveGoogleAdsOAuthCredentials()
    const redirectUri = resolveGoogleAdsOAuthRedirectUri(appUrl)
    if (!googleClientId || !redirectUri) throw new ServiceUnavailableError('Google Ads OAuth is not configured')
    const redirect = query.redirect ?? `${appUrl}/dashboard/ads`
    if (!isValidRedirectUrl(redirect)) throw new BadRequestError('Invalid redirect URL')
    const integrationClientId =
      typeof query.clientId === 'string' && query.clientId.trim().length > 0
        ? query.clientId.trim()
        : null
    const statePayload = createGoogleOAuthState({ state: auth.uid, redirect, clientId: integrationClientId })
    const loginUrl = buildGoogleOAuthUrl({ clientId: googleClientId, redirectUri, state: statePayload })
    return { url: loginUrl }
  },
)

export const Route = createFileRoute('/api/integrations/google/oauth/url')({
  server: { handlers },
})
