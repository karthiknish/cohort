import { ChatConversationTurn, ChatbotResponse, ChatbotAction } from '@/types/chatbot'

import { geminiAI } from './gemini'

interface GenerateResponseOptions {
  conversation?: ChatConversationTurn[]
  context?: Record<string, unknown>
}

const DEFAULT_SUGGESTIONS = [
  'Show analytics overview',
  'Review my upcoming tasks',
  'Summarize client performance',
  'Explain financial health'
]

const SITE_KNOWLEDGE_BASE = `
- Cohorts is a Next.js 16 + Firebase workspace for marketing agencies that unifies analytics, tasks, finance, proposals, collaboration, projects, and billing in one dashboard.
- Key dashboards: Analytics (campaign metrics and Gemini insights), Ads (platform connectors), Tasks (full CRUD with client + project linking), Finance (revenue, expenses, invoices, Stripe integration), Proposals (AI-powered multi-step wizard with Gamma PPT exports stored in Firebase), Collaboration (real-time team/client/project channels with attachments), Projects (project summaries with task and message stats), Settings/Admin (team roles, client workspaces, billing).
- AI integrations: Gemini generates insights, summaries, and chatbot replies; Gamma produces PowerPoint decks that are persisted to Firebase Storage with retry safeguards.
- Notifications: Workspace notifications fire for task creation, collaboration messages, and proposal deck readiness so admins, team, and relevant clients stay informed.
- Security & data: Firebase Auth guards all API routes, Firestore/Storage rules enforce tenant isolation, and client context scopes data per workspace.
- Documentation highlights remaining gaps (automated testing, CI/CD, background ingestion jobs, monitoring) but core feature set is production-ready.
`.trim()

const PLATFORM_MODULES: Array<ChatbotAction & { description: string }> = [
  {
    label: 'Go to Analytics',
    url: '/dashboard/analytics',
    description: 'Campaign performance dashboards, ROAS, and spend trends.'
  },
  {
    label: 'Manage Tasks',
    url: '/dashboard/tasks',
    description: 'Task tracking, prioritization, and assignments.'
  },
  {
    label: 'View Clients',
    url: '/dashboard/clients',
    description: 'Client health, revenue, and performance summaries.'
  },
  {
    label: 'Review Proposals',
    url: '/dashboard/proposals',
    description: 'Proposal pipeline, drafts, and approvals.'
  },
  {
    label: 'Finance Overview',
    url: '/dashboard/finance',
    description: 'Revenue, expenses, invoices, and profitability insights.'
  }
]

class ChatbotService {
  private contextData: Record<string, unknown> | null = null

  setContext(data: Record<string, unknown>) {
    this.contextData = data
  }

  async generateResponse(userMessage: string, options?: GenerateResponseOptions): Promise<ChatbotResponse> {
    const prompt = this.buildPrompt(userMessage, options)

    try {
      const aiResponse = await geminiAI.generateContent(prompt)
      return this.parseResponse(aiResponse)
    } catch (error) {
      console.error('Chatbot AI service error:', error)

      return {
        message: "I couldn't reach the AI just now, but I'm still here to help. Try asking again or jump into a section below.",
        suggestions: DEFAULT_SUGGESTIONS,
        actions: PLATFORM_MODULES.slice(0, 3).map(({ label, url }) => ({ label, url }))
      }
    }
  }

  async getInsights(platform?: string) {
    const prompt = `Provide 3 key insights and recommendations for a marketing agency${platform ? ` focusing on ${platform} ads` : ''}. Include specific metrics and actionable advice.`

    try {
      return await geminiAI.generateContent(prompt)
    } catch {
      return "I'm unable to generate AI insights right now, but here are some general recommendations:\n\n• Focus on improving ROAS across all platforms\n• Review underperforming campaigns\n• Optimize ad spend allocation\n• Test new creatives and audiences"
    }
  }

  async generateSummary(data: unknown, type: 'client' | 'campaign' | 'financial') {
    const prompt = `Generate a concise summary for ${type} performance: ${JSON.stringify(data)}`

    try {
      return await geminiAI.generateContent(prompt)
    } catch {
      return 'Summary: Based on the data provided, performance shows room for improvement. Key areas to focus include optimization and strategic adjustments.'
    }
  }

