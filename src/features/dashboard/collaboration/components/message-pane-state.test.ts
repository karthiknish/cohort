import { describe, expect, it } from 'vitest'

import type { CollaborationMessage } from '@/types/collaboration'

import {
  INITIAL_MESSAGE_PANE_STATE,
  messagePaneReducer,
} from './message-pane-state'

const message: CollaborationMessage = {
  id: 'message-1',
  channelType: 'client',
  clientId: 'client-1',
  projectId: null,
  content: 'Original text',
  senderId: 'user-1',
  senderName: 'Alex',
  createdAt: '2026-03-11T10:00:00.000Z',
  updatedAt: '2026-03-11T10:00:00.000Z',
  isEdited: false,
  deletedAt: null,
  deletedBy: null,
  isDeleted: false,
  attachments: [],
  reactions: [],
  threadRootId: null,
  parentMessageId: null,
}

describe('messagePaneReducer', () => {
  it('enters edit mode with the selected message content', () => {
    const next = messagePaneReducer(INITIAL_MESSAGE_PANE_STATE, {
      type: 'start-edit',
      message,
    })

    expect(next.editingMessageId).toBe('message-1')
    expect(next.editingValue).toBe('Original text')
  })

  it('toggles thread expansion on and off', () => {
    const expanded = messagePaneReducer(INITIAL_MESSAGE_PANE_STATE, {
      type: 'toggle-thread',
      threadRootId: 'thread-1',
    })

    expect(expanded.expandedThreadIds).toEqual({ 'thread-1': true })

    const collapsed = messagePaneReducer(expanded, {
      type: 'toggle-thread',
      threadRootId: 'thread-1',
    })

    expect(collapsed.expandedThreadIds).toEqual({})
  })

  it('sets a reply target without clearing edit state', () => {
    const editing = messagePaneReducer(INITIAL_MESSAGE_PANE_STATE, {
      type: 'start-edit',
      message,
    })

    const replying = messagePaneReducer(editing, {
      type: 'set-reply-target',
      message,
    })

    expect(replying.replyingToMessage).toBe(message)
    expect(replying.editingMessageId).toBe('message-1')
  })
})
