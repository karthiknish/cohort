// Workspace notification functions (Firestore-based)

import { FieldValue } from 'firebase-admin/firestore'

import { adminDb } from '@/lib/firebase-admin'
import type { CollaborationMessage } from '@/types/collaboration'
import type { TaskRecord } from '@/types/tasks'
import type { ProjectRecord } from '@/types/projects'
import type { WorkspaceNotificationRole } from '@/types/notifications'

import { RETRY_CONFIG, sleep, calculateBackoffDelay } from './config'
import type { WorkspaceNotificationInput, WorkspaceNotificationRecipients } from './types'

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

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

// =============================================================================
// FIRESTORE NOTIFICATION CREATION WITH RETRY
// =============================================================================

async function createWorkspaceNotification(input: WorkspaceNotificationInput): Promise<void> {
  const { workspaceId, recipients, ...rest } = input

  if (!workspaceId) {
    console.warn('[notifications] missing workspaceId, skipping notification creation')
    return
  }

  const normalizedRecipients: WorkspaceNotificationRecipients = {
    roles: uniqueRoles(recipients.roles ?? []),
  }

  const clientIds = sanitizeIdList(recipients.clientIds)
  if (clientIds) {
    normalizedRecipients.clientIds = clientIds
  }

  const explicitClientId =
    typeof recipients.clientId === 'string' && recipients.clientId.trim().length > 0
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

  let lastError: Error | null = null

  for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
    try {
      await adminDb.collection('workspaces').doc(workspaceId).collection('notifications').add(payload)
      console.log(`[notifications] workspace notification created: ${rest.kind}`)
      return
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')

      // Check if it's a retryable Firestore error
      const errorCode = (error as { code?: string })?.code
      const retryableErrors = ['unavailable', 'deadline-exceeded', 'resource-exhausted', 'aborted']

      if (retryableErrors.includes(errorCode ?? '') && attempt < RETRY_CONFIG.maxRetries - 1) {
        console.warn(`[notifications] Firestore write failed (${errorCode}), retrying...`)
        await sleep(calculateBackoffDelay(attempt))
        continue
      }
    }
  }

  console.error('[notifications] failed to record workspace notification after all retries', lastError)
}

// =============================================================================
// TASK NOTIFICATIONS
// =============================================================================

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

  const clientId =
    typeof task.clientId === 'string' && task.clientId.trim().length > 0 ? task.clientId.trim() : null
  const baseRoles: WorkspaceNotificationRole[] = ['admin', 'team']
  const recipients: WorkspaceNotificationRecipients = {
    roles: clientId ? uniqueRoles([...baseRoles, 'client']) : baseRoles,
    clientIds: clientId ? [clientId] : undefined,
    clientId,
  }

  const segments = [`Priority: ${task.priority}`, `Status: ${task.status}`]

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

export async function recordTaskUpdatedNotification(options: {
  workspaceId: string
  task: TaskRecord
  changes: string[]
  actorId?: string | null
  actorName?: string | null
}) {
  const { workspaceId, task, changes } = options
  if (!workspaceId || !task?.id || changes.length === 0) {
    return
  }

  const clientId =
    typeof task.clientId === 'string' && task.clientId.trim().length > 0 ? task.clientId.trim() : null
  const baseRoles: WorkspaceNotificationRole[] = ['admin', 'team']
  const recipients: WorkspaceNotificationRecipients = {
    roles: clientId ? uniqueRoles([...baseRoles, 'client']) : baseRoles,
    clientIds: clientId ? [clientId] : undefined,
    clientId,
  }

  const body = changes.join(' · ')

  await createWorkspaceNotification({
    workspaceId,
    kind: 'task.updated',
    title: `Task updated: ${task.title}`,
    body,
    actor: {
      id: options.actorId ?? null,
      name: options.actorName ?? null,
    },
    resource: { type: 'task', id: task.id },
    recipients,
    metadata: {
      status: task.status,
      priority: task.priority,
      clientId,
      clientName: task.client ?? null,
      changes,
    },
  })
}

