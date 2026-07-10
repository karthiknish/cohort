import { describe, expect, it } from 'vitest';
import { buildInitialFormState, mergeTaskParticipants, taskPillColors } from './task-types';
describe('task form helpers', () => {
    it('builds initial state with linked client and project context', () => {
        expect(buildInitialFormState({ id: 'client-1', name: 'Acme Labs' }, { id: 'project-1', name: 'Website Refresh' })).toMatchObject({
            clientId: 'client-1',
            clientName: 'Acme Labs',
            projectId: 'project-1',
            projectName: 'Website Refresh',
            status: 'todo',
            priority: 'medium',
            assignedTo: '',
        });
    });
    it('prefills the creator as assignee when participants are available', () => {
        expect(buildInitialFormState(undefined, undefined, {
            creatorUserId: 'user-alex',
            participants: [{ id: 'user-alex', name: 'Alex Kim' }],
        }).assignedTo).toBe('@[Alex Kim]');
    });
    it('exposes a dedicated project pill style', () => {
        expect(taskPillColors.project).toContain('bg-accent/10');
    });
    it('merges client roster members with resolved profiles for assignment', () => {
        expect(mergeTaskParticipants([
            [{ name: 'Deepak Karnan', role: 'Paid' }],
            [{ id: 'u-1', name: 'Deepak Karnan', role: 'admin', email: 'deepak@agency.com' }],
        ])).toEqual([
            { id: 'u-1', name: 'Deepak Karnan', role: 'Paid', email: 'deepak@agency.com' },
        ]);
    });
    it('dedupes repeated participants by normalized name while preserving richer data', () => {
        expect(mergeTaskParticipants([
            [{ name: 'Alex Chen', role: 'Account Manager' }],
            [{ id: 'u-3', name: ' alex chen ', role: 'admin', email: 'alex@example.com' }],
        ])).toEqual([
            { id: 'u-3', name: ' alex chen ', role: 'Account Manager', email: 'alex@example.com' },
        ]);
    });
});
