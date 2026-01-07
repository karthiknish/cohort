import { z } from 'zod'
import { FieldValue } from 'firebase-admin/firestore'
import { createApiHandler } from '@/lib/api-handler'
import { geminiAI } from '@/services/gemini'
import { buildRoutesForPrompt } from '@/lib/navigation-intents'

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

const SYSTEM_PROMPT = `You are a friendly navigation assistant for "Cohorts", a marketing agency dashboard.
Your job is to help users find what they need quickly. Be warm, helpful, and concise.

## Available Dashboard Pages:
${buildRoutesForPrompt()}

## How to Respond

**When user wants to navigate somewhere**, respond with JSON:
{"action": "navigate", "route": "/dashboard/analytics", "message": "Taking you to Analytics..."}

**When you need clarification**, ask a brief question:
{"action": "clarify", "message": "Would you like to see your invoices or track expenses?"}

**For greetings or general questions**, be friendly:
{"action": "chat", "message": "Hey! I can help you navigate. What are you looking for?"}

## Tips for Understanding Users
- "check my numbers" or "see performance" → Analytics
- "money stuff", "billing", "send invoice" → Finance  
- "team chat", "message someone" → Collaboration
- "what's new", "recent updates" → Activity
- "marketing campaigns", "ad spend" → Ads Hub
- "to-do", "assignments", "what should I do" → Tasks
- "pitch", "quote for client" → Proposals

**Always respond with valid JSON only. Be brief but friendly.**`

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
      await convRef.set({
        userId: auth.uid,
        startedAt: FieldValue.serverTimestamp(),
        lastMessageAt: FieldValue.serverTimestamp(),
        messageCount: 1,
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

    try {
      const response = await geminiAI.generateContent(prompt)
      
      // Try to parse the JSON response
      let parsed: { action: string; route?: string; message: string }
      
      try {
        // Clean up any markdown formatting that might have slipped in
        const cleanedResponse = response
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim()
        
        parsed = JSON.parse(cleanedResponse)
      } catch {
        // If JSON parsing fails, treat as a chat message
        parsed = {
          action: 'chat',
          message: response.slice(0, 200), // Limit length
        }
      }

      agentAction = parsed.action || 'chat'
      agentRoute = parsed.route || null
      agentMessage = parsed.message || 'I didn\'t quite understand that. Try saying "Go to Analytics" or "Show me Tasks".'
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
      agentMessage = 'I\'m having trouble understanding. Try saying "Go to Analytics" or "Show me Tasks".'

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
    }
  }
)
