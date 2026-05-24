import type { AgentRequestContextType, JsonRecord } from '../types'
import { asNonEmptyString, asRecord } from './values'

export const WRITE_OPERATIONS = new Set([
  'createTask',
  'updateTask',
  'createProject',
  'updateProject',
  'createClient',
  'updateClient',
  'addClientTeamMember',
  'sendDirectMessage',
  'createProposalDraft',
  'updateProposalDraft',
  'generateProposalFromDraft',
  'updateCampaign',
  'updateCreative',
])

export type AgentConfirmationProposal = {
  operation: string
  summary: string
  fields?: Record<string, unknown>
  affectedRecords?: string[]
  confidence?: 'low' | 'medium' | 'high'
  missingFields?: string[]
}

export type PendingAgentConfirmation = {
  confirmationId: string
  operation: string
  params: Record<string, unknown>
}

export function operationRequiresConfirmation(operation: string): boolean {
  return WRITE_OPERATIONS.has(operation)
}

export function parseConfirmationDecision(message: string): 'confirm' | 'cancel' | 'edit' | null {
  const normalized = message.trim().toLowerCase().replace(/[.!?]+$/, '')
  if (!normalized) return null

  if (
    ['confirm', 'yes', 'proceed', 'go ahead', 'do it', 'run it', 'approve', 'ok', 'okay'].includes(normalized) ||
    normalized.startsWith('confirm ')
  ) {
    return 'confirm'
  }

  if (
    ['cancel', 'no', 'stop', 'dont', "don't", 'abort', 'never mind', 'nevermind'].includes(normalized) ||
    normalized.startsWith('cancel ')
  ) {
    return 'cancel'
  }

  if (['edit', 'change', 'modify', 'update fields'].includes(normalized) || normalized.startsWith('edit ')) {
    return 'edit'
  }

  return null
}

export function resolvePendingConfirmation(
  context?: AgentRequestContextType,
): PendingAgentConfirmation | null {
  const pending = context?.pendingConfirmation
  if (!pending) return null

  const operation = asNonEmptyString(pending.operation)
  const confirmationId = asNonEmptyString(pending.confirmationId)
  const params = asRecord(pending.params) ?? {}

  if (!operation || !confirmationId) return null

  return {
    confirmationId,
    operation,
    params,
  }
}

export function resolveConfirmationDecision(
  message: string,
  context?: AgentRequestContextType,
): 'confirm' | 'cancel' | 'edit' | null {
  return context?.confirmationDecision ?? parseConfirmationDecision(message)
}

function humanizeFieldKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/^\w/, (char) => char.toUpperCase())
}

function summarizeParamValue(value: unknown): string | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') return value.trim() || null
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) {
    const parts = value.flatMap((entry) => {
      const summary = summarizeParamValue(entry)
      return summary ? [summary] : []
    })
    return parts.length > 0 ? parts.join(', ') : null
  }
  if (typeof value === 'object') return JSON.stringify(value)
  return null
}

export function buildConfirmationFields(params: Record<string, unknown>): Record<string, unknown> {
  const fields: Record<string, unknown> = {}
  const skipKeys = new Set(['_pendingConfirmation', 'promptId'])

  for (const [key, value] of Object.entries(params)) {
    if (skipKeys.has(key)) continue
    const summarized = summarizeParamValue(value)
    if (summarized) {
      fields[humanizeFieldKey(key)] = summarized
    }
  }

  return fields
}

