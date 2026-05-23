import { describe, expect, it } from 'vitest'

import type { ProjectRecord } from '@/types/projects'

import {
  canDragProjectKanbanCard,
  projectKanbanReducer,
  resolveProjectKanbanMoveTarget,
} from './project-kanban-logic'

const baseProject: ProjectRecord = {
  id: 'project-1',
  name: 'Website redesign',
  description: null,
  status: 'active',
  clientId: null,
  clientName: null,
  startDate: null,
  endDate: null,
  tags: [],
  ownerId: null,
  createdAt: null,
  updatedAt: null,
  taskCount: 0,
  openTaskCount: 0,
  recentActivityAt: null,
}

describe('project kanban helpers', () => {
  it('resolves adjacent workflow columns for keyboard moves', () => {
    expect(resolveProjectKanbanMoveTarget('active', 'previous')).toBe('planning')
    expect(resolveProjectKanbanMoveTarget('active', 'next')).toBe('on_hold')
    expect(resolveProjectKanbanMoveTarget('planning', 'previous')).toBeNull()
    expect(resolveProjectKanbanMoveTarget('completed', 'next')).toBeNull()
  })

  it('blocks drag while a status update is pending or project is deleted', () => {
    expect(canDragProjectKanbanCard(baseProject, new Set())).toBe(true)
    expect(canDragProjectKanbanCard(baseProject, new Set(['project-1']))).toBe(false)
    expect(
      canDragProjectKanbanCard(
        { ...baseProject, deletedAt: new Date().toISOString() },
        new Set(),
      ),
    ).toBe(false)
  })

  it('tracks drag-over state in the reducer', () => {
    const started = projectKanbanReducer(
      { draggedProject: null, dragOverStatus: null, boardAnnouncement: '' },
      { type: 'startDrag', draggedProject: { id: 'project-1', sourceStatus: 'active' } },
    )
    expect(started.draggedProject?.id).toBe('project-1')

    const over = projectKanbanReducer(started, { type: 'setDragOverStatus', status: 'completed' })
    expect(over.dragOverStatus).toBe('completed')

    const reset = projectKanbanReducer(over, { type: 'resetDragState' })
    expect(reset.draggedProject).toBeNull()
    expect(reset.dragOverStatus).toBeNull()
  })
})
