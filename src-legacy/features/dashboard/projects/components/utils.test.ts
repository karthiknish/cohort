import { describe, expect, it } from 'vitest';
import type { ProjectRecord } from '@/types/projects';
import { buildTaskCountsByProject, extractPaginatedItems, filterProjectsByQuery, mergeProjectTaskCounts, projectMatchesContext, projectMatchesQuery, } from './utils';
const PROJECT: ProjectRecord = {
    id: 'project-1',
    name: 'Website Redesign',
    description: 'Refresh landing pages and improve conversion flows.',
    status: 'active',
    clientId: 'client-1',
    clientName: 'Acme Labs',
    startDate: null,
    endDate: null,
    tags: ['design', 'conversion'],
    ownerId: null,
    createdAt: null,
    updatedAt: null,
    taskCount: 4,
    openTaskCount: 2,
    recentActivityAt: null,
};
describe('project search helpers', () => {
    it('matches client names and tags in addition to project text', () => {
        expect(projectMatchesQuery(PROJECT, 'acme')).toBe(true);
        expect(projectMatchesQuery(PROJECT, 'conversion')).toBe(true);
        expect(projectMatchesQuery(PROJECT, 'redesign')).toBe(true);
    });
    it('returns all projects when the query is empty', () => {
        expect(filterProjectsByQuery([PROJECT], '')).toEqual([PROJECT]);
        expect(filterProjectsByQuery([PROJECT], '   ')).toEqual([PROJECT]);
    });
    it('filters out non-matching projects', () => {
        const otherProject = { ...PROJECT, id: 'project-2', name: 'Paid Social Sprint', clientName: 'Beta Co', tags: ['ads'] };
        expect(filterProjectsByQuery([PROJECT, otherProject], 'acme')).toEqual([PROJECT]);
    });
    it('matches incoming project context by id or name', () => {
        expect(projectMatchesContext(PROJECT, 'project-1', null)).toBe(true);
        expect(projectMatchesContext(PROJECT, null, 'website redesign')).toBe(true);
        expect(projectMatchesContext(PROJECT, 'project-2', 'paid social sprint')).toBe(false);
    });
});
describe('extractPaginatedItems', () => {
    it('returns bare arrays unchanged', () => {
        expect(extractPaginatedItems([{ id: 'a' }])).toEqual([{ id: 'a' }]);
    });
    it('unwraps paginated { items } payloads', () => {
        expect(extractPaginatedItems({ items: [{ id: 'b' }], nextCursor: 'c1' })).toEqual([{ id: 'b' }]);
    });
    it('returns an empty array for invalid shapes', () => {
        expect(extractPaginatedItems(null)).toEqual([]);
        expect(extractPaginatedItems({ nextCursor: 'c1' })).toEqual([]);
    });
});
describe('buildTaskCountsByProject', () => {
    it('counts total and open tasks per project', () => {
        const counts = buildTaskCountsByProject([
            { projectId: 'p1', status: 'todo' },
            { projectId: 'p1', status: 'done' },
            { projectId: 'p1', status: 'in-progress' },
            { projectId: 'p2', status: 'done' },
            { projectId: null, status: 'todo' },
        ]);
        expect(counts).toEqual({
            p1: { taskCount: 3, openTaskCount: 2 },
            p2: { taskCount: 1, openTaskCount: 0 },
        });
    });
    it('merges counts onto project records', () => {
        const merged = mergeProjectTaskCounts(PROJECT, {
            'project-1': { taskCount: 9, openTaskCount: 4 },
        });
        expect(merged.taskCount).toBe(9);
        expect(merged.openTaskCount).toBe(4);
    });
});
