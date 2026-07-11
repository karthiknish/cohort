import type { ActionCtx } from '../_generated/server'
import { Errors } from '../errors'
import { isTokenExpiringSoon, refreshTikTokAccessToken } from '@/lib/integration-token-refresh'

export type TikTokIntegration = {
  accessToken?: string | null
  accessTokenExpiresAtMs?: number | null
  accountId?: string | null
}

export async function getTikTokIntegration(
  ctx: ActionCtx,
  workspaceId: string,
  clientId: string | null,
): Promise<TikTokIntegration | null> {
  const { internal } = await import('../_generated/api')
  const integration = await ctx.runQuery(internal.adsIntegrations.getAdIntegrationInternal, {
    workspaceId,
    providerId: 'tiktok',
    clientId,
  })

  if (!integration) return null

  return {
    accessToken: integration.accessToken,
    accessTokenExpiresAtMs: integration.accessTokenExpiresAtMs,
    accountId: integration.accountId,
  }
}

export function requireTikTokAdAccount(integration: TikTokIntegration): string {
  const accountId = integration.accountId
  if (typeof accountId !== 'string' || accountId.trim().length === 0) {
    throw Errors.integration.notConfigured('TikTok', 'TikTok ad account ID not configured')
  }
  return accountId
}

export async function resolveTikTokAccessToken(
  workspaceId: string,
  integration: TikTokIntegration,
  clientId: string | null,
): Promise<string> {
  if (!integration.accessToken) {
    throw Errors.integration.missingToken('tiktok')
  }

  if (isTokenExpiringSoon(integration.accessTokenExpiresAtMs)) {
    return refreshTikTokAccessToken({ userId: workspaceId, clientId })
  }

  return integration.accessToken
}
