import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

import type { TaskRecord } from '@/types/tasks'

vi.mock('./task-card', () => ({
  TaskCard: ({ task }: { task: TaskRecord }) => <div>TaskCard:{task.title}</div>,
}))

vi.mock('./task-row', () => ({
  TaskRow: ({ task }: { task: TaskRecord }) => <div>TaskRow:{task.title}</div>,
}))

import {
  TaskListEmptyState,
  TaskListErrorState,
  TaskListItems,
  TaskListLoadMore,
  TaskListLoadingState,
} from './task-list-sections'

const task: TaskRecord = {
  id: 'task-1',
  title: 'Review launch brief',
  description: 'Check timeline',
  status: 'todo',
  priority: 'medium',
  assignedTo: [],
  createdAt: '2026-03-01',
  updatedAt: '2026-03-10',
}

describe('task list sections', () => {
  it('renders loading, error, empty, and load-more states', () => {
    const markup = renderToStaticMarkup(
      <>
        <TaskListLoadingState viewMode="grid" />
        <TaskListErrorState error="Failed to load" loading={false} onRefresh={vi.fn()} viewMode="list" />
        <TaskListEmptyState emptyStateMessage="Nothing here" showEmptyStateFiltered={false} viewMode="grid" />
        <TaskListLoadMore loadingMore={true} onLoadMore={vi.fn()} viewMode="list" />
      </>,
    )

    expect(markup).toContain('skeleton-shimmer')
    expect(markup).toContain('Failed to load')
    expect(markup).toContain('No tasks found')
    expect(markup).toContain('Loading…')
  })

  it('renders task items in grid and list modes', () => {
    const markup = renderToStaticMarkup(
      <>
        <TaskListItems
          onDelete={vi.fn()}
          onEdit={vi.fn()}
          onOpen={vi.fn()}
          onQuickStatusChange={vi.fn()}
          pendingStatusUpdates={new Set()}
          tasks={[task]}
          viewMode="grid"
        />
        <TaskListItems
          onDelete={vi.fn()}
          onEdit={vi.fn()}
          onOpen={vi.fn()}
          onQuickStatusChange={vi.fn()}
          pendingStatusUpdates={new Set()}
          tasks={[task]}
          viewMode="list"
        />
      </>,
    )

    expect(markup).toContain('TaskCard:Review launch brief')
    expect(markup).toContain('TaskRow:Review launch brief')
  })
})