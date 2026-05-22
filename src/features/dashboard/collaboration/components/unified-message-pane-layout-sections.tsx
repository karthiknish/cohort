'use client'

import { createElement, useCallback, useEffect, useRef, useState, type ChangeEvent, type RefObject } from 'react'

import { ConfirmDialog } from '@/shared/ui/confirm-dialog'

import { MessageSearchBar, NoSearchResultsState } from './message-pane-parts'
import type { MessagePaneHeaderInfo } from './unified-message-pane-types'

type UseUnifiedMessagePaneSearchParams = {
  canSearchMessages: boolean
  headerType: MessagePaneHeaderInfo['type']
  messageSearchQuery: string
  messageSearchActive: boolean
  resultCount: number
  onMessageSearchChange?: (value: string) => void
}

export function useUnifiedMessagePaneMessageSearch({
  canSearchMessages,
  headerType,
  messageSearchQuery,
  messageSearchActive,
  resultCount,
  onMessageSearchChange,
}: UseUnifiedMessagePaneSearchParams) {
  const messageSearchInputRef = useRef<HTMLInputElement>(null)
  const [messageSearchOpen, setMessageSearchOpen] = useState(false)
  const [prevCanSearchMessages, setPrevCanSearchMessages] = useState(canSearchMessages)

  if (canSearchMessages !== prevCanSearchMessages) {
    setPrevCanSearchMessages(canSearchMessages)
    if (!canSearchMessages) {
      setMessageSearchOpen(false)
    }
  }

  const handleMessageSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onMessageSearchChange?.(event.target.value)
    },
    [onMessageSearchChange],
  )

  const handleClearMessageSearch = useCallback(() => {
    onMessageSearchChange?.('')
  }, [onMessageSearchChange])

  const handleDismissMessageSearch = useCallback(() => {
    setMessageSearchOpen(false)
    onMessageSearchChange?.('')
  }, [onMessageSearchChange])

  const handleToggleMessageSearch = useCallback(() => {
    setMessageSearchOpen((open) => {
      const next = !open
      if (!next) {
        onMessageSearchChange?.('')
      }
      return next
    })
  }, [onMessageSearchChange])

  useEffect(() => {
    if (!messageSearchOpen) return
    messageSearchInputRef.current?.focus()
  }, [messageSearchOpen])

  useEffect(() => {
    if (!canSearchMessages || !messageSearchOpen) {
      return
    }

    const onGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      handleDismissMessageSearch()
    }

    window.addEventListener('keydown', onGlobalKeyDown)
    return () => window.removeEventListener('keydown', onGlobalKeyDown)
  }, [canSearchMessages, handleDismissMessageSearch, messageSearchOpen])

  const searchBar =
    canSearchMessages && onMessageSearchChange && messageSearchOpen ? (
      <MessageSearchBar
        inputRef={messageSearchInputRef}
        value={messageSearchQuery}
        onChange={handleMessageSearchChange}
        resultCount={resultCount}
        isActive={messageSearchActive}
        placeholder={
          headerType === 'dm' ? 'Search messages in this conversation…' : 'Search messages in this channel…'
        }
        onClear={handleClearMessageSearch}
      />
    ) : null

  return {
    messageSearchOpen,
    handleToggleMessageSearch,
    searchBar,
  }
}

export function resolveUnifiedMessagePaneEmptyState(
  isMessageSearchActive: boolean,
  emptyState?: React.ReactNode,
) {
  return isMessageSearchActive ? createElement(NoSearchResultsState) : emptyState
}

type UnifiedMessagePaneDeleteConfirmProps = {
  confirmingDeleteMessageId: string | null
  activeDeletingMessageId: string | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  onCancel: () => void
}

export function UnifiedMessagePaneDeleteConfirm({
  confirmingDeleteMessageId,
  activeDeletingMessageId,
  onOpenChange,
  onConfirm,
  onCancel,
}: UnifiedMessagePaneDeleteConfirmProps) {
  return (
    <ConfirmDialog
      open={Boolean(confirmingDeleteMessageId)}
      onOpenChange={onOpenChange}
      title="Delete message"
      description="This removes the message content for everyone in the conversation and keeps a deleted placeholder in the timeline."
      confirmLabel="Delete"
      cancelLabel="Cancel"
      variant="destructive"
      isLoading={activeDeletingMessageId === confirmingDeleteMessageId}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}

export type UnifiedMessagePaneAttachHandlerProps = {
  fileInputRef: RefObject<HTMLInputElement | null>
  onAddAttachments?: (files: FileList | File[]) => void
}

export function useUnifiedMessagePaneAttachHandler({
  fileInputRef,
}: UnifiedMessagePaneAttachHandlerProps) {
  return useCallback(() => {
    fileInputRef.current?.click()
  }, [fileInputRef])
}
