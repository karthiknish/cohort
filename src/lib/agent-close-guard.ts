import type { AgentMessage } from '@/shared/hooks/use-agent-mode'
import type { AgentAttachmentContext } from '@/lib/agent-attachments'

export type AgentCloseBlockerReason =
  | 'unsent-message'
  | 'attachments'
  | 'processing'
  | 'pending-confirmation'

export type AgentCloseGuardState = {
  composerText: string
  pendingAttachments: AgentAttachmentContext[]
  isProcessing: boolean
  isExtractingAttachments: boolean
  messages: AgentMessage[]
}

export function getAgentCloseBlockers(state: AgentCloseGuardState): AgentCloseBlockerReason[] {
  const blockers: AgentCloseBlockerReason[] = []

  if (state.composerText.trim().length > 0) {
    blockers.push('unsent-message')
  }

  if (state.pendingAttachments.length > 0 || state.isExtractingAttachments) {
    blockers.push('attachments')
  }

  if (state.isProcessing) {
    blockers.push('processing')
  }

  const hasPendingConfirmation = state.messages.some(
    (message) => message.metadata?.pendingConfirmation != null,
  )
  if (hasPendingConfirmation) {
    blockers.push('pending-confirmation')
  }

  return blockers
}

export function shouldBlockAgentClose(state: AgentCloseGuardState): boolean {
  return getAgentCloseBlockers(state).length > 0
}

export function agentCloseBlockerMessage(blockers: AgentCloseBlockerReason[]): string {
  if (blockers.includes('processing')) {
    return 'Agent Mode is still working on your last request. Wait for it to finish or cancel before closing.'
  }
  if (blockers.includes('pending-confirmation')) {
    return 'You have a pending action that needs confirmation. Confirm or cancel it before closing.'
  }
  if (blockers.includes('attachments')) {
    return 'Attachments are still being read. Remove them or wait before closing.'
  }
  if (blockers.includes('unsent-message')) {
    return 'You have an unsent message in the composer. Discard it and close?'
  }
  return 'Close Agent Mode and discard unsaved work?'
}
