import { useMemo } from 'react'
import { useQuery } from 'convex/react'

import { useAuth } from '@/contexts/auth-context'
import { usePreview } from '@/contexts/preview-context'
import { getPreviewAdsIntegrationStatuses } from '@/lib/preview-data'
import { adsIntegrationsApi } from '@/lib/convex-api'

export type IntegrationStatusSummary = {
  totalTargets: number
  totalIntegrations: number
  failedCount: number
  pendingCount: number
  neverCount: number
  lastErrorProviders: Array<{ clientId: string; providerId: string; message: string | null }>
}

const EMPTY: IntegrationStatusSummary = {
  totalTargets: 0,
  totalIntegrations: 0,
  failedCount: 0,
  pendingCount: 0,
  neverCount: 0,
  lastErrorProviders: [],
}

export function useIntegrationStatusSummary(options: { clientIds: string[] }) {
  const { clientIds } = options
  const { user } = useAuth()
  const { isPreviewMode } = usePreview()

  const workspaceId = user?.agencyId ? String(user.agencyId) : null

  const stableClientIds = useMemo(() => {
    const uniq = Array.from(new Set(clientIds.filter(Boolean)))
    uniq.sort()
    return uniq
  }, [JSON.stringify(clientIds)]) // Use stringified version to catch content changes vs reference changes

  const previewSummary = useMemo<{
    summary: IntegrationStatusSummary
    loading: boolean
    error: string | null
  }>(() => {
    if (!isPreviewMode) {
      return { summary: EMPTY, loading: false, error: null }
    }

    const statuses = getPreviewAdsIntegrationStatuses()
    const failed = statuses.filter((s) => s.status === 'error').length
    const pending = statuses.filter((s) => s.status === 'pending').length
    const never = statuses.filter((s) => s.status === 'never').length

    return {
      summary: {
        totalTargets: stableClientIds.length,
        totalIntegrations: statuses.length * stableClientIds.length,
        failedCount: failed * stableClientIds.length,
        pendingCount: pending * stableClientIds.length,
        neverCount: never * stableClientIds.length,
        lastErrorProviders: [],
      },
      loading: false,
      error: null,
    }
  }, [isPreviewMode, stableClientIds.length])

  // We don’t have a multi-client Convex endpoint yet, so this hook summarizes
  // integrations at the workspace scope (clientId = null).
  const statusesByClient = useQuery(
    adsIntegrationsApi.listStatuses,
    isPreviewMode || !workspaceId || !user?.id || stableClientIds.length === 0
      ? 'skip'
      : {
          workspaceId,
          clientId: null,
        }
  ) as Array<any> | undefined

  const liveSummary = useMemo(() => {
    if (isPreviewMode) return previewSummary

    if (!workspaceId || !user?.id || stableClientIds.length === 0) {
      return { summary: EMPTY, loading: false, error: null }
    }

    if (statusesByClient === undefined) {
      return { summary: EMPTY, loading: true, error: null }
    }

    const statuses = Array.isArray(statusesByClient) ? statusesByClient : []

    const totalTargets = stableClientIds.length
    const totalIntegrations = statuses.length * totalTargets

    const failedCount = statuses.filter((s: any) => s?.lastSyncStatus === 'error').length * totalTargets
    const pendingCount = statuses.filter((s: any) => s?.lastSyncStatus === 'pending').length * totalTargets
    const neverCount = statuses.filter((s: any) => (s?.lastSyncStatus ?? 'never') === 'never').length * totalTargets

    return {
      summary: {
        totalTargets,
        totalIntegrations,
        failedCount,
        pendingCount,
        neverCount,
        lastErrorProviders: [],
      },
      loading: false,
      error: null,
    }
  }, [isPreviewMode, previewSummary, stableClientIds.length, statusesByClient, user?.id, workspaceId])

  return useMemo(() => liveSummary, [liveSummary])
}
