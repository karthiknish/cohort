export type ActivityType =
  | 'project_updated'
  | 'task_completed'
  | 'message_posted'
  | 'client_added'
  | 'invoice_sent'
  | 'proposal_created'

export type StatusFilter = 'all' | 'read' | 'unread' | 'pinned'

export interface EnhancedActivity {
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
  isPinned?: boolean
  metadata?: {
    changes?: Array<{ field: string; oldValue: string; newValue: string }>
    impact?: 'low' | 'medium' | 'high'
    tags?: string[]
  }
  reactions?: Array<{ emoji: string; count: number; users: string[] }>
  comments?: number
  commentData?: Array<{ id: string; userId: string; userName: string; text: string; timestamp: string }>
}

export type SortOption = 'newest' | 'oldest' | 'type' | 'entity'
export type DateRangeOption = 'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom'

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  project_updated: 'Project Update',
  task_completed: 'Task Activity',
  message_posted: 'New Message',
  client_added: 'New Client',
  invoice_sent: 'Invoice Sent',
  proposal_created: 'Proposal Created',
}
