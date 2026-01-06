'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Timestamp,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
  type QueryConstraint,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'

import { useToast } from '@/components/ui/use-toast'
import { usePreview } from '@/contexts/preview-context'
import { db } from '@/lib/firebase'
import { getPreviewCollaborationMessages } from '@/lib/preview-data'
import type { CollaborationMessage } from '@/types/collaboration'
import type { Channel } from '../types'
import type { MessagesByChannelState, TypingParticipant } from './types'
import { REALTIME_MESSAGE_LIMIT, TYPING_TIMEOUT_MS } from './constants'
import { mapRealtimeMessage } from './utils'

interface UseRealtimeMessagesOptions {
  workspaceId: string | null
  selectedChannel: Channel | null
  setMessagesByChannel: React.Dispatch<React.SetStateAction<MessagesByChannelState>>
  setNextCursorByChannel: React.Dispatch<React.SetStateAction<Record<string, string | null>>>
  setLoadingChannelId: React.Dispatch<React.SetStateAction<string | null>>
  setMessagesError: React.Dispatch<React.SetStateAction<string | null>>
  onError: (channel: Channel) => void
}

export function useRealtimeMessages({
  workspaceId,
  selectedChannel,
  setMessagesByChannel,
  setNextCursorByChannel,
  setLoadingChannelId,
  setMessagesError,
  onError,
}: UseRealtimeMessagesOptions) {
  const { toast } = useToast()
  const { isPreviewMode } = usePreview()
  const channelUnsubscribeRef = useRef<(() => void) | null>(null)
  
  // Store channel in ref for use in error callback without adding to deps
  const channelRef = useRef(selectedChannel)
  channelRef.current = selectedChannel
  
  // Store onError in ref to avoid it affecting deps
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError
  
  // Extract stable channel properties to use in deps instead of full object
  const channelId = selectedChannel?.id ?? null
  const channelType = selectedChannel?.type ?? null
  const channelClientId = selectedChannel?.clientId ?? null
  const channelProjectId = selectedChannel?.projectId ?? null

  useEffect(() => {
    channelUnsubscribeRef.current?.()
    channelUnsubscribeRef.current = null

    if (!channelId || !channelType) {
      return
    }

    // Handle preview mode
    if (isPreviewMode) {
      const previewMessages = getPreviewCollaborationMessages(
        channelClientId,
        channelProjectId
      )
      setMessagesByChannel((prev) => ({
        ...prev,
        [channelId]: previewMessages,
      }))
      setNextCursorByChannel((prev) => ({
        ...prev,
        [channelId]: null,
      }))
      setLoadingChannelId(null)
      setMessagesError(null)
      return
    }

    if (!workspaceId) {
      return
    }

    setLoadingChannelId(channelId)
    setMessagesError(null)

    const baseCollection = collection(db, 'workspaces', workspaceId, 'collaborationMessages')
    const constraints: QueryConstraint[] = [where('channelType', '==', channelType)]

    if (channelType === 'client') {
      if (!channelClientId) {
        setMessagesError('Client channel is missing an identifier')
        setLoadingChannelId((current) => (current === channelId ? null : current))
        return
      }
      constraints.push(where('clientId', '==', channelClientId))
    }

    if (channelType === 'project') {
      if (!channelProjectId) {
        setMessagesError('Project channel is missing an identifier')
        setLoadingChannelId((current) => (current === channelId ? null : current))
        return
      }
      constraints.push(where('projectId', '==', channelProjectId))
    }

    constraints.push(orderBy('createdAt', 'asc'), limit(REALTIME_MESSAGE_LIMIT))
    const channelQuery = query(baseCollection, ...constraints)

    const unsubscribe = onSnapshot(
      channelQuery,
      (snapshot) => {
        const next = snapshot.docs.map((doc) => mapRealtimeMessage(doc))
        setMessagesByChannel((prev) => ({
          ...prev,
          [channelId]: next,
        }))
        setNextCursorByChannel((prev) => ({
          ...prev,
          [channelId]: prev[channelId] ?? null,
        }))
        setLoadingChannelId((current) => (current === channelId ? null : current))
        setMessagesError(null)
      },
      (error) => {
        console.error('[collaboration] realtime subscription error', error)
        const message = error instanceof Error ? error.message : 'Unable to subscribe to messages'
        setMessagesError(message)
        setLoadingChannelId((current) => (current === channelId ? null : current))
        toast({
          title: 'Connection lost',
          description: 'Messages may be delayed. Trying to reconnect...',
          variant: 'destructive',
        })
        // Use refs for callback and channel to avoid dep issues
        if (channelRef.current) {
          onErrorRef.current(channelRef.current)
        }
      }
    )

    channelUnsubscribeRef.current = unsubscribe

    return () => {
      unsubscribe()
      if (channelUnsubscribeRef.current === unsubscribe) {
        channelUnsubscribeRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId, channelType, channelClientId, channelProjectId, isPreviewMode, setLoadingChannelId, setMessagesByChannel, setMessagesError, setNextCursorByChannel, toast, workspaceId])
}


interface UseRealtimeTypingOptions {
  userId: string | null
  workspaceId: string | null
  selectedChannel: Channel | null
}

export function useRealtimeTyping({
  userId,
  workspaceId,
  selectedChannel,
}: UseRealtimeTypingOptions) {
  const [typingParticipants, setTypingParticipants] = useState<TypingParticipant[]>([])
  
  // Extract stable channel id to use in deps
  const channelId = selectedChannel?.id ?? null

  useEffect(() => {
    if (!userId || !workspaceId || !channelId) {
      setTypingParticipants([])
      return
    }

    const typingDocRef = doc(db, 'workspaces', workspaceId, 'collaborationTyping', channelId)

    const unsubscribe = onSnapshot(
      typingDocRef,
      (snapshot) => {
        const data = snapshot.data() as { typers?: Record<string, unknown> } | undefined
        const entries = data && typeof data.typers === 'object' && data.typers !== null ? data.typers : undefined

        if (!entries) {
          setTypingParticipants([])
          return
        }

        const now = Date.now()
        const list: TypingParticipant[] = []

        Object.entries(entries).forEach(([actorId, rawEntry]) => {
          if (!rawEntry || typeof rawEntry !== 'object' || actorId === userId) {
            return
          }

          const entry = rawEntry as Record<string, unknown>
          const name = typeof entry.name === 'string' ? entry.name : null
          if (!name || name.trim().length === 0) {
            return
          }

          const expires = entry.expiresAt
          let expiresAtMs: number | null = null

          if (expires instanceof Timestamp) {
            expiresAtMs = expires.toMillis()
          } else if (
            typeof expires === 'object' &&
            expires !== null &&
            typeof (expires as { toMillis?: () => number }).toMillis === 'function'
          ) {
            expiresAtMs = (expires as { toMillis: () => number }).toMillis()
          } else if (typeof expires === 'number') {
            expiresAtMs = expires
          }

          if (expiresAtMs && expiresAtMs < now) {
            return
          }

          const role = typeof entry.role === 'string' ? entry.role : null
          list.push({ name, role })
        })

        setTypingParticipants(list)
      },
      (error) => {
        console.warn('[collaboration] typing subscription error', error)
        setTypingParticipants([])
      }
    )

    return () => {
      unsubscribe()
    }
  }, [channelId, userId, workspaceId])

  return { typingParticipants }
}
