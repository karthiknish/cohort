import { describe, expect, it } from 'vitest';
import type { ProposedImportTask } from './tasks-document-import-types';
import { needsImportReview } from './tasks-document-import-review';
function buildTask(overrides: Partial<ProposedImportTask>): ProposedImportTask {
    return {
        localId: '1',
        title: 'Task',
        description: '',
        priority: 'medium',
        assignedTo: '',
        assignedToUserIds: [],
        documentAssigneeNames: [],
        dueDate: '',
        assignmentStatus: 'resolved',
        dueDateStatus: 'resolved',
        dueDateHint: null,
        suggestions: [],
        sourceExcerpt: null,
        include: true,
        ...overrides,
    };
}
describe('tasks document import hybrid routing', () => {
    it('skips review when every assignee and due date is resolved', () => {
        const tasks: ProposedImportTask[] = [
            buildTask({
                localId: '1',
                assignedTo: '@[Alex Kim]',
                assignedToUserIds: ['user-alex'],
                documentAssigneeNames: ['Alex Kim'],
                dueDate: '2026-05-28',
            }),
            buildTask({
                localId: '2',
                assignmentStatus: 'unassigned',
                documentAssigneeNames: [],
                dueDateStatus: 'resolved',
            }),
        ];
        expect(needsImportReview(tasks)).toBe(false);
    });
    it('opens review when any assignee is ambiguous', () => {
        expect(needsImportReview([
            buildTask({
                assignmentStatus: 'ambiguous',
                documentAssigneeNames: ['Alex'],
                suggestions: ['Alex Kim', 'Alex Johnson'],
            }),
        ])).toBe(true);
    });
    it('opens review when assignees need profile matching', () => {
        expect(needsImportReview([
            buildTask({
                assignmentStatus: 'unassigned',
                documentAssigneeNames: ['Deepak'],
                suggestions: ['Deepak Sharma'],
            }),
        ])).toBe(true);
    });
    it('opens review when document assignees have no workspace match', () => {
        expect(needsImportReview([
            buildTask({
                assignmentStatus: 'unassigned',
                documentAssigneeNames: ['Someone New'],
                suggestions: [],
            }),
        ])).toBe(true);
    });
    it('opens review when due dates need clarification', () => {
        expect(needsImportReview([
            buildTask({
                dueDateStatus: 'unclear',
                dueDateHint: 'TBD',
            }),
        ])).toBe(true);
    });
});
