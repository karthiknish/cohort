'use client'

import { useCallback, useEffect, useReducer } from 'react'
import { useMutation, useQuery } from 'convex/react'

import { useAuth } from '@/shared/contexts/auth-context'
import { useClientContext } from '@/shared/contexts/client-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { useToast } from '@/shared/ui/use-toast'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { api, notificationsApi } from '@/lib/convex-api'

import { getPreviewActivity } from '@/lib/preview-data'
import type { Activity } from '@/types/activity'

type RealtimeActivityState = {
  activities: Activity[]
  loading: boolean
  error: string | null
  hasMore: boolean
  currentLimit: number
}

type RealtimeActivityAction =
  | {
      type: 'syncData'
      activities: Activity[]
      loading: boolean
      error: string | null
      hasMore: boolean
    }
  | {
      type: 'setError'
      error: string | null
    }
  | {
      type: 'setCurrentLimit'
      currentLimit: number
    }

function createInitialRealtimeActivityState(limitCount: number): RealtimeActivityState {
  return {
    activities: [],
    loading: false,
    error: null,
    hasMore: false,
    currentLimit: limitCount,
  }
}

function realtimeActivityReducer(
  state: RealtimeActivityState,
  action: RealtimeActivityAction,
): RealtimeActivityState {
  switch (action.type) {
    case 'syncData':
      return {
        ...state,
        activities: action.activities,
        loading: action.loading,
        error: action.error,
        hasMore: action.hasMore,
      }
    case 'setError':
      return {
        ...state,
        error: action.error,
      }
    case 'setCurrentLimit':
      return {
        ...state,
        currentLimit: action.currentLimit,
      }
    default:
      return state
  }
}

export function useRealtimeActivity(limitCount = 20, preferPreviewData = false) {
  const { user } = useAuth()
  const { selectedClient } = useClientContext()
  const { isPreviewMode } = usePreview()
  const { toast } = useToast()

  const [{ activities, loading, error, hasMore, currentLimit }, dispatch] = useReducer(
    realtimeActivityReducer,
    limitCount,
    createInitialRealtimeActivityState,
  )

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
    dispatch({ type: 'setError', error: null })
  }, [])

  // Handle preview mode
  useEffect(() => {
    if (!usePreviewData) return

    const previewActivities = getPreviewActivity(selectedClient?.id ?? null)
    dispatch({
      type: 'syncData',
      activities: previewActivities.slice(0, currentLimit),
      loading: false,
      error: null,
      hasMore: previewActivities.length > currentLimit,
    })
  }, [usePreviewData, selectedClient?.id, currentLimit])

  // Convex realtime path
  useEffect(() => {
    if (!convexEnabled) return

    if (!convexActivities) {
      dispatch({
        type: 'syncData',
        activities,
        loading: true,
        error: null,
        hasMore,
      })
      return
    }

    dispatch({
      type: 'syncData',
      activities: convexActivities,
      loading: false,
      error: null,
      hasMore: convexActivities.length === currentLimit,
    })
  }, [activities, convexActivities, convexEnabled, currentLimit, hasMore])

  const loadMore = useCallback(() => {
    dispatch({ type: 'setCurrentLimit', currentLimit: currentLimit + limitCount })
  }, [currentLimit, limitCount])

  const retry = useCallback(() => {
    dispatch({ type: 'setCurrentLimit', currentLimit: limitCount })
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
          ...(user.role === 'client' && selectedClient?.id
            ? { clientId: String(selectedClient.id) }
            : {}),
        })
        dispatch({ type: 'setError', error: null })
      } catch (error) {
        logError(error, 'useRealtimeActivity:markAsRead')
        dispatch({ type: 'setError', error: 'Unable to update activity read status. Please try again.' })
        toast({
          title: 'Update failed',
          description: asErrorMessage(error),
          variant: 'destructive',
        })
      }
    },
    [ackMutation, selectedClient?.id, toast, user?.agencyId, user?.role]
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
