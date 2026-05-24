'use node'

import { internal } from '/_generated/api'
import type { ActionCtx } from '../../../_generated/server'
import type { GoogleAnalyticsPropertyOption } from '@/services/integrations/google-analytics/properties'

import {
  action,
  Errors,
  normalizeClientId,
  normalizeGoogleAnalyticsPropertyId,
  nowMs,
  v,
  withErrorHandling,
} from './shared'

type InitializeGoogleAnalyticsPropertyResult = {
  accountId: string
  accountName: string
  properties: GoogleAnalyticsPropertyOption[]
}

async function runInitializeGoogleAnalyticsProperty(
  ctx: ActionCtx,
  args: {
    workspaceId: string
    clientId?: string | null
    accountId?: string | null
  },
): Promise<InitializeGoogleAnalyticsPropertyResult> {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) throw Errors.auth.unauthorized()
  const clientId = normalizeClientId(args.clientId ?? null)
  const [integration, { fetchGoogleAnalyticsProperties, fetchGoogleAnalyticsPropertyCurrency }] =
    await Promise.all([
      ctx.runQuery(internal.analyticsIntegrations.getGoogleAnalyticsIntegrationInternal, {
        workspaceId: args.workspaceId,
        clientId,
      }),
      import('@/services/integrations/google-analytics/properties'),
    ])
  if (!integration?.accessToken) throw Errors.integration.missingToken('Google Analytics')

  const selectedPropertyId = normalizeGoogleAnalyticsPropertyId(args.accountId ?? null)
  if (!selectedPropertyId) {
    throw Errors.validation.invalidInput('Please select a Google Analytics property to finish setup')
  }

  const [properties, currencyCode] = await Promise.all([
    fetchGoogleAnalyticsProperties({ accessToken: integration.accessToken }),
    fetchGoogleAnalyticsPropertyCurrency({
      accessToken: integration.accessToken,
      propertyId: selectedPropertyId,
    }),
  ])

  if (!properties.length) {
    throw Errors.integration.notConfigured('Google Analytics', 'No Google Analytics properties available')
  }

  const selectedProperty =
    properties.find((property: GoogleAnalyticsPropertyOption) =>
      normalizeGoogleAnalyticsPropertyId(property.id) === selectedPropertyId,
    ) ?? null
  if (!selectedProperty) {
    throw Errors.validation.invalidInput('Selected Google Analytics property is not available for this integration token')
  }

  await Promise.all([
    ctx.runMutation(internal.analyticsIntegrations.updateGoogleAnalyticsCredentialsInternal, {
      workspaceId: args.workspaceId,
      clientId,
      accountId: selectedProperty.id,
      accountName: selectedProperty.name,
      currency: currencyCode,
      linkedAtMs: integration.linkedAtMs ?? nowMs(),
    }),
    ctx.runMutation(internal.adsIntegrations.enqueueSyncJob, {
      workspaceId: args.workspaceId,
      providerId: 'google-analytics',
      clientId,
      jobType: 'initial-backfill',
      timeframeDays: 90,
    }),
  ])

  await Promise.all([
    ctx.runMutation(internal.analyticsIntegrations.updateGoogleAnalyticsStatusInternal, {
      workspaceId: args.workspaceId,
      clientId,
      status: 'pending',
      message: null,
    }),
    ctx.runAction(internal.adSyncWorkerActions.processNextQueuedSyncJobInternal, {
      workspaceId: args.workspaceId,
    }),
  ])

  return {
    accountId: selectedProperty.id,
    accountName: selectedProperty.name,
    properties,
  }
}

export const initializeGoogleAnalyticsProperty = action({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    accountId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) =>
    withErrorHandling(
      () => runInitializeGoogleAnalyticsProperty(ctx, args),
      'analyticsIntegrations:initializeGoogleAnalyticsProperty',
      { maxRetries: 3 },
    ),
})
