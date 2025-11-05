export type ActivityType = 'project_updated' | 'task_completed' | 'message_posted'

export interface Activity {
  id: string
  type: ActivityType
  timestamp: string // ISO string
  clientId: string
  entityId: string // projectId, taskId, or messageId
  entityName: string // for display purposes
  description: string // human-readable description
  navigationUrl: string // URL to navigate to the related item
}

export interface ActivityResponse {
  activities: Activity[]
  hasMore: boolean
  total: number
}

export interface ActivityQueryParams {
  clientId: string
  limit?: number
  offset?: number
}
