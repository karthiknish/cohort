import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import type { TaskRecord } from '@/types/tasks'

import { TaskCardHeaderSection, TaskCardInfoPanels, TaskCardPriorityBadge } from './task-card-sections'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
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
  attachments: [{ name: 'brief.pdf', url: 'https://example.com/brief.pdf', type: 'application/pdf', size: '42' }],
  commentCount: 2,
  subtaskCount: 3,
  timeSpentMinutes: 45,
  sharedWith: ['u-2'],
}

describe('task card sections', () => {
  it('renders the header context and indicators', () => {
    const markup = renderToStaticMarkup(
      <TaskCardHeaderSection
        task={task}
        isPendingUpdate={false}
        onOpen={vi.fn()}
        searchQuery=""
        highlightMatch={(text) => text}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onQuickStatusChange={vi.fn()}
        onClone={vi.fn()}
        onShare={vi.fn()}
      />,
    )

    expect(markup).toContain('Review launch brief')
    expect(markup).toContain('View task Review launch brief')
    expect(markup).toContain('Acme Corp')
    expect(markup).toContain('Spring Launch')
    expect(markup).toContain('Task actions')
  })

  it('renders the priority badge and info panels', () => {
    const markup = renderToStaticMarkup(
      <>
        <TaskCardPriorityBadge priority="high" />
        <TaskCardInfoPanels task={task} overdue={false} dueSoon={true} />
      </>,
    )

    expect(markup).toContain('High')
    expect(markup).toContain('Alex Kim')
    expect(markup).toContain('Due date')
  })
})
