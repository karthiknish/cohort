"use node"

import { api } from '/_generated/api'
import { action, type ActionCtx } from './_generated/server'
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
import { executeOperationTurn, tryResolveConfirmationTurn } from './agentActions/runExecuteTurn'
import type { AgentConfirmationProposal } from './agentActions/helpers/confirmation'
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
      const userMessageParams: Record<string, unknown> = {}
      if (args.context?.mentions && args.context.mentions.length > 0) {
        userMessageParams.mentions = args.context.mentions
      }
      if (args.context?.attachments && args.context.attachments.length > 0) {
        userMessageParams.attachments = args.context.attachments
      }
      const mentionParams = Object.keys(userMessageParams).length > 0 ? userMessageParams : null

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
        params: mentionParams as JsonRecord | null,
        executeResult: null,
      })

      await ctx.runMutation(api.agentConversations.updatePreviewSnippet, {
        workspaceId: args.workspaceId,
        legacyId: convId,
        previewSnippet: args.message.slice(0, 160),
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
      let requiresConfirmation = false
      let confirmation: AgentConfirmationProposal | undefined

      const turnArgs = {
        workspaceId: args.workspaceId,
        userId,
        conversationId: convId,
        message: args.message,
        context: args.context,
      }

      const confirmationTurn = await tryResolveConfirmationTurn(ctx, turnArgs)

      if (confirmationTurn) {
        agentAction = confirmationTurn.agentAction
        agentRoute = confirmationTurn.agentRoute
        agentMessage = confirmationTurn.agentMessage
        agentOperation = confirmationTurn.agentOperation
        agentParams = confirmationTurn.agentParams
        executeResult = confirmationTurn.executeResult
        requiresConfirmation = confirmationTurn.requiresConfirmation ?? false
        confirmation = confirmationTurn.confirmation
      } else if (deterministicIntent?.action === 'navigate') {
        agentAction = 'navigate'
        agentRoute = deterministicIntent.route
        agentMessage = deterministicIntent.message
      } else if (deterministicIntent?.action === 'clarify') {
        agentAction = 'clarify'
        agentMessage = deterministicIntent.message
      } else if (deterministicIntent?.action === 'execute') {
        const executeTurn = await executeOperationTurn(
          ctx,
          turnArgs,
          deterministicIntent.operation,
          deterministicIntent.params,
          { fallbackMessage: deterministicIntent.message },
        )
        agentAction = executeTurn.agentAction
        agentRoute = executeTurn.agentRoute
        agentMessage = executeTurn.agentMessage
        agentOperation = executeTurn.agentOperation
        agentParams = executeTurn.agentParams
        executeResult = executeTurn.executeResult
        requiresConfirmation = executeTurn.requiresConfirmation ?? false
        confirmation = executeTurn.confirmation
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
            agentMessage = executeResult.userMessage ?? 'I need an operation name to execute this action.'
          } else {
            const executeTurn = await executeOperationTurn(ctx, turnArgs, operation, params, {
              fallbackMessage: typeof parsed.message === 'string' ? parsed.message : null,
            })
            agentAction = executeTurn.agentAction
            agentRoute = executeTurn.agentRoute
            agentMessage = executeTurn.agentMessage
            agentOperation = executeTurn.agentOperation
            agentParams = executeTurn.agentParams
            executeResult = executeTurn.executeResult
            requiresConfirmation = executeTurn.requiresConfirmation ?? false
            confirmation = executeTurn.confirmation
          }
        } else {
          agentMessage = typeof parsed.message === 'string' ? parsed.message : agentMessage
        }
      }

      const agentMessageLegacyId = crypto.randomUUID()
      const storedExecuteResult = serializeExecuteResultForStorage(executeResult)

      await Promise.all([
        ctx.runMutation(api.agentMessages.upsert, {
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
        }),
        ctx.runMutation(api.agentConversations.upsert, {
          workspaceId: args.workspaceId,
          legacyId: convId,
          userId,
          lastMessageAt: Date.now(),
          messageCount: previousMessageCount + 2,
        }),
        ctx.runMutation(api.agentConversations.updatePreviewSnippet, {
          workspaceId: args.workspaceId,
          legacyId: convId,
          previewSnippet: (agentMessage || args.message).slice(0, 160),
        }),
      ])

      const steps = [
        { id: 'parse', label: 'Parsed request', status: 'completed' as const },
        { id: 'context', label: 'Resolved context', status: 'completed' as const },
        {
          id: 'action',
          label: requiresConfirmation
            ? 'Awaiting confirmation'
            : agentAction === 'navigate'
              ? 'Navigation'
              : agentAction === 'execute' && agentOperation
                ? `Executed ${agentOperation}`
                : agentAction === 'clarify'
                  ? 'Clarification'
                  : 'Response',
          status: requiresConfirmation
            ? ('active' as const)
            : executeResult?.success === false
              ? ('failed' as const)
              : ('completed' as const),
          detail: executeResult?.success === false ? executeResult.userMessage : undefined,
        },
        {
          id: 'done',
          label: requiresConfirmation
            ? 'Waiting for you'
            : executeResult?.success === false
              ? 'Needs attention'
              : 'Done',
          status: requiresConfirmation
            ? ('pending' as const)
            : executeResult?.success === false
              ? ('failed' as const)
              : ('completed' as const),
        },
      ]

      const pendingExecution =
        requiresConfirmation && agentOperation && agentParams
          ? {
              confirmationId:
                typeof agentParams._confirmationId === 'string'
                  ? agentParams._confirmationId
                  : agentMessageLegacyId,
              operation: agentOperation,
              params: Object.fromEntries(
                Object.entries(agentParams).filter(
                  ([key]) => !key.startsWith('_'),
                ),
              ),
            }
          : undefined

      return {
        conversationId: convId,
        userMessageId: userMessageLegacyId,
        agentMessageId: agentMessageLegacyId,
        action: agentAction,
        route: agentRoute,
        message: agentMessage,
        operation: agentOperation,
        executeResult,
        steps,
        requiresConfirmation: requiresConfirmation || undefined,
        confirmation,
        pendingExecution,
      }
    }, 'agentActions:sendMessage'),
})

