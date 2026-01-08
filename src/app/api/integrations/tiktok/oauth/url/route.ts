import { z } from 'zod'
import { buildTikTokOAuthUrl, createTikTokOAuthState } from '@/services/tiktok-business'
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

    const clientKey = process.env.TIKTOK_CLIENT_KEY
    const redirectUri = process.env.TIKTOK_OAUTH_REDIRECT_URI
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    if (!clientKey || !redirectUri) {
      throw new ServiceUnavailableError('TikTok OAuth is not configured')
    }

    const redirect = query.redirect ?? `${appUrl}/dashboard/ads`

    // Validate redirect URL to prevent Open Redirect vulnerabilities
    if (!isValidRedirectUrl(redirect)) {
      throw new BadRequestError('Invalid redirect URL')
    }

    const state = createTikTokOAuthState({
      state: auth.uid,
      redirect,
      clientId: query.clientId ?? null,
    })
    const scopes = process.env.TIKTOK_OAUTH_SCOPES?.split(',').map((scope) => scope.trim()).filter(Boolean)
    const url = buildTikTokOAuthUrl({ clientKey, redirectUri, state, scopes })

    return { url }
  }
)
