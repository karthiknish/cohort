'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'

import type { WorkspaceNotification } from '@/types/notifications'

export function useNotificationNavigation(onNavigate?: () => void) {
  const { push } = useRouter()

  return useCallback(
    (notification: WorkspaceNotification) => {
      const target =
        typeof notification.navigationUrl === 'string' ? notification.navigationUrl : null
      if (!target) return

      onNavigate?.()

      if (target.startsWith('/')) {
        push(target)
        return
      }

      if (typeof window !== 'undefined') {
        window.location.assign(target)
      }
    },
    [onNavigate, push],
  )
}
