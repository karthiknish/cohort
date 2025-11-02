import type { TaskRecord } from '@/types/tasks'
import type { CollaborationMessage } from '@/types/collaboration'

export const PROJECT_STATUSES = ['planning', 'active', 'on_hold', 'completed'] as const
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export type ProjectRecord = {
  id: string
  name: string
  description: string | null
  status: ProjectStatus
  clientId: string | null
  clientName: string | null
  startDate: string | null
  endDate: string | null
  tags: string[]
  ownerId: string | null
  createdAt: string | null
  updatedAt: string | null
  taskCount: number
  openTaskCount: number
  recentActivityAt: string | null
}

export type ProjectDetail = ProjectRecord & {
  tasks: TaskRecord[]
  recentMessages: CollaborationMessage[]
}
