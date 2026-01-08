import { TASK_PRIORITIES, TASK_STATUSES, type TaskPriority, type TaskRecord, type TaskStatus } from '@/types/tasks'
import type { StoredTask } from '@/types/stored-types'
import { coerceStringArray, toISO } from '@/lib/utils'

export type { StoredTask } from '@/types/stored-types'

export function mapTaskDoc(docId: string, data: StoredTask): TaskRecord {
  const status = (typeof data.status === 'string' ? data.status : 'todo') as TaskStatus
  const priority = (typeof data.priority === 'string' ? data.priority : 'medium') as TaskPriority

  return {
    id: docId,
    title: typeof data.title === 'string' ? data.title : 'Untitled task',
    description: typeof data.description === 'string' ? data.description : null,
    status: TASK_STATUSES.includes(status) ? status : 'todo',
    priority: TASK_PRIORITIES.includes(priority) ? priority : 'medium',
    assignedTo: coerceStringArray(data.assignedTo),
    clientId: typeof data.clientId === 'string' ? data.clientId : null,
    client: typeof data.client === 'string' ? data.client : null,
    projectId: typeof data.projectId === 'string' ? data.projectId : null,
    projectName: typeof data.projectName === 'string' ? data.projectName : null,
    dueDate: toISO(data.dueDate),
    tags: coerceStringArray(data.tags),
    createdAt: toISO(data.createdAt),
    updatedAt: toISO(data.updatedAt),
    deletedAt: toISO(data.deletedAt),
  }
}
