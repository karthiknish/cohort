"use node"

import { api } from './_generated/api'
import { action } from './_generated/server'
import {
  SYSTEM_PROMPT,
  agentRequestContext,
  fallbackTitleFromMessage,
  formatConversationHistory,
  generateConversationTitle,
  normalizeOperationName,
  parseGeminiResponse,
  requireIdentity,
  resolveDeterministicAgentIntent,
} from './agentActions/helpers'
import {
  getProposalConversationPromptIdFromAssistantMessage,
  isProposalConversationRequest,
} from './agentActions/helpers/proposalConversation'
import { safeExecuteOperation } from './agentActions/operations'
import type {
  ConversationGetResult,
  ConversationListResult,
  ConversationMessagesResult,
  JsonRecord,
} from './agentActions/types'
import { Errors, withErrorHandling } from './errors'
import { enforceGeminiActionRateLimit } from './geminiRateLimit'

import { v } from 'convex/values'
import { geminiAI } from '../src/services/gemini'

function serializeExecuteResultForStorage(executeResult: {
  success: boolean
  data?: Record<string, unknown>
  route?: string
  retryable?: boolean
  userMessage?: string
} | null): JsonRecord | null {
  if (!executeResult) return null

  const serialized: JsonRecord = {
    success: executeResult.success,
  }

  if (typeof executeResult.route === 'string') {
    serialized.route = executeResult.route
  }

  if (typeof executeResult.retryable === 'boolean') {
    serialized.retryable = executeResult.retryable
  }

  if (typeof executeResult.userMessage === 'string') {
    serialized.userMessage = executeResult.userMessage
  }

  if (executeResult.data && Object.keys(executeResult.data).length > 0) {
    serialized.dataJson = JSON.stringify(executeResult.data)
  }

  return serialized
}

