import { FieldValue } from 'firebase-admin/firestore'

import { adminDb } from '@/lib/firebase-admin'
import type { CollaborationMessage } from '@/types/collaboration'
import type { TaskRecord } from '@/types/tasks'

interface ContactPayload {
  name: string
  email: string
  company: string | null
  message: string
}

const EMAIL_WEBHOOK_URL = process.env.CONTACT_EMAIL_WEBHOOK_URL
const SLACK_WEBHOOK_URL = process.env.CONTACT_SLACK_WEBHOOK_URL
const WHATSAPP_API_VERSION = process.env.WHATSAPP_BUSINESS_API_VERSION ?? 'v18.0'
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_BUSINESS_ACCESS_TOKEN
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID

export async function notifyContactEmail(payload: ContactPayload) {
  if (!EMAIL_WEBHOOK_URL) {
    console.info('[notifications] email webhook not configured, skipping')
    return
  }

  try {
    await fetch(EMAIL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'contact.created', payload }),
    })
  } catch (error) {
    console.error('[notifications] email webhook failed', error)
  }
}

export async function notifyContactSlack(payload: ContactPayload) {
  if (!SLACK_WEBHOOK_URL) {
    console.info('[notifications] slack webhook not configured, skipping')
    return
  }

  const text = `:wave: *New contact message*\n*Name:* ${payload.name}\n*Email:* ${payload.email}\n*Company:* ${payload.company ?? '—'}\n*Message:* ${payload.message}`

  try {
    await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
  } catch (error) {
    console.error('[notifications] slack webhook failed', error)
  }
}

type WhatsAppNotificationKind = 'task-created' | 'collaboration-message'

type WorkspaceNotificationRole = 'admin' | 'team' | 'client'
type WorkspaceNotificationKind = 'task.created' | 'collaboration.message'

type WorkspaceNotificationRecipients = {
  roles: WorkspaceNotificationRole[]
  clientIds?: string[]
  clientId?: string | null
  userIds?: string[]
}

type WorkspaceNotificationResource =
  | { type: 'task'; id: string }
  | { type: 'collaboration'; id: string }

type WorkspaceNotificationInput = {
  workspaceId: string
  kind: WorkspaceNotificationKind
  title: string
  body: string
  actor: { id: string | null; name: string | null }
  resource: WorkspaceNotificationResource
  recipients: WorkspaceNotificationRecipients
  metadata?: Record<string, unknown>
}

function uniqueRoles(roles: WorkspaceNotificationRole[]): WorkspaceNotificationRole[] {
  const seen = new Set<WorkspaceNotificationRole>()
  const allowed: WorkspaceNotificationRole[] = ['admin', 'team', 'client']

  roles.forEach((role) => {
    if (allowed.includes(role) && !seen.has(role)) {
      seen.add(role)
    }
  })

  return Array.from(seen)
}

function sanitizeIdList(values?: unknown[]): string[] | undefined {
  if (!Array.isArray(values)) {
    return undefined
  }

  const set = new Set<string>()
  for (const value of values) {
    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (trimmed.length > 0) {
        set.add(trimmed)
      }
    }
  }

  return set.size > 0 ? Array.from(set) : undefined
}

async function createWorkspaceNotification(input: WorkspaceNotificationInput): Promise<void> {
  const { workspaceId, recipients, ...rest } = input

  if (!workspaceId) {
    return
  }

  const normalizedRecipients: WorkspaceNotificationRecipients = {
    roles: uniqueRoles(recipients.roles ?? []),
  }

  const clientIds = sanitizeIdList(recipients.clientIds)
  if (clientIds) {
    normalizedRecipients.clientIds = clientIds
  }

  const explicitClientId = typeof recipients.clientId === 'string' && recipients.clientId.trim().length > 0
    ? recipients.clientId.trim()
    : null

  const primaryClientId = explicitClientId ?? clientIds?.[0] ?? null
  if (primaryClientId) {
    normalizedRecipients.clientId = primaryClientId
  }

  const userIds = sanitizeIdList(recipients.userIds)
  if (userIds) {
    normalizedRecipients.userIds = userIds
  }

  if (!normalizedRecipients.roles.length) {
    normalizedRecipients.roles = ['team']
  }

  const payload = {
    ...rest,
    workspaceId,
    recipients: normalizedRecipients,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    readBy: [] as string[],
    acknowledgedBy: [] as string[],
  }

  try {
    await adminDb.collection('workspaces').doc(workspaceId).collection('notifications').add(payload)
  } catch (error) {
    console.error('[notifications] failed to record workspace notification', error)
  }
}

