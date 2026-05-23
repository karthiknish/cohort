import { api } from '/_generated/api'
import {
  asNonEmptyString,
  asNumber,
  asRecord,
  asString,
  normalizeReportPeriod,
  resolveReportWindow,
  unwrapConvexResult,
} from '../../helpers'
import type { OperationHandler } from '../../types'
import {
  formatSocialCount,
  formatSurfaceHeadline,
  toSocialOverviewSnapshot,
  type SocialSurface,
  type SocialTopContent,
} from './socialSummary'

const SOCIAL_SURFACES: SocialSurface[] = ['facebook', 'instagram']

function inferSocialSurface(message: string, params: Record<string, unknown>): SocialSurface | 'all' {
  const paramSurface = asNonEmptyString(params.surface)?.toLowerCase()
  if (paramSurface === 'facebook' || paramSurface === 'instagram') {
    return paramSurface
  }

  const normalized = message.toLowerCase()
  if (normalized.includes('instagram') || /\big\b/.test(normalized)) return 'instagram'
  if (normalized.includes('facebook') || /\bfb\b/.test(normalized)) return 'facebook'
  return 'all'
}

function resolveTimeframeDays(params: Record<string, unknown>, startDate: string, endDate: string): number {
  const explicit = asNumber(params.timeframeDays)
  if (explicit !== null && explicit > 0) {
    return Math.min(Math.max(Math.round(explicit), 1), 365)
  }

  const startMs = Date.parse(`${startDate}T00:00:00.000Z`)
  const endMs = Date.parse(`${endDate}T00:00:00.000Z`)
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return 30

  const spanDays = Math.max(Math.round((endMs - startMs) / 86_400_000) + 1, 1)
  return Math.min(spanDays, 365)
}

function formatSyncStatus(status: string | null): string {
  switch (status) {
    case 'pending':
      return 'Sync in progress'
    case 'success':
      return 'Last sync succeeded'
    case 'error':
      return 'Last sync failed'
    case 'never':
      return 'Never synced'
    default:
      return 'Not synced yet'
  }
}