// =============================================================================
// COLLABORATION NOTIFICATIONS
// =============================================================================

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
  const isProjectChannel = message.channelType === 'project'
  const clientId =
    (isClientChannel || isProjectChannel) &&
    typeof message.clientId === 'string' &&
    message.clientId.trim().length > 0
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
    title: isClientChannel
      ? 'Client channel update'
      : isProjectChannel
        ? 'Project channel update'
        : 'New collaboration message',
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
      attachments:
        message.attachments?.map((attachment) => ({
          name: attachment.name,
          url: attachment.url,
          type: attachment.type ?? null,
          size: attachment.size ?? null,
        })) ?? [],
      projectId: isProjectChannel && typeof message.projectId === 'string' ? message.projectId : null,
    },
  })

  // Send mention notifications for each mentioned user
  if (message.mentions && message.mentions.length > 0) {
    await recordMentionNotifications({
      workspaceId,
      message,
      actorId: options.actorId ?? message.senderId ?? null,
      actorName: options.actorName ?? message.senderName ?? null,
    })
  }
}

export async function recordMentionNotifications(options: {
  workspaceId: string
  message: CollaborationMessage
  actorId?: string | null
  actorName?: string | null
}) {
  const { workspaceId, message } = options
  if (!workspaceId || !message?.id || !message.mentions?.length) {
    return
  }

  const isClientChannel = message.channelType === 'client'
  const isProjectChannel = message.channelType === 'project'
  const clientId =
    (isClientChannel || isProjectChannel) &&
    typeof message.clientId === 'string' &&
    message.clientId.trim().length > 0
      ? message.clientId.trim()
      : null

  const content = typeof message.content === 'string' ? message.content : ''
  const rawSnippet = content.length > 150 ? `${content.slice(0, 147)}…` : content
  const snippet = rawSnippet.trim().length > 0 ? rawSnippet : '(no message content)'

  const senderName = options.actorName ?? message.senderName ?? 'Someone'

  // Create a notification for each mention
  for (const mention of message.mentions) {
    const mentionedName = mention.name

    await createWorkspaceNotification({
      workspaceId,
      kind: 'collaboration.mention',
      title: `${senderName} mentioned you`,
      body: snippet,
      actor: {
        id: options.actorId ?? null,
        name: senderName,
      },
      resource: { type: 'collaboration', id: message.id },
      recipients: {
        roles: ['admin', 'team', 'client'],
        clientIds: clientId ? [clientId] : undefined,
        clientId,
      },
      metadata: {
        channelType: message.channelType,
        clientId,
        senderId: message.senderId ?? null,
        senderName: message.senderName ?? null,
        mentionedName,
        mentionSlug: mention.slug,
        projectId: isProjectChannel && typeof message.projectId === 'string' ? message.projectId : null,
      },
    })
  }
}

// =============================================================================
// PROPOSAL NOTIFICATIONS
// =============================================================================

export async function recordProposalDeckReadyNotification(options: {
  workspaceId: string
  proposalId: string
  proposalTitle?: string | null
  clientId?: string | null
  clientName?: string | null
  storageUrl?: string | null
}) {
  const { workspaceId, proposalId } = options
  if (!workspaceId || !proposalId) {
    return
  }

  const proposalTitle =
    typeof options.proposalTitle === 'string' && options.proposalTitle.trim().length > 0
      ? options.proposalTitle.trim()
      : null
  const clientName =
    typeof options.clientName === 'string' && options.clientName.trim().length > 0
      ? options.clientName.trim()
      : null
  const clientId =
    typeof options.clientId === 'string' && options.clientId.trim().length > 0
      ? options.clientId.trim()
      : null

  const title = proposalTitle ? `Presentation ready: ${proposalTitle}` : 'Presentation ready'

  const details: string[] = []
  if (clientName) {
    details.push(`Client: ${clientName}`)
  }
  details.push('Your Gamma presentation is ready to download.')
  if (options.storageUrl) {
    details.push('Stored in Firebase Storage for quick access.')
  }

  const recipients: WorkspaceNotificationRecipients = {
    roles: clientId ? ['admin', 'team', 'client'] : ['admin', 'team'],
    clientIds: clientId ? [clientId] : undefined,
    clientId: clientId ?? undefined,
  }

  await createWorkspaceNotification({
    workspaceId,
    kind: 'proposal.deck.ready',
    title,
    body: details.join(' · '),
    actor: {
      id: null,
      name: null,
    },
    resource: { type: 'proposal', id: proposalId },
    recipients,
    metadata: {
      proposalId,
      proposalTitle: proposalTitle ?? null,
      clientId: clientId ?? null,
      clientName: clientName ?? null,
      storageUrl: options.storageUrl ?? null,
    },
  })
}

