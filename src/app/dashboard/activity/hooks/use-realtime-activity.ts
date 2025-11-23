'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import {
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  collection,
} from 'firebase/firestore'

import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
import { db } from '@/lib/firebase'
import type { Activity } from '@/types/activity'

type FirestoreTimestampLike =
  | Date
  | { toDate?: () => Date }
  | { seconds?: number; nanoseconds?: number }
  | string
  | null
  | undefined

function toIsoTimestamp(value: FirestoreTimestampLike): string {
  if (!value) return new Date().toISOString()
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'string') {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString()
  }

  if (typeof value === 'object') {
    const candidate = value as { toDate?: () => Date; seconds?: number }
    if (typeof candidate.toDate === 'function') {
      const date = candidate.toDate()
      if (date instanceof Date && !Number.isNaN(date.getTime())) {
        return date.toISOString()
      }
    }

    if (typeof candidate.seconds === 'number' && Number.isFinite(candidate.seconds)) {
      return new Date(candidate.seconds * 1000).toISOString()
    }
  }

  return new Date().toISOString()
}

function readString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback
}

export function useRealtimeActivity(limitCount = 20) {
  const { user } = useAuth()
  const { selectedClient } = useClientContext()
  const unsubscribeRefs = useRef<Array<() => void>>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setupRealtimeListeners = useCallback(() => {
    if (!selectedClient?.id || !user) return

    const clientId = selectedClient.id
    const userId = user.id

    setLoading(true)
    setError(null)

    // Clean up existing listeners
    unsubscribeRefs.current.forEach(unsubscribe => unsubscribe())
    unsubscribeRefs.current = []

    try {
      // Real-time listener for tasks (simplified query to avoid index requirement)
      const tasksQuery = query(
        collection(db, 'users', userId, 'tasks'),
        where('clientId', '==', clientId),
        orderBy('updatedAt', 'desc'),
        limit(limitCount)
      )

      const unsubscribeTasks = onSnapshot(
        tasksQuery,
        (snapshot) => {
          const taskActivities = snapshot.docs.map((doc) => {
            const data = doc.data() as Record<string, unknown>
            const title = readString(data.title, 'Untitled Task')
            const projectId = readString(data.projectId, clientId)
            const timestampSource = (data.updatedAt ?? data.createdAt) as FirestoreTimestampLike

            return {
              id: `task-${doc.id}`,
              type: 'task_completed' as const,
              timestamp: toIsoTimestamp(timestampSource),
              clientId,
              entityId: doc.id,
              entityName: title,
              description: `Task "${title}" was updated`,
              navigationUrl: `/dashboard/tasks?projectId=${encodeURIComponent(projectId)}&projectName=${encodeURIComponent('Project')}`,
            }
          })

          setActivities((prev) => {
            const filtered = prev.filter((activity) => !activity.id.startsWith('task-'))
            const combined = [...taskActivities, ...filtered]
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .slice(0, limitCount)
            return combined
          })
        },
        (err) => {
          console.error('Real-time tasks listener error:', err)
          setError('Failed to sync task updates')
        }
      )

      // Real-time listener for collaboration messages (simplified query to avoid index requirement)
      const messagesQuery = query(
        collection(db, 'users', userId, 'collaborationMessages'),
        where('clientId', '==', clientId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )

      const unsubscribeMessages = onSnapshot(
        messagesQuery,
        (snapshot) => {
          const messageActivities = snapshot.docs.map((doc) => {
            const data = doc.data() as Record<string, unknown>
            const projectId = readString(data.projectId, clientId)
            const projectName = readString(data.projectName, 'Project')
            const timestampSource = (data.createdAt ?? data.updatedAt) as FirestoreTimestampLike

            return {
              id: `message-${doc.id}`,
              type: 'message_posted' as const,
              timestamp: toIsoTimestamp(timestampSource),
              clientId,
              entityId: doc.id,
              entityName: projectName,
              description: `New message in ${projectName}`,
              navigationUrl: `/dashboard/collaboration?projectId=${encodeURIComponent(projectId)}`,
            }
          })

          setActivities((prev) => {
            const filtered = prev.filter((activity) => !activity.id.startsWith('message-'))
            const combined = [...messageActivities, ...filtered]
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .slice(0, limitCount)
            return combined
          })
        },
        (err) => {
          console.error('Real-time messages listener error:', err)
          setError('Failed to sync message updates')
        }
      )

      // Store unsubscribe functions for cleanup
      unsubscribeRefs.current = [unsubscribeTasks, unsubscribeMessages]
      setLoading(false)

    } catch (err) {
      console.error('Error setting up real-time listeners:', err)
      setError('Failed to set up real-time sync')
      setLoading(false)
    }
  }, [selectedClient?.id, user, limitCount])

  useEffect(() => {
    setupRealtimeListeners()

    return () => {
      // Clean up all listeners when component unmounts or client changes
      unsubscribeRefs.current.forEach(unsubscribe => unsubscribe())
      unsubscribeRefs.current = []
    }
  }, [setupRealtimeListeners])

  const retry = useCallback(() => {
    setupRealtimeListeners()
  }, [setupRealtimeListeners])

  return {
    activities,
    loading,
    error,
    retry,
    isRealTime: true,
  }
}
