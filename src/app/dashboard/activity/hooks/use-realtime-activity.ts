'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import {
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  collection,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'

import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
import { db } from '@/lib/firebase'
import type { Activity } from '@/types/activity'

export function useRealtimeActivity() {
  const { user } = useAuth()
  const { selectedClient } = useClientContext()
  const unsubscribeRefs = useRef<Array<() => void>>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mapDocumentToActivity = useCallback((doc: QueryDocumentSnapshot<DocumentData>): Activity => {
    const data = doc.data()
    return {
      id: doc.id,
      type: data.type || 'project_updated',
      timestamp: data.timestamp || new Date().toISOString(),
      clientId: data.clientId || '',
      entityId: data.entityId || '',
      entityName: data.entityName || 'Unknown',
      description: data.description || '',
      navigationUrl: data.navigationUrl,
    }
  }, [])

  const setupRealtimeListeners = useCallback(() => {
    if (!selectedClient?.id || !user) return

    setLoading(true)
    setError(null)

    // Clean up existing listeners
    unsubscribeRefs.current.forEach(unsubscribe => unsubscribe())
    unsubscribeRefs.current = []

    try {
      // Real-time listener for tasks (simplified query to avoid index requirement)
      const tasksQuery = query(
        collection(db, 'users', user.id, 'tasks'),
        where('clientId', '==', selectedClient.id),
        orderBy('updatedAt', 'desc'),
        limit(20)
      )

      const unsubscribeTasks = onSnapshot(
        tasksQuery,
        (snapshot) => {
          const taskActivities = snapshot.docs.map(doc => {
            const data = doc.data()
            return {
              id: `task-${doc.id}`,
              type: 'task_completed' as const,
              timestamp: (data as any).updatedAt?.toISOString() || new Date().toISOString(),
              clientId: selectedClient.id,
              entityId: doc.id,
              entityName: (data as any).title || 'Untitled Task',
              description: `Task "${(data as any).title || 'Untitled Task'}" was updated`,
              navigationUrl: `/dashboard/tasks?projectId=${(data as any).projectId}&projectName=${encodeURIComponent('Project')}`,
            }
          })

          // Filter completed tasks client-side and update activities
          const completedTasks = taskActivities.filter(task => {
            const data = snapshot.docs.find(doc => doc.id === task.entityId.split('-')[1])?.data()
            return (data as any)?.status === 'completed'
          })

          setActivities(prev => {
            const filtered = prev.filter(a => !a.id.startsWith('task-'))
            const combined = [...completedTasks, ...filtered]
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .slice(0, 20)
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
        collection(db, 'users', user.id, 'collaborationMessages'),
        where('clientId', '==', selectedClient.id),
        orderBy('createdAt', 'desc'),
        limit(20)
      )

      const unsubscribeMessages = onSnapshot(
        messagesQuery,
        (snapshot) => {
          const messageActivities = snapshot.docs.map(doc => {
            const data = doc.data()
            return {
              id: `message-${doc.id}`,
              type: 'message_posted' as const,
              timestamp: (data as any).createdAt?.toISOString() || new Date().toISOString(),
              clientId: selectedClient.id,
              entityId: doc.id,
              entityName: 'Project',
              description: `New message in project`,
              navigationUrl: `/dashboard/collaboration?projectId=${(data as any).projectId}`,
            }
          })

          // Filter project messages client-side and update activities
          const projectMessages = messageActivities.filter(message => {
            const data = snapshot.docs.find(doc => doc.id === message.entityId.split('-')[1])?.data()
            return (data as any)?.channelType === 'project'
          })

          setActivities(prev => {
            const filtered = prev.filter(a => !a.id.startsWith('message-'))
            const combined = [...projectMessages, ...filtered]
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .slice(0, 20)
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
  }, [selectedClient?.id, user, mapDocumentToActivity])

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
