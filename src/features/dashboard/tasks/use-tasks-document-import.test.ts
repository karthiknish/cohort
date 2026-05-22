import { describe, expect, it } from 'vitest'

import type { ProposedImportTask } from './tasks-document-import-types'

function needsImportReview(tasks: ProposedImportTask[]): boolean {
  return tasks.some((task) => task.assignmentStatus === 'ambiguous')
}

describe('tasks document import hybrid routing', () => {
  it('skips review when every assignee is resolved or unassigned', () => {
    const tasks: ProposedImportTask[] = [
      {
        localId: '1',
        title: 'Task A',
        description: '',
        priority: 'medium',
        assignedTo: '@[Alex]',
        dueDate: '',
        assignmentStatus: 'resolved',
        suggestions: [],
        sourceExcerpt: null,
        include: true,
      },
      {
        localId: '2',
        title: 'Task B',
        description: '',
        priority: 'low',
        assignedTo: '',
        dueDate: '',
        assignmentStatus: 'unassigned',
        suggestions: [],
        sourceExcerpt: null,
        include: true,
      },
    ]

    expect(needsImportReview(tasks)).toBe(false)
  })

  it('opens review when any assignee is ambiguous', () => {
    const tasks: ProposedImportTask[] = [
      {
        localId: '1',
        title: 'Task A',
        description: '',
        priority: 'medium',
        assignedTo: '',
        dueDate: '',
        assignmentStatus: 'ambiguous',
        suggestions: ['Alex Kim', 'Alex Johnson'],
        sourceExcerpt: null,
        include: true,
      },
    ]

    expect(needsImportReview(tasks)).toBe(true)
  })
})
