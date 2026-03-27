import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import type { TaskComment } from '@/types/task-comments'

import { TaskCommentsSummaryHeader, TaskCommentsThreadList } from './task-comments-sections'

const rootComment: TaskComment = {
  id: 'comment-1',
  taskId: 'task-1',
  content: 'Root discussion item',
  format: 'markdown',
  authorId: 'user-1',
  authorName: 'Alex Kim',
  authorRole: 'PM',
  createdAt: '2026-03-11T10:00:00.000Z',
  updatedAt: '2026-03-11T10:00:00.000Z',
  isEdited: false,
  isDeleted: false,
  deletedAt: null,
  deletedBy: null,
  attachments: [],
  mentions: [],
  parentCommentId: null,
  threadRootId: null,
}

const replyComment: TaskComment = {
  ...rootComment,
  id: 'comment-2',
  content: 'Follow-up reply',
  parentCommentId: 'comment-1',
  threadRootId: 'comment-1',
}

const canManageComment = () => true

describe('task comment sections', () => {
  it('renders the summary header state', () => {
    const markup = renderToStaticMarkup(
      <TaskCommentsSummaryHeader
        commentsCount={2}
        replyCount={1}
        replyTo={rootComment}
        editingCommentId={null}
      />,
    )

    expect(markup).toContain('Conversation')
    expect(markup).toContain('2 comments')
    expect(markup).toContain('Thread reply')
  })

  it('renders threaded comment cards', () => {
    const markup = renderToStaticMarkup(
      <TaskCommentsThreadList
        loading={false}
        roots={[rootComment]}
        repliesByParent={new Map([['comment-1', [replyComment]]])}
        replyToId={null}
        editingCommentId={null}
        deletingCommentId={null}
        canManageComment={canManageComment}
        onStartReply={vi.fn()}
        onStartEdit={vi.fn()}
        onRequestDelete={vi.fn()}
      />,
    )

    expect(markup).toContain('Alex Kim')
    expect(markup).toContain('Root discussion item')
    expect(markup).toContain('1 reply')
    expect(markup).toContain('Follow-up reply')
  })
})