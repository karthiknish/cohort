"use node"

import { action } from './_generated/server'
import { api } from './_generated/api'
import { v } from 'convex/values'
import { Errors } from './errors'

import { buildRoutesForPrompt } from '../src/lib/navigation-intents'
import { geminiAI } from '../src/services/gemini'

function getOperationsDocumentation(): string {
  return `
## Executable Operations (action: "execute")

When the user wants to CREATE or UPDATE data, use:
{"action": "execute", "operation": "<operation>", "params": {...}, "message": "Confirmation message"}

### Financial Operations
- **createCost**: Add expense to Finance
  Params: { category: string, amount: number, cadence?: "one-off"|"monthly"|"quarterly"|"annual" }
  Example: "add $1000 ad spend" → {"action": "execute", "operation": "createCost", "params": {"category": "Ad Spend", "amount": 1000}, "message": "Done! Added $1,000 Ad Spend expense."}

### Task Operations  
- **createTask**: Create a new task
  Params: { title: string, priority?: "low"|"medium"|"high", description?: string }
  Example: "remind me to review proposals" → {"action": "execute", "operation": "createTask", "params": {"title": "Review proposals"}, "message": "Done! Task created."}
`
}

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) {
    throw Errors.auth.unauthorized()
  }
}

const agentRequestContext = v.object({
  previousMessages: v.optional(
    v.array(
      v.object({
        type: v.union(v.literal('user'), v.literal('agent')),
        content: v.string(),
      })
    )
  ),
})

const SYSTEM_PROMPT = `You are a friendly AI assistant for "Cohorts", a marketing agency dashboard.
You can help users NAVIGATE to pages AND EXECUTE actions like adding expenses or creating tasks.

## Available Dashboard Pages:
${buildRoutesForPrompt()}

${getOperationsDocumentation()}

## How to Respond

**When user wants to navigate somewhere**, respond with JSON:
{"action": "navigate", "route": "/dashboard/analytics", "message": "Taking you to Analytics..."}

**When user wants to CREATE/ADD something** (expenses, tasks, etc.), respond with:
{"action": "execute", "operation": "createCost", "params": {"category": "Ad Spend", "amount": 1000}, "message": "Done! I've added $1,000..."}

**When you need clarification**, ask a brief question:
{"action": "clarify", "message": "How much would you like to add? And what category?"}

**For greetings or general questions**, be friendly:
{"action": "chat", "message": "Hey! I can help you navigate or add data. What do you need?"}

## Tips for Understanding Users
- "add X in ad spend/marketing" → EXECUTE createCost
- "create a task to..." or "remind me to..." → EXECUTE createTask
- "check my numbers" or "see performance" → navigate to Analytics
- "money stuff", "billing", "invoices" → navigate to Finance
- "show tasks", "my to-do list" → navigate to Tasks

**Always respond with valid JSON only. Be brief but friendly.**`

function fallbackTitleFromMessage(message: string): string {
  const cleaned = message.replace(/\s+/g, ' ').replace(/[\r\n\t]+/g, ' ').trim()
  if (!cleaned) return 'New chat'
  return cleaned.length > 60 ? `${cleaned.slice(0, 57)}...` : cleaned
}

async function generateConversationTitle(message: string): Promise<string> {
  const prompt = `Generate a short title for this user request.

Rules:
- 2 to 7 words
- Title Case
- No quotes
- No trailing punctuation

Request: ${JSON.stringify(message)}

Title:`

  const raw = await geminiAI.generateContent(prompt)
  const cleaned = raw
    .replace(/"/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[\.!:;,-]+$/g, '')

  const safe = cleaned.length > 0 ? cleaned : fallbackTitleFromMessage(message)
  return safe.length > 60 ? `${safe.slice(0, 57)}...` : safe
}

function parseGeminiResponse(raw: string): {
  action: string
  route?: string
  message?: string
  operation?: string
  params?: Record<string, unknown>
} {
  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return { action: 'chat', message: raw.slice(0, 200) }
  }
}

