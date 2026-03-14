'use client'

import { useMutation } from 'convex/react'
import { useCallback, useEffect, useRef } from 'react'

import { usePreview } from '@/shared/contexts/preview-context'
import { collaborationApi } from '@/lib/convex-api'
import type { Channel } from '../types'
import { TYPING_TIMEOUT_MS, TYPING_UPDATE_INTERVAL_MS } from './constants'

interface UseTypingOptions {
  workspaceId: string | null
  selectedChannel: Channel | null
  resolveSenderDetails: () => { senderName: string; senderRole: string | null }
}

type TypingUpdateRequest = {
  workspaceId: string
  channelId: string
  channelType: Channel['type']
  clientId: string | null
  projectId: string | null
  name: string
  role: string | null
  isTyping: boolean
  ttlMs: number
}

export function buildTypingUpdateRequest({
  workspaceId,
  selectedChannel,
  senderName,
  senderRole,
  isTyping,
}: {
  workspaceId: string | null
  selectedChannel: Channel | null
  senderName: string
  senderRole: string | null
  isTyping: boolean
}): TypingUpdateRequest | null {
  if (!workspaceId || !selectedChannel || !senderName) {
    return null
  }

  return {
    workspaceId,
    channelId: selectedChannel.id,
    channelType: selectedChannel.type,
    clientId: selectedChannel.clientId ?? null,
    projectId: selectedChannel.projectId ?? null,
    name: senderName,
    role: senderRole,
    isTyping,
    ttlMs: TYPING_TIMEOUT_MS,
  }
}

export function useTyping({ workspaceId, selectedChannel, resolveSenderDetails }: UseTypingOptions) {
  const { isPreviewMode } = usePreview()
  const selectedChannelId = selectedChannel?.id ?? null
  const composerFocusedRef = useRef(false)
  const isTypingRef = useRef(false)
  const lastTypingUpdateRef = useRef(0)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const setTyping = useMutation(collaborationApi.setTyping)

  const sendTypingUpdate = useCallback(
    async (isTyping: boolean) => {
      if (isPreviewMode) {
        return
      }

      const { senderName, senderRole } = resolveSenderDetails()
      const request = buildTypingUpdateRequest({
        workspaceId,
        selectedChannel,
        senderName,
        senderRole,
        isTyping,
      })

      if (!request) {
        return
      }

      try {
        await setTyping(request)
      } catch (error) {
        console.warn('[collaboration] failed to update typing status', error)
      }
    },
    [isPreviewMode, resolveSenderDetails, selectedChannel, setTyping, workspaceId]
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

  useEffect(() => {
    if (selectedChannelId === null) {
      return () => {
        stopTyping()
      }
    }

    return () => {
      stopTyping()
    }
  }, [selectedChannelId, stopTyping])

  useEffect(() => {
    const handleBeforeUnload = () => {
      stopTyping()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        stopTyping()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [stopTyping])

  return {
    composerFocusedRef,
    stopTyping,
    notifyTyping,
    handleComposerFocus,
    handleComposerBlur,
  }
}
