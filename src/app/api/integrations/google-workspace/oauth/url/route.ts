import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { BadRequestError, ForbiddenError, ServiceUnavailableError, UnauthorizedError } from '@/lib/api-errors'
import { isValidRedirectUrl } from '@/lib/utils'
import {
  buildGoogleWorkspaceOAuthUrl,
  createGoogleWorkspaceOAuthState,
  resolveGoogleWorkspaceOAuthCredentials,
  resolveGoogleWorkspaceOAuthRedirectUri,
} from '@/services/google-workspace'

const querySchema = z.object({
  redirect: z.string().optional(),
})

export const POST = createApiHandler(
  {
    querySchema,
    rateLimit: 'standard',
  },
  async (_req, { auth, query }) => {
    if (!auth.uid) {
      throw new UnauthorizedError('Authentication required')
    }

    const role = typeof auth.claims?.role === 'string' ? auth.claims.role : null
    if (role !== 'admin' && role !== 'team') {
      throw new ForbiddenError('Client users cannot connect Google Workspace for meetings')
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const { clientId: googleClientId } = resolveGoogleWorkspaceOAuthCredentials()
    const redirectUri = resolveGoogleWorkspaceOAuthRedirectUri(appUrl)

    if (!googleClientId || !redirectUri) {
      throw new ServiceUnavailableError('Google Workspace OAuth is not configured')
    }

    const redirect = query.redirect ?? `${appUrl}/dashboard/meetings`

    if (!isValidRedirectUrl(redirect)) {
      throw new BadRequestError('Invalid redirect URL')
    }

    const state = createGoogleWorkspaceOAuthState({
      state: auth.uid,
      redirect,
    })

    const url = buildGoogleWorkspaceOAuthUrl({
      clientId: googleClientId,
      redirectUri,
      state,
    })

    return { url }
  }
)
