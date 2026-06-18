import { createFileRoute } from '@tanstack/react-router'
import { adaptApiHandler } from '@/lib/api-handler-start'
import { z } from 'zod'
import { buildTikTokOAuthUrl, createTikTokOAuthState } from '@/services/tiktok-business'
import { ServiceUnavailableError, UnauthorizedError, BadRequestError } from '@/lib/api-errors'
import { isValidRedirectUrl } from '@/lib/utils'

const querySchema = z.object({
  redirect: z.string().optional(),
  clientId: z.string().optional(),
})

const handlers = adaptApiHandler(
  { auth: 'required', querySchema, rateLimit: 'standard' },
  async (_req, { auth, query }) => {
    if (!auth.uid) throw new UnauthorizedError('Authentication required')
    const clientKey = process.env.TIKTOK_CLIENT_KEY
    const redirectUri = process.env.TIKTOK_OAUTH_REDIRECT_URI
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      'http://localhost:3000'
    if (!clientKey || !redirectUri) throw new ServiceUnavailableError('TikTok OAuth is not configured')
    const redirect = query.redirect ?? `${appUrl}/dashboard/ads`
    if (!isValidRedirectUrl(redirect)) throw new BadRequestError('Invalid redirect URL')
    const state = createTikTokOAuthState({ state: auth.uid, redirect, clientId: query.clientId ?? null })
    const scopes = process.env.TIKTOK_OAUTH_SCOPES?.split(',').flatMap((scope) => {
      const normalizedScope = scope.trim()
      return normalizedScope ? [normalizedScope] : []
    })
    const url = buildTikTokOAuthUrl({ clientKey, redirectUri, state, scopes })
    return { url }
  },
)

export const Route = createFileRoute('/api/integrations/tiktok/oauth/url')({
  server: { handlers },
})
