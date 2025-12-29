import { z } from 'zod'
import { createMetaOAuthState } from '@/services/meta-business'
import { buildMetaBusinessLoginUrl } from '@/services/facebook-oauth'
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

    const appId = process.env.META_APP_ID
    const businessConfigId = process.env.META_BUSINESS_CONFIG_ID
    const redirectUri = process.env.META_OAUTH_REDIRECT_URI
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    if (!appId || !businessConfigId || !redirectUri) {
      throw new ServiceUnavailableError('Meta business login is not configured')
    }

    const redirect = query.redirect ?? `${appUrl}/dashboard`

    // Validate redirect URL to prevent Open Redirect vulnerabilities
    if (!isValidRedirectUrl(redirect)) {
      throw new BadRequestError('Invalid redirect URL')
    }

    const statePayload = createMetaOAuthState({ state: auth.uid, redirect })
  const loginUrl = buildMetaBusinessLoginUrl({
    businessConfigId,
    appId,
    redirectUri,
    state: statePayload,
  })

  return { url: loginUrl }
})