function formatConversationHistory(context?: {
  previousMessages?: Array<{ type: 'user' | 'agent'; content: string }>
}): string {
  if (!context?.previousMessages?.length) return ''

  const history = context.previousMessages
    .slice(-4)
    .map((m) => `${m.type === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n')

  return `\nRecent conversation:\n${history}\n`
}

async function safeExecuteOperation(ctx: any, args: { workspaceId: string; operation: string; params: Record<string, unknown> }) {
  const operation = args.operation

  if (operation === 'createCost' || operation === 'addExpense') {
    const category = typeof args.params.category === 'string' ? args.params.category : 'Ad Spend'
    const amountRaw = (args.params as any).amount
    const amount = typeof amountRaw === 'number' ? amountRaw : Number(amountRaw)
    const cadence = typeof args.params.cadence === 'string' ? args.params.cadence : 'monthly'
    const currency = typeof args.params.currency === 'string' ? args.params.currency : 'USD'

    if (!Number.isFinite(amount) || amount <= 0) {
      return { success: false, data: { error: 'Invalid amount' } }
    }

    const result = await ctx.runMutation('financeCosts:create', {
      workspaceId: args.workspaceId,
      clientId: null,
      category,
      amount,
      cadence,
      currency,
    })

    return { success: true, data: result }
  }

  return { success: false, data: { error: `Unsupported operation: ${operation}` } }
}

export const sendMessage = action({
  args: {
    workspaceId: v.string(),
    message: v.string(),
    conversationId: v.optional(v.union(v.string(), v.null())),
    context: v.optional(agentRequestContext),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const now = Date.now()
    const userId = identity.subject

    const conversationId = args.conversationId ?? null
    const isNewConversation = !conversationId

    const convId = conversationId ?? crypto.randomUUID()

    // Upsert conversation (similar to legacy dual-write mechanics)
    if (isNewConversation) {
      let title = fallbackTitleFromMessage(args.message)
      try {
        title = await generateConversationTitle(args.message)
      } catch {
        // ignore
      }

      await ctx.runMutation(api.agentConversations.upsert, {
        workspaceId: args.workspaceId,
        legacyId: convId,
        userId,
        title,
        startedAt: now,
        lastMessageAt: now,
        messageCount: 1,
      })
    } else {
      await ctx.runMutation(api.agentConversations.upsert, {
        workspaceId: args.workspaceId,
        legacyId: convId,
        userId,
        lastMessageAt: now,
      })
    }

    // Save user message
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

    // Build prompt and call Gemini
    const prompt = `${SYSTEM_PROMPT}${formatConversationHistory(args.context)}\nUser: ${args.message}\n\nRespond with JSON only:`

    let agentAction = 'chat'
    let agentRoute: string | null = null
    let agentMessage = 'I didn\'t quite understand that.'
    let agentOperation: string | null = null
    let agentParams: Record<string, unknown> | null = null
    let executeResult: { success: boolean; data?: Record<string, unknown> } | null = null

    const raw = await geminiAI.generateContent(prompt)
    const parsed = parseGeminiResponse(raw)

    agentAction = parsed.action || 'chat'
    agentRoute = parsed.route || null
    agentOperation = parsed.operation || null
    agentParams = parsed.params || null

    if (agentAction === 'execute' && agentOperation && agentParams) {
      const result = await safeExecuteOperation(ctx, {
        workspaceId: args.workspaceId,
        operation: agentOperation,
        params: agentParams,
      })

      executeResult = { success: result.success, data: result.data }
      agentMessage = typeof parsed.message === 'string' ? parsed.message : 'Action completed.'

      if (!executeResult.success) {
        agentAction = 'chat'
      }
    } else {
      agentMessage = typeof parsed.message === 'string' ? parsed.message : agentMessage
    }

    const agentMessageLegacyId = crypto.randomUUID()
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
      params: agentParams,
      executeResult,
    })

    await ctx.runMutation(api.agentConversations.upsert, {
      workspaceId: args.workspaceId,
      legacyId: convId,
      userId,
      lastMessageAt: Date.now(),
    })

    return {
      conversationId: convId,
      action: agentAction,
      route: agentRoute,
      message: agentMessage,
      operation: agentOperation,
      executeResult,
    }
  },
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
  }> => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const limit = Math.min(Math.max(args.limit ?? 20, 1), 50)

    const result: any = await ctx.runQuery(api.agentConversations.list, {
      workspaceId: args.workspaceId,
      userId: identity.subject,
      limit,
    })

    return {
      conversations: result.conversations.map((row: any) => ({
        id: row.legacyId,
        title: row.title,
        startedAt: typeof row.startedAt === 'number' ? new Date(row.startedAt).toISOString() : null,
        lastMessageAt: typeof row.lastMessageAt === 'number' ? new Date(row.lastMessageAt).toISOString() : null,
        messageCount: row.messageCount,
      })),
    }
  },
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
    }>
  }> => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const conv: any = await ctx.runQuery(api.agentConversations.get, {
      workspaceId: args.workspaceId,
      legacyId: args.conversationId,
    })

    if (!conv.conversation) {
      throw Errors.resource.notFound('Conversation')
    }

    if (conv.conversation.userId !== identity.subject) {
      throw Errors.auth.forbidden()
    }

    const limit = Math.min(Math.max(args.limit ?? 200, 1), 500)

    const msgs: any = await ctx.runQuery(api.agentMessages.listByConversation, {
      workspaceId: args.workspaceId,
      conversationLegacyId: args.conversationId,
      limit,
    })

    return {
      conversation: {
        id: args.conversationId,
        startedAt: typeof conv.conversation.startedAt === 'number' ? new Date(conv.conversation.startedAt).toISOString() : null,
        lastMessageAt:
          typeof conv.conversation.lastMessageAt === 'number' ? new Date(conv.conversation.lastMessageAt).toISOString() : null,
        messageCount: conv.conversation.messageCount,
      },
      messages: msgs.messages.map((msg: any) => ({
        id: msg.legacyId,
        type: msg.type,
        content: msg.content,
        timestamp: new Date(msg.createdAt).toISOString(),
        route: msg.route,
      })),
    }
  },
})
