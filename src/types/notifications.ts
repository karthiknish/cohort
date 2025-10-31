export type WorkspaceNotificationRole = 'admin' | 'team' | 'client'

export type WorkspaceNotificationKind = 'task.created' | 'collaboration.message'

export type WorkspaceNotificationResource =
  | { type: 'task'; id: string }
  | { type: 'collaboration'; id: string }

export type WorkspaceNotification = {
  id: string
  kind: WorkspaceNotificationKind
  title: string
  body: string
  actor: {
    id: string | null
    name: string | null
  }
  resource: WorkspaceNotificationResource
  recipients: {
    roles: WorkspaceNotificationRole[]
    clientIds?: string[]
    clientId?: string | null
    userIds?: string[]
  }
  metadata?: Record<string, unknown>
  createdAt: string | null
  updatedAt: string | null
  read: boolean
  acknowledged: boolean
}

export type WorkspaceNotificationUpdateAction = 'read' | 'dismiss'
