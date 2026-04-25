import { action, internalMutation, mutation, query, internalQuery } from '../_generated/server'
import type { Id } from '/_generated/dataModel'
import { v } from 'convex/values'
import { z } from 'zod/v4'
import { Errors, withErrorHandling } from '../errors'
import {
  authenticatedMutation,
  authenticatedQuery,
  requireWorkspaceAccess,
  workspaceMutation,
  zWorkspaceQuery,
  zWorkspaceMutation,
  zWorkspaceQueryActive,
} from '../functions'

export function nowMs() {
  return Date.now()
}

export function normalizeClientId(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function assertCronKey(_ctx: { auth: { getUserIdentity: () => Promise<unknown> } }, args: { cronKey?: string | null }) {
  // Allows background workers (httpActions/schedulers) to call specific mutations
  // without requiring a user identity, guarded by a shared secret.
  const secret = process.env.INTEGRATIONS_CRON_SECRET
  if (!secret) {
    throw Errors.base.internal('INTEGRATIONS_CRON_SECRET is not configured')
  }

  if (args.cronKey !== secret) {
    throw Errors.auth.unauthorized()
  }
}

export function hasOwn(obj: object, key: string) {
  return Object.hasOwn(obj, key)
}

export function normalizeMetaAccountId(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (trimmed.length === 0) return null
  return trimmed.startsWith('act_') ? trimmed : `act_${trimmed}`
}

export function normalizeGoogleAdsAccountId(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function normalizeGoogleAnalyticsPropertyId(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (trimmed.length === 0) return null
  if (trimmed.startsWith('properties/')) {
    const extracted = trimmed.split('/')[1]
    return typeof extracted === 'string' && extracted.length > 0 ? extracted : null
  }
  return trimmed
}

export function resolveGoogleAdsDeveloperToken(integrationDeveloperToken: string | null | undefined): string {
  const fromIntegration = typeof integrationDeveloperToken === 'string' ? integrationDeveloperToken.trim() : ''
  if (fromIntegration.length > 0) {
    return fromIntegration
  }

  const fromEnv = typeof process.env.GOOGLE_ADS_DEVELOPER_TOKEN === 'string'
    ? process.env.GOOGLE_ADS_DEVELOPER_TOKEN.trim()
    : ''

  if (fromEnv.length > 0) {
    return fromEnv
  }

  throw Errors.integration.notConfigured(
    'Google Ads',
    'Google Ads developer token is missing. Set GOOGLE_ADS_DEVELOPER_TOKEN before completing setup.'
  )
}

export const adIntegrationZ = z.object({
  providerId: z.string(),
  clientId: z.string().nullable(),
  accessToken: z.string().nullable(),
  idToken: z.string().nullable(),
  refreshToken: z.string().nullable(),
  scopes: z.array(z.string()),
  accountId: z.string().nullable(),
  accountName: z.string().nullable(),
  currency: z.string().nullable(),
  developerToken: z.string().nullable(),
  loginCustomerId: z.string().nullable(),
  managerCustomerId: z.string().nullable(),
  accessTokenExpiresAtMs: z.number().nullable(),
  refreshTokenExpiresAtMs: z.number().nullable(),
  lastSyncStatus: z.union([
    z.literal('never'),
    z.literal('pending'),
    z.literal('success'),
    z.literal('error'),
  ]),
  lastSyncMessage: z.string().nullable(),
  lastSyncedAtMs: z.number().nullable(),
  lastSyncRequestedAtMs: z.number().nullable(),
  linkedAtMs: z.number().nullable(),
  autoSyncEnabled: z.boolean().nullable(),
  syncFrequencyMinutes: z.number().nullable(),
  scheduledTimeframeDays: z.number().nullable(),
})

export type ClaimedSyncJob = {
  id: Id<'adSyncJobs'>
  providerId: string
  clientId: string | null
  jobType: 'initial-backfill' | 'scheduled-sync' | 'manual-sync'
  timeframeDays: number
  status: 'running'
  createdAtMs: number
  startedAtMs: number
  processedAtMs: null
  errorMessage: null
}



export {
  action,
  internalMutation,
  mutation,
  query,
  internalQuery,
  v,
  z,
  Errors,
  withErrorHandling,
  authenticatedMutation,
  authenticatedQuery,
  requireWorkspaceAccess,
  workspaceMutation,
  zWorkspaceQuery,
  zWorkspaceMutation,
  zWorkspaceQueryActive,
}