export const sendMessage = action({
  args: {
    workspaceId: v.string(),
    message: v.string(),
    conversationId: v.optional(v.union(v.string(), v.null())),
    context: v.optional(agentRequestContext),
  },
  handler: async (ctx, args) =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      const now = Date.now()
      const userId = identity.subject
      const conversationId = args.conversationId ?? null
      const convId = conversationId ?? crypto.randomUUID()

      const existingConversationResponse = await ctx.runQuery(api.agentConversations.get, {
        workspaceId: args.workspaceId,
        legacyId: convId,
      })
      const existingConversation = existingConversationResponse.conversation

      if (existingConversation && existingConversation.userId !== userId) {
        throw Errors.auth.forbidden()
      }

      const isNewConversation = !existingConversation
      const previousMessageCount = existingConversation?.messageCount ?? 0
      const previousAssistantMessage = [...(args.context?.previousMessages ?? [])]
        .reverse()
        .find((message) => message.type === 'agent')
      const proposalPromptId = getProposalConversationPromptIdFromAssistantMessage(previousAssistantMessage?.content)
      const deterministicIntent = proposalPromptId
        ? {
            action: 'execute' as const,
            operation: 'advanceProposalConversation',
            params: { promptId: proposalPromptId },
            message: undefined,
          }
        : isProposalConversationRequest(args.message)
          ? {
              action: 'execute' as const,
              operation: 'advanceProposalConversation',
              params: {},
              message: 'I’ll gather the proposal details with you here.',
            }
          : resolveDeterministicAgentIntent(args.message, args.context)
      const geminiRequestCount = (isNewConversation ? 1 : 0) + (deterministicIntent ? 0 : 1)

      if (geminiRequestCount > 0) {
        await enforceGeminiActionRateLimit(ctx, {
          name: 'agentMessage',
          userId,
          workspaceId: args.workspaceId,
          resourceId: convId,
          count: geminiRequestCount,
        })
      }

      if (isNewConversation) {
        let title = fallbackTitleFromMessage(args.message)
        try {
          title = await generateConversationTitle(args.message)
        } catch {
          // Ignore title generation failure and use the fallback title.
        }

        await ctx.runMutation(api.agentConversations.upsert, {
          workspaceId: args.workspaceId,
          legacyId: convId,
          userId,
          title,
          startedAt: now,
          lastMessageAt: now,
          messageCount: 0,
        })
      } else {
        await ctx.runMutation(api.agentConversations.upsert, {
          workspaceId: args.workspaceId,
          legacyId: convId,
          userId,
          lastMessageAt: now,
        })
      }

      const userMessageLegacyId = crypto.randomUUID()
      await ctx.runMutation(api.agentMessages.upsert, {
        workspaceId: args.workspaceId,
        conversationLegacyId: convId,
        legacyId: userMessageLegacyId,
        type: 'user',
        content: args.message,
        createdAt: now,
        userId,
        action: null,
        route: null,
        operation: null,
        params: null,
        executeResult: null,
      })

      const prompt = `${SYSTEM_PROMPT}${formatConversationHistory(args.context)}\nUser: ${args.message}\n\nRespond with JSON only:`

      let agentAction = 'chat'
      let agentRoute: string | null = null
      let agentMessage = "I didn't quite understand that."
      let agentOperation: string | null = null
      let agentParams: Record<string, unknown> | null = null
      let executeResult: {
        success: boolean
        data?: Record<string, unknown>
        route?: string
        retryable?: boolean
        userMessage?: string
      } | null = null

      if (deterministicIntent?.action === 'navigate') {
        agentAction = 'navigate'
        agentRoute = deterministicIntent.route
        agentMessage = deterministicIntent.message
      } else if (deterministicIntent?.action === 'clarify') {
        agentAction = 'clarify'
        agentMessage = deterministicIntent.message
      } else if (deterministicIntent?.action === 'execute') {
        agentAction = 'execute'
        agentOperation = normalizeOperationName(deterministicIntent.operation)
        agentParams = deterministicIntent.params

        const result = await safeExecuteOperation(ctx, {
          workspaceId: args.workspaceId,
          userId,
          conversationId: convId,
          operation: agentOperation,
          params: agentParams,
          context: args.context,
          rawMessage: args.message,
        })

        executeResult = {
          success: result.success,
          data: result.data,
          route: result.route,
          retryable: result.retryable,
          userMessage: result.userMessage,
        }

        agentRoute = result.route ?? (typeof result.data?.route === 'string' ? result.data.route : null)

        agentMessage =
          executeResult.userMessage ||
          deterministicIntent.message ||
          (executeResult.success ? 'Action completed.' : 'I could not complete that action.')
      } else {
        const raw = await geminiAI.generateContent(prompt)
        const parsed = parseGeminiResponse(raw)

        agentAction = parsed.action || 'chat'
        agentRoute = parsed.route || null
        agentOperation = parsed.operation ? normalizeOperationName(parsed.operation) : null
        agentParams = parsed.params || null

        if (agentAction === 'execute') {
          const operation = agentOperation
          const params = agentParams ?? {}

          if (!operation) {
            executeResult = {
              success: false,
              data: { error: 'Missing operation name' },
              userMessage: 'I need an operation name to execute this action.',
            }
          } else {
            const result = await safeExecuteOperation(ctx, {
              workspaceId: args.workspaceId,
              userId,
              conversationId: convId,
              operation,
              params,
              context: args.context,
              rawMessage: args.message,
            })

            executeResult = {
              success: result.success,
              data: result.data,
              route: result.route,
              retryable: result.retryable,
              userMessage: result.userMessage,
            }

            agentRoute = result.route ?? (typeof result.data?.route === 'string' ? result.data.route : null)
          }

          const parsedMessage =
            typeof parsed.message === 'string' && parsed.message.trim()
              ? parsed.message.trim()
              : null

          agentMessage =
            executeResult?.success === false
              ? (executeResult.userMessage || 'I could not complete that action.')
              : (
                  executeResult?.userMessage ||
                  parsedMessage ||
                  (executeResult?.success
                    ? 'Action completed.'
                    : 'I could not complete that action.')
                )
        } else {
          agentMessage = typeof parsed.message === 'string' ? parsed.message : agentMessage
        }
      }

      const agentMessageLegacyId = crypto.randomUUID()
      const storedExecuteResult = serializeExecuteResultForStorage(executeResult)

      await ctx.runMutation(api.agentMessages.upsert, {
        workspaceId: args.workspaceId,
        conversationLegacyId: convId,
        legacyId: agentMessageLegacyId,
        type: 'agent',
        content: agentMessage,
        createdAt: Date.now(),
        userId: null,
        action: agentAction,
        route: agentRoute,
        operation: agentOperation,
        params: agentParams as JsonRecord | null,
        executeResult: storedExecuteResult,
      })

      await ctx.runMutation(api.agentConversations.upsert, {
        workspaceId: args.workspaceId,
        legacyId: convId,
        userId,
        lastMessageAt: Date.now(),
        messageCount: previousMessageCount + 2,
      })

      return {
        conversationId: convId,
        action: agentAction,
        route: agentRoute,
        message: agentMessage,
        operation: agentOperation,
        executeResult,
      }
    }, 'agentActions:sendMessage'),
})