function sanitizeWhatsAppNumber(input: unknown): string | null {
  if (typeof input !== 'string') {
    return null
  }
  const digits = input.replace(/\D+/g, '')
  if (digits.length < 8) {
    return null
  }
  return digits
}

async function sendWhatsAppMessage(to: string, body: string): Promise<void> {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.info('[notifications] whatsapp not configured, skipping send')
    return
  }

  const endpoint = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${encodeURIComponent(WHATSAPP_PHONE_NUMBER_ID)}/messages`

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: {
          body,
          preview_url: false,
        },
      }),
    })

    if (!response.ok) {
      const payload = await response.text()
      console.error(`[notifications] whatsapp send failed (${response.status})`, payload)
    }
  } catch (error) {
    console.error('[notifications] whatsapp send error', error)
  }
}

function formatTaskNotification(task: TaskRecord, actorName?: string | null): string | null {
  if (!task?.title) {
    return null
  }

  const assigned = task.assignedTo.length ? task.assignedTo.join(', ') : 'Unassigned'
  const due = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'
  const segments = [
    `New task: "${task.title}"`,
    `Priority: ${task.priority}`,
    `Status: ${task.status}`,
    `Assigned: ${assigned}`,
    `Due: ${due}`,
  ]

  if (task.client) {
    segments.push(`Client: ${task.client}`)
  }

  if (actorName) {
    segments.push(`By: ${actorName}`)
  }

  return segments.join('\n')
}

function formatCollaborationNotification(message: CollaborationMessage, actorName?: string | null): string | null {
  if (!message?.content) {
    return null
  }

  const snippet = message.content.length > 280 ? `${message.content.slice(0, 277)}…` : message.content
  const channelLabel =
    message.channelType === 'client'
      ? message.clientId
        ? `Client channel (${message.clientId})`
        : 'Client channel'
      : message.channelType === 'project'
        ? 'Project channel'
        : 'Team channel'

  const segments = [
    `New collaboration message in ${channelLabel}`,
    `From: ${message.senderName}`,
    snippet,
  ]

  if (actorName) {
    segments.push(`Shared by: ${actorName}`)
  }

  return segments.join('\n')
}

async function dispatchWorkspaceWhatsAppNotification(options: {
  workspaceId: string
  kind: WhatsAppNotificationKind
  body: string | null
}) {
  const { workspaceId, kind, body } = options

  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    return
  }

  if (!workspaceId || !body || body.trim().length === 0) {
    return
  }

  const fieldPath = kind === 'task-created'
    ? 'notificationPreferences.whatsapp.tasks'
    : 'notificationPreferences.whatsapp.collaboration'

  try {
    const snapshot = await adminDb
      .collection('users')
      .where('agencyId', '==', workspaceId)
      .where(fieldPath, '==', true)
      .limit(50)
      .get()

    if (snapshot.empty) {
      return
    }

    const numbers = new Set<string>()
    snapshot.docs.forEach((doc) => {
      const data = doc.data() as Record<string, unknown>
      const sanitized = sanitizeWhatsAppNumber(data.phoneNumber)
      if (sanitized) {
        numbers.add(sanitized)
      }
    })

    if (!numbers.size) {
      return
    }

    const payloads = Array.from(numbers).map((number) => sendWhatsAppMessage(number, body))
    await Promise.allSettled(payloads)
  } catch (error) {
    console.error('[notifications] failed to resolve whatsapp recipients', error)
  }
}

export async function notifyTaskCreatedWhatsApp(options: {
  workspaceId: string
  task: TaskRecord
  actorName?: string | null
}) {
  const body = formatTaskNotification(options.task, options.actorName)
  await dispatchWorkspaceWhatsAppNotification({ workspaceId: options.workspaceId, kind: 'task-created', body })
}

export async function notifyCollaborationMessageWhatsApp(options: {
  workspaceId: string
  message: CollaborationMessage
  actorName?: string | null
}) {
  const body = formatCollaborationNotification(options.message, options.actorName)
  await dispatchWorkspaceWhatsAppNotification({ workspaceId: options.workspaceId, kind: 'collaboration-message', body })
}

export async function recordTaskNotification(options: {
  workspaceId: string
  task: TaskRecord
  actorId?: string | null
  actorName?: string | null
}) {
  const { workspaceId, task } = options
  if (!workspaceId || !task?.id) {
    return
  }

  const clientId = typeof task.clientId === 'string' && task.clientId.trim().length > 0 ? task.clientId.trim() : null
  const baseRoles: WorkspaceNotificationRole[] = ['admin', 'team']
  const recipients: WorkspaceNotificationRecipients = {
    roles: clientId ? uniqueRoles([...baseRoles, 'client']) : baseRoles,
    clientIds: clientId ? [clientId] : undefined,
    clientId,
  }

  const segments = [
    `Priority: ${task.priority}`,
    `Status: ${task.status}`,
  ]

  if (task.assignedTo?.length) {
    segments.push(`Assigned: ${task.assignedTo.join(', ')}`)
  }

  if (task.dueDate) {
    const dueDate = new Date(task.dueDate)
    const formattedDue = Number.isNaN(dueDate.getTime()) ? task.dueDate : dueDate.toLocaleDateString()
    segments.push(`Due: ${formattedDue}`)
  }

  if (task.client) {
    segments.push(`Client: ${task.client}`)
  }

  await createWorkspaceNotification({
    workspaceId,
    kind: 'task.created',
    title: `Task created: ${task.title}`,
    body: segments.join(' · '),
    actor: {
      id: options.actorId ?? null,
      name: options.actorName ?? null,
    },
    resource: { type: 'task', id: task.id },
    recipients,
    metadata: {
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ?? null,
      assignedTo: task.assignedTo,
      clientId,
      clientName: task.client ?? null,
    },
  })
}

export async function recordCollaborationNotification(options: {
  workspaceId: string
  message: CollaborationMessage
  actorId?: string | null
  actorName?: string | null
}) {
  const { workspaceId, message } = options
  if (!workspaceId || !message?.id) {
    return
  }

  const isClientChannel = message.channelType === 'client'
  const clientId = isClientChannel && typeof message.clientId === 'string' && message.clientId.trim().length > 0
    ? message.clientId.trim()
    : null

  const baseRoles: WorkspaceNotificationRole[] = ['admin', 'team']
  const recipients: WorkspaceNotificationRecipients = {
    roles: clientId ? uniqueRoles([...baseRoles, 'client']) : baseRoles,
    clientIds: clientId ? [clientId] : undefined,
    clientId,
  }

  const content = typeof message.content === 'string' ? message.content : ''
  const rawSnippet = content.length > 200 ? `${content.slice(0, 197)}…` : content
  const snippet = rawSnippet.trim().length > 0 ? rawSnippet : '(no message content)'
  const preview = message.senderName ? `${message.senderName}: ${snippet}` : snippet

  await createWorkspaceNotification({
    workspaceId,
    kind: 'collaboration.message',
    title: isClientChannel ? 'Client channel update' : 'New collaboration message',
    body: preview,
    actor: {
      id: options.actorId ?? message.senderId ?? null,
      name: options.actorName ?? message.senderName ?? null,
    },
    resource: { type: 'collaboration', id: message.id },
    recipients,
    metadata: {
      channelType: message.channelType,
      clientId,
      senderId: message.senderId ?? null,
      senderRole: message.senderRole ?? null,
      attachments: message.attachments?.map((attachment) => ({
        name: attachment.name,
        url: attachment.url,
        type: attachment.type ?? null,
        size: attachment.size ?? null,
      })) ?? [],
    },
  })
}