export function buildConfirmationProposal(
  operation: string,
  params: Record<string, unknown>,
  fallbackMessage?: string | null,
): AgentConfirmationProposal {
  const fields = buildConfirmationFields(params)
  const title = asNonEmptyString(params.title)
  const name = asNonEmptyString(params.name)
  const recipient = asNonEmptyString(params.recipientQuery) ?? asNonEmptyString(params.recipient)
  const content = asNonEmptyString(params.content)

  const affectedRecords: string[] = []
  if (title) affectedRecords.push(`Task: ${title}`)
  if (name && operation.toLowerCase().includes('project')) affectedRecords.push(`Project: ${name}`)
  if (name && operation.toLowerCase().includes('client')) affectedRecords.push(`Client: ${name}`)
  if (recipient) affectedRecords.push(`Recipient: ${recipient}`)

  const missingFields: string[] = []
  if (operation === 'createTask' && !title) missingFields.push('title')
  if (operation === 'createProject' && !name) missingFields.push('name')
  if (operation === 'createClient' && !name) missingFields.push('name')
  if (operation === 'sendDirectMessage') {
    if (!recipient) missingFields.push('recipient')
    if (!content) missingFields.push('message')
  }

  const summary =
    fallbackMessage?.trim() ||
    (operation === 'sendDirectMessage' && recipient && content
      ? `Send “${content.slice(0, 80)}${content.length > 80 ? '…' : ''}” to ${recipient}?`
      : title
        ? `${operationLabel(operation)} “${title}”?`
        : name
          ? `${operationLabel(operation)} “${name}”?`
          : `${operationLabel(operation)} with the details below?`)

  return {
    operation,
    summary,
    fields: Object.keys(fields).length > 0 ? fields : undefined,
    affectedRecords: affectedRecords.length > 0 ? affectedRecords : undefined,
    confidence: missingFields.length > 0 ? 'low' : Object.keys(fields).length >= 2 ? 'high' : 'medium',
    missingFields: missingFields.length > 0 ? missingFields : undefined,
  }
}

function operationLabel(operation: string): string {
  const labels: Record<string, string> = {
    createTask: 'Create task',
    updateTask: 'Update task',
    createProject: 'Create project',
    updateProject: 'Update project',
    createClient: 'Create client',
    updateClient: 'Update client',
    addClientTeamMember: 'Add team member',
    sendDirectMessage: 'Send message',
    createProposalDraft: 'Create proposal draft',
    updateProposalDraft: 'Update proposal draft',
    generateProposalFromDraft: 'Generate proposal',
    advanceProposalConversation: 'Continue proposal conversation',
    updateCampaign: 'Update campaign',
    updateCreative: 'Update creative',
  }
  return labels[operation] ?? `Run ${operation}`
}

export function serializePendingConfirmationData(
  pending: PendingAgentConfirmation,
): JsonRecord {
  return {
    pendingConfirmation: {
      confirmationId: pending.confirmationId,
      operation: pending.operation,
      paramsJson: JSON.stringify(pending.params),
    },
  }
}

export function parsePendingConfirmationFromStorage(
  executeResult: Record<string, unknown> | null,
  params: Record<string, unknown> | null,
): PendingAgentConfirmation | null {
  const data = asRecord(executeResult?.data) ?? asRecord(executeResult)
  const pendingFromData = asRecord(data?.pendingConfirmation)
  if (pendingFromData) {
    const operation = asNonEmptyString(pendingFromData.operation)
    const confirmationId = asNonEmptyString(pendingFromData.confirmationId)
    const paramsJson =
      typeof pendingFromData.paramsJson === 'string' ? pendingFromData.paramsJson : null
    if (operation && confirmationId) {
      try {
        return {
          confirmationId,
          operation,
          params: paramsJson ? (JSON.parse(paramsJson) as Record<string, unknown>) : (asRecord(params) ?? {}),
        }
      } catch {
        return {
          confirmationId,
          operation,
          params: asRecord(params) ?? {},
        }
      }
    }
  }

  if (params?._pendingConfirmation === true) {
    const operation = asNonEmptyString(params._operation) ?? asNonEmptyString(executeResult?.operation as string)
    if (operation) {
      const cleanParams = { ...params }
      delete cleanParams._pendingConfirmation
      delete cleanParams._operation
      return {
        confirmationId: asNonEmptyString(params._confirmationId) ?? crypto.randomUUID(),
        operation,
        params: cleanParams,
      }
    }
  }

  return null
}

export function buildUndoHint(
  operation: string,
  data?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!data) return undefined

  const taskId = asNonEmptyString(data.taskId)
  const projectId = asNonEmptyString(data.projectId)
  const messageLegacyId = asNonEmptyString(data.messageLegacyId)

  if (operation === 'createTask' && taskId) {
    return { type: 'task', resourceId: taskId, label: 'Task created' }
  }
  if (operation === 'createProject' && projectId) {
    return { type: 'project', resourceId: projectId, label: 'Project created' }
  }
  if (operation === 'sendDirectMessage' && messageLegacyId) {
    return { type: 'message', resourceId: messageLegacyId, label: 'Message sent' }
  }

  return undefined
}
