export const TASK_STATUSES = ['todo', 'in-progress', 'review', 'completed', 'archived'] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]

export const TASK_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const
export type TaskPriority = (typeof TASK_PRIORITIES)[number]

export const RECURRENCE_RULES = ['none', 'daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'] as const
export type RecurrenceRule = (typeof RECURRENCE_RULES)[number]

export type TaskDependency = {
  taskId: string
  type: 'blocks' | 'blocked-by' | 'related' | 'parent' | 'child'
}

export type TimeEntry = {
  id: string
  userId: string
  userName: string
  startTime: string
  endTime?: string | null
  duration?: number | null // in minutes
  note?: string | null
}

export type TaskActivity = {
  id: string
  taskId: string
  userId: string
  userName: string
  userRole?: string | null
  action: 'created' | 'updated' | 'deleted' | 'status_changed' | 'assigned' | 'comment_added' | 'time_logged'
  field?: string | null
  oldValue?: string | null
  newValue?: string | null
  timestamp: string
}

export type TaskTemplate = {
  id: string
  name: string
  description?: string | null
  title: string
  descriptionTemplate?: string | null
  status: TaskStatus
  priority: TaskPriority
  tags: string[]
  estimatedHours?: number | null
  recurrenceRule?: RecurrenceRule | null
}

export type TaskRecord = {
  id: string
  title: string
  description?: string | null
  status: TaskStatus
  priority: TaskPriority
  assignedTo: string[]
  clientId?: string | null
  client?: string | null
  projectId?: string | null
  projectName?: string | null
  dueDate?: string | null
  tags: string[]
  createdAt?: string | null
  updatedAt?: string | null
  deletedAt?: string | null
  // New fields
  parentId?: string | null
  subtaskCount?: number | null
  dependencies?: TaskDependency[]
  commentCount?: number | null
  timeSpentMinutes?: number | null
  estimatedMinutes?: number | null
  recurrenceRule?: RecurrenceRule | null
  recurrenceEndDate?: string | null
  isRecurring?: boolean | null
  sharedWith?: string[] | null
  activities?: TaskActivity[]
  timeEntries?: TimeEntry[]
}
