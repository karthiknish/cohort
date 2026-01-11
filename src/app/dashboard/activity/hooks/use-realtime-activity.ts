'use client'

import { useCallback, useEffect, useState } from 'react'
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

  const convexEnabled =
    !isPreviewMode && Boolean(user?.agencyId) && Boolean(selectedClient?.id)

  const convexActivities = useQuery(
    (api as any).activity.listForClient,
    convexEnabled
      ? {
          workspaceId: String(user!.agencyId),
          clientId: String(selectedClient!.id),
          limit: limitCount,
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
    setActivities(previewActivities.slice(0, limitCount))
    setLoading(false)
    setError(null)
  }, [isPreviewMode, selectedClient?.id, limitCount])

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
  }, [convexActivities, convexEnabled])

  // No REST fallback; Convex query works in all modes.

  const retry = useCallback(() => {
    void refresh()
  }, [refresh])

  return {
    activities,
    loading,
    error,
    retry,
    isRealTime: convexEnabled,
  }
}
