import { z } from 'zod'
import { buildTikTokOAuthUrl, createTikTokOAuthState } from '@/services/tiktok-business'
import { createApiHandler } from '@/lib/api-handler'
import { ServiceUnavailableError, UnauthorizedError } from '@/lib/api-errors'

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

    const clientKey = process.env.TIKTOK_CLIENT_KEY
    const redirectUri = process.env.TIKTOK_OAUTH_REDIRECT_URI
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    if (!clientKey || !redirectUri) {
      throw new ServiceUnavailableError('TikTok OAuth is not configured')
    }

    const redirect = query.redirect ?? `${appUrl}/dashboard/ads`

  const state = createTikTokOAuthState({ state: auth.uid, redirect })
  const scopes = process.env.TIKTOK_OAUTH_SCOPES?.split(',').map((scope) => scope.trim()).filter(Boolean)
  const url = buildTikTokOAuthUrl({ clientKey, redirectUri, state, scopes })

  return { url }
})
