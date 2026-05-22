'use client'

import { useCallback } from 'react'
import { useConvex, useMutation } from 'convex/react'

import { notifyFailure } from '@/lib/notifications'
import { reportConvexFailure } from '@/lib/handle-convex-error'
import { api, collaborationApi } from '@/lib/convex-api'
import { shouldSendCollaborationEmailCopy } from './collaboration-email-notify'
import type { CollaborationMessage } from '@/types/collaboration'

/** Sends collaboration message copies to external channels (email) per notification prefs V2. */
export function useCollaborationExternalNotify() {
  const convex = useConvex()
  const updateSharedTo = useMutation(collaborationApi.updateSharedTo)

  const sendCollaborationEmailCopy = useCallback(
    async (message: CollaborationMessage, workspaceId: string) => {
      try {
        const rawPrefs = await convex.query(api.settings.getMyNotificationPreferences, {})
        if (!rawPrefs) return

        if (!shouldSendCollaborationEmailCopy(rawPrefs)) {
          return
        }

        try {
          const response = await fetch('/api/integrations/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messageType: 'collaboration',
              text: message.content,
              metadata: {
                senderName: message.senderName,
                conversationUrl: `${window.location.origin}/dashboard/collaboration`,
              },
            }),
          })

          if (!response.ok) {
            const detail =
              typeof response.status === 'number' ? `Server returned ${response.status}.` : 'Request failed.'
            notifyFailure({
              title: 'Email collaboration copy failed',
              message: detail,
            })
            return
          }

          try {
            await updateSharedTo({
              workspaceId,
              legacyId: message.id,
              sharedTo: ['email'],
            })
          } catch (error) {
            reportConvexFailure({
              error: error,
              context: 'useCollaborationExternalNotify:updateSharedTo',
              title: 'Could not tag message as emailed',
              fallbackMessage: 'Could not tag message as emailed',
            })
          }
        } catch (error) {
          reportConvexFailure({
            error: error,
            context: 'useCollaborationExternalNotify:email',
            title: 'Email collaboration copy failed',
            fallbackMessage: 'Email collaboration copy failed',
          })
        }
      } catch (error) {
        reportConvexFailure({
          error: error,
          context: 'useCollaborationExternalNotify',
          title: 'Collaboration email unavailable',
          fallbackMessage: 'Collaboration email unavailable',
        })
      }
    },
    [convex, updateSharedTo],
  )

  return { sendCollaborationEmailCopy }
}
