import { describe, expect, it } from 'vitest'

import { buildInitialFormState, mergeTaskParticipants, taskPillColors } from './task-types'

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

  it('merges client members, workspace users, and platform admins for assignment', () => {
    expect(mergeTaskParticipants([
      [{ name: 'Account Lead', role: 'Account Manager' }],
      [{ id: 'u-1', name: 'Workspace Teammate', role: 'team', email: 'team@example.com' }],
      [{ id: 'u-2', name: 'Platform Admin', role: 'admin', email: 'admin@example.com' }],
    ])).toEqual([
      { name: 'Account Lead', role: 'Account Manager', id: undefined, email: undefined },
      { id: 'u-2', name: 'Platform Admin', role: 'admin', email: 'admin@example.com' },
      { id: 'u-1', name: 'Workspace Teammate', role: 'team', email: 'team@example.com' },
    ])
  })

  it('dedupes repeated participants by normalized name while preserving richer data', () => {
    expect(mergeTaskParticipants([
      [{ name: 'Alex Chen', role: 'Account Manager' }],
      [{ id: 'u-3', name: ' alex chen ', role: 'admin', email: 'alex@example.com' }],
    ])).toEqual([
      { id: 'u-3', name: ' alex chen ', role: 'Account Manager', email: 'alex@example.com' },
    ])
  })
})