'use client'

import {
  type ChangeEvent,
  type ClipboardEvent,
  type DragEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { useToast } from '@/shared/ui/use-toast'
import type { CollaborationMessage } from '@/types/collaboration'

import type { PendingAttachment } from '../hooks/types'
import type { UnifiedMessage } from './message-list'
import type { MessagePaneHeaderInfo } from './unified-message-pane-types'

type UseUnifiedMessagePaneControllerArgs = {
  channelMessages?: CollaborationMessage[]
  focusMessageId?: string | null
  focusThreadId?: string | null
  header: MessagePaneHeaderInfo | null
  isSending: boolean
  messageDeletingId?: string | null
  messageInput: string
  messageUpdatingId?: string | null
  onAddAttachments?: (files: FileList | File[]) => void
  onComposerBlur?: () => void
  onComposerFocus?: () => void
  onDeleteMessage?: (messageId: string) => Promise<void>
  onEditMessage?: (messageId: string, newContent: string) => Promise<void>
  onLoadMoreThreadReplies?: (threadRootId: string) => Promise<void> | void
  onLoadThreadReplies?: (threadRootId: string) => Promise<void> | void
  onMarkThreadAsRead?: (threadRootId: string, beforeMs?: number) => Promise<void> | void
  onReply?: (message: UnifiedMessage) => void
  onSendMessage: (content: string) => Promise<void>
  onShareToPlatform?: (message: UnifiedMessage, platform: 'email') => Promise<void>
  onToggleReaction: (messageId: string, emoji: string) => Promise<void>
  pendingAttachments: PendingAttachment[]
  threadErrorsByRootId: Record<string, string | null>
  threadLoadingByRootId: Record<string, boolean>
  threadMessagesByRootId: Record<string, CollaborationMessage[]>
  uploadingAttachments: boolean
}

export function useUnifiedMessagePaneController({
  channelMessages,
  focusMessageId = null,
  focusThreadId = null,
  header,
  isSending,
  messageDeletingId = null,
  messageInput,
  messageUpdatingId = null,
  onAddAttachments,
  onComposerBlur,
  onComposerFocus,
  onDeleteMessage,
  onEditMessage,
  onLoadMoreThreadReplies,
  onLoadThreadReplies,
  onMarkThreadAsRead,
  onReply,
  onSendMessage,
  onShareToPlatform,
  onToggleReaction,
  pendingAttachments,
  threadErrorsByRootId,
  threadLoadingByRootId,
  threadMessagesByRootId,
  uploadingAttachments,
}: UseUnifiedMessagePaneControllerArgs) {
  const [sharingTo, setSharingTo] = useState<string | null>(null)
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null)
  const [confirmingDeleteMessageId, setConfirmingDeleteMessageId] = useState<string | null>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const [editingPreview, setEditingPreview] = useState('')
  const [expandedThreadIds, setExpandedThreadIds] = useState<Record<string, boolean>>({})
  const [isComposerFocused, setIsComposerFocused] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const lastAutoOpenedThreadRef = useRef<string | null>(null)
  const lastConversationKeyRef = useRef<string | null>(null)
  const { toast } = useToast()

  const activeDeletingMessageId = deletingMessageId ?? messageDeletingId
  const conversationKey = header ? `${header.type}:${header.name}` : 'none'
  const hasPendingAttachments = pendingAttachments.length > 0

  const channelMessagesById = useMemo(() => {
    const map = new Map<string, CollaborationMessage>()
    for (const message of channelMessages ?? []) {
      if (message?.id) map.set(message.id, message)
    }
    for (const replies of Object.values(threadMessagesByRootId)) {
      for (const reply of replies) {
        if (reply?.id) map.set(reply.id, reply)
      }
    }
    return map
  }, [channelMessages, threadMessagesByRootId])

  const effectiveFocusMessageId = useMemo(() => {
    if (typeof focusMessageId !== 'string') return null
    const normalizedId = focusMessageId.trim()
    if (!normalizedId) return null
    const focusedMessage = channelMessagesById.get(normalizedId)
    if (!focusedMessage?.parentMessageId) return normalizedId
    return focusedMessage.threadRootId?.trim() || focusedMessage.parentMessageId?.trim() || normalizedId
  }, [channelMessagesById, focusMessageId])

  const effectiveFocusThreadId = useMemo(() => {
    if (typeof focusThreadId === 'string' && focusThreadId.trim().length > 0) {
      return focusThreadId.trim()
    }
    if (typeof focusMessageId !== 'string' || focusMessageId.trim().length === 0) {
      return null
    }
    const focusedMessage = channelMessagesById.get(focusMessageId.trim())
    if (!focusedMessage) return null
    return focusedMessage.threadRootId?.trim() || focusedMessage.parentMessageId?.trim() || null
  }, [channelMessagesById, focusMessageId, focusThreadId])

  useEffect(() => {
    if (lastConversationKeyRef.current === conversationKey) return
    lastConversationKeyRef.current = conversationKey

    const frame = window.requestAnimationFrame(() => {
      setEditingMessageId(null)
      setEditingValue('')
      setEditingPreview('')
      setConfirmingDeleteMessageId(null)
      setDeletingMessageId(null)
      setIsComposerFocused(false)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [conversationKey])

  const handleReaction = useCallback(async (messageId: string, emoji: string) => {
    await onToggleReaction(messageId, emoji)
  }, [onToggleReaction])

  const handleReply = useCallback((message: UnifiedMessage) => {
    onReply?.(message)
  }, [onReply])

  const handleDelete = useCallback(async (messageId: string) => {
    if (!onDeleteMessage) return
    setDeletingMessageId(messageId)
    try {
      await onDeleteMessage(messageId)
    } finally {
      setDeletingMessageId(null)
    }
  }, [onDeleteMessage])

  const handleRequestDelete = useCallback((messageId: string) => {
    setConfirmingDeleteMessageId(messageId)
  }, [])

  const handleCancelDelete = useCallback(() => {
    if (activeDeletingMessageId) return
    setConfirmingDeleteMessageId(null)
  }, [activeDeletingMessageId])

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmingDeleteMessageId) return
    try {
      await handleDelete(confirmingDeleteMessageId)
      setConfirmingDeleteMessageId(null)
    } catch {
      // Error toast comes from message actions; leave dialog open for retry.
    }
  }, [confirmingDeleteMessageId, handleDelete])

  const handleStartEdit = useCallback((message: UnifiedMessage) => {
    if (!onEditMessage || message.deleted) return
    setEditingMessageId(message.id)
    setEditingValue(message.content ?? '')
    setEditingPreview((message.content ?? '').trim().slice(0, 120))
  }, [onEditMessage])

  const handleCancelEdit = useCallback(() => {
    if (messageUpdatingId) return
    setEditingMessageId(null)
    setEditingValue('')
    setEditingPreview('')
  }, [messageUpdatingId])

  const handleConfirmEdit = useCallback(async () => {
    if (!onEditMessage || !editingMessageId) return
    const trimmedValue = editingValue.trim()
    if (!trimmedValue) {
      toast({
        title: 'Message required',
        description: 'Enter a message before saving your changes.',
        variant: 'destructive',
      })
      return
    }
    try {
      await onEditMessage(editingMessageId, trimmedValue)
      setEditingMessageId(null)
      setEditingValue('')
      setEditingPreview('')
    } catch {
      // Error toast comes from message actions; keep editor open.
    }
  }, [editingMessageId, editingValue, onEditMessage, toast])

  const handleShare = useCallback(async (message: UnifiedMessage, platform: 'email') => {
    if (!onShareToPlatform) return
    setSharingTo(`${message.id}-${platform}`)
    await onShareToPlatform(message, platform)
      .then(() => {
        toast({
          title: 'Message shared',
          description: `Sent to ${platform === 'email' ? 'Email' : platform}`,
        })
      })
      .catch(() => {
        toast({
          title: 'Share failed',
          description: `Could not send to ${platform === 'email' ? 'Email' : platform}`,
          variant: 'destructive',
        })
      })
    setSharingTo(null)
  }, [onShareToPlatform, toast])

  const handleSend = useCallback(async () => {
    const content = messageInput.trim()
    if ((!content && !hasPendingAttachments) || isSending || uploadingAttachments) return
    await onSendMessage(content)
  }, [hasPendingAttachments, isSending, messageInput, onSendMessage, uploadingAttachments])

  const handleComposerFocusInternal = useCallback(() => {
    setIsComposerFocused(true)
    onComposerFocus?.()
  }, [onComposerFocus])

  const handleComposerBlurInternal = useCallback(() => {
    setIsComposerFocused(false)
    onComposerBlur?.()
  }, [onComposerBlur])

  const handleAttachmentInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    if (!onAddAttachments) return
    const files = event.target.files
    if (files && files.length > 0) onAddAttachments(files)
    event.target.value = ''
  }, [onAddAttachments])

  const handleComposerDragOver = useCallback((event: DragEvent<HTMLTextAreaElement>) => {
    if (!onAddAttachments) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }, [onAddAttachments])

  const handleComposerDrop = useCallback((event: DragEvent<HTMLTextAreaElement>) => {
    if (!onAddAttachments) return
    event.preventDefault()
    const files = event.dataTransfer.files
    if (files && files.length > 0) onAddAttachments(files)
  }, [onAddAttachments])

  const handleComposerPaste = useCallback((event: ClipboardEvent<HTMLTextAreaElement>) => {
    if (!onAddAttachments) return
    const files = event.clipboardData?.files
    if (files && files.length > 0) {
      event.preventDefault()
      onAddAttachments(files)
    }
  }, [onAddAttachments])

  const resolveThreadRootId = useCallback((message: UnifiedMessage) => {
    const original = channelMessagesById.get(message.id)
    if (original?.threadRootId && original.threadRootId.trim().length > 0) return original.threadRootId.trim()
    if (message.threadRootId && message.threadRootId.trim().length > 0) return message.threadRootId.trim()
    return message.id
  }, [channelMessagesById])

  const handleThreadToggle = useCallback((threadRootId: string, beforeMs?: number) => {
    const normalizedId = typeof threadRootId === 'string' ? threadRootId.trim() : ''
    if (!normalizedId) return
    const isCurrentlyOpen = Boolean(expandedThreadIds[normalizedId])

    setExpandedThreadIds((prev) => {
      const next = { ...prev }
      if (isCurrentlyOpen) delete next[normalizedId]
      else next[normalizedId] = true
      return next
    })

    if (!isCurrentlyOpen) {
      const hasRepliesLoaded = (threadMessagesByRootId[normalizedId]?.length ?? 0) > 0
      const hasError = Boolean(threadErrorsByRootId[normalizedId])
      const isLoadingReplies = Boolean(threadLoadingByRootId[normalizedId])
      if ((!hasRepliesLoaded || hasError) && !isLoadingReplies) {
        void onLoadThreadReplies?.(normalizedId)
      }
      void onMarkThreadAsRead?.(normalizedId, beforeMs)
    }
  }, [expandedThreadIds, onLoadThreadReplies, onMarkThreadAsRead, threadErrorsByRootId, threadLoadingByRootId, threadMessagesByRootId])

  const handleRetryThreadLoad = useCallback((threadRootId: string) => {
    const normalizedId = typeof threadRootId === 'string' ? threadRootId.trim() : ''
    if (!normalizedId) return
    void onLoadThreadReplies?.(normalizedId)
  }, [onLoadThreadReplies])

  const handleLoadMoreThread = useCallback((threadRootId: string) => {
    const normalizedId = typeof threadRootId === 'string' ? threadRootId.trim() : ''
    if (!normalizedId) return
    void onLoadMoreThreadReplies?.(normalizedId)
  }, [onLoadMoreThreadReplies])

  useEffect(() => {
    if (!effectiveFocusThreadId) {
      lastAutoOpenedThreadRef.current = null
      return
    }
    if (lastAutoOpenedThreadRef.current === effectiveFocusThreadId) return

    lastAutoOpenedThreadRef.current = effectiveFocusThreadId
    const frame = window.requestAnimationFrame(() => {
      setExpandedThreadIds((prev) => {
        if (prev[effectiveFocusThreadId]) return prev
        return { ...prev, [effectiveFocusThreadId]: true }
      })
    })

    const hasRepliesLoaded = (threadMessagesByRootId[effectiveFocusThreadId]?.length ?? 0) > 0
    const isLoadingReplies = Boolean(threadLoadingByRootId[effectiveFocusThreadId])
    if (!hasRepliesLoaded && !isLoadingReplies) {
      void onLoadThreadReplies?.(effectiveFocusThreadId)
    }
    void onMarkThreadAsRead?.(effectiveFocusThreadId)

    return () => window.cancelAnimationFrame(frame)
  }, [effectiveFocusThreadId, onLoadThreadReplies, onMarkThreadAsRead, threadLoadingByRootId, threadMessagesByRootId])

  return {
    activeDeletingMessageId,
    channelMessagesById,
    confirmingDeleteMessageId,
    editingMessageId,
    editingPreview,
    editingValue,
    effectiveFocusMessageId,
    effectiveFocusThreadId,
    expandedThreadIds,
    fileInputRef,
    handleAttachmentInputChange,
    handleCancelDelete,
    handleCancelEdit,
    handleComposerBlurInternal,
    handleComposerDragOver,
    handleComposerDrop,
    handleComposerFocusInternal,
    handleComposerPaste,
    handleConfirmDelete,
    handleConfirmEdit,
    handleDelete,
    handleLoadMoreThread,
    handleReaction,
    handleReply,
    handleRequestDelete,
    handleRetryThreadLoad,
    handleSend,
    handleShare,
    handleStartEdit,
    handleThreadToggle,
    hasPendingAttachments,
    isComposerFocused,
    setEditingValue,
    sharingTo,
    resolveThreadRootId,
  }
}