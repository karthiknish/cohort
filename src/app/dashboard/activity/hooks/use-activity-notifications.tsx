'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { toast } from 'sonner'
import { Folder, CheckCircle, MessageSquare, Bell } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
import type { Activity } from '@/types/activity'

interface NotificationConfig {
  enabled: boolean
  showProjectUpdates: boolean
  showTaskCompletions: boolean
  showNewMessages: boolean
}

export function useActivityNotifications(activities: Activity[]) {
  const { user } = useAuth()
  const { selectedClient } = useClientContext()
  const previousActivitiesRef = useRef<Activity[]>([])
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null)
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [config, setConfig] = useState<NotificationConfig>({
    enabled: true,
    showProjectUpdates: true,
    showTaskCompletions: true,
    showNewMessages: true,
  })

  // Show notification toast for new activity
  const showNotificationToast = useCallback((activity: Activity, isFromOtherTab = false) => {
    if (!config.enabled || !user) return

    // Don't show notifications for user's own actions (if we can detect it)
    // This would require tracking user ID in activity data

    let shouldNotify = false
    let message = ''
    let icon: React.ReactNode = null

    switch (activity.type) {
      case 'project_updated':
        if (config.showProjectUpdates) {
          shouldNotify = true
          message = `Project "${activity.entityName}" was updated`
          icon = <Folder className="h-4 w-4" />
        }
        break
      case 'task_completed':
        if (config.showTaskCompletions) {
          shouldNotify = true
          message = `Task "${activity.entityName}" was completed`
          icon = <CheckCircle className="h-4 w-4" />
        }
        break
      case 'message_posted':
        if (config.showNewMessages) {
          shouldNotify = true
          message = `New message in ${activity.entityName}`
          icon = <MessageSquare className="h-4 w-4" />
        }
        break
    }

    if (shouldNotify) {
      const toastMessage = isFromOtherTab ? message : `${message} (Live)`
      
      toast.success(toastMessage, {
        icon,
        duration: 4000,
        action: activity.navigationUrl ? {
          label: 'View',
          onClick: () => {
            window.location.href = activity.navigationUrl
          },
        } : undefined,
      })
    }
  }, [config, user])

  // Initialize broadcast channel for cross-tab sync
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
      return
    }

    broadcastChannelRef.current = new BroadcastChannel('activity-notifications')

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'NEW_ACTIVITY' && event.data.activity) {
        showNotificationToast(event.data.activity, true)
      }
    }

    broadcastChannelRef.current.addEventListener('message', handleMessage)

    return () => {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.removeEventListener('message', handleMessage)
        broadcastChannelRef.current.close()
        broadcastChannelRef.current = null
      }
    }
  }, [showNotificationToast])

  // Detect new activities and show notifications
  useEffect(() => {
    if (!activities.length || !selectedClient?.id) return

    const previousActivities = previousActivitiesRef.current
    const newActivities = activities.filter(activity => 
      !previousActivities.some(prev => prev.id === activity.id)
    )

    // Debounce rapid notifications
    if (newActivities.length > 0) {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current)
      }

      notificationTimeoutRef.current = setTimeout(() => {
        if (newActivities.length === 1) {
          // Single activity notification
          showNotificationToast(newActivities[0])
          
          // Broadcast to other tabs
          if (broadcastChannelRef.current) {
            broadcastChannelRef.current.postMessage({
              type: 'NEW_ACTIVITY',
              activity: newActivities[0],
            })
          }
        } else {
          // Batch notification for multiple activities
          const activityTypes = newActivities.map(a => a.type)
          let message = ''
          
          if (activityTypes.includes('project_updated') && activityTypes.includes('task_completed')) {
            message = `${newActivities.length} new updates`
          } else if (activityTypes.every(t => t === 'project_updated')) {
            message = `${newActivities.length} project updates`
          } else if (activityTypes.every(t => t === 'task_completed')) {
            message = `${newActivities.length} tasks completed`
          } else if (activityTypes.every(t => t === 'message_posted')) {
            message = `${newActivities.length} new messages`
          } else {
            message = `${newActivities.length} new activities`
          }

          toast.success(message, {
            icon: <Bell className="h-4 w-4" />,
            duration: 4000,
          })

          // Broadcast batch notification to other tabs
          if (broadcastChannelRef.current) {
            broadcastChannelRef.current.postMessage({
              type: 'BATCH_NOTIFICATION',
              count: newActivities.length,
              message,
            })
          }
        }
      }, 500) // 500ms debounce
    }

    // Update previous activities
    previousActivitiesRef.current = [...activities]

    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current)
      }
    }
  }, [activities, selectedClient?.id, showNotificationToast])

  return {
    config,
    updateConfig: (newConfig: Partial<NotificationConfig>) => {
      setConfig((previous) => ({
        ...previous,
        ...newConfig,
      }))
    },
  }
}
