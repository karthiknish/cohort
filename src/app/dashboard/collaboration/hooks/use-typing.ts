'use client'

import { useCallback, useRef, useState } from 'react'
import { Timestamp, deleteField, doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
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

  const sendTypingUpdate = useCallback(
    async (isTyping: boolean) => {
      if (!userId || !workspaceId || !selectedChannel) {
        return
      }

      const { senderName, senderRole } = resolveSenderDetails()
      if (!senderName) {
        return
      }

      const typingDocRef = doc(db, 'workspaces', workspaceId, 'collaborationTyping', selectedChannel.id)
      const now = Date.now()

      try {
        if (isTyping) {
          const payload = {
            channelType: selectedChannel.type,
            clientId: selectedChannel.clientId ?? null,
            projectId: selectedChannel.projectId ?? null,
            typers: {
              [userId]: {
                name: senderName,
                role: senderRole,
                updatedAt: Timestamp.fromMillis(now),
                expiresAt: Timestamp.fromMillis(now + TYPING_TIMEOUT_MS),
              },
            },
          }
          await setDoc(typingDocRef, payload, { merge: true })
        } else {
          await setDoc(
            typingDocRef,
            {
              typers: {
                [userId]: deleteField(),
              },
            },
            { merge: true }
          )
        }
      } catch (error) {
        console.warn('[collaboration] failed to update typing status', error)
      }
    },
    [resolveSenderDetails, selectedChannel, userId, workspaceId]
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
