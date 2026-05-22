import { describe, expect, it } from 'vitest'

import type { ProposedImportTask } from './tasks-document-import-types'
import {
  buildImportReviewDescription,
  getImportReviewBlocker,
  needsImportReview,
  taskNeedsDueDateReview,
} from './tasks-document-import-review'

function buildTask(overrides: Partial<ProposedImportTask>): ProposedImportTask {
  return {
    localId: '1',
    title: 'Task',
    description: '',
    priority: 'medium',
    assignedTo: '',
    dueDate: '',
    assignmentStatus: 'resolved',
    dueDateStatus: 'resolved',
    dueDateHint: null,
    suggestions: [],
    sourceExcerpt: null,
    include: true,
    ...overrides,
  }
}

describe('tasks document import review helpers', () => {
  it('opens review when due dates are missing or unclear', () => {
    expect(
      needsImportReview([
        buildTask({ dueDateStatus: 'missing' }),
        buildTask({ localId: '2', dueDateStatus: 'resolved' }),
      ]),
    ).toBe(true)
  })

  it('blocks confirm until unclear due dates are filled in', () => {
    expect(
      getImportReviewBlocker([
        buildTask({ dueDateStatus: 'unclear', dueDateHint: 'next week' }),
      ]),
    ).toBe('Add due dates for 1 task.')
  })

  it('clears blockers after the user sets a due date', () => {
    expect(
      getImportReviewBlocker([
        buildTask({
          dueDateStatus: 'resolved',
          dueDate: '2026-05-28',
        }),
      ]),
    ).toBeNull()
  })

  it('describes due-date review in the sheet copy', () => {
    expect(
      buildImportReviewDescription(null, [buildTask({ dueDateStatus: 'missing' })]),
    ).toContain('due dates were missing or unclear')
  })

  it('detects due-date review tasks', () => {
    expect(taskNeedsDueDateReview(buildTask({ dueDateStatus: 'unclear' }))).toBe(true)
    expect(taskNeedsDueDateReview(buildTask({ dueDateStatus: 'resolved' }))).toBe(false)
  })
})
