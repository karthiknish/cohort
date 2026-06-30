import { createFileRoute } from '@tanstack/react-router'
import { adaptApiHandler } from '@/lib/api-handler-start'
import { z } from 'zod'
import { createMetaOAuthState } from '@/services/meta-business'
import { buildMetaBusinessLoginUrl, SOCIAL_META_SCOPES } from '@/services/facebook-oauth'
import { ServiceUnavailableError, UnauthorizedError, BadRequestError } from '@/lib/api-errors'
import { isValidRedirectUrl } from '@/lib/utils'

const querySchema = z.object({
  redirect: z.string().optional(),
  clientId: z.string().optional(),
  surface: z.enum(['facebook', 'instagram']).optional(),
  entryPoint: z.enum(['socials', 'ads']).optional(),
})

const handlers = adaptApiHandler(
  { auth: 'required', querySchema, rateLimit: 'standard' },
  async (_req, { auth, query }) => {
    if (!auth.uid) throw new UnauthorizedError('Authentication required')
    const appId = process.env.META_APP_ID
    const businessConfigId = process.env.META_BUSINESS_CONFIG_ID
    const redirectUri = process.env.META_OAUTH_REDIRECT_URI
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      'http://localhost:3000'
    if (!appId || !businessConfigId || !redirectUri) {
      throw new ServiceUnavailableError('Meta business login is not configured')
    }
    const defaultRedirectPath = query.entryPoint === 'socials' ? '/dashboard/socials' : '/dashboard/ads'
    const redirect = query.redirect ?? `${appUrl}${defaultRedirectPath}`
    if (!isValidRedirectUrl(redirect)) throw new BadRequestError('Invalid redirect URL')
    const clientId =
      typeof query.clientId === 'string' && query.clientId.trim().length > 0
        ? query.clientId.trim()
        : null
    const statePayload = createMetaOAuthState({
      state: auth.uid,
      redirect,
      clientId,
      surface: query.surface,
      entryPoint: query.entryPoint,
    })
    const loginUrl = buildMetaBusinessLoginUrl({
      businessConfigId,
      appId,
      redirectUri,
      state: statePayload,
      scopes: query.entryPoint === 'socials' ? SOCIAL_META_SCOPES : undefined,
    })
    return { url: loginUrl }
  },
)

export const Route = createFileRoute('/api/integrations/meta/oauth/url')({
  server: { handlers },
})
