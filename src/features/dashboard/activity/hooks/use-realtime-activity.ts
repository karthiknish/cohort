'use client'

import { useCallback, useEffect, useState } from 'react'
import { useQuery, useMutation } from 'convex/react'

import { useAuth } from '@/shared/contexts/auth-context'
import { useClientContext } from '@/shared/contexts/client-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { api } from '@/lib/convex-api'
import { notificationsApi } from '@/lib/convex-api'

import { getPreviewActivity } from '@/lib/preview-data'
import type { Activity } from '@/types/activity'

export function useRealtimeActivity(limitCount = 20, preferPreviewData = false) {
  const { user } = useAuth()
  const { selectedClient } = useClientContext()
  const { isPreviewMode } = usePreview()

  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [currentLimit, setCurrentLimit] = useState(limitCount)

  const usePreviewData = isPreviewMode || preferPreviewData
  const convexEnabled =
    !usePreviewData && Boolean(user?.agencyId) && Boolean(selectedClient?.id)

  const convexActivities = useQuery(
    api.activity.listForClient,
    convexEnabled
      ? {
          workspaceId: String(user!.agencyId),
          clientId: String(selectedClient!.id),
          limit: currentLimit,
        }
      : 'skip'
  ) as Activity[] | undefined

  const ackMutation = useMutation(notificationsApi.ack)

  const refresh = useCallback(async () => {
    setError(null)
  }, [])

  // Handle preview mode
  useEffect(() => {
    if (!usePreviewData) return

    const previewActivities = getPreviewActivity(selectedClient?.id ?? null)
    setActivities(previewActivities.slice(0, currentLimit))
    setLoading(false)
    setError(null)
    setHasMore(previewActivities.length > currentLimit)
  }, [usePreviewData, selectedClient?.id, currentLimit])

  // Convex realtime path
  useEffect(() => {
    if (!convexEnabled) return

    setError(null)
    if (!convexActivities) {
      setLoading(true)
      return
    }

    setActivities(convexActivities)
    setLoading(false)
    setHasMore(convexActivities.length === currentLimit)
  }, [convexActivities, convexEnabled, currentLimit])

  const loadMore = useCallback(() => {
    setCurrentLimit((prev) => prev + limitCount)
  }, [limitCount])

  const retry = useCallback(() => {
    setCurrentLimit(limitCount)
    void refresh()
  }, [refresh, limitCount])

  const markAsRead = useCallback(
    async (ids: string[]) => {
      if (!user?.agencyId || ids.length === 0) return
      try {
        await ackMutation({
          workspaceId: String(user.agencyId),
          ids,
          action: 'read',
        })
      } catch {
        // Silently fail - UI will update on next query refresh
      }
    },
    [ackMutation, user?.agencyId]
  )

  return {
    activities,
    loading,
    error,
    retry,
    loadMore,
    hasMore,
    isRealTime: convexEnabled,
    markAsRead,
  }
}
