import { z } from 'zod'
import { buildTikTokOAuthUrl, createTikTokOAuthState } from '@/services/tiktok-business'
import { createApiHandler } from '@/lib/api-handler'

const querySchema = z.object({
  redirect: z.string().optional(),
})

export const POST = createApiHandler(
  {
    querySchema,
  },
  async (req, { auth, query }) => {
    if (!auth.uid) {
      return { error: 'Authentication required', status: 401 }
    }

    const clientKey = process.env.TIKTOK_CLIENT_KEY
    const redirectUri = process.env.TIKTOK_OAUTH_REDIRECT_URI
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    if (!clientKey || !redirectUri) {
      return { error: 'TikTok OAuth is not configured', status: 500 }
    }

    const redirect = query.redirect ?? `${appUrl}/dashboard/ads`

  const state = createTikTokOAuthState({ state: auth.uid, redirect })
  const scopes = process.env.TIKTOK_OAUTH_SCOPES?.split(',').map((scope) => scope.trim()).filter(Boolean)
  const url = buildTikTokOAuthUrl({ clientKey, redirectUri, state, scopes })

  return { url }
})
