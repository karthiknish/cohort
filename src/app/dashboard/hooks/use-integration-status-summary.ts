import { useEffect, useMemo, useState } from 'react'

import { useAuth } from '@/contexts/auth-context'
import { usePreview } from '@/contexts/preview-context'
import { getPreviewAdsIntegrationStatuses } from '@/lib/preview-data'
import { fetchIntegrationStatuses } from '@/app/dashboard/ads/components/utils'

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
  const { user, getIdToken } = useAuth()
  const { isPreviewMode } = usePreview()

  const [summary, setSummary] = useState<IntegrationStatusSummary>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stableClientIds = useMemo(() => {
    const uniq = Array.from(new Set(clientIds.filter(Boolean)))
    uniq.sort()
    return uniq
  }, [clientIds])

  useEffect(() => {
    let cancelled = false

    if (!user?.id) {
      setSummary(EMPTY)
      setLoading(false)
      setError(null)
      return () => {
        cancelled = true
      }
    }

    if (stableClientIds.length === 0) {
      setSummary(EMPTY)
      setLoading(false)
      setError(null)
      return () => {
        cancelled = true
      }
    }

    const run = async () => {
      setLoading(true)
      setError(null)

      try {
        if (isPreviewMode) {
          const statuses = getPreviewAdsIntegrationStatuses()
          const failed = statuses.filter((s) => s.status === 'error').length
          const pending = statuses.filter((s) => s.status === 'pending').length
          const never = statuses.filter((s) => s.status === 'never').length

          if (!cancelled) {
            setSummary({
              totalTargets: stableClientIds.length,
              totalIntegrations: statuses.length * stableClientIds.length,
              failedCount: failed * stableClientIds.length,
              pendingCount: pending * stableClientIds.length,
              neverCount: never * stableClientIds.length,
              lastErrorProviders: [],
            })
          }
          return
        }

        const token = await getIdToken()

        const results = await Promise.all(
          stableClientIds.map(async (clientId) => {
            const resp = await fetchIntegrationStatuses(token, user.id, clientId)
            return { clientId, statuses: resp.statuses }
          })
        )

        let totalIntegrations = 0
        let failedCount = 0
        let pendingCount = 0
        let neverCount = 0
        const lastErrorProviders: IntegrationStatusSummary['lastErrorProviders'] = []

        for (const entry of results) {
          totalIntegrations += entry.statuses.length
          for (const status of entry.statuses) {
            if (status.status === 'error') {
              failedCount += 1
              lastErrorProviders.push({ clientId: entry.clientId, providerId: status.providerId, message: status.message ?? null })
            } else if (status.status === 'pending') {
              pendingCount += 1
            } else if (status.status === 'never') {
              neverCount += 1
            }
          }
        }

        if (!cancelled) {
          setSummary({
            totalTargets: stableClientIds.length,
            totalIntegrations,
            failedCount,
            pendingCount,
            neverCount,
            lastErrorProviders: lastErrorProviders.slice(0, 5),
          })
        }
      } catch (e) {
        if (!cancelled) {
          setSummary(EMPTY)
          setError(e instanceof Error ? e.message : 'Unable to load integration status')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [getIdToken, isPreviewMode, stableClientIds, user?.id])

  return { summary, loading, error }
}
