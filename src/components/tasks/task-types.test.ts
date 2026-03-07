import { describe, expect, it } from 'vitest'

import { buildInitialFormState, taskPillColors } from './task-types'

describe('task form helpers', () => {
  it('builds initial state with linked client and project context', () => {
    expect(buildInitialFormState(
      { id: 'client-1', name: 'Acme Labs' },
      { id: 'project-1', name: 'Website Refresh' },
    )).toMatchObject({
      clientId: 'client-1',
      clientName: 'Acme Labs',
      projectId: 'project-1',
      projectName: 'Website Refresh',
      status: 'todo',
      priority: 'medium',
    })
  })

  it('exposes a dedicated project pill style', () => {
    expect(taskPillColors.project).toContain('indigo')
  })
})