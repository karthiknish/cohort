'use client'

import { useInSiteMeetingRoomChat } from './use-in-site-meeting-room-chat'


import { notifyFailure } from '@/lib/notifications'
import { reportConvexFailure } from '@/lib/handle-convex-error'
import { useCallback, useEffect, useMemo, useReducer, useRef, type ChangeEvent, type KeyboardEvent, type MouseEvent } from 'react'

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

type MeetingChatState = {
  isOpen: boolean
  draft: string
  lastReadAt: number
  highlightedMentionIndex: number
  mentionState: MeetingChatMentionState
  pendingAttachments: PendingAttachment[]
  uploadingFiles: boolean
}

type MeetingChatAction =
  | { type: 'open'; latestTimestamp: number }
  | { type: 'close'; latestTimestamp: number }
  | { type: 'setDraft'; value: string }
  | { type: 'syncMentionState'; value: MeetingChatMentionState }
  | { type: 'resetMentionState' }
  | { type: 'setHighlightedMentionIndex'; value: number | ((current: number) => number) }
  | { type: 'addAttachments'; attachments: PendingAttachment[] }
  | { type: 'removeAttachment'; attachmentId: string }
  | { type: 'clearComposer' }
  | { type: 'setUploadingFiles'; value: boolean }

function createInitialMeetingChatState(): MeetingChatState {
  return {
    isOpen: false,
    draft: '',
    lastReadAt: 0,
    highlightedMentionIndex: 0,
    mentionState: DEFAULT_MEETING_CHAT_MENTION_STATE,
    pendingAttachments: [],
    uploadingFiles: false,
  }
}

function meetingChatReducer(state: MeetingChatState, action: MeetingChatAction): MeetingChatState {
  switch (action.type) {
    case 'open':
      return {
        ...state,
        isOpen: true,
        lastReadAt: action.latestTimestamp > 0 ? action.latestTimestamp : state.lastReadAt,
        mentionState: DEFAULT_MEETING_CHAT_MENTION_STATE,
        highlightedMentionIndex: 0,
      }
    case 'close':
      return {
        ...state,
        isOpen: false,
        lastReadAt: action.latestTimestamp > 0 ? action.latestTimestamp : state.lastReadAt,
        mentionState: DEFAULT_MEETING_CHAT_MENTION_STATE,
        highlightedMentionIndex: 0,
      }
    case 'setDraft':
      return { ...state, draft: action.value }
    case 'syncMentionState':
      return { ...state, mentionState: action.value, highlightedMentionIndex: 0 }
    case 'resetMentionState':
      return {
        ...state,
        mentionState: DEFAULT_MEETING_CHAT_MENTION_STATE,
        highlightedMentionIndex: 0,
      }
    case 'setHighlightedMentionIndex':
      return {
        ...state,
        highlightedMentionIndex:
          typeof action.value === 'function'
            ? action.value(state.highlightedMentionIndex)
            : action.value,
      }
    case 'addAttachments':
      return { ...state, pendingAttachments: [...state.pendingAttachments, ...action.attachments] }
    case 'removeAttachment':
      return {
        ...state,
        pendingAttachments: state.pendingAttachments.filter(
          (attachment) => attachment.id !== action.attachmentId
        ),
      }
    case 'clearComposer':
      return {
        ...state,
        draft: '',
        pendingAttachments: [],
        mentionState: DEFAULT_MEETING_CHAT_MENTION_STATE,
        highlightedMentionIndex: 0,
      }
    case 'setUploadingFiles':
      return { ...state, uploadingFiles: action.value }
    default:
      return state
  }
}

export function InSiteMeetingRoomChat(props: InSiteMeetingRoomChatProps) {
  return useInSiteMeetingRoomChat(props)
}
