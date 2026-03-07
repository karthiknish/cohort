import type { ConvexHttpClient } from 'convex/browser'
import type { FunctionReference } from 'convex/server'

import { createConvexAdminClient } from '@/lib/convex-admin'
import { logger } from '@/lib/logger'
import type { AuthResult } from '@/lib/server-auth'
import type { AdIntegration } from '@/types/integrations'
import { resolveWorkspaceIdForUser } from '@/lib/workspace'

type TimestampInput = Date | string | number | unknown | null | undefined

function toMillis(value: TimestampInput): number | null {
  if (value == null) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.getTime()
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string') {
    const parsed = Date.parse(value)
    return Number.isNaN(parsed) ? null : parsed
  }
  if (typeof (value as { toMillis?: () => number }).toMillis === 'function') return (value as { toMillis: () => number }).toMillis()
  if (typeof (value as { toDate?: () => Date }).toDate === 'function') return toMillis((value as { toDate: () => Date }).toDate())
  return null
}

function getConvexClientForUser(userId: string): ConvexHttpClient | null {
  const auth: AuthResult = { uid: userId, email: null, name: null, claims: { provider: 'convex' }, isCron: false }
  return createConvexAdminClient({ auth })
}

function normalizeClientId(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null
}

async function executeMutation(convex: ConvexHttpClient, name: string, args: Record<string, unknown>) {
  return await convex.mutation(name as unknown as FunctionReference<'mutation'>, args)
}

async function executeQuery(convex: ConvexHttpClient, name: string, args: Record<string, unknown>) {
  return await convex.query(name as unknown as FunctionReference<'query'>, args)
}

export async function persistGoogleAnalyticsTokens(options: {
  userId: string
  clientId?: string | null
  accessToken: string | null
  refreshToken?: string | null
  idToken?: string | null
  scopes?: string[]
  status?: 'pending' | 'success' | 'error' | 'never'
  accessTokenExpiresAt?: TimestampInput
  refreshTokenExpiresAt?: TimestampInput
  accountId?: string | null
  accountName?: string | null
}): Promise<void> {
  const workspaceId = await resolveWorkspaceIdForUser(options.userId)
  const convex = getConvexClientForUser(options.userId)
  if (!convex) throw new Error('Convex admin client is not configured')
  await executeMutation(convex, 'analyticsIntegrations:persistGoogleAnalyticsTokens', {
    workspaceId,
    clientId: normalizeClientId(options.clientId),
    accessToken: options.accessToken,
    refreshToken: options.refreshToken,
    idToken: options.idToken,
    scopes: options.scopes,
    status: options.status,
    accessTokenExpiresAtMs: toMillis(options.accessTokenExpiresAt),
    refreshTokenExpiresAtMs: toMillis(options.refreshTokenExpiresAt),
    accountId: options.accountId,
    accountName: options.accountName,
  })
}

export async function updateGoogleAnalyticsCredentials(options: {
  userId: string
  clientId?: string | null
  accessToken?: string | null
  refreshToken?: string | null
  idToken?: string | null
  accessTokenExpiresAt?: TimestampInput
  refreshTokenExpiresAt?: TimestampInput
  accountId?: string | null
  accountName?: string | null
}): Promise<void> {
  const workspaceId = await resolveWorkspaceIdForUser(options.userId)
  const convex = getConvexClientForUser(options.userId)
  if (!convex) throw new Error('Convex admin client is not configured')
  await executeMutation(convex, 'analyticsIntegrations:updateGoogleAnalyticsCredentialsInternal', {
    workspaceId,
    clientId: normalizeClientId(options.clientId),
    accessToken: options.accessToken,
    refreshToken: options.refreshToken,
    idToken: options.idToken,
    accessTokenExpiresAtMs: options.accessTokenExpiresAt === undefined ? undefined : toMillis(options.accessTokenExpiresAt),
    refreshTokenExpiresAtMs: options.refreshTokenExpiresAt === undefined ? undefined : toMillis(options.refreshTokenExpiresAt),
    accountId: options.accountId,
    accountName: options.accountName,
  })
}

export async function getGoogleAnalyticsIntegration(options: { userId: string; clientId?: string | null }): Promise<AdIntegration | null> {
  const workspaceId = await resolveWorkspaceIdForUser(options.userId)
  const convex = getConvexClientForUser(options.userId)
  if (!convex) return null
  try {
    return (await executeQuery(convex, 'analyticsIntegrations:getGoogleAnalyticsIntegration', {
      workspaceId,
      clientId: normalizeClientId(options.clientId),
    })) as AdIntegration | null
  } catch (error) {
    logger.error('Convex Query Error: analyticsIntegrations:getGoogleAnalyticsIntegration', error, { userId: options.userId })
    throw error
  }
}

export async function updateGoogleAnalyticsStatus(options: {
  userId: string
  clientId?: string | null
  status: 'pending' | 'success' | 'error'
  message?: string | null
}): Promise<void> {
  const workspaceId = await resolveWorkspaceIdForUser(options.userId)
  const convex = getConvexClientForUser(options.userId)
  if (!convex) throw new Error('Convex admin client is not configured')
  await executeMutation(convex, 'analyticsIntegrations:updateGoogleAnalyticsStatus', {
    workspaceId,
    clientId: normalizeClientId(options.clientId),
    status: options.status,
    message: options.message ?? null,
  })
}

export async function hasPendingGoogleAnalyticsSyncJob(options: { userId: string; clientId?: string | null }): Promise<boolean> {
  const workspaceId = await resolveWorkspaceIdForUser(options.userId)
  const convex = getConvexClientForUser(options.userId)
  if (!convex) return false
  return (await executeQuery(convex, 'analyticsIntegrations:hasPendingGoogleAnalyticsSyncJob', {
    workspaceId,
    clientId: normalizeClientId(options.clientId),
  })) as boolean
}

export async function markGoogleAnalyticsSyncRequested(options: {
  userId: string
  clientId?: string | null
  status?: 'pending' | 'never' | 'error' | 'success'
}): Promise<void> {
  const workspaceId = await resolveWorkspaceIdForUser(options.userId)
  const convex = getConvexClientForUser(options.userId)
  if (!convex) throw new Error('Convex admin client is not configured')
  await executeMutation(convex, 'analyticsIntegrations:markGoogleAnalyticsSyncRequested', {
    workspaceId,
    clientId: normalizeClientId(options.clientId),
    status: options.status ?? 'pending',
  })
}

export async function deleteGoogleAnalyticsIntegration(options: { userId: string; clientId?: string | null }): Promise<void> {
  const workspaceId = await resolveWorkspaceIdForUser(options.userId)
  const convex = getConvexClientForUser(options.userId)
  if (!convex) throw new Error('Convex admin client is not configured')
  await executeMutation(convex, 'analyticsIntegrations:deleteGoogleAnalyticsIntegration', {
    workspaceId,
    clientId: normalizeClientId(options.clientId),
  })
}