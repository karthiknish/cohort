'use client'

import { useCallback, useRef, useState } from 'react'
import { useMutation } from 'convex/react'
import { collaborationApi } from '@/lib/convex-api'
import type { Channel } from '../types'
import { TYPING_TIMEOUT_MS, TYPING_UPDATE_INTERVAL_MS } from './constants'

interface UseTypingOptions {
  userId: string | null
  workspaceId: string | null
  selectedChannel: Channel | null
  resolveSenderDetails: () => { senderName: string; senderRole: string | null }
}

export function useTyping({ userId, workspaceId, selectedChannel, resolveSenderDetails }: UseTypingOptions) {
  const composerFocusedRef = useRef(false)
  const isTypingRef = useRef(false)
  const lastTypingUpdateRef = useRef(0)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const setTyping = useMutation((collaborationApi as any).setTyping)

  const sendTypingUpdate = useCallback(
    async (isTyping: boolean) => {
      if (!userId || !workspaceId || !selectedChannel) {
        return
      }

      const { senderName, senderRole } = resolveSenderDetails()
      if (!senderName) {
        return
      }

      try {
        await setTyping({
          workspaceId,
          channelId: selectedChannel.id,
          channelType: selectedChannel.type,
          clientId: selectedChannel.clientId ?? null,
          projectId: selectedChannel.projectId ?? null,
          userId,
          name: senderName,
          role: senderRole,
          isTyping,
          ttlMs: TYPING_TIMEOUT_MS,
        })
      } catch (error) {
        console.warn('[collaboration] failed to update typing status', error)
      }
    },
    [resolveSenderDetails, selectedChannel, setTyping, userId, workspaceId]
  )

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }

    if (!isTypingRef.current) {
      return
    }

    isTypingRef.current = false
    lastTypingUpdateRef.current = 0
    void sendTypingUpdate(false)
  }, [sendTypingUpdate])

  const notifyTyping = useCallback(() => {
    if (!composerFocusedRef.current || !selectedChannel) {
      return
    }

    const now = Date.now()
    if (!isTypingRef.current || now - lastTypingUpdateRef.current > TYPING_UPDATE_INTERVAL_MS) {
      isTypingRef.current = true
      lastTypingUpdateRef.current = now
      void sendTypingUpdate(true)
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false
      lastTypingUpdateRef.current = 0
      void sendTypingUpdate(false)
    }, TYPING_TIMEOUT_MS)
  }, [selectedChannel, sendTypingUpdate])

  const handleComposerFocus = useCallback(() => {
    composerFocusedRef.current = true
  }, [])

  const handleComposerBlur = useCallback(() => {
    composerFocusedRef.current = false
    stopTyping()
  }, [stopTyping])

  return {
    composerFocusedRef,
    stopTyping,
    notifyTyping,
    handleComposerFocus,
    handleComposerBlur,
  }
}
