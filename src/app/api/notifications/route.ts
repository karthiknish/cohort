import { NextRequest, NextResponse } from 'next/server'
import { FieldPath, Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { AuthenticationError } from '@/lib/server-auth'
import { resolveWorkspaceContext } from '@/lib/workspace'
import type { WorkspaceNotification, WorkspaceNotificationKind, WorkspaceNotificationRole } from '@/types/notifications'
import { createApiHandler } from '@/lib/api-handler'
import { toISO } from '@/lib/utils'

const PAGE_SIZE_DEFAULT = 25
const PAGE_SIZE_MAX = 100

const notificationQuerySchema = z.object({
  pageSize: z.string().optional(),
  after: z.string().optional(),
  role: z.enum(['admin', 'team', 'client']).optional(),
  clientId: z
    .string()
    .regex(/^[a-zA-Z0-9_-]{1,100}$/)
    .optional(),
  unread: z.string().optional(),
})

function mapNotification(doc: FirebaseFirestore.QueryDocumentSnapshot, userId: string): WorkspaceNotification {
  const data = doc.data() as Record<string, unknown>
  const recipientsRaw = data.recipients && typeof data.recipients === 'object' ? (data.recipients as Record<string, unknown>) : {}
  const roles = Array.isArray(recipientsRaw.roles)
    ? recipientsRaw.roles.filter((value): value is WorkspaceNotificationRole => value === 'admin' || value === 'team' || value === 'client')
    : []

  const recipients = {
    roles,
    clientIds: Array.isArray(recipientsRaw.clientIds)
      ? recipientsRaw.clientIds.filter((value): value is string => typeof value === 'string')
      : undefined,
    clientId: typeof recipientsRaw.clientId === 'string' ? recipientsRaw.clientId : null,
    userIds: Array.isArray(recipientsRaw.userIds)
      ? recipientsRaw.userIds.filter((value): value is string => typeof value === 'string')
      : undefined,
  }

  const actorRaw = data.actor && typeof data.actor === 'object' ? (data.actor as Record<string, unknown>) : {}

  const resourceRaw = data.resource && typeof data.resource === 'object' ? (data.resource as Record<string, unknown>) : {}
  let resource: WorkspaceNotification['resource'] = { type: 'task', id: '' }
  if (typeof resourceRaw.type === 'string' && typeof resourceRaw.id === 'string') {
    if (resourceRaw.type === 'collaboration') {
      resource = { type: 'collaboration', id: resourceRaw.id }
    } else if (resourceRaw.type === 'proposal') {
      resource = { type: 'proposal', id: resourceRaw.id }
    } else {
      resource = { type: 'task', id: resourceRaw.id }
    }
  }

  return {
    id: doc.id,
    kind: typeof data.kind === 'string' && (data.kind === 'task.created' || data.kind === 'collaboration.message' || data.kind === 'proposal.deck.ready')
      ? (data.kind as WorkspaceNotificationKind)
      : 'task.created',
    title: typeof data.title === 'string' ? data.title : 'Notification',
    body: typeof data.body === 'string' ? data.body : '',
    actor: {
      id: typeof actorRaw.id === 'string' ? actorRaw.id : null,
      name: typeof actorRaw.name === 'string' ? actorRaw.name : null,
    },
    resource,
    recipients,
    metadata: data.metadata && typeof data.metadata === 'object' ? (data.metadata as Record<string, unknown>) : undefined,
    createdAt: toISO(data.createdAt),
    updatedAt: toISO(data.updatedAt),
    read: Array.isArray(data.readBy) ? (data.readBy as unknown[]).some((entry) => entry === userId) : false,
    acknowledged: Array.isArray(data.acknowledgedBy)
      ? (data.acknowledgedBy as unknown[]).some((entry) => entry === userId)
      : false,
  }
}

export const GET = createApiHandler(
  {
    workspace: 'required',
    querySchema: notificationQuerySchema,
    rateLimit: 'standard',
  },
  async (req, { auth, workspace, query }) => {
    if (!workspace) throw new Error('Workspace context missing')
    const {
      pageSize: pageSizeParam,
      after: afterParam,
      role: roleParam,
      clientId: clientIdParam,
      unread: unreadParam,
    } = query

    const unreadOnly = unreadParam === 'true'
    const pageSize = Math.min(Math.max(Number(pageSizeParam) || PAGE_SIZE_DEFAULT, 1), PAGE_SIZE_MAX)

    let notificationsQuery = workspace.workspaceRef
      .collection('notifications')
      .orderBy('createdAt', 'desc')
      .orderBy(FieldPath.documentId(), 'desc')
      .limit(pageSize + 1)

    if (roleParam) {
      notificationsQuery = notificationsQuery.where('recipients.roles', 'array-contains', roleParam)
    }

    if (clientIdParam) {
      notificationsQuery = notificationsQuery.where('recipients.clientId', '==', clientIdParam)
    }

    if (afterParam) {
      const [timestamp, docId] = afterParam.split('|')
      if (timestamp && docId) {
        const afterDate = new Date(timestamp)
        if (!Number.isNaN(afterDate.getTime())) {
          notificationsQuery = notificationsQuery.startAfter(Timestamp.fromDate(afterDate), docId)
        }
      }
    }

    const snapshot = await notificationsQuery.get()
    const docs = snapshot.docs

    const notifications = docs.slice(0, pageSize).map((doc) => mapNotification(doc, auth.uid!))

    const nextCursorDoc = docs.length > pageSize ? docs[pageSize] : null
    const nextCursor = nextCursorDoc
      ? (() => {
          const createdAt = toISO(nextCursorDoc.get('createdAt'))
          return createdAt ? `${createdAt}|${nextCursorDoc.id}` : null
        })()
      : null

    const filtered = unreadOnly ? notifications.filter((notification) => !notification.read) : notifications

    return { notifications: filtered, nextCursor }
  }
)
