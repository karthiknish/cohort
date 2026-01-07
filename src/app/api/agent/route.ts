import { z } from 'zod'
import { FieldValue } from 'firebase-admin/firestore'
import { createApiHandler } from '@/lib/api-handler'
import { geminiAI } from '@/services/gemini'
import { buildRoutesForPrompt } from '@/lib/navigation-intents'
import { executeAgentAction, getOperationsDocumentation } from '@/services/agent/action-executor'

const agentRequestSchema = z.object({
  message: z.string().min(1).max(500),
  conversationId: z.string().optional(),
  context: z.object({
    previousMessages: z.array(z.object({
      type: z.enum(['user', 'agent']),
      content: z.string(),
    })).optional(),
  }).optional(),
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
  const cleaned = message
    .replace(/\s+/g, ' ')
    .replace(/[\r\n\t]+/g, ' ')
    .trim()
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

export const POST = createApiHandler(
  {
    bodySchema: agentRequestSchema,
    rateLimit: 'standard',
    workspace: 'required',
  },
  async (req, { auth, body, workspace }) => {
    const { message, conversationId, context } = body

    if (!workspace) {
      throw new Error('Workspace context is required')
    }

    // Get or create conversation document
    let convRef: FirebaseFirestore.DocumentReference
    let isNewConversation = false

    if (conversationId) {
      convRef = workspace.agentConversationsCollection.doc(conversationId)
    } else {
      convRef = workspace.agentConversationsCollection.doc()
      isNewConversation = true
    }

    // Save user message
    const userMessageRef = convRef.collection('messages').doc()
    await userMessageRef.set({
      type: 'user',
      content: message,
      createdAt: FieldValue.serverTimestamp(),
      userId: auth.uid,
    })

    // Update conversation metadata
    if (isNewConversation) {
      let title = fallbackTitleFromMessage(message)
      try {
        title = await generateConversationTitle(message)
      } catch (error) {
        console.warn('[agent] Failed to generate title, using fallback:', error)
      }

      await convRef.set({
        userId: auth.uid,
        startedAt: FieldValue.serverTimestamp(),
        lastMessageAt: FieldValue.serverTimestamp(),
        messageCount: 1,
        title,
      })
    } else {
      await convRef.update({
        lastMessageAt: FieldValue.serverTimestamp(),
        messageCount: FieldValue.increment(1),
      })
    }

    // Build conversation context
    let conversationHistory = ''
    if (context?.previousMessages && context.previousMessages.length > 0) {
      conversationHistory = context.previousMessages
        .slice(-4) // Last 4 messages for context
        .map(m => `${m.type === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n')
      conversationHistory = `\nRecent conversation:\n${conversationHistory}\n`
    }

    const prompt = `${SYSTEM_PROMPT}${conversationHistory}\nUser: ${message}\n\nRespond with JSON only:`

    let agentAction: string
    let agentRoute: string | null = null
    let agentMessage: string
    let agentOperation: string | null = null
    let agentParams: Record<string, unknown> | null = null
    let executeResult: { success: boolean; data?: Record<string, unknown> } | null = null

    try {
      const response = await geminiAI.generateContent(prompt)

      // Try to parse the JSON response
      let parsed: {
        action: string
        route?: string
        message: string
        operation?: string
        params?: Record<string, unknown>
      }

      try {
        // Clean up any markdown formatting that might have slipped in
        const cleanedResponse = response
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim()

        parsed = JSON.parse(cleanedResponse)

        // Debug: log what Gemini returned
        console.log('[agent] Gemini parsed response:', JSON.stringify(parsed, null, 2))
      } catch {
        // If JSON parsing fails, treat as a chat message
        console.warn('[agent] Failed to parse JSON, raw response:', response.slice(0, 300))
        parsed = {
          action: 'chat',
          message: response.slice(0, 200), // Limit length
        }
      }

      agentAction = parsed.action || 'chat'
      agentRoute = parsed.route || null
      agentOperation = parsed.operation || null
      agentParams = parsed.params || null

      // Debug: log action detection
      console.log('[agent] Detected action:', agentAction, 'operation:', agentOperation, 'params:', agentParams)

      // Handle execute actions
      if (agentAction === 'execute' && agentOperation && agentParams) {
        const result = await executeAgentAction(
          agentOperation,
          agentParams,
          {
            auth: { uid: auth.uid!, email: auth.email, name: auth.name },
            workspace: {
              workspaceId: workspace.workspaceId,
              financeCostsCollection: workspace.financeCostsCollection,
              tasksCollection: workspace.tasksCollection,
              projectsCollection: workspace.projectsCollection,
              proposalsCollection: workspace.proposalsCollection,
              messagesCollection: workspace.collaborationCollection,
              clientsCollection: workspace.clientsCollection,
            },
          }
        )

        agentMessage = result.message
        executeResult = { success: result.success, data: result.data }

        if (!result.success) {
          // If execution failed, change action to chat so frontend doesn't try to do anything special
          agentAction = 'chat'
        }
      } else {
        agentMessage = parsed.message || 'I didn\'t quite understand that. Try saying "Go to Analytics" or "Add 1000 in ad spend".'
      }
    } catch (error) {
      console.error('[agent] Gemini API error:', error)

      // Fallback to basic keyword matching if Gemini fails
      const lowerMessage = message.toLowerCase()

      const fallbackRoutes: Record<string, { route: string; name: string }> = {
        'dashboard': { route: '/dashboard', name: 'Dashboard' },
        'analytics': { route: '/dashboard/analytics', name: 'Analytics' },
        'tasks': { route: '/dashboard/tasks', name: 'Tasks' },
        'finance': { route: '/dashboard/finance', name: 'Finance' },
        'projects': { route: '/dashboard/projects', name: 'Projects' },
        'proposals': { route: '/dashboard/proposals', name: 'Proposals' },
        'collaboration': { route: '/dashboard/collaboration', name: 'Collaboration' },
        'clients': { route: '/dashboard/clients', name: 'Clients' },
        'ads': { route: '/dashboard/ads', name: 'Ads Hub' },
        'activity': { route: '/dashboard/activity', name: 'Activity' },
        'settings': { route: '/settings', name: 'Settings' },
      }

      agentAction = 'chat'
      agentMessage = 'I\'m having trouble understanding. Try saying "Go to Analytics" or "Add 500 in marketing spend".'

      for (const [keyword, info] of Object.entries(fallbackRoutes)) {
        if (lowerMessage.includes(keyword)) {
          agentAction = 'navigate'
          agentRoute = info.route
          agentMessage = `Taking you to ${info.name}...`
          break
        }
      }
    }

    // Save agent response
    const agentMessageRef = convRef.collection('messages').doc()
    await agentMessageRef.set({
      type: 'agent',
      content: agentMessage,
      action: agentAction,
      route: agentRoute,
      operation: agentOperation,
      params: agentParams,
      executeResult,
      createdAt: FieldValue.serverTimestamp(),
    })

    // Update conversation with agent message count
    await convRef.update({
      lastMessageAt: FieldValue.serverTimestamp(),
      messageCount: FieldValue.increment(1),
    })

    return {
      conversationId: convRef.id,
      action: agentAction,
      route: agentRoute,
      message: agentMessage,
      operation: agentOperation,
      executeResult,
    }
  }
)