export const socialOperationHandlers: Record<string, OperationHandler> = {
  async summarizeSocialPerformance(ctx, input) {
    const period = normalizeReportPeriod(input.params.period)
    const { periodLabel, startDate, endDate } = resolveReportWindow(period, input.params)
    const clientId = asNonEmptyString(input.params.clientId) ?? asNonEmptyString(input.context?.activeClientId ?? null)
    const surfaceFilter = inferSocialSurface(input.rawMessage ?? '', input.params)
    const surfaces = surfaceFilter === 'all' ? SOCIAL_SURFACES : [surfaceFilter]

    const statusRaw = await ctx.runQuery(api.socialIntegrations.getStatus, {
      workspaceId: input.workspaceId,
      clientId: clientId ?? null,
    })
    const status = asRecord(statusRaw) ?? {}

    const connected = status.connected === true
    const setupComplete = status.setupComplete === true
    const connection = {
      connected,
      setupComplete,
      facebookPageName: asString(status.facebookPageName),
      instagramBusinessName: asString(status.instagramBusinessName),
      lastSyncStatus: asString(status.lastSyncStatus),
      lastSyncedAtMs: asNumber(status.lastSyncedAtMs),
    }

    if (!connected) {
      return {
        success: true,
        route: '/dashboard/socials',
        data: {
          dataKind: 'social',
          periodLabel,
          startDate,
          endDate,
          connection,
          metricsAvailable: false,
        },
        userMessage:
          'Organic social is not connected yet. Open Socials to connect Meta and select a Facebook Page (Instagram links automatically when available).',
      }
    }

    if (!setupComplete) {
      return {
        success: true,
        route: '/dashboard/socials',
        data: {
          dataKind: 'social',
          periodLabel,
          startDate,
          endDate,
          connection,
          metricsAvailable: false,
        },
        userMessage:
          'Meta is connected, but no Facebook Page is selected yet. Open Socials to choose a Page before syncing organic metrics.',
      }
    }

    const overviews: Record<string, ReturnType<typeof toSocialOverviewSnapshot>> = {}
    const topContent: Record<string, SocialTopContent[]> = {}

    for (const surface of surfaces) {
      const overviewRaw = await ctx.runQuery(api.socialMetrics.listOverview, {
        workspaceId: input.workspaceId,
        clientId: clientId ?? null,
        surface,
        startDate,
        endDate,
      })
      overviews[surface] = toSocialOverviewSnapshot(surface, asRecord(overviewRaw))

      const contentRaw = await ctx.runQuery(api.socialMetrics.listContent, {
        workspaceId: input.workspaceId,
        clientId: clientId ?? null,
        surface,
        limit: 3,
      })

      topContent[surface] = Array.isArray(contentRaw)
        ? contentRaw.flatMap((item) => {
            const record = asRecord(item)
            if (!record) return []
            const contentId = asNonEmptyString(record.contentId)
            if (!contentId) return []
            return [{
              contentId,
              message: asString(record.message),
              impressions: asNumber(record.impressions) ?? 0,
              reach: asNumber(record.reach) ?? 0,
              engagedUsers: asNumber(record.engagedUsers) ?? 0,
              publishedAt: asString(record.publishedAt),
            }]
          })
        : []
    }

    const facebook = overviews.facebook ?? null
    const instagram = overviews.instagram ?? null
    const hasMetrics =
      (facebook?.rowCount ?? 0) > 0 ||
      (instagram?.rowCount ?? 0) > 0 ||
      (topContent.facebook?.length ?? 0) > 0 ||
      (topContent.instagram?.length ?? 0) > 0

    const headlineParts = surfaces.flatMap((surface) => {
      const overview = overviews[surface]
      return overview ? [formatSurfaceHeadline(surface, overview)] : []
    })

    const syncHint = formatSyncStatus(connection.lastSyncStatus)
    const userMessage = hasMetrics
      ? `${periodLabel} organic social (${startDate} to ${endDate}): ${headlineParts.join(' ')}`
      : `Organic social is configured (${connection.facebookPageName ?? 'Facebook Page'}), but no metrics are synced for ${startDate} to ${endDate}. ${syncHint} — ask me to sync social metrics or widen the date range.`

    return {
      success: true,
      route: '/dashboard/socials',
      data: {
        dataKind: 'social',
        periodLabel,
        startDate,
        endDate,
        connection,
        facebook,
        instagram,
        topContent,
        metricsAvailable: hasMetrics,
      },
      userMessage,
    }
  },

  async requestSocialSync(ctx, input) {
    const clientId = asNonEmptyString(input.params.clientId) ?? asNonEmptyString(input.context?.activeClientId ?? null)
    const period = normalizeReportPeriod(input.params.period)
    const { startDate, endDate } = resolveReportWindow(period, input.params)
    const timeframeDays = resolveTimeframeDays(input.params, startDate, endDate)
    const surfaceParam = asNonEmptyString(input.params.surface)?.toLowerCase()
    const surface =
      surfaceParam === 'facebook' || surfaceParam === 'instagram' ? surfaceParam : null

    const statusRaw = await ctx.runQuery(api.socialIntegrations.getStatus, {
      workspaceId: input.workspaceId,
      clientId: clientId ?? null,
    })
    const status = asRecord(statusRaw) ?? {}

    if (status.connected !== true) {
      return {
        success: false,
        retryable: false,
        route: '/dashboard/socials',
        data: { connected: false },
        userMessage: 'Connect Meta on the Socials page before requesting a sync.',
      }
    }

    if (status.setupComplete !== true) {
      return {
        success: false,
        retryable: false,
        route: '/dashboard/socials',
        data: { connection: { setupComplete: false } },
        userMessage: 'Select a Facebook Page on Socials before syncing organic metrics.',
      }
    }

    const result = await ctx.runMutation(api.socialIntegrations.requestManualSync, {
      workspaceId: input.workspaceId,
      clientId: clientId ?? null,
      surface,
      timeframeDays,
    })

    const jobId = asNonEmptyString(asRecord(unwrapConvexResult(result))?.jobId) ?? asString(result)

    const surfaceLabel = surface === 'facebook' ? 'Facebook' : surface === 'instagram' ? 'Instagram' : 'Facebook and Instagram'

    return {
      success: true,
      route: '/dashboard/socials',
      data: {
        jobId,
        timeframeDays,
        surface: surface ?? 'all',
      },
      userMessage: `Queued an organic social sync for ${surfaceLabel} (last ${timeframeDays} days). Metrics will refresh on Socials shortly.`,
    }
  },
}
