export const TASK_STATUSES = ['todo', 'in-progress', 'review', 'completed'] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]

export const TASK_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const
export type TaskPriority = (typeof TASK_PRIORITIES)[number]

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
}
