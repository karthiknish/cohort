import { describe, expect, it } from 'vitest';
import type { ProposedImportTask } from './tasks-document-import-types';
import { buildAssigneeReviewPrompt, buildImportReviewDescription, getImportReviewBlocker, needsImportReview, taskNeedsAssigneeReview, } from './tasks-document-import-review';
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
describe('tasks document import review helpers', () => {
    it('opens review when assignees need workspace matching', () => {
        expect(needsImportReview([
            buildTask({
                assignmentStatus: 'unassigned',
                documentAssigneeNames: ['Deepak'],
                suggestions: ['Deepak Karnan'],
            }),
        ])).toBe(true);
    });
    it('opens review when document assignees cannot be matched at all', () => {
        expect(needsImportReview([
            buildTask({
                assignmentStatus: 'unassigned',
                documentAssigneeNames: ['Unknown Person'],
                suggestions: [],
            }),
        ])).toBe(true);
    });
    it('blocks confirm until ambiguous assignees are cleared', () => {
        expect(getImportReviewBlocker([
            buildTask({
                assignmentStatus: 'ambiguous',
                documentAssigneeNames: ['Deepak'],
                suggestions: ['Deepak Sharma', 'Deepak Singh'],
                assignedToUserIds: ['user-deepak'],
            }),
        ])).toContain('matched multiple teammates');
    });
    it('blocks confirm until workspace teammates are selected', () => {
        expect(getImportReviewBlocker([
            buildTask({
                assignmentStatus: 'unassigned',
                documentAssigneeNames: ['Deepak'],
                suggestions: ['Deepak Karnan'],
                assignedToUserIds: [],
            }),
        ])).toBe('Pick workspace teammates for 1 task.');
    });
    it('describes unmatched roster suggestions in the assignee prompt', () => {
        expect(buildAssigneeReviewPrompt(buildTask({
            assignmentStatus: 'unassigned',
            documentAssigneeNames: ['Deepak'],
            suggestions: ['Deepak Karnan'],
        }))).toContain('workspace profile');
    });
    it('blocks free-text assignees that are not workspace members', () => {
        expect(getImportReviewBlocker([
            buildTask({
                assignedTo: '@[Random Person]',
                assignedToUserIds: [],
                assignmentStatus: 'resolved',
            }),
        ])).toBe('Use the teammate picker for 1 task — free-text assignees are not allowed.');
    });
    it('clears blockers after valid workspace user ids are set', () => {
        expect(getImportReviewBlocker([
            buildTask({
                assignedTo: '@[Deepak Sharma]',
                assignedToUserIds: ['user-deepak'],
                assignmentStatus: 'resolved',
            }),
        ])).toBeNull();
    });
    it('describes assignee review in the sheet copy', () => {
        expect(buildImportReviewDescription(null, [
            buildTask({ assignmentStatus: 'ambiguous', documentAssigneeNames: ['Deepak'] }),
        ])).toContain('unclear');
    });
    it('builds a prompt when a document name matches multiple teammates', () => {
        expect(buildAssigneeReviewPrompt(buildTask({
            assignmentStatus: 'ambiguous',
            documentAssigneeNames: ['Deepak'],
            suggestions: ['Deepak Sharma', 'Deepak Singh'],
        }))).toContain('multiple teammates');
    });
    it('requires resolved tasks with suggestions to pick a teammate', () => {
        expect(taskNeedsAssigneeReview(buildTask({
            assignmentStatus: 'resolved',
            assignedToUserIds: [],
            suggestions: ['Deepak Sharma'],
        }))).toBe(true);
    });
});
