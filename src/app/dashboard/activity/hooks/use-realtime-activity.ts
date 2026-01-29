'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import { useQuery } from 'convex/react'

import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
import { usePreview } from '@/contexts/preview-context'
import { api } from '@/lib/convex-api'

import { getPreviewActivity } from '@/lib/preview-data'
import type { Activity } from '@/types/activity'

export function useRealtimeActivity(limitCount = 20) {
  const { user } = useAuth()
  const { selectedClient } = useClientContext()
  const { isPreviewMode } = usePreview()

  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)

  // Track current limit for pagination
  const currentLimitRef = useRef(limitCount)

  const convexEnabled =
    !isPreviewMode && Boolean(user?.agencyId) && Boolean(selectedClient?.id)

  const convexActivities = useQuery(
    (api as any).activity.listForClient,
    convexEnabled
      ? {
          workspaceId: String(user!.agencyId),
          clientId: String(selectedClient!.id),
          limit: currentLimitRef.current,
        }
      : 'skip'
  ) as Activity[] | undefined

  const refresh = useCallback(async () => {
    // Convex query is the source of truth; "refresh" just clears error.
    setError(null)
  }, [])

  // Handle preview mode
  useEffect(() => {
    if (!isPreviewMode) return

    const previewActivities = getPreviewActivity(selectedClient?.id ?? null)
    setActivities(previewActivities.slice(0, currentLimitRef.current))
    setLoading(false)
    setError(null)
    setHasMore(previewActivities.length > currentLimitRef.current)
  }, [isPreviewMode, selectedClient?.id])

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
    // If we got back fewer items than the limit, we've reached the end
    setHasMore(convexActivities.length === currentLimitRef.current)
  }, [convexActivities, convexEnabled])

  const loadMore = useCallback(() => {
    currentLimitRef.current += limitCount
  }, [limitCount])

  const retry = useCallback(() => {
    currentLimitRef.current = limitCount
    void refresh()
  }, [refresh, limitCount])

  return {
    activities,
    loading,
    error,
    retry,
    loadMore,
    hasMore,
    isRealTime: convexEnabled,
  }
}
