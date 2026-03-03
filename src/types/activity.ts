export type ActivityType =
  | 'project_updated'
  | 'task_activity'
  | 'message_posted'
  | 'client_added'
  | 'proposal_created'

export interface Activity {
  id: string
  type: ActivityType
  timestamp: string
  clientId: string
  entityId: string
  entityName: string
  description: string
  navigationUrl: string
  userId?: string
  userName?: string
  userAvatar?: string
  isRead?: boolean
  kind?: string
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
