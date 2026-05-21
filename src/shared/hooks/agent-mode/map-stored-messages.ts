import { parseAgentAttachmentsFromStored } from '@/lib/agent-attachments'
import type { AgentMessageMetadata } from '@/lib/agent-message-lifecycle'
import { parsePendingConfirmationFromStored } from '@/lib/agent-message-lifecycle'
import { parseAgentMentionsFromStored } from '@/lib/agent-mentions'

import type { AgentMessage } from './types'
import { asRecord, parseStoredExecuteResultData, type StoredAgentMessage } from './stored-message-utils'

export function mapStoredMessagesToAgentMessages(stored: StoredAgentMessage[]): AgentMessage[] {
  return stored.map((msg) => {
    const type: 'user' | 'agent' = msg.type === 'user' ? 'user' : 'agent'
    const action = typeof msg.action === 'string' ? msg.action : null
    const operation = typeof msg.operation === 'string' ? msg.operation : null
    const executeResult =
      msg.executeResult && typeof msg.executeResult === 'object'
        ? (msg.executeResult as Record<string, unknown>)
        : null

    const executionSuccess =
      executeResult && typeof executeResult.success === 'boolean'
        ? executeResult.success
        : null

    const normalizedAction: AgentMessageMetadata['action'] | undefined =
      action === 'navigate' || action === 'execute' || action === 'clarify' ? action : action ? 'response' : undefined

    const status: AgentMessage['status'] =
      normalizedAction === 'execute' && executionSuccess !== null
        ? executionSuccess
          ? 'success'
          : 'error'
        : normalizedAction === 'navigate'
          ? 'success'
          : 'info'

    const pendingConfirmation =
      type === 'agent'
        ? parsePendingConfirmationFromStored(executeResult, msg.params, msg.id)
        : null

    const storedData = parseStoredExecuteResultData(executeResult)
    const undoHintRaw = storedData?.undoHint
    const undoHint =
      undoHintRaw &&
      typeof undoHintRaw === 'object' &&
      !Array.isArray(undoHintRaw) &&
      typeof (undoHintRaw as Record<string, unknown>).resourceId === 'string' &&
      ((undoHintRaw as Record<string, unknown>).type === 'task' ||
        (undoHintRaw as Record<string, unknown>).type === 'project' ||
        (undoHintRaw as Record<string, unknown>).type === 'message')
        ? {
            type: (undoHintRaw as Record<string, unknown>).type as 'task' | 'project' | 'message',
            resourceId: (undoHintRaw as Record<string, unknown>).resourceId as string,
            label:
              typeof (undoHintRaw as Record<string, unknown>).label === 'string'
                ? ((undoHintRaw as Record<string, unknown>).label as string)
                : 'Created',
          }
        : undefined

    const storedMentions =
      msg.params && typeof msg.params === 'object' && !Array.isArray(msg.params)
        ? parseAgentMentionsFromStored((msg.params as Record<string, unknown>).mentions)
        : undefined
    const storedAttachments =
      msg.params && typeof msg.params === 'object' && !Array.isArray(msg.params)
        ? parseAgentAttachmentsFromStored((msg.params as Record<string, unknown>).attachments)
        : undefined

    return {
      id: msg.id,
      clientId: msg.id,
      type,
      content: msg.content,
      timestamp: new Date(msg.timestamp),
      route: msg.route,
      status: pendingConfirmation ? 'warning' : status,
      lifecycle: 'sent' as const,
      mentions: storedMentions,
      attachments: storedAttachments,
      metadata:
        normalizedAction || operation || executeResult || pendingConfirmation
          ? {
              action: pendingConfirmation ? 'clarify' : normalizedAction,
              operation: operation ?? undefined,
              success: executionSuccess ?? undefined,
              data: storedData,
              requiresConfirmation: pendingConfirmation ? true : undefined,
              pendingConfirmation: pendingConfirmation ?? undefined,
              undoHint,
            }
          : undefined,
    }
  })
}
