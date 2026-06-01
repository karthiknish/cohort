import { describe, expect, it } from 'vitest';
import type { TaskComment } from '@/types/task-comments';
import { INITIAL_TASK_COMMENTS_PANEL_STATE, taskCommentsPanelReducer, } from './use-task-comments-panel';
const comment: TaskComment = {
    id: 'comment-1',
    taskId: 'task-1',
    content: 'Parent comment',
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
};
describe('taskCommentsPanelReducer', () => {
    it('starts a reply and clears edit/composer state', () => {
        const editing = taskCommentsPanelReducer({ ...INITIAL_TASK_COMMENTS_PANEL_STATE, composerValue: 'draft', editingCommentId: 'comment-9' }, { type: 'startReply', comment });
        expect(editing.replyTo).toBe(comment);
        expect(editing.editingCommentId).toBeNull();
        expect(editing.composerValue).toBe('');
        expect(editing.pendingAttachments).toEqual([]);
    });
    it('starts edit mode from the selected comment', () => {
        const next = taskCommentsPanelReducer(INITIAL_TASK_COMMENTS_PANEL_STATE, {
            type: 'startEdit',
            comment,
        });
        expect(next.editingCommentId).toBe('comment-1');
        expect(next.composerValue).toBe('Parent comment');
        expect(next.replyTo).toBeNull();
        expect(next.pendingAttachments).toEqual([]);
    });
    it('resets composer fields after send', () => {
        const busy = {
            ...INITIAL_TASK_COMMENTS_PANEL_STATE,
            composerValue: 'Posted',
            replyTo: comment,
            pendingAttachments: [
                {
                    id: 'file-1',
                    file: new File(['hello'], 'hello.txt', { type: 'text/plain' }),
                    name: 'hello.txt',
                    mimeType: 'text/plain',
                    sizeLabel: '1 KB',
                },
            ],
        };
        const next = taskCommentsPanelReducer(busy, { type: 'resetComposer' });
        expect(next.composerValue).toBe('');
        expect(next.replyTo).toBeNull();
        expect(next.editingCommentId).toBeNull();
        expect(next.pendingAttachments).toEqual([]);
    });
});
