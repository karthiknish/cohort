import type { ActionCtx } from '../_generated/server'
import { Errors } from '../errors'

export function normalizeClientId(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function isTokenExpiringSoon(expiresAtMs: number | null | undefined): boolean {
  if (typeof expiresAtMs !== 'number' || !Number.isFinite(expiresAtMs)) return false
  const fiveMinutes = 5 * 60 * 1000
  return expiresAtMs - Date.now() <= fiveMinutes
}

type LinkedInIntegration = {
  accessToken?: string | null
  accessTokenExpiresAtMs?: number | null
  accountId?: string | null
}

export async function getLinkedInIntegration(
  ctx: ActionCtx,
  workspaceId: string,
  clientId: string | null
): Promise<LinkedInIntegration> {
  const { internal } = await import('../_generated/api')
  const integration = await ctx.runQuery(internal.adsIntegrations.getAdIntegrationInternal, {
    workspaceId,
    providerId: 'linkedin',
    clientId,
  })

  if (!integration.accessToken) {
    throw Errors.integration.missingToken('linkedin')
  }

  return integration
}

export async function requireLinkedInAdAccount(integration: LinkedInIntegration): Promise<string> {
  const accountId = integration.accountId
  if (typeof accountId !== 'string' || accountId.trim().length === 0) {
    throw Errors.integration.notConfigured('LinkedIn', 'LinkedIn account ID not configured')
  }
  return accountId
}

export async function resolveLinkedInAccessToken(
  workspaceId: string,
  integration: LinkedInIntegration,
  clientId: string | null
): Promise<string> {
  if (!integration.accessToken) {
    throw Errors.integration.missingToken('linkedin')
  }

  if (isTokenExpiringSoon(integration.accessTokenExpiresAtMs)) {
    const { refreshLinkedInAccessToken } = await import('@/lib/integration-token-refresh-linkedin')
    return refreshLinkedInAccessToken({ userId: workspaceId, clientId })
  }

  return integration.accessToken
}