// =============================================================================
// INVOICE NOTIFICATIONS
// =============================================================================

export async function recordInvoiceSentNotification(options: {
  workspaceId: string
  invoiceId: string
  clientId: string
  clientName: string
  amount: number
  currency: string
  invoiceNumber: string | null
  actorId: string
}) {
  const { workspaceId, invoiceId, clientId, clientName, amount, currency, invoiceNumber, actorId } =
    options

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount)

  const title = `Invoice sent: ${clientName}`
  const body = `Amount: ${formattedAmount}${invoiceNumber ? ` · #${invoiceNumber}` : ''}`

  await createWorkspaceNotification({
    workspaceId,
    kind: 'invoice.sent',
    title,
    body,
    actor: { id: actorId, name: 'Admin' },
    resource: { type: 'invoice', id: invoiceId },
    recipients: {
      roles: ['admin', 'team', 'client'],
      clientIds: [clientId],
      clientId,
    },
    metadata: {
      amount,
      currency,
      invoiceNumber,
      clientId,
      clientName,
    },
  })
}

export async function recordInvoicePaidNotification(options: {
  workspaceId: string
  invoiceId: string
  clientId: string
  clientName: string
  amount: number
  currency: string
  invoiceNumber: string | null
}) {
  const { workspaceId, invoiceId, clientId, clientName, amount, currency, invoiceNumber } = options

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount)

  const title = `Invoice paid: ${clientName}`
  const body = `Received ${formattedAmount}${invoiceNumber ? ` · #${invoiceNumber}` : ''}`

  await createWorkspaceNotification({
    workspaceId,
    kind: 'invoice.paid',
    title,
    body,
    actor: { id: null, name: 'Stripe' },
    resource: { type: 'invoice', id: invoiceId },
    recipients: {
      roles: ['admin', 'team'],
      clientIds: [clientId],
      clientId,
    },
    metadata: {
      amount,
      currency,
      invoiceNumber,
      clientId,
      clientName,
    },
  })
}

// =============================================================================
// PROJECT NOTIFICATIONS
// =============================================================================

export async function recordProjectCreatedNotification(options: {
  workspaceId: string
  project: ProjectRecord
  actorId?: string | null
  actorName?: string | null
}) {
  const { workspaceId, project } = options
  if (!workspaceId || !project?.id) {
    return
  }

  const clientId =
    typeof project.clientId === 'string' && project.clientId.trim().length > 0
      ? project.clientId.trim()
      : null
  const baseRoles: WorkspaceNotificationRole[] = ['admin', 'team']
  const recipients: WorkspaceNotificationRecipients = {
    roles: clientId ? uniqueRoles([...baseRoles, 'client']) : baseRoles,
    clientIds: clientId ? [clientId] : undefined,
    clientId,
  }

  const segments = [`Status: ${project.status}`]

  if (project.startDate) {
    const startDate = new Date(project.startDate)
    const formattedStart = Number.isNaN(startDate.getTime())
      ? project.startDate
      : startDate.toLocaleDateString()
    segments.push(`Start: ${formattedStart}`)
  }

  if (project.clientName) {
    segments.push(`Client: ${project.clientName}`)
  }

  await createWorkspaceNotification({
    workspaceId,
    kind: 'project.created',
    title: `New project: ${project.name}`,
    body: segments.join(' · '),
    actor: {
      id: options.actorId ?? null,
      name: options.actorName ?? null,
    },
    resource: { type: 'project', id: project.id },
    recipients,
    metadata: {
      status: project.status,
      clientId,
      clientName: project.clientName ?? null,
    },
  })
}
