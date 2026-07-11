import { createFileRoute } from '@tanstack/react-router'
import { adaptApiHandler } from '@/lib/api-handler-start'
import { z } from 'zod'
import { createLinkedInOAuthState, buildLinkedInOAuthUrl } from '@/services/linkedin-oauth'
import { ServiceUnavailableError, UnauthorizedError, BadRequestError } from '@/lib/api-errors'
import { isValidRedirectUrl } from '@/lib/utils'
import { generateCodeVerifier } from '@/lib/crypto'

const querySchema = z.object({
  redirect: z.string().optional(),
  clientId: z.string().optional(),
})

const handlers = adaptApiHandler(
  { auth: 'required', querySchema, rateLimit: 'standard' },
  async (_req, { auth, query }) => {
    if (!auth.uid) throw new UnauthorizedError('Authentication required')
    const linkedInClientId = process.env.LINKEDIN_CLIENT_ID
    const redirectUri = process.env.LINKEDIN_OAUTH_REDIRECT_URI
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      'http://localhost:3000'
    if (!linkedInClientId || !redirectUri) throw new ServiceUnavailableError('LinkedIn Ads OAuth is not configured')
    const redirect = query.redirect ?? `${appUrl}/dashboard/ads`
    if (!isValidRedirectUrl(redirect)) throw new BadRequestError('Invalid redirect URL')
    const integrationClientId =
      typeof query.clientId === 'string' && query.clientId.trim().length > 0
        ? query.clientId.trim()
        : null
    const codeVerifier = generateCodeVerifier()
    const statePayload = createLinkedInOAuthState({ state: auth.uid, redirect, clientId: integrationClientId, codeVerifier })
    const loginUrl = buildLinkedInOAuthUrl({ clientId: linkedInClientId, redirectUri, state: statePayload, codeVerifier })
    return { url: loginUrl }
  },
)

export const Route = createFileRoute('/api/integrations/linkedin/oauth/url')({
  server: { handlers },
})
