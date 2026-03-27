'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent, type MouseEvent } from 'react'

import { useChat, useParticipants } from '@/shared/ui/livekit'
import { useConvex, useMutation } from 'convex/react'

import { MAX_ATTACHMENTS } from '@/features/dashboard/collaboration/hooks/constants'
import type { PendingAttachment } from '@/features/dashboard/collaboration/hooks/types'
import { validateAttachments } from '@/features/dashboard/collaboration/hooks/utils'
import { useToast } from '@/shared/ui/use-toast'
import { useAuth } from '@/shared/contexts/auth-context'
import { filesApi } from '@/lib/convex-api'

import {
  buildMeetingChatMessageContent,
  countUnreadMeetingChatMessages,
  DEFAULT_MEETING_CHAT_MENTION_STATE,
  detectMeetingChatMentionState,
  getMeetingChatAvatarUrlFromMetadata,
  insertMeetingChatMention,
  type MeetingChatAttachment,
  type MeetingChatMentionState,
} from './in-site-meeting-room-chat.utils'
import { MeetingChatFloatingDock, type MeetingChatMentionCandidate } from './in-site-meeting-room-chat-sections'

type InSiteMeetingRoomChatProps = {
  compact?: boolean
}

export function InSiteMeetingRoomChat({ compact = false }: InSiteMeetingRoomChatProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const convex = useConvex()
  const { chatMessages, send, isSending } = useChat()
  const participants = useParticipants()
  const generateUploadUrl = useMutation(filesApi.generateUploadUrl)
  const [isOpen, setIsOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [lastReadAt, setLastReadAt] = useState(0)
  const [highlightedMentionIndex, setHighlightedMentionIndex] = useState(0)
  const [mentionState, setMentionState] = useState<MeetingChatMentionState>(DEFAULT_MEETING_CHAT_MENTION_STATE)
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([])
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const messageEndRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const trimmedDraft = draft.trim()
  const canSend = trimmedDraft.length > 0 || pendingAttachments.length > 0
  const unreadCount = isOpen ? 0 : countUnreadMeetingChatMessages(chatMessages, lastReadAt)
  const attachmentAccept = '.png,.jpg,.jpeg,.webp,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,.zip,.md'
  const mentionCandidates = useMemo<MeetingChatMentionCandidate[]>(() => {
    const byLabel = new Map<string, MeetingChatMentionCandidate>()

    for (const participant of participants) {
      const label = participant.name?.trim() || participant.identity?.trim()
      if (!label) {
        continue
      }

      const key = label.toLowerCase()
      if (!byLabel.has(key)) {
        byLabel.set(key, {
          avatarUrl: getMeetingChatAvatarUrlFromMetadata(participant.metadata),
          id: participant.sid,
          identity: participant.identity,
          isLocal: participant.isLocal,
          label,
        })
      }
    }

    return Array.from(byLabel.values()).sort((left, right) => {
      if (left.isLocal !== right.isLocal) {
        return left.isLocal ? 1 : -1
      }
      return left.label.localeCompare(right.label)
    })
  }, [participants])
  const mentionLabels = useMemo(() => mentionCandidates.map((candidate) => candidate.label), [mentionCandidates])
  const mentionResults = useMemo(() => {
    if (!mentionState.active) {
      return []
    }

    const normalizedQuery = mentionState.query.trim().toLowerCase()
    if (!normalizedQuery) {
      return mentionCandidates.slice(0, 8)
    }

    return mentionCandidates
      .filter((candidate) => {
        const label = candidate.label.toLowerCase()
        const identity = candidate.identity.toLowerCase()
        return label.includes(normalizedQuery) || identity.includes(normalizedQuery)
      })
      .slice(0, 8)
  }, [mentionCandidates, mentionState.active, mentionState.query])

  const resetMentionState = useCallback(() => {
    setMentionState(DEFAULT_MEETING_CHAT_MENTION_STATE)
    setHighlightedMentionIndex(0)
  }, [])

  const syncMentionStateFromValue = useCallback((nextValue: string, caretPosition: number) => {
    const nextState = detectMeetingChatMentionState(nextValue, caretPosition)
    setMentionState(nextState)
    setHighlightedMentionIndex(0)
  }, [])

  useEffect(() => {
    if (!isOpen || chatMessages.length === 0) {
      return
    }

    messageEndRef.current?.scrollIntoView({ block: 'end' })
  }, [chatMessages, isOpen])

  const handleOpen = useCallback(() => {
    setIsOpen(true)
    const latestTimestamp = chatMessages[chatMessages.length - 1]?.timestamp ?? 0
    if (latestTimestamp > 0) {
      setLastReadAt(latestTimestamp)
    }
    resetMentionState()
  }, [chatMessages, resetMentionState])

  const handleClose = useCallback(() => {
    const latestTimestamp = chatMessages[chatMessages.length - 1]?.timestamp ?? 0
    if (latestTimestamp > 0) {
      setLastReadAt(latestTimestamp)
    }
    setIsOpen(false)
    resetMentionState()
  }, [chatMessages, resetMentionState])

  const handleRemoveAttachment = useCallback((attachmentId: string) => {
    setPendingAttachments((current) => current.filter((attachment) => attachment.id !== attachmentId))
  }, [])

  const handleAttachmentSelection = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) {
      return
    }

    const result = validateAttachments(files, pendingAttachments.length, MAX_ATTACHMENTS)

    if (result.errors.length > 0) {
      toast({
        title: 'Some files couldn\'t be attached',
        description: result.errors.join('. '),
        variant: 'destructive',
      })
    }

    if (result.valid.length > 0) {
      setPendingAttachments((current) => [...current, ...result.valid])
    }

    event.target.value = ''
  }, [pendingAttachments.length, toast])

  const uploadPendingMeetingAttachments = useCallback(async (attachments: PendingAttachment[]): Promise<MeetingChatAttachment[]> => {
    if (!user?.id) {
      throw new Error('Sign in required to share files in meeting chat.')
    }

    const uploaded: MeetingChatAttachment[] = []

    for (const attachment of attachments) {
      const uploadUrlPayload = (await generateUploadUrl({})) as { url?: string }
      const uploadUrl = uploadUrlPayload?.url
      if (!uploadUrl) {
        throw new Error('Unable to create upload URL')
      }

      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': attachment.mimeType || 'application/octet-stream',
        },
        body: attachment.file,
      })

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload file (${uploadResponse.status})`)
      }

      const uploadResult = (await uploadResponse.json().catch(() => null)) as { storageId?: string } | null
      if (!uploadResult?.storageId) {
        throw new Error('Upload did not return storageId')
      }

      const publicUrl = await convex.query(filesApi.getPublicUrl, { storageId: uploadResult.storageId }) as { url?: string | null }
      if (!publicUrl?.url) {
        throw new Error('Unable to resolve uploaded file URL')
      }

      uploaded.push({
        name: attachment.name,
        size: attachment.sizeLabel,
        type: attachment.mimeType || 'application/octet-stream',
        url: publicUrl.url,
      })
    }

    return uploaded
  }, [convex, generateUploadUrl, user?.id])

  const handleSend = useCallback(async () => {
    if (!canSend) {
      return
    }

    const hasAttachments = pendingAttachments.length > 0
    if (hasAttachments) {
      setUploadingFiles(true)
    }

    try {
      let messageContent = trimmedDraft

      if (hasAttachments) {
        const uploadedAttachments = await uploadPendingMeetingAttachments(pendingAttachments)
        messageContent = buildMeetingChatMessageContent({
          attachments: uploadedAttachments,
          text: trimmedDraft,
        })
      }

      await send(messageContent)
      setDraft('')
      setPendingAttachments([])
      resetMentionState()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Message failed',
        description: error instanceof Error ? error.message : 'Unable to send the room chat message or file share.',
      })
      if (hasAttachments) {
        setUploadingFiles(false)
      }
      return
    }

    if (hasAttachments) {
      setUploadingFiles(false)
    }
  }, [canSend, pendingAttachments, resetMentionState, send, toast, trimmedDraft, uploadPendingMeetingAttachments])

  const insertSelectedMention = useCallback((candidate: MeetingChatMentionCandidate) => {
    const textarea = textareaRef.current
    if (!textarea) {
      return
    }

    const caretPosition = textarea.selectionStart ?? draft.length
    const { nextCaret, nextValue } = insertMeetingChatMention({
      caretPosition,
      currentValue: draft,
      mentionLabel: candidate.label,
      mentionState,
    })

    setDraft(nextValue)
    resetMentionState()

    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(nextCaret, nextCaret)
    })
  }, [draft, mentionState, resetMentionState])

  const handleDraftChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = event.target.value
    const caretPosition = event.target.selectionStart ?? nextValue.length
    setDraft(nextValue)
    syncMentionStateFromValue(nextValue, caretPosition)
  }, [syncMentionStateFromValue])

  const handleComposerBlur = useCallback(() => {
    resetMentionState()
  }, [resetMentionState])

  const handleMentionMouseDown = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }, [])

  const handleComposerKeyDown = useCallback((event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionState.active && mentionResults.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setHighlightedMentionIndex((current) => (current + 1) % mentionResults.length)
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setHighlightedMentionIndex((current) => (current - 1 + mentionResults.length) % mentionResults.length)
        return
      }

      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault()
        const candidate = mentionResults[highlightedMentionIndex] ?? mentionResults[0]
        if (candidate) {
          insertSelectedMention(candidate)
        }
        return
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        resetMentionState()
        return
      }
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void handleSend()
    }
  }, [handleSend, highlightedMentionIndex, insertSelectedMention, mentionResults, mentionState.active, resetMentionState])

  const panelProps = {
    attachmentAccept,
    canSend,
    chatMessages,
    draft,
    fileInputRef,
    highlightedMentionIndex,
    isSending,
    localAvatarUrl: user?.photoURL ?? null,
    maxAttachments: MAX_ATTACHMENTS,
    mentionLabels,
    mentionResults,
    messageEndRef,
    onAttachmentSelection: handleAttachmentSelection,
    onClose: handleClose,
    onComposerBlur: handleComposerBlur,
    onDraftChange: handleDraftChange,
    onKeyDown: handleComposerKeyDown,
    onMentionMouseDown: handleMentionMouseDown,
    onRemoveAttachment: handleRemoveAttachment,
    onSelectMention: insertSelectedMention,
    onSend: () => {
      void handleSend()
    },
    pendingAttachments,
    showMentionResults: mentionState.active,
    textareaRef,
    uploadingFiles,
  }

  return (
    <MeetingChatFloatingDock
      compact={compact}
      isOpen={isOpen}
      onOpen={handleOpen}
      panelProps={panelProps}
      unreadCount={unreadCount}
    />
  )
}
