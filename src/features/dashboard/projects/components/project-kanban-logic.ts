import type { ProjectRecord, ProjectStatus } from '@/types/projects'
import { PROJECT_STATUSES } from '@/types/projects'

export type DraggedProject = {
  id: string
  sourceStatus: ProjectStatus
}

type ProjectKanbanState = {
  draggedProject: DraggedProject | null
  dragOverStatus: ProjectStatus | null
  boardAnnouncement: string
}

type ProjectKanbanAction =
  | { type: 'startDrag'; draggedProject: DraggedProject }
  | { type: 'setDragOverStatus'; status: ProjectStatus | null }
  | { type: 'resetDragState' }
  | { type: 'setBoardAnnouncement'; message: string }

export const INITIAL_PROJECT_KANBAN_STATE: ProjectKanbanState = {
  draggedProject: null,
  dragOverStatus: null,
  boardAnnouncement: '',
}

export function projectKanbanReducer(
  state: ProjectKanbanState,
  action: ProjectKanbanAction,
): ProjectKanbanState {
  switch (action.type) {
    case 'startDrag':
      return { ...state, draggedProject: action.draggedProject }
    case 'setDragOverStatus':
      return { ...state, dragOverStatus: action.status }
    case 'resetDragState':
      return { ...state, draggedProject: null, dragOverStatus: null }
    case 'setBoardAnnouncement':
      return { ...state, boardAnnouncement: action.message }
    default:
      return state
  }
}

const KANBAN_STATUSES = [...PROJECT_STATUSES]

export function resolveProjectKanbanMoveTarget(
  currentStatus: ProjectStatus,
  direction: 'previous' | 'next',
): ProjectStatus | null {
  const currentIndex = KANBAN_STATUSES.indexOf(currentStatus)
  if (currentIndex < 0) return null
  return direction === 'previous'
    ? (KANBAN_STATUSES[currentIndex - 1] ?? null)
    : (KANBAN_STATUSES[currentIndex + 1] ?? null)
}

export function canDragProjectKanbanCard(
  project: ProjectRecord,
  pendingStatusUpdates: Set<string>,
): boolean {
  return !pendingStatusUpdates.has(project.id) && project.deletedAt == null
}
