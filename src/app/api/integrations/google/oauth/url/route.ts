import { z } from 'zod'
import { createGoogleOAuthState, buildGoogleOAuthUrl } from '@/services/google-oauth'
import { createApiHandler } from '@/lib/api-handler'
import { ServiceUnavailableError, UnauthorizedError, BadRequestError } from '@/lib/api-errors'
import { isValidRedirectUrl } from '@/lib/utils'

const querySchema = z.object({
  redirect: z.string().optional(),
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

    const clientId = process.env.GOOGLE_ADS_CLIENT_ID
    const redirectUri = process.env.GOOGLE_ADS_OAUTH_REDIRECT_URI
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    if (!clientId || !redirectUri) {
      throw new ServiceUnavailableError('Google Ads OAuth is not configured')
    }

    const redirect = query.redirect ?? `${appUrl}/dashboard/integrations`

    // Validate redirect URL to prevent Open Redirect vulnerabilities
    if (!isValidRedirectUrl(redirect)) {
      throw new BadRequestError('Invalid redirect URL')
    }

    const statePayload = createGoogleOAuthState({ state: auth.uid, redirect })
    const loginUrl = buildGoogleOAuthUrl({
      clientId,
      redirectUri,
      state: statePayload,
    })

    return { url: loginUrl }
  }
)
