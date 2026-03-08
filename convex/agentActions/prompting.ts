import { v } from 'convex/values'

import { buildRoutesForPrompt } from '../../src/lib/navigation-intents'
import { geminiAI } from '../../src/services/gemini'
import { Errors } from '../errors'

import type { ParsedAgentResponse } from './types'

function getOperationsDocumentation(): string {
  return `
## Executable Operations (action: "execute")

When the user wants to CREATE or UPDATE data, use:
{"action": "execute", "operation": "<operation>", "params": {...}, "message": "Confirmation message"}

### Task Operations
- **createTask**: Create a new task
  Params: { title: string, priority?: "low"|"medium"|"high", description?: string, dueDate?: string, clientId?: string, clientName?: string }
  Example: "remind me to review proposals" → {"action": "execute", "operation": "createTask", "params": {"title": "Review proposals"}, "message": "Done! Task created."}

- **updateTask**: Update a task status, priority, title, description, or due date
  Params: { taskId: string, status?: string, priority?: string, title?: string, description?: string, dueDate?: string }

- **summarizeClientTasks**: List or summarize tasks for a specific client
  Params: { clientReference?: string, clientId?: string, mode?: "list"|"summary" }
  Example: "list all the tasks in @abc client" → {"action": "execute", "operation": "summarizeClientTasks", "params": {"clientReference": "abc", "mode": "list"}, "message": "Listing the tasks for abc now."}

### Project Operations
- **createProject**: Create a project
  Params: { name: string, description?: string, status?: string, clientId?: string, clientName?: string, startDate?: string, endDate?: string, tags?: string[] }
  Examples:
  - "create project Website Refresh" → {"action": "execute", "operation": "createProject", "params": {"name": "Website Refresh"}, "message": "Creating project Website Refresh."}
  - "create project Q2 SEO Sprint for this client" → use activeClientId when present

- **updateProject**: Update project fields
  Params: { projectId: string, name?: string, description?: string, status?: string, clientId?: string, clientName?: string, startDate?: string, endDate?: string, tags?: string[] }
  Examples:
  - "update this project status to active" → use activeProjectId when present
  - "update project proj_123 status to on_hold" → {"action": "execute", "operation": "updateProject", "params": {"projectId": "proj_123", "status": "on_hold"}, "message": "Updating that project now."}

### Client Operations
- **createClient**: Create a client record
  Params: { name: string, accountManager?: string, teamMembers?: Array<{name: string, role?: string}> }

- **addClientTeamMember**: Add a team member to an existing client
  Params: { clientId: string, name: string, role?: string }

### Messaging Operations
- **sendDirectMessage**: Send a direct message to a workspace user
  Params: { recipientQuery: string, content: string }
  Example: "send a chat to @Deepak saying hi" → {"action": "execute", "operation": "sendDirectMessage", "params": {"recipientQuery": "Deepak", "content": "hi"}, "message": "Sending that message to Deepak now."}

### Proposal Operations
- **createProposalDraft**: Create a proposal draft
  Params: { clientId?: string, clientName?: string, formData?: object, status?: string, stepProgress?: number }

- **updateProposalDraft**: Refine an existing proposal draft
  Params: { proposalId?: string, formPatch?: object, status?: string, stepProgress?: number, clientId?: string, clientName?: string }
  Note: If proposalId is omitted, use activeProposalId from context.

- **generateProposalFromDraft**: Trigger proposal generation pipeline
  Params: { proposalId?: string }
  Note: If proposalId is omitted, use activeProposalId from context.

### Ads Operations
- **updateAdsCampaignStatus**: Enable or pause an ads campaign
  Params: { providerId: "google"|"tiktok"|"linkedin"|"facebook", campaignId: string, action?: "enable"|"pause", status?: "active"|"paused", clientId?: string }

- **updateAdsCreativeStatus**: Enable or pause an ads creative
  Params: { providerId: "google"|"tiktok"|"linkedin"|"facebook", creativeId: string, status: "active"|"paused", adGroupId?: string, clientId?: string }

### Reporting Operations
- **summarizeAdsPerformance**: Return a compact ads snapshot with current performance and leading campaigns
  Params: { period?: "daily"|"weekly"|"monthly", startDate?: string, endDate?: string, focus?: "active", clientId?: string, providerId?: "google"|"tiktok"|"linkedin"|"facebook", providerIds?: string[] }
  Examples:
  - "how are my Meta ads doing this week" → use summarizeAdsPerformance with providerIds: ["facebook"] and activeClientId when available
  - "what campaigns are active right now" → use summarizeAdsPerformance with focus: "active"

- **generatePerformanceReport**: Generate a daily, weekly, or monthly performance report
  Params: { period?: "daily"|"weekly"|"monthly", startDate?: string, endDate?: string, clientId?: string, providerIds?: string[] }
  Examples:
  - "generate a weekly performance report" → {"action": "execute", "operation": "generatePerformanceReport", "params": {"period": "weekly"}, "message": "Generating your weekly performance report..."}
  - "generate a monthly Google + Meta report for this client" → include providerIds and activeClientId when available
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
  activeProposalId: v.optional(v.union(v.string(), v.null())),
  activeProjectId: v.optional(v.union(v.string(), v.null())),
  activeClientId: v.optional(v.union(v.string(), v.null())),
})

const SYSTEM_PROMPT = `You are a friendly AI assistant for "Cohorts", a marketing agency dashboard.
You can help users NAVIGATE to pages, EXECUTE actions, and create reports/proposals.

## Available Dashboard Pages:
${buildRoutesForPrompt()}

${getOperationsDocumentation()}

## How to Respond

**When user wants to navigate somewhere**, respond with JSON:
{"action": "navigate", "route": "/dashboard/analytics", "message": "Taking you to Analytics..."}

**When user wants to CREATE/ADD something** (like tasks), respond with:
{"action": "execute", "operation": "createTask", "params": {"title": "Review proposals"}, "message": "Done! Task created."}

**When user wants a report**, respond with an execute operation:
{"action": "execute", "operation": "generatePerformanceReport", "params": {"period": "weekly"}, "message": "Generating your weekly report..."}

**When user wants proposal drafting or generation**, use proposal operations:
- createProposalDraft
- updateProposalDraft
- generateProposalFromDraft

**When you need clarification**, ask a brief question:
{"action": "clarify", "message": "How much would you like to add? And what category?"}

If the request is vague, underspecified, or refers to "this/that/it" without enough context, prefer the clarify action over taking action. Be conversational and ask for the missing details you need before executing anything.

**For greetings or general questions**, be friendly:
{"action": "chat", "message": "Hey! I can help you navigate or create tasks. What do you need?"}

## Tips for Understanding Users
- "create a task to..." or "remind me to..." → EXECUTE createTask
- "update this task/project/client/proposal" → EXECUTE the matching update operation, preferring active context ids when present
- "create project" / "new project" → EXECUTE createProject
- "generate weekly report" / "daily report" / "monthly report" → EXECUTE generatePerformanceReport
- "meta ad metrics" / "facebook ad metric" / "how are my ads doing" / "metrics from 2026-01-01 to 2026-01-31" → EXECUTE summarizeAdsPerformance
- "what ads are active right now" / "which campaigns are live" → EXECUTE summarizeAdsPerformance with focus: "active"
- "create proposal draft" / "refine proposal" / "generate proposal" → EXECUTE proposal operations
- "schedule a meeting", "start a meet", "join call" → navigate to Meetings
- "open ads", "manage campaigns", "check ad spend" → navigate to Ads Hub
- "open collaboration", "show project discussion", "open team chat" → navigate to Collaboration
- "send a chat to @Deepak saying hi" / "dm Deepak saying can we review this" → EXECUTE sendDirectMessage
- "list all the tasks in @abc client" / "give me client @abc summary for tasks" → EXECUTE summarizeClientTasks
- "check my numbers" or "see performance" → navigate to Analytics
- "show tasks", "my to-do list" → navigate to Tasks
- vague requests like "do that", "handle this", "check metrics", or "create task" without enough detail → CLARIFY first

If activeProposalId/activeProjectId/activeClientId is present in context, prefer it when the user says "this proposal/project/client".

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
    .replace(/[.!:;,-]+$/g, '')

  const safe = cleaned.length > 0 ? cleaned : fallbackTitleFromMessage(message)
  return safe.length > 60 ? `${safe.slice(0, 57)}...` : safe
}

function parseGeminiResponse(raw: string): ParsedAgentResponse {
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    const firstBrace = cleaned.indexOf('{')
    const lastBrace = cleaned.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const candidate = cleaned.slice(firstBrace, lastBrace + 1)
      try {
        return JSON.parse(candidate)
      } catch {
        // Fall through to chat fallback below.
      }
    }

    return { action: 'chat', message: raw.slice(0, 200) }
  }
}

export {
  SYSTEM_PROMPT,
  agentRequestContext,
  fallbackTitleFromMessage,
  generateConversationTitle,
  parseGeminiResponse,
  requireIdentity,
}