export const listConversations = action({
  args: {
    workspaceId: v.string(),
    limit: v.optional(v.number()),
    cursor: v.optional(v.union(v.number(), v.null())),
    search: v.optional(v.union(v.string(), v.null())),
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<{
    conversations: Array<{
      id: string
      title: string
      startedAt: string | null
      lastMessageAt: string | null
      messageCount: number
      pinnedAt: string | null
      archivedAt: string | null
      previewSnippet: string | null
    }>
    nextCursor: number | null
    hasMore: boolean
  }> =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      const limit = Math.min(Math.max(args.limit ?? 30, 1), 50)

      const result = await ctx.runQuery(api.agentConversations.list, {
        workspaceId: args.workspaceId,
        userId: identity.subject,
        limit,
        cursor: args.cursor ?? null,
        search: args.search ?? null,
        includeArchived: args.includeArchived ?? false,
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
          pinnedAt:
            typeof row.pinnedAt === 'number' ? new Date(row.pinnedAt).toISOString() : null,
          archivedAt:
            typeof row.archivedAt === 'number' ? new Date(row.archivedAt).toISOString() : null,
          previewSnippet: row.previewSnippet ?? null,
        })),
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
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
          params: msg.params ?? null,
          executeResult: msg.executeResult,
        })),
      }
    }, 'agentActions:getConversation'),
})

async function loadConversationExportPayload(
  ctx: ActionCtx,
  args: { workspaceId: string; conversationId: string },
  userId: string,
) {
  const conv = await ctx.runQuery(api.agentConversations.get, {
    workspaceId: args.workspaceId,
    legacyId: args.conversationId,
  }) as ConversationGetResult

  if (!conv.conversation) {
    throw Errors.resource.notFound('Conversation', args.conversationId)
  }
  if (conv.conversation.userId !== userId) {
    throw Errors.auth.forbidden()
  }

  const msgs = await ctx.runQuery(api.agentMessages.listByConversation, {
    workspaceId: args.workspaceId,
    conversationLegacyId: args.conversationId,
    limit: 500,
  }) as ConversationMessagesResult

  const title = conv.conversation.title?.trim() || 'Agent chat'

  return {
    id: args.conversationId,
    title,
    startedAt:
      typeof conv.conversation.startedAt === 'number'
        ? new Date(conv.conversation.startedAt).toISOString()
        : null,
    lastMessageAt:
      typeof conv.conversation.lastMessageAt === 'number'
        ? new Date(conv.conversation.lastMessageAt).toISOString()
        : null,
    messages: msgs.messages.map((message) => ({
      id: message.legacyId,
      type: message.type,
      content: message.content,
      timestamp: new Date(message.createdAt).toISOString(),
      route: message.route,
      operation: message.operation,
    })),
  }
}

