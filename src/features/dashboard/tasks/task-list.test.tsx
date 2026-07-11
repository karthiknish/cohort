import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { TaskRecord } from '@/types/tasks';
import { TaskList } from './task-list';
vi.mock('next/link', () => ({
    default: ({ children, href }: {
        children: ReactNode;
        href: string;
    }) => <a href={href}>{children}</a>,
}));
vi.mock('./task-view-dialog', () => ({
    TaskViewDialog: () => null,
}));

vi.mock('./task-data-table', () => ({
    TaskDataTable: ({ tasks }: {
        tasks: TaskRecord[];
    }) => (<div>TaskDataTable:{tasks.map((task) => task.title).join(',')}</div>),
}));
const task: TaskRecord = {
    id: 'task-1',
    title: 'Review launch brief',
    description: 'Check timeline and owner list.',
    status: 'todo',
    priority: 'high',
    assignedTo: ['Alex Kim'],
    clientId: 'client-1',
    client: 'Acme Corp',
    projectId: 'project-1',
    projectName: 'Spring Launch',
    dueDate: '2026-03-20',
};
const baseProps = {
    tasks: [task],
    loading: false,
    initialLoading: false,
    error: null,
    pendingStatusUpdates: new Set<string>(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onQuickStatusChange: vi.fn(),
    onRefresh: vi.fn(),
    loadingMore: false,
    hasMore: false,
    onLoadMore: vi.fn(),
    emptyStateMessage: 'No tasks',
    showEmptyStateFiltered: false,
};
describe('TaskList', () => {
    it('renders the list view with TaskDataTable', () => {
        const markup = renderToStaticMarkup(<TaskList {...baseProps}/>);
        expect(markup).toContain('TaskDataTable:Review launch brief');
    });
    it('does not use role="button" wrappers', () => {
        const markup = renderToStaticMarkup(<TaskList {...baseProps}/>);
        expect(markup).not.toContain('role="button"');
    });
});
