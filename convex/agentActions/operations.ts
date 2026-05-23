import type { ActionCtx } from '../_generated/server'
import {
  asErrorMessage,
  normalizeOperationName,
} from './helpers'
import { summarizeAnalyticsPerformanceHandler } from './operations/analyticsSummary'
import { adsOperationHandlers } from './operations/ads/index'
import { reportOperationHandlers } from './operations/ads/reports'
import { clientOperationHandlers } from './operations/clients/index'
import { messagingOperationHandlers } from './operations/messaging/index'
import { notificationOperationHandlers } from './operations/notifications/index'
import { projectOperationHandlers } from './operations/projects/index'
import { meetingOperationHandlers } from './operations/meetings/index'
import { proposalOperationHandlers } from './operations/proposals/index'
import { socialOperationHandlers } from './operations/socials/index'
import { taskOperationHandlers } from './operations/tasks/index'
import type { OperationHandler, OperationInput, OperationResult } from './types'

const operationHandlers: Record<string, OperationHandler> = {
  ...messagingOperationHandlers,
  ...notificationOperationHandlers,
  ...taskOperationHandlers,
  ...projectOperationHandlers,
  ...clientOperationHandlers,
  ...proposalOperationHandlers,
  ...meetingOperationHandlers,
  ...adsOperationHandlers,
  summarizeAnalyticsPerformance: summarizeAnalyticsPerformanceHandler,
  ...socialOperationHandlers,
  ...reportOperationHandlers,
}

export async function safeExecuteOperation(
  ctx: ActionCtx,
  args: OperationInput & {
    operation: string
  },
): Promise<OperationResult> {
  const normalizedOperation = normalizeOperationName(args.operation)
  const handler = operationHandlers[normalizedOperation]

  if (!handler) {
    return {
      success: false,
      data: { error: `Unsupported operation: ${normalizedOperation}` },
      userMessage: `I don't support the operation "${normalizedOperation}" yet.`,
    }
  }

  try {
    return await handler(ctx, args)
  } catch (error) {
    return {
      success: false,
      retryable: true,
      data: {
        error: asErrorMessage(error),
        operation: normalizedOperation,
      },
      userMessage: `I couldn't complete ${normalizedOperation}: ${asErrorMessage(error)}`,
    }
  }
}