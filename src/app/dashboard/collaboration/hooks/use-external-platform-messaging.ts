'use client'

import { useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'
import type { CollaborationMessage } from '@/types/collaboration'

interface NotificationPreferences {
  slackCollaboration?: boolean
  teamsCollaboration?: boolean
  whatsappCollaboration?: boolean
  slackWebhookUrl?: string
  teamsWebhookUrl?: string
  whatsappPhoneNumber?: string
}

interface UseExternalPlatformMessagingOptions {
  workspaceId: string | null
  notificationPreferences: NotificationPreferences | null
}

interface ShareResult {
  platform: 'slack' | 'teams' | 'whatsapp'
  success: boolean
  error?: string
}

export function useExternalPlatformMessaging({
  workspaceId,
  notificationPreferences,
}: UseExternalPlatformMessagingOptions) {
  const { toast } = useToast()

  const sendToExternalPlatforms = useCallback(
    async (message: CollaborationMessage): Promise<ShareResult[]> => {
      if (!workspaceId || !notificationPreferences) {
        return []
      }

      const results: ShareResult[] = []
      const { content, senderName, channelType } = message

      // Build message metadata
      const metadata = {
        senderName,
        message: content,
        channelType,
        conversationUrl: `${window.location.origin}/dashboard/collaboration`,
      }

      // Send to Slack if enabled
      if (notificationPreferences.slackCollaboration && notificationPreferences.slackWebhookUrl) {
        try {
          const response = await fetch('/api/integrations/slack/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              channel: '#general',
              messageType: 'collaboration',
              text: content,
              webhookUrl: notificationPreferences.slackWebhookUrl,
              metadata: {
                senderName,
                conversationUrl: metadata.conversationUrl,
              },
            }),
          })

          if (response.ok) {
            results.push({ platform: 'slack', success: true })
          } else {
            const error = await response.text()
            results.push({ platform: 'slack', success: false, error })
          }
        } catch (error) {
          results.push({
            platform: 'slack',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }

      // Send to Teams if enabled
      if (notificationPreferences.teamsCollaboration && notificationPreferences.teamsWebhookUrl) {
        try {
          const response = await fetch('/api/integrations/teams/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messageType: 'collaboration',
              text: content,
              webhookUrl: notificationPreferences.teamsWebhookUrl,
              metadata: {
                senderName,
                conversationUrl: metadata.conversationUrl,
              },
            }),
          })

          if (response.ok) {
            results.push({ platform: 'teams', success: true })
          } else {
            const error = await response.text()
            results.push({ platform: 'teams', success: false, error })
          }
        } catch (error) {
          results.push({
            platform: 'teams',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }

      // Send to WhatsApp if enabled
      if (notificationPreferences.whatsappCollaboration && notificationPreferences.whatsappPhoneNumber) {
        try {
          const response = await fetch('/api/integrations/whatsapp/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: notificationPreferences.whatsappPhoneNumber,
              messageType: 'collaboration',
              text: content,
              metadata: {
                senderName,
              },
            }),
          })

          if (response.ok) {
            results.push({ platform: 'whatsapp', success: true })
          } else {
            const error = await response.text()
            results.push({ platform: 'whatsapp', success: false, error })
          }
        } catch (error) {
          results.push({
            platform: 'whatsapp',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }

      // Show toast for any failures
      const failures = results.filter((r) => !r.success)
      if (failures.length > 0) {
        toast({
          title: 'Some notifications failed',
          description: `Failed to send to: ${failures.map((f) => f.platform).join(', ')}`,
          variant: 'destructive',
        })
      }

      return results
    },
    [workspaceId, notificationPreferences, toast]
  )

  return {
    sendToExternalPlatforms,
  }
}
