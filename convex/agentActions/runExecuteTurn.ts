import type { ActionCtx } from '../_generated/server'
import { safeExecuteOperation } from './operations'
import {
  buildConfirmationProposal,
  buildUndoHint,
  operationRequiresConfirmation,
  resolveConfirmationDecision,
  resolvePendingConfirmation,
  serializePendingConfirmationData,
  type AgentConfirmationProposal,
  type PendingAgentConfirmation,
} from './helpers/confirmation'
import { normalizeOperationName } from './helpers'
import type { AgentRequestContextType, OperationResult } from './types'

export type ExecuteTurnResult = {
  agentAction: string
  agentRoute: string | null
  agentMessage: string
  agentOperation: string | null
  agentParams: Record<string, unknown> | null
  executeResult: OperationResult | null
  requiresConfirmation?: boolean
  confirmation?: AgentConfirmationProposal
}

type ExecuteTurnArgs = {
  workspaceId: string
  userId: string
  conversationId: string
  message: string
  context?: AgentRequestContextType
}

export async function tryResolveConfirmationTurn(
  ctx: ActionCtx,
  args: ExecuteTurnArgs,
): Promise<ExecuteTurnResult | null> {
  const pending = resolvePendingConfirmation(args.context)
  const decision = resolveConfirmationDecision(args.message, args.context)
  if (!pending || !decision) return null

  if (decision === 'cancel') {
    return {
      agentAction: 'clarify',
      agentRoute: null,
      agentMessage: 'Cancelled — I did not run that action.',
      agentOperation: pending.operation,
      agentParams: null,
      executeResult: {
        success: true,
        data: { cancelled: true, operation: pending.operation },
      },
    }
  }

  if (decision === 'edit') {
    return {
      agentAction: 'clarify',
      agentRoute: null,
      agentMessage:
        'What would you like to change? Update your request with the new details and I will prepare a fresh confirmation.',
      agentOperation: pending.operation,
      agentParams: null,
      executeResult: {
        success: true,
        data: { awaitingEdit: true, operation: pending.operation },
      },
    }
  }

  return executeOperationTurn(ctx, args, pending.operation, pending.params, {
    forceExecute: true,
    fallbackMessage: 'Action completed.',
  })
}

export async function executeOperationTurn(
  ctx: ActionCtx,
  args: ExecuteTurnArgs,
  operationInput: string,
  params: Record<string, unknown>,
  options?: {
    forceExecute?: boolean
    fallbackMessage?: string | null
  },
): Promise<ExecuteTurnResult> {
  const operation = normalizeOperationName(operationInput)
  const fallbackMessage = options?.fallbackMessage ?? null

  if (!options?.forceExecute && operationRequiresConfirmation(operation)) {
    const confirmationId = crypto.randomUUID()
    const pending: PendingAgentConfirmation = {
      confirmationId,
      operation,
      params,
    }
    const proposal = buildConfirmationProposal(operation, params, fallbackMessage)

    return {
      agentAction: 'clarify',
      agentRoute: null,
      agentMessage:
        proposal.missingFields && proposal.missingFields.length > 0
          ? `${proposal.summary} I still need: ${proposal.missingFields.join(', ')}.`
          : proposal.summary,
      agentOperation: operation,
      agentParams: {
        ...params,
        _pendingConfirmation: true,
        _confirmationId: confirmationId,
        _operation: operation,
      },
      executeResult: {
        success: true,
        data: serializePendingConfirmationData(pending),
      },
      requiresConfirmation: true,
      confirmation: proposal,
    }
  }

  const result = await safeExecuteOperation(ctx, {
    workspaceId: args.workspaceId,
    userId: args.userId,
    conversationId: args.conversationId,
    operation,
    params,
    context: args.context,
    rawMessage: args.message,
  })

  const agentRoute = result.route ?? (typeof result.data?.route === 'string' ? result.data.route : null)
  const undoHint = result.success ? buildUndoHint(operation, result.data) : undefined
  const dataWithUndo =
    undoHint && result.data
      ? { ...result.data, undoHint }
      : result.data

  return {
    agentAction: 'execute',
    agentRoute,
    agentMessage:
      result.userMessage ||
      fallbackMessage ||
      (result.success ? 'Action completed.' : 'I could not complete that action.'),
    agentOperation: operation,
    agentParams: params,
    executeResult: {
      success: result.success,
      data: dataWithUndo,
      route: result.route,
      retryable: result.retryable,
      userMessage: result.userMessage,
    },
  }
}
