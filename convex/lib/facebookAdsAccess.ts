import type { ActionCtx } from '../_generated/server'
import { Errors } from '../errors'
import { normalizeClientId } from '@/lib/normalizeClientId'
import { isTokenExpiringSoon } from './isTokenExpiringSoon'

export { normalizeClientId }

type FacebookIntegration = {
  accessToken?: string | null
  accessTokenExpiresAtMs?: number | null
  accountId?: string | null
}

export async function getFacebookIntegration(
  ctx: ActionCtx,
  workspaceId: string,
  clientId: string | null
): Promise<FacebookIntegration> {
  const { internal } = await import('../_generated/api')
  const integration = await ctx.runQuery(internal.adsIntegrations.getAdIntegrationInternal, {
    workspaceId,
    providerId: 'facebook',
    clientId,
  })

  if (!integration.accessToken) {
    throw Errors.integration.missingToken('facebook')
  }

  return integration
}

export async function requireFacebookAdAccount(integration: FacebookIntegration): Promise<string> {
  const accountId = integration.accountId
  if (typeof accountId !== 'string' || accountId.trim().length === 0) {
    throw Errors.integration.notConfigured('Meta', 'Meta ad account ID not configured')
  }
  return accountId
}

export async function resolveFacebookAccessToken(
  workspaceId: string,
  integration: FacebookIntegration,
  clientId: string | null
): Promise<string> {
  if (!integration.accessToken) {
    throw Errors.integration.missingToken('facebook')
  }

  if (isTokenExpiringSoon(integration.accessTokenExpiresAtMs)) {
    const { refreshMetaAccessToken } = await import('@/lib/integration-token-refresh-meta')
    return refreshMetaAccessToken({ userId: workspaceId, clientId })
  }

  return integration.accessToken
}
