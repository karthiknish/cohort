'use node'

import { action } from './_generated/server'
import { v } from 'convex/values'
import { Errors, withErrorHandling } from './errors'
import {
  getFacebookIntegration,
  normalizeClientId,
  resolveFacebookAccessToken,
} from './lib/facebookAdsAccess'
import type { MetaCapiActionSource } from '@/lib/meta-capi-events'
import type { MetaCapiHashedUserData } from '@/lib/meta-capi-user-data'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) {
    throw Errors.auth.unauthorized()
  }
}

const capiEventArgs = v.object({
  eventName: v.string(),
  eventTime: v.optional(v.number()),
  eventId: v.optional(v.string()),
  actionSource: v.optional(v.string()),
  eventSourceUrl: v.optional(v.string()),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  value: v.optional(v.number()),
  currency: v.optional(v.string()),
  orderId: v.optional(v.string()),
})

async function mapCapiEvent(
  row: {
    eventName: string
    eventTime?: number
    eventId?: string
    actionSource?: string
    eventSourceUrl?: string
    email?: string
    phone?: string
    value?: number
    currency?: string
    orderId?: string
  },
  defaultActionSource: MetaCapiActionSource,
) {
  const { buildMetaCapiHashedUserData } = await import('@/lib/meta-capi-user-data')

  let hashedUserData: MetaCapiHashedUserData | undefined
  if (row.email?.trim() || row.phone?.trim()) {
    hashedUserData = buildMetaCapiHashedUserData({
      email: row.email,
      phone: row.phone,
    })
  }

  return {
    eventName: row.eventName.trim(),
    eventTime: row.eventTime,
    eventId: row.eventId,
    actionSource: (row.actionSource?.trim() || defaultActionSource) as MetaCapiActionSource,
    eventSourceUrl: row.eventSourceUrl,
    hashedUserData,
    customData: {
      value: row.value,
      currency: row.currency,
      orderId: row.orderId,
    },
  }
}

export const sendCapiEvents = action({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    pixelId: v.string(),
    events: v.array(capiEventArgs),
    testEventCode: v.optional(v.string()),
  },
  handler: async (ctx, args) =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      if (args.events.length === 0) {
        throw Errors.base.badRequest('Add at least one event to send.')
      }

      const clientId = normalizeClientId(args.clientId ?? null)
      const integration = await getFacebookIntegration(ctx, args.workspaceId, clientId)
      const [accessToken, { sendMetaCapiEvents }] = await Promise.all([
        resolveFacebookAccessToken(args.workspaceId, integration, clientId),
        import('@/services/integrations/meta-ads/capi'),
      ])

      const events = await Promise.all(
        args.events.map((row) => mapCapiEvent(row, 'website')),
      )

      const result = await sendMetaCapiEvents({
        accessToken,
        pixelId: args.pixelId.trim(),
        events,
        testEventCode: args.testEventCode,
      })

      if (!result.success) {
        throw Errors.integration.error('facebook', result.error ?? 'Failed to send CAPI events')
      }

      return {
        success: true,
        eventsReceived: result.eventsReceived,
        messages: result.messages ?? [],
        fbtraceId: result.fbtraceId,
      }
    }, 'adsMetaEvents:sendCapiEvents'),
})

export const sendOfflineEvents = action({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    pixelId: v.string(),
    events: v.array(capiEventArgs),
    testEventCode: v.optional(v.string()),
  },
  handler: async (ctx, args) =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      if (args.events.length === 0) {
        throw Errors.base.badRequest('Add at least one offline event to send.')
      }

      const clientId = normalizeClientId(args.clientId ?? null)
      const integration = await getFacebookIntegration(ctx, args.workspaceId, clientId)
      const [accessToken, { sendMetaOfflineEvents }] = await Promise.all([
        resolveFacebookAccessToken(args.workspaceId, integration, clientId),
        import('@/services/integrations/meta-ads/capi'),
      ])

      const events = await Promise.all(
        args.events.map((row) => mapCapiEvent(row, 'physical_store')),
      )

      const result = await sendMetaOfflineEvents({
        accessToken,
        pixelId: args.pixelId.trim(),
        events,
        testEventCode: args.testEventCode,
      })

      if (!result.success) {
        throw Errors.integration.error('facebook', result.error ?? 'Failed to send offline events')
      }

      return {
        success: true,
        eventsReceived: result.eventsReceived,
        messages: result.messages ?? [],
        fbtraceId: result.fbtraceId,
      }
    }, 'adsMetaEvents:sendOfflineEvents'),
})

export const executeBatch = action({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    requests: v.array(
      v.object({
        method: v.union(v.literal('GET'), v.literal('POST'), v.literal('DELETE')),
        relativeUrl: v.string(),
        body: v.optional(v.string()),
        name: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      if (args.requests.length === 0) {
        throw Errors.base.badRequest('Add at least one batch request.')
      }

      const clientId = normalizeClientId(args.clientId ?? null)
      const integration = await getFacebookIntegration(ctx, args.workspaceId, clientId)
      const [accessToken, { executeMetaBatch }] = await Promise.all([
        resolveFacebookAccessToken(args.workspaceId, integration, clientId),
        import('@/services/integrations/meta-ads/batch'),
      ])

      const result = await executeMetaBatch({
        accessToken,
        requests: args.requests,
      })

      if (!result.success && result.responses.length === 0) {
        throw Errors.integration.error('facebook', result.error ?? 'Batch request failed')
      }

      return {
        success: result.success,
        responses: result.responses,
        error: result.error,
      }
    }, 'adsMetaEvents:executeBatch'),
})
