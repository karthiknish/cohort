import { NextRequest, NextResponse } from 'next/server'
import { FieldPath, Timestamp } from 'firebase-admin/firestore'

import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import { resolveWorkspaceContext } from '@/lib/workspace'
import type { WorkspaceNotification, WorkspaceNotificationKind, WorkspaceNotificationRole } from '@/types/notifications'

const PAGE_SIZE_DEFAULT = 25
const PAGE_SIZE_MAX = 100

function toISO(value: unknown): string | null {
  if (!value && value !== 0) {
    return null
  }

  if (value instanceof Timestamp) {
    return value.toDate().toISOString()
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate?: () => Date }).toDate === 'function') {
    const converted = (value as { toDate: () => Date }).toDate()
    return converted instanceof Date ? converted.toISOString() : null
  }

  if (typeof value === 'string') {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString()
    }
    return value
  }

  return null
}

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
    } else {
      resource = { type: 'task', id: resourceRaw.id }
    }
  }

  return {
    id: doc.id,
    kind: typeof data.kind === 'string' && (data.kind === 'task.created' || data.kind === 'collaboration.message')
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

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      throw new AuthenticationError('Authentication required', 401)
    }

    const workspace = await resolveWorkspaceContext(auth)

    const searchParams = request.nextUrl.searchParams
    const pageSizeParam = searchParams.get('pageSize')
    const afterParam = searchParams.get('after')
    const roleParam = searchParams.get('role')
    const clientIdParam = searchParams.get('clientId')
    const unreadOnly = searchParams.get('unread') === 'true'

    const pageSize = Math.min(Math.max(Number(pageSizeParam) || PAGE_SIZE_DEFAULT, 1), PAGE_SIZE_MAX)

    let query = workspace.workspaceRef
      .collection('notifications')
      .orderBy('createdAt', 'desc')
      .orderBy(FieldPath.documentId(), 'desc')
      .limit(pageSize + 1)

    if (roleParam) {
      query = query.where('recipients.roles', 'array-contains', roleParam)
    }

    if (clientIdParam) {
      query = query.where('recipients.clientId', '==', clientIdParam)
    }

    if (afterParam) {
      const [timestamp, docId] = afterParam.split('|')
      if (timestamp && docId) {
        const afterDate = new Date(timestamp)
        if (!Number.isNaN(afterDate.getTime())) {
          query = query.startAfter(Timestamp.fromDate(afterDate), docId)
        }
      }
    }

    const snapshot = await query.get()
    const docs = snapshot.docs

    const notifications = docs.slice(0, pageSize).map((doc) => mapNotification(doc, auth.uid!))

    const nextCursorDoc = docs.length > pageSize ? docs[docs.length - 1] : null
    const nextCursor = nextCursorDoc
      ? (() => {
          const createdAt = toISO(nextCursorDoc.get('createdAt'))
          return createdAt ? `${createdAt}|${nextCursorDoc.id}` : null
        })()
      : null

    const filtered = unreadOnly ? notifications.filter((notification) => !notification.read) : notifications

    return NextResponse.json({ notifications: filtered, nextCursor })
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[notifications] GET failed', error)
    return NextResponse.json({ error: 'Failed to load notifications' }, { status: 500 })
  }
}
