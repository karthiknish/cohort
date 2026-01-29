'use client'

import { useCallback, useRef, useEffect } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { collaborationApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { useToast } from '@/components/ui/use-toast'
import type { CollaborationMessage } from '@/types/collaboration'

interface UseReadReceiptsOptions {
  workspaceId: string | null
  userId: string | null
  channelId: string | null
  channelType: string
  clientId: string | null
  projectId: string | null
  messages: CollaborationMessage[]
  enabled?: boolean
}

interface ReadReceiptsState {
  unreadCount: number
  lastReadMessageId: string | null
  readReceipts: Record<string, string[]> // messageId -> array of userIds
}

export function useReadReceipts({
  workspaceId,
  userId,
  channelId,
  channelType,
  clientId,
  projectId,
  messages,
  enabled = true,
}: UseReadReceiptsOptions) {
  const { toast } = useToast()

  const markAsRead = useMutation((collaborationApi as any).markAsRead)
  const markMultipleAsRead = useMutation((collaborationApi as any).markMultipleAsRead)
  const markChannelAsRead = useMutation((collaborationApi as any).markChannelAsRead)

  // Track which messages have been marked as read in this session
  const markedAsReadRef = useRef<Set<string>>(new Set())

  // Get unread count for the channel
  const unreadResult = useQuery(
    (collaborationApi as any).getUnreadCount,
    enabled && workspaceId && userId && channelId
      ? {
          workspaceId: String(workspaceId),
          channelType,
          clientId: clientId ?? undefined,
          projectId: projectId ?? undefined,
          userId: String(userId),
        }
      : 'skip'
  )

  const unreadCount = (unreadResult as { count?: number } | null)?.count ?? 0

  // Mark a single message as read
  const handleMarkAsRead = useCallback(
    async (messageId: string) => {
      if (!workspaceId || !userId || !enabled) return

      // Skip if already marked in this session
      if (markedAsReadRef.current.has(messageId)) return

      // Skip if message is from current user
      const message = messages.find((m) => m.id === messageId)
      if (message?.senderId === userId) return

      try {
        markedAsReadRef.current.add(messageId)

        await markAsRead({
          workspaceId: String(workspaceId),
          legacyId: messageId,
          userId: String(userId),
        })
      } catch (error) {
        logError(error, 'useReadReceipts:handleMarkAsRead')
        markedAsReadRef.current.delete(messageId)
      }
    },
    [workspaceId, userId, messages, markAsRead, enabled]
  )

  // Mark multiple messages as read
  const handleMarkMultipleAsRead = useCallback(
    async (messageIds: string[]) => {
      if (!workspaceId || !userId || !enabled || messageIds.length === 0) return

      // Filter out already marked and own messages
      const messagesToMark = messageIds.filter((id) => {
        if (markedAsReadRef.current.has(id)) return false
        const message = messages.find((m) => m.id === id)
        return message?.senderId !== userId
      })

      if (messagesToMark.length === 0) return

      try {
        messagesToMark.forEach((id) => markedAsReadRef.current.add(id))

        await markMultipleAsRead({
          workspaceId: String(workspaceId),
          legacyIds: messagesToMark,
          userId: String(userId),
        })
      } catch (error) {
        logError(error, 'useReadReceipts:handleMarkMultipleAsRead')
        messagesToMark.forEach((id) => markedAsReadRef.current.delete(id))
      }
    },
    [workspaceId, userId, messages, markMultipleAsRead, enabled]
  )

  // Mark all messages in channel as read
  const handleMarkChannelAsRead = useCallback(
    async (beforeMs?: number) => {
      if (!workspaceId || !userId || !enabled) return

      try {
        await markChannelAsRead({
          workspaceId: String(workspaceId),
          channelType,
          clientId: clientId ?? undefined,
          projectId: projectId ?? undefined,
          userId: String(userId),
          beforeMs,
        })

        // Mark all current messages as read in session
        messages.forEach((message) => {
          if (message.senderId !== userId) {
            markedAsReadRef.current.add(message.id)
          }
        })
      } catch (error) {
        logError(error, 'useReadReceipts:handleMarkChannelAsRead')
        toast({
          title: 'Failed to mark messages as read',
          description: asErrorMessage(error),
          variant: 'destructive',
        })
      }
    },
    [
      workspaceId,
      userId,
      channelType,
      clientId,
      projectId,
      messages,
      markChannelAsRead,
      enabled,
      toast,
    ]
  )

  // Auto-mark visible messages as read
  useEffect(() => {
    if (!enabled || !userId) return

    // Mark messages that are visible as read
    // In a real implementation, you'd use Intersection Observer
    // For now, we'll mark the most recent message when channel changes
    const mostRecentMessage = messages[0]
    if (mostRecentMessage && mostRecentMessage.senderId !== userId) {
      // Small delay to ensure message is actually visible
      const timer = setTimeout(() => {
        handleMarkAsRead(mostRecentMessage.id)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [channelId, messages, userId, enabled, handleMarkAsRead])

  // Get read status for a message
  const getMessageReadStatus = useCallback(
    (messageId: string): { readBy: string[]; isRead: boolean } => {
      const message = messages.find((m) => m.id === messageId)
      const readBy = message?.readBy ?? []
      return {
        readBy,
        isRead: userId ? readBy.includes(userId) : false,
      }
    },
    [messages, userId]
  )

  // Get users who haven't read a message yet
  const getUnreadUsers = useCallback(
    (messageId: string, allUserIds: string[]): string[] => {
      const { readBy } = getMessageReadStatus(messageId)
      return allUserIds.filter((id) => !readBy.includes(id))
    },
    [getMessageReadStatus]
  )

  // Get read receipts for UI display
  const getReadReceiptsForDisplay = useCallback(
    (message: CollaborationMessage): {
      readCount: number
      totalCount: number
      readByNames: string[]
    } => {
      const readBy = message.readBy ?? []
      // In a real implementation, you'd fetch user names
      // For now, return the count
      return {
        readCount: readBy.length,
        totalCount: 0, // Would be total channel members
        readByNames: [], // Would map userIds to names
      }
    },
    []
  )

  return {
    unreadCount,
    markAsRead: handleMarkAsRead,
    markMultipleAsRead: handleMarkMultipleAsRead,
    markChannelAsRead: handleMarkChannelAsRead,
    getMessageReadStatus,
    getUnreadUsers,
    getReadReceiptsForDisplay,
  }
}