export const duplicateConversation = action({
  args: {
    workspaceId: v.string(),
    conversationId: v.string(),
  },
  handler: async (ctx, args): Promise<{ conversationId: string; messageCount: number }> =>
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

      const msgs = await ctx.runQuery(api.agentMessages.listByConversation, {
        workspaceId: args.workspaceId,
        conversationLegacyId: args.conversationId,
        limit: 500,
      }) as ConversationMessagesResult

      const now = Date.now()
      const newConversationId = crypto.randomUUID()
      const sourceTitle = conv.conversation.title?.trim() || 'Chat'
      const title = `${sourceTitle.slice(0, 48)} (copy)`

      await ctx.runMutation(api.agentConversations.upsert, {
        workspaceId: args.workspaceId,
        legacyId: newConversationId,
        userId: identity.subject,
        title,
        startedAt: now,
        lastMessageAt: now,
        messageCount: msgs.messages.length,
      })

      await Promise.all(
        msgs.messages.map(async (message) =>
          ctx.runMutation(api.agentMessages.upsert, {
            workspaceId: args.workspaceId,
            conversationLegacyId: newConversationId,
            legacyId: crypto.randomUUID(),
            type: message.type,
            content: message.content,
            createdAt: message.createdAt,
            userId: message.type === 'user' ? identity.subject : null,
            action: message.action,
            route: message.route,
            operation: message.operation,
            params: (message.params ?? null) as JsonRecord | null,
            executeResult: (message.executeResult ?? null) as JsonRecord | null,
          }),
        ),
      )

      const lastMessage = msgs.messages[msgs.messages.length - 1]
      if (lastMessage) {
        await ctx.runMutation(api.agentConversations.updatePreviewSnippet, {
          workspaceId: args.workspaceId,
          legacyId: newConversationId,
          previewSnippet: lastMessage.content.slice(0, 160),
        })
      }

      return { conversationId: newConversationId, messageCount: msgs.messages.length }
    }, 'agentActions:duplicateConversation'),
})

export const exportConversation = action({
  args: {
    workspaceId: v.string(),
    conversationId: v.string(),
    format: v.optional(v.union(v.literal('json'), v.literal('markdown'))),
  },
  handler: async (ctx, args): Promise<{ format: 'json' | 'markdown'; content: string; title: string }> =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      const payload = await loadConversationExportPayload(ctx, args, identity.subject)
      const format = args.format ?? 'markdown'
      if (format === 'json') {
        return { format, content: JSON.stringify(payload, null, 2), title: payload.title }
      }

      const lines: string[] = [`# ${payload.title}`, '']
      if (payload.startedAt) lines.push(`Started: ${payload.startedAt}`)
      if (payload.lastMessageAt) lines.push(`Last message: ${payload.lastMessageAt}`)
      lines.push('')

      for (const message of payload.messages) {
        const speaker = message.type === 'user' ? 'You' : 'Agent'
        lines.push(`## ${speaker} · ${message.timestamp}`)
        lines.push('')
        lines.push(message.content.trim())
        if (message.route) {
          lines.push('')
          lines.push(`Route: ${message.route}`)
        }
        lines.push('')
      }

      return { format, content: lines.join('\n').trim(), title: payload.title }
    }, 'agentActions:exportConversation'),
})

export const shareConversation = action({
  args: {
    workspaceId: v.string(),
    conversationId: v.string(),
  },
  handler: async (ctx, args): Promise<{ markdown: string; deepLinkPath: string }> =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      const payload = await loadConversationExportPayload(ctx, args, identity.subject)
      const lines: string[] = [`# ${payload.title}`, '']
      if (payload.startedAt) lines.push(`Started: ${payload.startedAt}`)
      if (payload.lastMessageAt) lines.push(`Last message: ${payload.lastMessageAt}`)
      lines.push('')
      for (const message of payload.messages) {
        const speaker = message.type === 'user' ? 'You' : 'Agent'
        lines.push(`## ${speaker} · ${message.timestamp}`)
        lines.push('')
        lines.push(message.content.trim())
        lines.push('')
      }

      return {
        markdown: lines.join('\n').trim(),
        deepLinkPath: `/dashboard?agentConversation=${encodeURIComponent(args.conversationId)}`,
      }
    }, 'agentActions:shareConversation'),
})