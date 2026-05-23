import { normalizeAdsProviderId } from '@/domain/ads/provider'
import { getPreviewAdsIntegrationStatuses } from '@/lib/preview-data'
import { PROVIDER_ICON_MAP } from '@/features/dashboard/ads/constants'

import type { AdPlatform, IntegrationStatus, IntegrationStatusResponse } from '../components/types'
import { PROVIDER_IDS } from '../components/constants'

import {
  RAW_ADS_PROVIDER_IDS,
  type ConvexIntegrationStatusRow,
  type IntegrationStatusInfo,
} from './ads-connections-types'

export function mapConvexIntegrationStatuses(args: {
  rows: ConvexIntegrationStatusRow[]
  isPreviewMode: boolean
  workspaceId: string | null
  canQueryConvex: boolean
}): IntegrationStatusResponse | null {
  const { rows, isPreviewMode, workspaceId, canQueryConvex } = args

  if (isPreviewMode) {
    return { statuses: getPreviewAdsIntegrationStatuses() }
  }

  if (!workspaceId || !canQueryConvex) {
    return null
  }

  const seenProviders = new Set<string>()
  const statuses = rows.flatMap((row) => {
    const rawProviderId = String(row.providerId).trim().toLowerCase()
    if (!RAW_ADS_PROVIDER_IDS.has(rawProviderId)) {
      return []
    }

    const providerId = normalizeAdsProviderId(String(row.providerId)) ?? rawProviderId
    if (!RAW_ADS_PROVIDER_IDS.has(providerId) || seenProviders.has(providerId)) {
      return []
    }

    seenProviders.add(providerId)
    return [
      {
        providerId,
        status: String(row.lastSyncStatus ?? 'never'),
        message: row.lastSyncMessage ?? null,
        lastSyncedAt:
          typeof row.lastSyncedAtMs === 'number' ? new Date(row.lastSyncedAtMs).toISOString() : null,
        lastSyncRequestedAt:
          typeof row.lastSyncRequestedAtMs === 'number'
            ? new Date(row.lastSyncRequestedAtMs).toISOString()
            : null,
        linkedAt: typeof row.linkedAtMs === 'number' ? new Date(row.linkedAtMs).toISOString() : null,
        accountId: row.accountId ?? null,
        accountName: row.accountName ?? null,
        currency: row.currency ?? null,
        autoSyncEnabled: row.autoSyncEnabled ?? null,
        syncFrequencyMinutes: row.syncFrequencyMinutes ?? null,
        scheduledTimeframeDays: row.scheduledTimeframeDays ?? null,
        metaUseAsyncInsights: row.metaUseAsyncInsights ?? null,
      },
    ]
  })

  return { statuses }
}

export function buildIntegrationStatusMap(
  statuses: IntegrationStatus[],
): Record<string, IntegrationStatusInfo> {
  const map: Record<string, IntegrationStatusInfo> = {}
  for (const status of statuses) {
    map[status.providerId] = {
      lastSyncedAt: status.lastSyncedAt,
      lastSyncRequestedAt: status.lastSyncRequestedAt,
      status: status.status,
      accountId: status.accountId,
      accountName: status.accountName,
      currency: status.currency,
    }
  }
  return map
}

export function deriveConnectedProviders(
  statuses: IntegrationStatus[] | undefined,
): Record<string, boolean> {
  if (!statuses) {
    return {}
  }

  const connected: Record<string, boolean> = {}
  for (const status of statuses) {
    connected[status.providerId] = Boolean(status.linkedAt) || status.status === 'success'
  }
  return connected
}

export function providerNeedsAccountSelection(status: IntegrationStatus | undefined): boolean {
  return Boolean(status?.linkedAt && !status.accountId)
}

export function buildAdPlatforms(): AdPlatform[] {
  return [
    {
      id: PROVIDER_IDS.GOOGLE,
      name: 'Google Ads',
      description:
        'Import campaign performance, budgets, and ROAS insights directly from Google Ads.',
      icon: PROVIDER_ICON_MAP.google!,
      mode: 'oauth',
    },
    {
      id: PROVIDER_IDS.FACEBOOK,
      name: 'Meta Ads Manager',
      description: 'Pull spend, results, and creative breakdowns from Meta and Instagram campaigns.',
      icon: PROVIDER_ICON_MAP.facebook!,
      mode: 'oauth',
    },
    {
      id: PROVIDER_IDS.LINKEDIN,
      name: 'LinkedIn Ads',
      description: 'Sync lead-gen form results and campaign analytics from LinkedIn.',
      icon: PROVIDER_ICON_MAP.linkedin!,
      mode: 'oauth',
    },
    {
      id: PROVIDER_IDS.TIKTOK,
      name: 'TikTok Ads',
      description: 'Bring in spend, engagement, and conversion insights from TikTok campaign flights.',
      icon: PROVIDER_ICON_MAP.tiktok!,
      mode: 'oauth',
    },
  ]
}
