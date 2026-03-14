import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

import type { TaskRecord } from '@/types/tasks'

import { TaskList } from './task-list'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

vi.mock('./task-view-dialog', () => ({
  TaskViewDialog: () => null,
}))

vi.mock('./task-card', () => ({
  TaskCard: ({ task }: { task: TaskRecord }) => <div>TaskCard:{task.title}</div>,
}))

vi.mock('./task-row', () => ({
  TaskRow: ({ task }: { task: TaskRecord }) => <div>TaskRow:{task.title}</div>,
}))

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
}

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
}

describe('TaskList', () => {
  it('renders semantic open buttons instead of wrapper role buttons in both views', () => {
    const markup = renderToStaticMarkup(
      <>
        <TaskList {...baseProps} viewMode="grid" />
        <TaskList {...baseProps} viewMode="list" />
      </>,
    )

    expect(markup).toContain('TaskCard:Review launch brief')
    expect(markup).toContain('TaskRow:Review launch brief')
    expect(markup).not.toContain('role="button"')
  })
})