  private buildPrompt(userMessage: string, options?: GenerateResponseOptions): string {
    const history = this.formatConversation(options?.conversation)
    const moduleDescriptions = PLATFORM_MODULES.map(
      ({ label, url, description }) => `- ${label} (${url}): ${description}`
    ).join('\n')

    const contextSnippets: string[] = []

    contextSnippets.push(`Site knowledge: ${SITE_KNOWLEDGE_BASE}`)

    if (this.contextData) {
      contextSnippets.push(`Saved context: ${JSON.stringify(this.contextData)}`)
    }

    if (options?.context) {
      contextSnippets.push(`Runtime context: ${JSON.stringify(options.context)}`)
    }

    const additionalContext = contextSnippets.length
      ? contextSnippets.join('\n')
      : 'No additional context provided.'

    return `You are Cohorts AI Assistant, a marketing agency copilot inside a dashboard application.\n\nPlatform modules you can reference:\n${moduleDescriptions}\n\nAdditional context:\n${additionalContext}\n\nConversation so far:\n${history}\n\nLatest user request: "${userMessage}"\n\nRespond with a single JSON object, with no markdown fences or extra text. Use this shape:\n{\n  "reply": "markdown-ready answer summarizing insights and next steps",\n  "suggestions": ["optional follow-up prompt", "..."],\n  "actions": [{"label": "Action label", "url": "/dashboard/..."}]\n}\n\nGuidelines:\n- Keep reply concise, actionable, and friendly.\n- Reference modules using the provided URLs when suggesting navigation.\n- Provide 1-3 suggestions using natural language.\n- Provide up to 3 actions; omit the array if none are relevant.\n- If data is missing, ask a clarifying question in the reply.\n- Avoid repeating the user question verbatim unless needed for clarity.`
  }

  private formatConversation(conversation?: ChatConversationTurn[]): string {
    if (!conversation?.length) {
      return 'No prior conversation.'
    }

    const recentTurns = conversation.slice(-8)

    return recentTurns
      .map((turn) => {
        const speaker = turn.role === 'assistant' ? 'Assistant' : 'User'
        return `${speaker}: ${turn.content}`
      })
      .join('\n')
  }

  private parseResponse(raw: string): ChatbotResponse {
    const cleaned = raw.trim()
    const jsonPayload = this.extractJson(cleaned)

    if (!jsonPayload) {
      return {
        message: cleaned || "I'm ready to help with analytics, tasks, clients, proposals, or finance.",
        suggestions: DEFAULT_SUGGESTIONS
      }
    }

    try {
      const parsed = JSON.parse(jsonPayload)
      const reply = this.extractMessage(parsed, cleaned)
      const suggestions = this.extractSuggestions(parsed)
      const actions = this.extractActions(parsed)

      return {
        message: reply,
        suggestions: suggestions?.length ? suggestions : DEFAULT_SUGGESTIONS,
        actions: actions?.length ? actions : undefined
      }
    } catch (error) {
      console.warn('Unable to parse structured Gemini response:', error)
      return {
        message: cleaned || "I'm ready to help with analytics, tasks, clients, proposals, or finance.",
        suggestions: DEFAULT_SUGGESTIONS
      }
    }
  }

  private extractJson(response: string): string | null {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    return jsonMatch ? jsonMatch[0] : null
  }

  private extractMessage(payload: Record<string, unknown>, fallback: string): string {
    const reply = payload.reply ?? payload.message ?? payload.answer

    if (typeof reply === 'string' && reply.trim().length > 0) {
      return reply.trim()
    }

    return fallback || "I'm here to help you manage your marketing operations."
  }

  private extractSuggestions(payload: Record<string, unknown>): string[] | undefined {
    const suggestions = payload.suggestions

    if (!Array.isArray(suggestions)) {
      return undefined
    }

    return suggestions
      .filter((suggestion): suggestion is string => typeof suggestion === 'string' && suggestion.trim().length > 0)
      .map((suggestion) => suggestion.trim())
      .slice(0, 4)
  }

  private extractActions(payload: Record<string, unknown>): ChatbotAction[] | undefined {
    const actions = payload.actions

    if (!Array.isArray(actions)) {
      return undefined
    }

    const validActions = actions
      .map((action) => {
        if (
          typeof action === 'object' &&
          action !== null &&
          typeof (action as { label?: unknown }).label === 'string' &&
          typeof (action as { url?: unknown }).url === 'string'
        ) {
          return {
            label: (action as { label: string }).label.trim(),
            url: (action as { url: string }).url.trim()
          }
        }
        return null
      })
      .filter((action): action is ChatbotAction => Boolean(action?.label && action.url))
      .slice(0, 3)

    if (!validActions.length) {
      return undefined
    }

    return validActions
  }
}

export const chatbotService = new ChatbotService()
