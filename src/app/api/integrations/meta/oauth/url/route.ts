import { z } from 'zod'
import { createMetaOAuthState } from '@/services/meta-business'
import { buildMetaBusinessLoginUrl } from '@/services/facebook-oauth'
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

    const appId = process.env.META_APP_ID
    const businessConfigId = process.env.META_BUSINESS_CONFIG_ID
    const redirectUri = process.env.META_OAUTH_REDIRECT_URI
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    if (!appId || !businessConfigId || !redirectUri) {
      return { error: 'Meta business login is not configured', status: 500 }
    }

    const redirect = query.redirect ?? `${appUrl}/dashboard`

  const statePayload = createMetaOAuthState({ state: auth.uid, redirect })
  const loginUrl = buildMetaBusinessLoginUrl({
    businessConfigId,
    appId,
    redirectUri,
    state: statePayload,
  })

  return { url: loginUrl }
})
