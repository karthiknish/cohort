import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { TaskRecord } from '@/types/tasks';

vi.mock('./task-data-table', () => ({
    TaskDataTable: ({ tasks, loading }: {
        tasks: TaskRecord[];
        loading?: boolean;
    }) => (loading ? <div className="animate-pulse">Loading rows…</div> : <div>TaskDataTable:{tasks.map((task) => task.title).join(',')}</div>),
}));
import { TaskListEmptyState, TaskListErrorState, TaskListItems, TaskListLoadMore, TaskListLoadingState, } from './task-list-sections';
const task: TaskRecord = {
    id: 'task-1',
    title: 'Review launch brief',
    description: 'Check timeline',
    status: 'todo',
    priority: 'medium',
    assignedTo: [],
    createdAt: '2026-03-01',
    updatedAt: '2026-03-10',
};
describe('task list sections', () => {
    it('renders loading, error, empty, and load-more states', () => {
        const markup = renderToStaticMarkup(<>
        <TaskListLoadingState />
        <TaskListErrorState error="Failed to load" loading={false} onRefresh={vi.fn()}/>
        <TaskListEmptyState emptyStateMessage="Nothing here" showEmptyStateFiltered={false}/>
        <TaskListLoadMore loadingMore={true} onLoadMore={vi.fn()}/>
      </>);
        expect(markup).toContain('animate-pulse');
        expect(markup).toContain('Failed to load');
        expect(markup).toContain('No tasks');
        expect(markup).toContain('Loading…');
    });
    it('renders task items in list mode', () => {
        const markup = renderToStaticMarkup(<>
        <TaskListItems onDelete={vi.fn()} onEdit={vi.fn()} onOpen={vi.fn()} onQuickStatusChange={vi.fn()} pendingStatusUpdates={new Set()} tasks={[task]}/>
      </>);
        expect(markup).toContain('TaskDataTable:Review launch brief');
    });
});
