'use node'

import { internalAction } from './_generated/server'
import { internal } from '/_generated/api'
import { v } from 'convex/values'

import { Errors, withErrorHandling } from './errors'

/** Avoid TS2589 when the generated `internal` union grows large. */
function internalRef<T>(ref: T): T {
  return ref as never
}

/** Submodule paths on generated API; `any` avoids TS2589 + strict indexed access. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const socialInternal = internal as any

function normalizeClientId(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function normalizeRawPayload(value: unknown): string | number | boolean | null | undefined {
  if (value === null || value === undefined) return null
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value
  }
  return undefined
}

export const processClaimedJob = internalAction({
  args: {
    workspaceId: v.string(),
    jobId: v.id('socialSyncJobs'),
    clientId: v.union(v.string(), v.null()),
    surface: v.union(v.string(), v.null()),
    timeframeDays: v.number(),
  },
  handler: async (ctx, args): Promise<{ metricsInserted: number }> =>
    withErrorHandling(async () => {
      const clientId = normalizeClientId(args.clientId)

      const integration = await ctx.runQuery(
        internalRef(socialInternal['socialIntegrations/queries'].getSocialIntegrationInternal),
        {
          workspaceId: args.workspaceId,
          clientId,
        },
      )

      if (!integration?.accessToken || !integration.facebookPageId) {
        throw Errors.integration.notConfigured('Meta Social', 'Facebook Page not configured')
      }

      const { fetchFacebookPageDailyInsights, fetchInstagramUserDailyInsights } = await import(
        '@/services/integrations/meta-social'
      )

      const metrics = []
      const syncFacebook = !args.surface || args.surface === 'facebook'
      const syncInstagram = !args.surface || args.surface === 'instagram'

      if (syncFacebook) {
        const fbRows = await fetchFacebookPageDailyInsights({
          accessToken: integration.accessToken,
          pageId: integration.facebookPageId,
          pageName: integration.facebookPageName,
          timeframeDays: args.timeframeDays,
        })
        metrics.push(...fbRows)
      }

      if (syncInstagram && integration.instagramBusinessId) {
        const igRows = await fetchInstagramUserDailyInsights({
          accessToken: integration.accessToken,
          instagramBusinessId: integration.instagramBusinessId,
          instagramBusinessName: integration.instagramBusinessName,
          timeframeDays: args.timeframeDays,
        })
        metrics.push(...igRows)
      }

      const metricsPayload = metrics.map((metric) => ({
        surface: metric.surface,
        entityId: metric.entityId,
        entityName: metric.entityName,
        date: metric.date,
        impressions: metric.impressions,
        reach: metric.reach,
        engagedUsers: metric.engagedUsers,
        reactions: metric.reactions,
        comments: metric.comments,
        shares: metric.shares,
        saves: metric.saves,
        followerCount: metric.followerCount,
        followerDelta: metric.followerDelta,
        engagementRate: metric.engagementRate ?? null,
        rawPayload: normalizeRawPayload(metric.rawPayload),
      }))

      const result: { inserted: number; updated: number } = await ctx.runMutation(
        internalRef(socialInternal['socialIntegrations/metricsUpsert'].writeMetricsBatchInternal),
        {
          workspaceId: args.workspaceId,
          clientId,
          metrics: metricsPayload,
        },
      )

      return { metricsInserted: result.inserted + result.updated }
    }, 'socialSyncWorkerActions:processClaimedJob'),
})

export const processAllQueuedJobs = internalAction({
  handler: async (ctx): Promise<{ processed: number; failed: number }> => {
    const workspaceIds = await ctx.runQuery(
      internalRef(socialInternal['socialIntegrations/syncJobs'].listWorkspacesWithQueuedJobsInternal),
      {},
    )

    let processed = 0
    let failed = 0

    const processWorkspaceJobs = async (workspaceId: string) => {
      const processNextJob = async (): Promise<void> => {
        const job = await ctx.runMutation(
          internalRef(socialInternal['socialIntegrations/syncJobs'].claimNextSyncJobInternal),
          { workspaceId },
        )
        if (!job) return

        try {
          await ctx.runAction(internalRef(internal.socialSyncWorkerActions.processClaimedJob), {
            workspaceId,
            jobId: job.id,
            clientId: job.clientId,
            surface: job.surface,
            timeframeDays: job.timeframeDays,
          })

          await Promise.all([
            ctx.runMutation(internalRef(socialInternal['socialIntegrations/syncJobs'].completeSyncJobInternal), {
              jobId: job.id,
            }),
            ctx.runMutation(
              internalRef(socialInternal['socialIntegrations/settings'].updateIntegrationStatusInternal),
              {
                workspaceId,
                clientId: job.clientId,
                status: 'success',
                message: null,
              },
            ),
          ])

          processed++
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Unknown error'

          await Promise.all([
            ctx.runMutation(internalRef(socialInternal['socialIntegrations/syncJobs'].failSyncJobInternal), {
              jobId: job.id,
              message,
            }),
            ctx.runMutation(
              internalRef(socialInternal['socialIntegrations/settings'].updateIntegrationStatusInternal),
              {
                workspaceId,
                clientId: job.clientId,
                status: 'error',
                message,
              },
            ),
          ])

          failed++
        }

        await processNextJob()
      }

      await processNextJob()
    }

    const workspaceIdList = workspaceIds as string[]
    let workspaceChain: Promise<void> = Promise.resolve()
    for (const workspaceId of workspaceIdList) {
      workspaceChain = workspaceChain.then(() => processWorkspaceJobs(workspaceId))
    }
    await workspaceChain

    return { processed, failed }
  },
})
