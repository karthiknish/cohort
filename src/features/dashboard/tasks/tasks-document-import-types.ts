export type TaskDocumentImportPhase =
  | 'idle'
  | 'dragging'
  | 'extracting'
  | 'analyzing'
  | 'review'
  | 'creating'
  | 'error'

export type TaskAssignmentStatus = 'resolved' | 'ambiguous' | 'unassigned'

export type ProposedImportTask = {
  localId: string
  title: string
  description: string
  priority: string
  assignedTo: string
  dueDate: string
  assignmentStatus: TaskAssignmentStatus
  suggestions: string[]
  sourceExcerpt: string | null
  include: boolean
}

export type ProposedImportTaskFromServer = {
  title: string
  description: string | null
  priority: 'low' | 'medium' | 'high'
  assignedTo: string[]
  dueDateMs: number | null
  assignmentStatus: TaskAssignmentStatus
  suggestions: string[]
  sourceExcerpt: string | null
}