export const listConversations = action({
  args: {
    workspaceId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{
    conversations: Array<{
      id: string
      title: string
      startedAt: string | null
      lastMessageAt: string | null
      messageCount: number
    }>
  }> =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      const limit = Math.min(Math.max(args.limit ?? 20, 1), 50)

      const result = await ctx.runQuery(api.agentConversations.list, {
        workspaceId: args.workspaceId,
        userId: identity.subject,
        limit,
      }) as ConversationListResult

      return {
        conversations: result.conversations.map((row) => ({
          id: row.legacyId,
          title: row.title ?? 'Untitled conversation',
          startedAt:
            typeof row.startedAt === 'number' ? new Date(row.startedAt).toISOString() : null,
          lastMessageAt:
            typeof row.lastMessageAt === 'number'
              ? new Date(row.lastMessageAt).toISOString()
              : null,
          messageCount: row.messageCount,
        })),
      }
    }, 'agentActions:listConversations'),
})

export const getConversation = action({
  args: {
    workspaceId: v.string(),
    conversationId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{
    conversation: {
      id: string
      startedAt: string | null
      lastMessageAt: string | null
      messageCount: number
    }
    messages: Array<{
      id: string
      type: string
      content: string
      timestamp: string
      route: string | null
      action: string | null
      operation: string | null
      executeResult: Record<string, unknown> | null
    }>
  }> =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      const conv = await ctx.runQuery(api.agentConversations.get, {
        workspaceId: args.workspaceId,
        legacyId: args.conversationId,
      }) as ConversationGetResult

      if (!conv.conversation) {
        throw Errors.resource.notFound('Conversation', args.conversationId)
      }

      if (conv.conversation.userId !== identity.subject) {
        throw Errors.auth.forbidden()
      }

      const limit = Math.min(Math.max(args.limit ?? 200, 1), 500)

      const msgs = await ctx.runQuery(api.agentMessages.listByConversation, {
        workspaceId: args.workspaceId,
        conversationLegacyId: args.conversationId,
        limit,
      }) as ConversationMessagesResult

      return {
        conversation: {
          id: args.conversationId,
          startedAt:
            typeof conv.conversation.startedAt === 'number'
              ? new Date(conv.conversation.startedAt).toISOString()
              : null,
          lastMessageAt:
            typeof conv.conversation.lastMessageAt === 'number'
              ? new Date(conv.conversation.lastMessageAt).toISOString()
              : null,
          messageCount: conv.conversation.messageCount,
        },
        messages: msgs.messages.map((msg) => ({
          id: msg.legacyId,
          type: msg.type,
          content: msg.content,
          timestamp: new Date(msg.createdAt).toISOString(),
          route: msg.route,
          action: msg.action,
          operation: msg.operation,
          executeResult: msg.executeResult,
        })),
      }
    }, 'agentActions:getConversation'),
})