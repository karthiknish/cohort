'use client'

import { useTaskCommentsPanel } from './use-task-comments-panel'


import { reportConvexFailure } from '@/lib/handle-convex-error'
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { useConvex, useMutation, useQuery } from 'convex/react'

import { useToast } from '@/shared/ui/use-toast'
import { filesApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { isConvexRealtimeEnabled } from '@/lib/convex-realtime'
import { extractMentionsFromContent } from '@/lib/mentions'
import { uploadTaskCommentAttachment } from '@/services/task-comment-attachments'
import type { TaskComment } from '@/types/task-comments'
import { api as generatedApi } from '@convex/_generated/api'
import type { TaskParticipant } from './task-types'
import {
  TaskCommentsComposerSection,
  TaskCommentsDeleteDialog,
  TaskCommentsSummaryHeader,
  TaskCommentsThreadList,
  type TaskCommentComposerAttachment,
} from './task-comments-sections'

type TaskCommentsPanelProps = {
  taskId: string
  workspaceId: string | null
  userId: string | null
  userName: string | null
  userRole: string | null
  participants: TaskParticipant[]
  onCommentCountChange?: (count: number) => void
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '1 KB'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function buildPendingAttachments(files: FileList): TaskCommentComposerAttachment[] {
  const now = Date.now()
  return Array.from(files).map((file, index) => ({
    id: `${now}-${index}-${file.name}`,
    file,
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
    sizeLabel: formatBytes(file.size),
  }))
}

function getPreviewText(content: string | null | undefined): string {
  const normalized = String(content ?? '').replace(/\s+/g, ' ').trim()
  if (normalized.length <= 72) return normalized
  return `${normalized.slice(0, 69)}...`
}

type TaskCommentsPanelState = {
  composerValue: string
  sending: boolean
  uploading: boolean
  replyTo: TaskComment | null
  editingCommentId: string | null
  savingEdit: boolean
  pendingAttachments: TaskCommentComposerAttachment[]
  deleteTarget: TaskComment | null
  deletingCommentId: string | null
}

type TaskCommentsPanelAction =
  | { type: 'setComposerValue'; composerValue: string }
  | { type: 'setSending'; sending: boolean }
  | { type: 'setUploading'; uploading: boolean }
  | { type: 'setReplyTo'; replyTo: TaskComment | null }
  | { type: 'setEditingCommentId'; editingCommentId: string | null }
  | { type: 'setSavingEdit'; savingEdit: boolean }
  | { type: 'setPendingAttachments'; pendingAttachments: TaskCommentComposerAttachment[] }
  | { type: 'setDeleteTarget'; deleteTarget: TaskComment | null }
  | { type: 'setDeletingCommentId'; deletingCommentId: string | null }
  | { type: 'resetComposer' }
  | { type: 'startReply'; comment: TaskComment }
  | { type: 'startEdit'; comment: TaskComment }
  | { type: 'startSending' }

const INITIAL_TASK_COMMENTS_PANEL_STATE: TaskCommentsPanelState = {
  composerValue: '',
  sending: false,
  uploading: false,
  replyTo: null,
  editingCommentId: null,
  savingEdit: false,
  pendingAttachments: [],
  deleteTarget: null,
  deletingCommentId: null,
}

function taskCommentsPanelReducer(
  state: TaskCommentsPanelState,
  action: TaskCommentsPanelAction,
): TaskCommentsPanelState {
  switch (action.type) {
    case 'setComposerValue':
      return { ...state, composerValue: action.composerValue }
    case 'setSending':
      return { ...state, sending: action.sending }
    case 'setUploading':
      return { ...state, uploading: action.uploading }
    case 'setReplyTo':
      return { ...state, replyTo: action.replyTo }
    case 'setEditingCommentId':
      return { ...state, editingCommentId: action.editingCommentId }
    case 'setSavingEdit':
      return { ...state, savingEdit: action.savingEdit }
    case 'setPendingAttachments':
      return { ...state, pendingAttachments: action.pendingAttachments }
    case 'setDeleteTarget':
      return { ...state, deleteTarget: action.deleteTarget }
    case 'setDeletingCommentId':
      return { ...state, deletingCommentId: action.deletingCommentId }
    case 'resetComposer':
      return {
        ...state,
        composerValue: '',
        replyTo: null,
        editingCommentId: null,
        pendingAttachments: [],
      }
    case 'startReply':
      return {
        ...state,
        replyTo: action.comment,
        editingCommentId: null,
        composerValue: '',
        pendingAttachments: [],
      }
    case 'startEdit':
      return {
        ...state,
        editingCommentId: action.comment.id,
        replyTo: null,
        composerValue: action.comment.content,
        pendingAttachments: [],
      }
    case 'startSending':
      return {
        ...state,
        sending: true,
        uploading: true,
      }
    default:
      return state
  }
}

export function TaskCommentsPanel(props: TaskCommentsPanelProps) {
  return useTaskCommentsPanel(props)
}
