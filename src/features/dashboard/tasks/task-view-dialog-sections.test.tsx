import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

import type { TaskRecord } from '@/types/tasks'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

vi.mock('@/shared/ui/dialog', () => ({
  DialogDescription: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/shared/ui/tabs', () => ({
  TabsContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: ReactNode }) => <button type="button">{children}</button>,
}))

vi.mock('./task-comments', () => ({
  TaskCommentsPanel: () => <div>TaskCommentsPanel</div>,
}))

import {
  TaskViewCommentsTab,
  TaskViewDetailsTab,
  TaskViewDialogFooter,
  TaskViewDialogHeader,
  TaskViewDialogTabsList,
  type TaskDetailItem,
} from './task-view-dialog-sections'

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
  createdAt: '2026-03-01',
  updatedAt: '2026-03-10',
  attachments: [{ url: 'https://example.com/file.pdf', name: 'Brief.pdf', type: 'pdf', size: '2 MB' }],
}

const detailItems: TaskDetailItem[] = [
  { label: 'Assignee', value: 'Alex Kim', icon: vi.fn() as never },
]

describe('task view dialog sections', () => {
  it('renders the header, tabs list, and footer', () => {
    const markup = renderToStaticMarkup(
      <>
        <TaskViewDialogHeader title="Review launch brief" summary="Todo • High priority" />
        <TaskViewDialogTabsList commentCount={3} />
        <TaskViewDialogFooter onClose={vi.fn()} />
      </>,
    )

    expect(markup).toContain('Review launch brief')
    expect(markup).toContain('Todo • High priority')
    expect(markup).toContain('Comments')
    expect(markup).toContain('3')
    expect(markup).toContain('Close')
  })

  it('renders the details and comments tabs', () => {
    const Icon = () => <span>Icon</span>
    const markup = renderToStaticMarkup(
      <>
        <TaskViewDetailsTab detailItems={[{ ...detailItems[0], icon: Icon }]} task={task} />
        <TaskViewCommentsTab
          commentCount={2}
          onCommentCountChange={vi.fn()}
          participants={[]}
          sourceCommentCount={0}
          taskId="task-1"
          userId={null}
          userName={null}
          userRole={null}
          workspaceId={null}
        />
      </>,
    )

    expect(markup).toContain('Description')
    expect(markup).toContain('Linked Project')
    expect(markup).toContain('Brief.pdf')
    expect(markup).toContain('Download')
    expect(markup).toContain('2 comments')
    expect(markup).toContain('TaskCommentsPanel')
  })
})