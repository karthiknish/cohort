'use client'

import { useCollaborationMessagePane } from './use-collaboration-message-pane'

'use no memo'

import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import type { ChangeEvent, ClipboardEvent, DragEvent, RefObject } from 'react'

import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { useToast } from '@/shared/ui/use-toast'
import { TaskCreationModal } from '@/features/dashboard/tasks/task-creation-modal'
import type { ClientTeamMember } from '@/types/clients'
import type { CollaborationMessage } from '@/types/collaboration'
import type { TaskRecord } from '@/types/tasks'

import type { PendingAttachment } from '../hooks'
import type { Channel } from '../types'
import {
  groupMessages,
} from '../utils'

import {
  EmptyChannelState,
  MessagePaneHeader,
  MessageSearchBar,
} from './message-pane-parts'
import { MessageComposer } from './message-composer'
import { 
  CollaborationMessageViewport,
  type CollaborationFlattenedMessageItem,
} from './message-pane-sections'

const MAX_PREVIEW_LENGTH = 80

type MessagePaneState = {
  editingMessageId: string | null
  editingValue: string
  replyingToMessage: CollaborationMessage | null
  expandedThreadIds: Record<string, boolean>
  confirmingDeleteMessageId: string | null
  taskCreationModalOpen: boolean
  selectedMessageForTask: CollaborationMessage | null
}

type MessagePaneAction =
  | { type: 'start-edit'; message: CollaborationMessage }
  | { type: 'set-editing-value'; value: string }
  | { type: 'clear-edit' }
  | { type: 'set-reply-target'; message: CollaborationMessage | null }
  | { type: 'toggle-thread'; threadRootId: string }
  | { type: 'reset-threads' }
  | { type: 'open-delete-confirmation'; messageId: string }
  | { type: 'close-delete-confirmation' }
  | { type: 'open-task-modal'; message: CollaborationMessage }
  | { type: 'close-task-modal' }

const INITIAL_MESSAGE_PANE_STATE: MessagePaneState = {
  editingMessageId: null,
  editingValue: '',
  replyingToMessage: null,
  expandedThreadIds: {},
  confirmingDeleteMessageId: null,
  taskCreationModalOpen: false,
  selectedMessageForTask: null,
}

function toggleExpandedThreadIds(expandedThreadIds: Record<string, boolean>, threadRootId: string) {
  const next = { ...expandedThreadIds }

  if (next[threadRootId]) {
    delete next[threadRootId]
    return next
  }

  next[threadRootId] = true
  return next
}

function messagePaneReducer(state: MessagePaneState, action: MessagePaneAction): MessagePaneState {
  switch (action.type) {
    case 'start-edit':
      return {
        ...state,
        editingMessageId: action.message.id,
        editingValue: action.message.content ?? '',
      }
    case 'set-editing-value':
      return {
        ...state,
        editingValue: action.value,
      }
    case 'clear-edit':
      return {
        ...state,
        editingMessageId: null,
        editingValue: '',
      }
    case 'set-reply-target':
      return {
        ...state,
        replyingToMessage: action.message,
      }
    case 'toggle-thread':
      return {
        ...state,
        expandedThreadIds: toggleExpandedThreadIds(state.expandedThreadIds, action.threadRootId),
      }
    case 'reset-threads':
      return {
        ...state,
        expandedThreadIds: {},
      }
    case 'open-delete-confirmation':
      return {
        ...state,
        confirmingDeleteMessageId: action.messageId,
        editingMessageId: state.editingMessageId === action.messageId ? null : state.editingMessageId,
        editingValue: state.editingMessageId === action.messageId ? '' : state.editingValue,
      }
    case 'close-delete-confirmation':
      return {
        ...state,
        confirmingDeleteMessageId: null,
      }
    case 'open-task-modal':
      return {
        ...state,
        taskCreationModalOpen: true,
        selectedMessageForTask: action.message,
      }
    case 'close-task-modal':
      return {
        ...state,
        taskCreationModalOpen: false,
        selectedMessageForTask: null,
      }
    default:
      return state
  }
}

export interface CollaborationMessagePaneProps {
  channel: Channel | null
  channelMessages: CollaborationMessage[]
  visibleMessages: CollaborationMessage[]
  channelParticipants: ClientTeamMember[]
  messagesError: string | null
  onRetryMessages?: () => void
  messagesRetrying?: boolean
  isLoading: boolean
  onLoadMore?: () => void
  canLoadMore?: boolean
  loadingMore?: boolean
  messageInput: string
  onMessageInputChange: (value: string) => void
  messageSearchQuery: string
  onMessageSearchChange: (value: string) => void
  onSendMessage: (options?: { parentMessageId?: string }) => void
  sending: boolean
  isSendDisabled: boolean
  pendingAttachments: PendingAttachment[]
  onAddAttachments: (files: FileList | File[]) => void
  onRemoveAttachment: (attachmentId: string) => void
  uploading: boolean
  typingParticipants: { name: string; role?: string | null }[]
  onComposerFocus: () => void
  onComposerBlur: () => void
  onEditMessage: (messageId: string, nextContent: string) => void
  onDeleteMessage: (messageId: string) => void
  onToggleReaction: (messageId: string, emoji: string) => void
  messageUpdatingId: string | null
  messageDeletingId: string | null
  messagesEndRef: RefObject<HTMLDivElement | null>
  currentUserId?: string | null
  currentUserRole?: string | null
  threadMessagesByRootId: Record<string, CollaborationMessage[]>
  threadNextCursorByRootId: Record<string, string | null>
  threadLoadingByRootId: Record<string, boolean>
  threadErrorsByRootId: Record<string, string | null>
  onLoadThreadReplies: (threadRootId: string) => Promise<void> | void
  onLoadMoreThreadReplies: (threadRootId: string) => Promise<void> | void
  onClearThreadReplies: (threadRootId?: string) => void
  reactionPendingByMessage: Record<string, string | null>
}

export function CollaborationMessagePane(props: CollaborationMessagePaneProps) {
  return useCollaborationMessagePane(props)
}
