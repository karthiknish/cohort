"use node"

import { action, type ActionCtx } from './_generated/server'
import { api } from './_generated/api'
import { v } from 'convex/values'
import { Errors, withErrorHandling } from './errors'

import { buildRoutesForPrompt, parseNavigationIntent } from '../src/lib/navigation-intents'
import { geminiAI } from '../src/services/gemini'
import { mergeProposalForm } from '../src/lib/proposals'

type ProviderId = 'google' | 'tiktok' | 'linkedin' | 'facebook'
type ReportPeriod = 'daily' | 'weekly' | 'monthly'

type AgentRequestContextType = {
  previousMessages?: Array<{ type: 'user' | 'agent'; content: string }>
  activeProposalId?: string | null
  activeProjectId?: string | null
  activeClientId?: string | null
}

type ParsedAgentResponse = {
  action: string
  route?: string
  message?: string
  operation?: string
  params?: Record<string, unknown>
}

type OperationResult = {
  success: boolean
  data?: Record<string, unknown>
  retryable?: boolean
  userMessage?: string
}

type JsonScalar = string | number | boolean | null
type JsonLayer1 = JsonScalar | JsonScalar[] | Record<string, JsonScalar>
type JsonLayer2 = JsonLayer1 | JsonLayer1[] | Record<string, JsonLayer1>
type JsonRecord = Record<string, JsonLayer2>

type OperationInput = {
  workspaceId: string
  userId: string
  conversationId: string
  params: Record<string, unknown>
  context?: AgentRequestContextType
}

type OperationHandler = (ctx: ActionCtx, input: OperationInput) => Promise<OperationResult>

type ConversationListResult = {
  conversations: Array<{
    legacyId: string
    title: string | null
    startedAt: number | null
    lastMessageAt: number | null
    messageCount: number
  }>
}

type ConversationGetResult = {
  conversation: {
    userId: string
    startedAt: number | null
    lastMessageAt: number | null
    messageCount: number
  } | null
}

type ConversationMessagesResult = {
  messages: Array<{
    legacyId: string
    type: 'user' | 'agent'
    content: string
    createdAt: number
    route: string | null
    action: string | null
    operation: string | null
    executeResult: Record<string, unknown> | null
  }>
}

type DeterministicAgentIntent =
  | {
      action: 'navigate'
      route: string
      message: string
    }
  | {
      action: 'execute'
      operation: string
      params: Record<string, unknown>
      message?: string
    }

const OPERATION_ALIASES: Record<string, string> = {
  createtask: 'createTask',
  addtask: 'createTask',
  remindme: 'createTask',
  updatetask: 'updateTask',
  edittask: 'updateTask',
  modifytask: 'updateTask',
  createproject: 'createProject',
  addproject: 'createProject',
  updateproject: 'updateProject',
  editproject: 'updateProject',
  createclient: 'createClient',
  addclient: 'createClient',
  addclientteammember: 'addClientTeamMember',
  addteammember: 'addClientTeamMember',
  createproposal: 'createProposalDraft',
  createproposaldraft: 'createProposalDraft',
  updateproposal: 'updateProposalDraft',
  updateproposaldraft: 'updateProposalDraft',
  generateproposal: 'generateProposalFromDraft',
  generateproposalfromdraft: 'generateProposalFromDraft',
  updatecampaignstatus: 'updateAdsCampaignStatus',
  updateadscampaignstatus: 'updateAdsCampaignStatus',
  updatecreativestatus: 'updateAdsCreativeStatus',
  updateadscreativestatus: 'updateAdsCreativeStatus',
  generateperformancereport: 'generatePerformanceReport',
  generatedailyreport: 'generatePerformanceReport',
  generateweeklyreport: 'generatePerformanceReport',
  generatemonthlyreport: 'generatePerformanceReport',
}

const PROPOSAL_STATUSES = new Set(['draft', 'in_progress', 'ready', 'partial_success', 'sent', 'failed'])

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function asString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => asNonEmptyString(item))
      .filter((item): item is string => item !== null)
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part.length > 0)
  }

  return []
}

function toStringRecord(value: unknown): Record<string, string> {
  const record = asRecord(value)
  if (!record) return {}

  return Object.entries(record).reduce<Record<string, string>>((acc, [key, item]) => {
    if (typeof item === 'string') {
      acc[key] = item
    }
    return acc
  }, {})
}

function normalizeOperationName(operation: string): string {
  const raw = operation.trim()
  const aliasKey = raw.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  return OPERATION_ALIASES[aliasKey] ?? raw
}

function normalizeProviderId(value: unknown): ProviderId | null {
  const normalized = asNonEmptyString(value)?.toLowerCase()
  if (!normalized) return null

  if (normalized === 'google' || normalized === 'tiktok' || normalized === 'linkedin') {
    return normalized
  }

  if (normalized === 'facebook' || normalized === 'meta') {
    return 'facebook'
  }

  return null
}

function normalizeReportPeriod(value: unknown): ReportPeriod {
  const normalized = asNonEmptyString(value)?.toLowerCase()
  if (normalized === 'daily') return 'daily'
  if (normalized === 'monthly') return 'monthly'
  return 'weekly'
}

function normalizeProposalStatus(value: unknown): string | null {
  const normalized = asNonEmptyString(value)?.toLowerCase()
  if (!normalized) return null
  return PROPOSAL_STATUSES.has(normalized) ? normalized : null
}

function normalizeCampaignAction(value: unknown): 'enable' | 'pause' | 'updateBudget' | 'updateBidding' | 'remove' | null {
  const normalized = asNonEmptyString(value)?.toLowerCase()
  if (!normalized) return null

  if (normalized === 'enable' || normalized === 'resume' || normalized === 'active') return 'enable'
  if (normalized === 'pause' || normalized === 'paused' || normalized === 'disable' || normalized === 'disabled') {
    return 'pause'
  }
  if (normalized === 'updatebudget' || normalized === 'budget') return 'updateBudget'
  if (normalized === 'updatebidding' || normalized === 'bidding') return 'updateBidding'
  if (normalized === 'remove' || normalized === 'delete') return 'remove'

  return null
}

function normalizeCreativeStatus(value: unknown): 'ACTIVE' | 'PAUSED' {
  const normalized = asNonEmptyString(value)?.toLowerCase()
  if (normalized === 'active' || normalized === 'enable' || normalized === 'enabled') return 'ACTIVE'
  return 'PAUSED'
}

function parseDateToMs(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value !== 'string') return null
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : null
}

function normalizeIntentText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function includesAnyPhrase(input: string, phrases: string[]): boolean {
  return phrases.some((phrase) => input.includes(phrase))
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function extractTrailingText(message: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = pattern.exec(message)
    if (!match) continue
    const extracted = asNonEmptyString(match[1])
    if (!extracted) continue
    return extracted.replace(/^[\s:,-]+/, '').replace(/[\s.]+$/, '')
  }

  return null
}

function extractEntityIdFromIntent(message: string, entity: 'task' | 'project' | 'client' | 'campaign' | 'creative' | 'proposal'): string | null {
  const escapedEntity = escapeRegex(entity)
  const patterns = [
    new RegExp(`${escapedEntity}\\s+id\\s+([a-zA-Z0-9_-]+)`, 'i'),
    new RegExp(`${escapedEntity}\\s+([a-zA-Z0-9_-]+)`, 'i'),
    new RegExp(`\\b([a-zA-Z]+_[a-zA-Z0-9_-]+)\\b`, 'i'),
  ]

  for (const pattern of patterns) {
    const match = pattern.exec(message)
    const value = asNonEmptyString(match?.[1])
    if (value) return value
  }

  return null
}

function inferPriorityFromIntent(normalized: string): 'low' | 'medium' | 'high' | null {
  if (includesAnyPhrase(normalized, ['high priority', 'urgent', 'asap'])) return 'high'
  if (includesAnyPhrase(normalized, ['low priority', 'later'])) return 'low'
  if (includesAnyPhrase(normalized, ['medium priority', 'normal priority'])) return 'medium'
  return null
}

function inferProviderFromIntent(message: string): ProviderId | null {
  const normalized = normalizeIntentText(message)
  if (includesAnyPhrase(normalized, ['google ads', 'google campaign', 'google'])) return 'google'
  if (includesAnyPhrase(normalized, ['meta ads', 'facebook ads', 'facebook', 'meta'])) return 'facebook'
  if (includesAnyPhrase(normalized, ['tiktok ads', 'tiktok'])) return 'tiktok'
  if (includesAnyPhrase(normalized, ['linkedin ads', 'linkedin'])) return 'linkedin'
  return null
}

function inferProviderFiltersFromIntent(message: string): ProviderId[] {
  const normalized = normalizeIntentText(message)
  const providers: ProviderId[] = []

  if (includesAnyPhrase(normalized, ['google ads', 'google campaign', 'google'])) providers.push('google')
  if (includesAnyPhrase(normalized, ['meta ads', 'facebook ads', 'facebook', 'meta'])) providers.push('facebook')
  if (includesAnyPhrase(normalized, ['tiktok ads', 'tiktok'])) providers.push('tiktok')
  if (includesAnyPhrase(normalized, ['linkedin ads', 'linkedin'])) providers.push('linkedin')

  return Array.from(new Set(providers))
}

function resolveDeterministicExecuteIntent(
  message: string,
  context?: AgentRequestContextType
): DeterministicAgentIntent | null {
  const normalized = normalizeIntentText(message)

  if (includesAnyPhrase(normalized, ['daily report', 'weekly report', 'monthly report', 'performance report', 'generate report'])) {
    const period: ReportPeriod = includesAnyPhrase(normalized, ['daily'])
      ? 'daily'
      : includesAnyPhrase(normalized, ['monthly'])
        ? 'monthly'
        : 'weekly'

    const providerIds = inferProviderFiltersFromIntent(message)
    const params: Record<string, unknown> = { period }
    if (providerIds.length > 0) params.providerIds = providerIds
    if (context?.activeClientId) params.clientId = context.activeClientId

    return {
      action: 'execute',
      operation: 'generatePerformanceReport',
      params,
      message: `Generating your ${period} performance report...`,
    }
  }

  if (
    includesAnyPhrase(normalized, ['remind me to', 'create task', 'add task', 'new task']) &&
    !includesAnyPhrase(normalized, ['update task', 'complete task', 'close task', 'mark task'])
  ) {
    const title =
      extractTrailingText(message, [
        /remind\s+me\s+to\s+(.+)$/i,
        /(?:create|add)\s+(?:a\s+)?task(?:\s+(?:to|for))?\s+(.+)$/i,
        /new\s+task\s+(.+)$/i,
      ]) ?? 'Follow up task'

    const priority = inferPriorityFromIntent(normalized)
    const params: Record<string, unknown> = { title }
    if (priority) params.priority = priority
    if (context?.activeClientId) params.clientId = context.activeClientId

    return {
      action: 'execute',
      operation: 'createTask',
      params,
      message: 'Creating that task now.',
    }
  }

  if (includesAnyPhrase(normalized, ['complete task', 'mark task', 'close task', 'update task'])) {
    const taskId = extractEntityIdFromIntent(message, 'task')
    if (!taskId) return null

    const params: Record<string, unknown> = { taskId }
    if (includesAnyPhrase(normalized, ['complete', 'completed', 'done', 'close'])) {
      params.status = 'done'
    }
    const priority = inferPriorityFromIntent(normalized)
    if (priority) params.priority = priority

    return {
      action: 'execute',
      operation: 'updateTask',
      params,
      message: 'Updating that task now.',
    }
  }

  if (includesAnyPhrase(normalized, ['create project', 'add project', 'new project'])) {
    const name =
      extractTrailingText(message, [
        /(?:create|add)\s+(?:a\s+)?project(?:\s+(?:called|named))?\s+(.+)$/i,
        /new\s+project\s+(.+)$/i,
      ]) ?? null

    if (!name) return null

    const params: Record<string, unknown> = { name }
    if (context?.activeClientId) params.clientId = context.activeClientId

    return {
      action: 'execute',
      operation: 'createProject',
      params,
      message: `Creating project ${name}.`,
    }
  }

  if (includesAnyPhrase(normalized, ['update project', 'edit project'])) {
    const projectId =
      extractEntityIdFromIntent(message, 'project') ??
      asNonEmptyString(context?.activeProjectId ?? null)
    if (!projectId) return null

    const params: Record<string, unknown> = { projectId }
    const status = extractTrailingText(message, [/status\s+(?:to\s+)?([a-zA-Z_\-]+)/i])
    if (status) params.status = status

    return {
      action: 'execute',
      operation: 'updateProject',
      params,
      message: 'Updating that project now.',
    }
  }

  if (includesAnyPhrase(normalized, ['create client', 'add client', 'new client'])) {
    const name =
      extractTrailingText(message, [
        /(?:create|add)\s+(?:a\s+)?client(?:\s+(?:called|named))?\s+(.+)$/i,
        /new\s+client\s+(.+)$/i,
      ]) ?? null

    if (!name) return null

    return {
      action: 'execute',
      operation: 'createClient',
      params: { name },
      message: `Creating client ${name}.`,
    }
  }

  if (includesAnyPhrase(normalized, ['add team member', 'add teammate'])) {
    const clientId = extractEntityIdFromIntent(message, 'client')
    const memberName = extractTrailingText(message, [
      /add\s+team\s+member\s+(.+)\s+to\s+client/i,
      /add\s+teammate\s+(.+)\s+to\s+client/i,
    ])

    if (!clientId || !memberName) return null

    return {
      action: 'execute',
      operation: 'addClientTeamMember',
      params: { clientId, name: memberName },
      message: `Adding ${memberName} to that client.`,
    }
  }

  if (includesAnyPhrase(normalized, ['create proposal draft', 'new proposal draft', 'draft proposal'])) {
    const params: Record<string, unknown> = {}
    if (context?.activeClientId) params.clientId = context.activeClientId

    return {
      action: 'execute',
      operation: 'createProposalDraft',
      params,
      message: 'Creating a proposal draft now.',
    }
  }

  if (includesAnyPhrase(normalized, ['generate proposal', 'generate this proposal', 'run proposal generation'])) {
    const proposalId =
      extractEntityIdFromIntent(message, 'proposal') ??
      asNonEmptyString(context?.activeProposalId ?? null)
    if (!proposalId) return null

    return {
      action: 'execute',
      operation: 'generateProposalFromDraft',
      params: { proposalId },
      message: 'Starting proposal generation now.',
    }
  }

  if (includesAnyPhrase(normalized, ['pause campaign', 'enable campaign', 'resume campaign', 'activate campaign'])) {
    const providerId = inferProviderFromIntent(message)
    const campaignId = extractEntityIdFromIntent(message, 'campaign')
    if (!providerId || !campaignId) return null

    const action = includesAnyPhrase(normalized, ['pause']) ? 'pause' : 'enable'
    const params: Record<string, unknown> = { providerId, campaignId, action }
    if (context?.activeClientId) params.clientId = context.activeClientId

    return {
      action: 'execute',
      operation: 'updateAdsCampaignStatus',
      params,
      message: `Updating campaign ${campaignId} on ${providerId}.`,
    }
  }

  if (includesAnyPhrase(normalized, ['pause creative', 'enable creative', 'resume creative', 'activate creative'])) {
    const providerId = inferProviderFromIntent(message)
    const creativeId = extractEntityIdFromIntent(message, 'creative')
    if (!providerId || !creativeId) return null

    const status = includesAnyPhrase(normalized, ['pause']) ? 'paused' : 'active'
    const params: Record<string, unknown> = { providerId, creativeId, status }
    if (context?.activeClientId) params.clientId = context.activeClientId

    return {
      action: 'execute',
      operation: 'updateAdsCreativeStatus',
      params,
      message: `Updating creative ${creativeId} on ${providerId}.`,
    }
  }

  return null
}

function resolveDeterministicNavigationIntent(message: string): { route: string; message: string } | null {
  const normalized = normalizeIntentText(message)

  const meetingIntent = includesAnyPhrase(normalized, [
    'meeting',
    'meet',
    'google meet',
    'call',
    'calendar',
    'invite',
  ])
  const meetingTask = includesAnyPhrase(normalized, [
    'schedule',
    'scedule',
    'start',
    'join',
    'reschedule',
    'cancel',
    'book',
    'set up',
    'setup',
    'quick meet',
  ])

  if (meetingIntent && meetingTask) {
    return {
      route: '/dashboard/meetings',
      message: 'Opening Meetings so you can schedule or start the call.',
    }
  }

  const adsIntent = includesAnyPhrase(normalized, [
    'ads',
    'ad campaign',
    'campaign',
    'ad spend',
    'roas',
    'creative',
    'google ads',
    'meta ads',
    'facebook ads',
    'tiktok ads',
    'linkedin ads',
  ])
  const adsNavigation = includesAnyPhrase(normalized, [
    'open',
    'go to',
    'take me',
    'show',
    'view',
    'check',
    'manage',
    'sync',
    'connect',
    'setup',
    'set up',
    'configure',
    'optimize',
  ])

  if (adsIntent && adsNavigation) {
    return {
      route: '/dashboard/ads',
      message: 'Opening Ads Hub so you can manage campaigns and ad tasks.',
    }
  }

  const parsedNavigationIntent = parseNavigationIntent(message)
  const hasExplicitNavVerb = includesAnyPhrase(normalized, [
    'go to',
    'take me',
    'open',
    'show',
    'view',
    'navigate',
    'check',
    'bring me',
  ])

  if (parsedNavigationIntent && (parsedNavigationIntent.confidence >= 0.75 || hasExplicitNavVerb)) {
    if (parsedNavigationIntent.route === '/dashboard/meetings') {
      return {
        route: '/dashboard/meetings',
        message: 'Opening Meetings so you can handle scheduling and call actions.',
      }
    }

    return {
      route: parsedNavigationIntent.route,
      message: `Opening ${parsedNavigationIntent.name} for you.`,
    }
  }

  return null
}

function resolveDeterministicAgentIntent(
  message: string,
  context?: AgentRequestContextType
): DeterministicAgentIntent | null {
  const executeIntent = resolveDeterministicExecuteIntent(message, context)
  if (executeIntent) return executeIntent

  const navigationIntent = resolveDeterministicNavigationIntent(message)
  if (navigationIntent) {
    return {
      action: 'navigate',
      route: navigationIntent.route,
      message: navigationIntent.message,
    }
  }

  return null
}

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`
}

function toIsoDate(value: Date): string {
  return value.toISOString().slice(0, 10)
}

function getPeriodWindow(period: ReportPeriod): {
  periodLabel: string
  startDate: string
  endDate: string
  startDateMs: number
  endDateMs: number
} {
  const end = new Date()
  const start = new Date(end)

  if (period === 'daily') {
    start.setDate(start.getDate() - 1)
  } else if (period === 'monthly') {
    start.setDate(start.getDate() - 30)
  } else {
    start.setDate(start.getDate() - 7)
  }

  const periodLabel = period.charAt(0).toUpperCase() + period.slice(1)

  return {
    periodLabel,
    startDate: toIsoDate(start),
    endDate: toIsoDate(end),
    startDateMs: start.getTime(),
    endDateMs: end.getTime(),
  }
}

function unwrapConvexResult(value: unknown): unknown {
  const record = asRecord(value)
  if (record && record.ok === true && 'data' in record) {
    return record.data
  }
  return value
}

function asErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Unknown error'
}

function mergeProposalPatch(existingForm: Record<string, unknown>, patch: Record<string, unknown>) {
  const safeExisting = mergeProposalForm(existingForm)
  const next = {
    ...safeExisting,
    ...patch,
    company: {
      ...safeExisting.company,
      ...(asRecord(patch.company) ?? {}),
    },
    marketing: {
      ...safeExisting.marketing,
      ...(asRecord(patch.marketing) ?? {}),
      socialHandles: {
        ...safeExisting.marketing.socialHandles,
        ...toStringRecord(asRecord(patch.marketing)?.socialHandles),
      },
    },
    goals: {
      ...safeExisting.goals,
      ...(asRecord(patch.goals) ?? {}),
    },
    scope: {
      ...safeExisting.scope,
      ...(asRecord(patch.scope) ?? {}),
    },
    timelines: {
      ...safeExisting.timelines,
      ...(asRecord(patch.timelines) ?? {}),
    },
    value: {
      ...safeExisting.value,
      ...(asRecord(patch.value) ?? {}),
    },
  }

  return mergeProposalForm(next)
}

function getOperationsDocumentation(): string {
  return `
## Executable Operations (action: "execute")

When the user wants to CREATE or UPDATE data, use:
{"action": "execute", "operation": "<operation>", "params": {...}, "message": "Confirmation message"}

### Task Operations
- **createTask**: Create a new task
  Params: { title: string, priority?: "low"|"medium"|"high", description?: string, dueDate?: string, clientId?: string, clientName?: string }
  Example: "remind me to review proposals" → {"action": "execute", "operation": "createTask", "params": {"title": "Review proposals"}, "message": "Done! Task created."}

- **updateTask**: Update a task status, priority, title, description, due date, or tags
  Params: { taskId: string, status?: string, priority?: string, title?: string, description?: string, dueDate?: string, tags?: string[] }

### Project Operations
- **createProject**: Create a project
  Params: { name: string, description?: string, status?: string, clientId?: string, clientName?: string, startDate?: string, endDate?: string, tags?: string[] }

- **updateProject**: Update project fields
  Params: { projectId: string, name?: string, description?: string, status?: string, clientId?: string, clientName?: string, startDate?: string, endDate?: string, tags?: string[] }

### Client Operations
- **createClient**: Create a client record
  Params: { name: string, accountManager?: string, teamMembers?: Array<{name: string, role?: string}> }

- **addClientTeamMember**: Add a team member to an existing client
  Params: { clientId: string, name: string, role?: string }

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
- **generatePerformanceReport**: Generate a daily, weekly, or monthly performance report
  Params: { period?: "daily"|"weekly"|"monthly", clientId?: string, providerIds?: string[] }
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

**For greetings or general questions**, be friendly:
{"action": "chat", "message": "Hey! I can help you navigate or create tasks. What do you need?"}

## Tips for Understanding Users
- "create a task to..." or "remind me to..." → EXECUTE createTask
- "update this task/project/client/proposal" → EXECUTE the matching update operation
- "generate weekly report" / "daily report" / "monthly report" → EXECUTE generatePerformanceReport
- "create proposal draft" / "refine proposal" / "generate proposal" → EXECUTE proposal operations
- "schedule a meeting", "start a meet", "join call" → navigate to Meetings
- "open ads", "manage campaigns", "check ad spend" → navigate to Ads Hub
- "check my numbers" or "see performance" → navigate to Analytics
- "show tasks", "my to-do list" → navigate to Tasks

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
    .replace(/[\.!:;,-]+$/g, '')

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

function formatConversationHistory(context?: AgentRequestContextType): string {
  const historyBlock = context?.previousMessages?.length
    ? `\nRecent conversation:\n${context.previousMessages
        .slice(-4)
        .map((m) => `${m.type === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n')}\n`
    : ''

  const contextLines: string[] = []
  const activeProposalId = asNonEmptyString(context?.activeProposalId ?? null)
  const activeProjectId = asNonEmptyString(context?.activeProjectId ?? null)
  const activeClientId = asNonEmptyString(context?.activeClientId ?? null)

  if (activeProposalId) contextLines.push(`- activeProposalId: ${activeProposalId}`)
  if (activeProjectId) contextLines.push(`- activeProjectId: ${activeProjectId}`)
  if (activeClientId) contextLines.push(`- activeClientId: ${activeClientId}`)

  const contextBlock = contextLines.length > 0 ? `\nContext hints:\n${contextLines.join('\n')}\n` : ''

  return `${historyBlock}${contextBlock}`
}

function resolveProposalId(params: Record<string, unknown>, context?: AgentRequestContextType): string | null {
  return (
    asNonEmptyString(params.proposalId) ??
    asNonEmptyString(params.legacyId) ??
    asNonEmptyString(params.id) ??
    asNonEmptyString(context?.activeProposalId ?? null)
  )
}

const operationHandlers: Record<string, OperationHandler> = {
  async createTask(ctx, input) {
    const title = asNonEmptyString(input.params.title)

    if (!title) {
      return { success: false, data: { error: 'Task title is required.' }, userMessage: 'Please provide a task title.' }
    }

    const description = asNonEmptyString(input.params.description)
    const priorityRaw = asNonEmptyString(input.params.priority)?.toLowerCase()
    const priority = priorityRaw === 'low' || priorityRaw === 'high' || priorityRaw === 'medium' ? priorityRaw : 'medium'
    const status = asNonEmptyString(input.params.status) ?? 'todo'
    const dueDateMs =
      asNumber(input.params.dueDateMs) ??
      parseDateToMs(input.params.dueDate)
    const tags = asStringArray(input.params.tags)
    const assignedTo = asStringArray(input.params.assignedTo)
    const clientId = asNonEmptyString(input.params.clientId) ?? ''
    const clientName = asNonEmptyString(input.params.clientName)

    const rawResult = await ctx.runMutation(api.tasks.createTask, {
      workspaceId: input.workspaceId,
      title,
      description: description ?? null,
      status,
      priority,
      assignedTo,
      clientId,
      client: clientName ?? null,
      dueDateMs,
      tags,
    })

    const unwrapped = unwrapConvexResult(rawResult)
    const unwrappedRecord = asRecord(unwrapped)
    const taskId =
      asNonEmptyString(unwrappedRecord?.legacyId) ??
      asNonEmptyString(unwrapped)

    return {
      success: true,
      data: {
        taskId,
        title,
      },
      userMessage: taskId ? `Created task ${taskId}.` : 'Task created.',
    }
  },

  async updateTask(ctx, input) {
    const taskId = asNonEmptyString(input.params.taskId) ?? asNonEmptyString(input.params.legacyId) ?? asNonEmptyString(input.params.id)
    if (!taskId) {
      return { success: false, data: { error: 'taskId is required.' }, userMessage: 'Please tell me which task to update.' }
    }

    const update: Record<string, unknown> = {}

    const title = asNonEmptyString(input.params.title)
    if (title) update.title = title

    if ('description' in input.params) {
      update.description = asString(input.params.description)
    }

    const status = asNonEmptyString(input.params.status)
    if (status) update.status = status

    const priority = asNonEmptyString(input.params.priority)
    if (priority) update.priority = priority

    const assignedTo = asStringArray(input.params.assignedTo)
    if (Array.isArray(input.params.assignedTo)) update.assignedTo = assignedTo

    const dueDateMs = asNumber(input.params.dueDateMs) ?? parseDateToMs(input.params.dueDate)
    if (dueDateMs !== null || 'dueDate' in input.params || 'dueDateMs' in input.params) {
      update.dueDateMs = dueDateMs
    }

    const tags = asStringArray(input.params.tags)
    if (Array.isArray(input.params.tags)) update.tags = tags

    if (Object.keys(update).length === 0) {
      return {
        success: false,
        data: { error: 'No valid fields provided for update.' },
        userMessage: 'Tell me what to change on the task (status, priority, title, due date, etc.).',
      }
    }

    await ctx.runMutation(api.tasks.patchTask, {
      workspaceId: input.workspaceId,
      legacyId: taskId,
      update,
    })

    return {
      success: true,
      data: { taskId, updatedFields: Object.keys(update) },
      userMessage: 'Task updated successfully.',
    }
  },

  async createProject(ctx, input) {
    const name = asNonEmptyString(input.params.name)
    if (!name) {
      return { success: false, data: { error: 'Project name is required.' }, userMessage: 'Please provide a project name.' }
    }

    const legacyId = asNonEmptyString(input.params.projectId) ?? asNonEmptyString(input.params.legacyId) ?? `project_${crypto.randomUUID()}`
    const description = asNonEmptyString(input.params.description)
    const status = asNonEmptyString(input.params.status) ?? 'planning'
    const clientIdRaw = asNonEmptyString(input.params.clientId)
    const clientId = clientIdRaw === 'none' ? null : clientIdRaw
    const clientName = asNonEmptyString(input.params.clientName)
    const startDateMs = asNumber(input.params.startDateMs) ?? parseDateToMs(input.params.startDate)
    const endDateMs = asNumber(input.params.endDateMs) ?? parseDateToMs(input.params.endDate)
    const tags = asStringArray(input.params.tags)

    const rawResult = await ctx.runMutation(api.projects.create, {
      workspaceId: input.workspaceId,
      legacyId,
      name,
      description: description ?? null,
      status,
      clientId,
      clientName: clientName ?? null,
      startDateMs,
      endDateMs,
      tags,
      ownerId: input.userId,
      createdAtMs: Date.now(),
      updatedAtMs: Date.now(),
    })

    const unwrapped = unwrapConvexResult(rawResult)
    const projectId = asNonEmptyString(unwrapped) ?? legacyId

    return {
      success: true,
      data: { projectId, name },
      userMessage: `Created project ${name}.`,
    }
  },

  async updateProject(ctx, input) {
    const projectId = asNonEmptyString(input.params.projectId) ?? asNonEmptyString(input.params.legacyId) ?? asNonEmptyString(input.params.id)
    if (!projectId) {
      return { success: false, data: { error: 'projectId is required.' }, userMessage: 'Please tell me which project to update.' }
    }

    const updateArgs: {
      workspaceId: string
      legacyId: string
      updatedAtMs: number
      name?: string
      description?: string | null
      status?: string
      clientId?: string | null
      clientName?: string | null
      startDateMs?: number | null
      endDateMs?: number | null
      tags?: string[]
    } = {
      workspaceId: input.workspaceId,
      legacyId: projectId,
      updatedAtMs: Date.now(),
    }

    const name = asNonEmptyString(input.params.name)
    if (name) updateArgs.name = name

    if ('description' in input.params) {
      updateArgs.description = asString(input.params.description)
    }

    const status = asNonEmptyString(input.params.status)
    if (status) updateArgs.status = status

    if ('clientId' in input.params) {
      const clientIdRaw = asNonEmptyString(input.params.clientId)
      updateArgs.clientId = clientIdRaw === 'none' ? null : clientIdRaw
    }

    if ('clientName' in input.params) {
      updateArgs.clientName = asString(input.params.clientName)
    }

    const startDateMs = asNumber(input.params.startDateMs) ?? parseDateToMs(input.params.startDate)
    if (startDateMs !== null || 'startDate' in input.params || 'startDateMs' in input.params) {
      updateArgs.startDateMs = startDateMs
    }

    const endDateMs = asNumber(input.params.endDateMs) ?? parseDateToMs(input.params.endDate)
    if (endDateMs !== null || 'endDate' in input.params || 'endDateMs' in input.params) {
      updateArgs.endDateMs = endDateMs
    }

    if (Array.isArray(input.params.tags)) {
      updateArgs.tags = asStringArray(input.params.tags)
    }

    const mutatedFields = Object.keys(updateArgs).filter((field) => !['workspaceId', 'legacyId', 'updatedAtMs'].includes(field))
    if (mutatedFields.length === 0) {
      return {
        success: false,
        data: { error: 'No valid fields provided for update.' },
        userMessage: 'Tell me what to update on the project.',
      }
    }

    await ctx.runMutation(api.projects.update, updateArgs)

    return {
      success: true,
      data: { projectId, updatedFields: mutatedFields },
      userMessage: 'Project updated successfully.',
    }
  },

  async createClient(ctx, input) {
    const name = asNonEmptyString(input.params.name)
    if (!name) {
      return { success: false, data: { error: 'Client name is required.' }, userMessage: 'Please provide a client name.' }
    }

    const accountManager = asNonEmptyString(input.params.accountManager) ?? 'Unassigned'
    const rawTeamMembers = Array.isArray(input.params.teamMembers) ? input.params.teamMembers : []
    const teamMembers = rawTeamMembers
      .map((member) => {
        const memberRecord = asRecord(member)
        if (!memberRecord) {
          const nameFromString = asNonEmptyString(member)
          return nameFromString ? { name: nameFromString, role: 'Contributor' } : null
        }

        const memberName = asNonEmptyString(memberRecord.name)
        if (!memberName) return null

        return {
          name: memberName,
          role: asNonEmptyString(memberRecord.role) ?? 'Contributor',
        }
      })
      .filter((member): member is { name: string; role: string } => member !== null)

    const rawResult = await ctx.runMutation(api.clients.create, {
      workspaceId: input.workspaceId,
      name,
      accountManager,
      teamMembers,
      createdBy: input.userId,
    })

    const unwrapped = unwrapConvexResult(rawResult)
    const record = asRecord(unwrapped)
    const clientId = asNonEmptyString(record?.legacyId)

    return {
      success: true,
      data: { clientId, name },
      userMessage: `Created client ${name}.`,
    }
  },

  async addClientTeamMember(ctx, input) {
    const clientId = asNonEmptyString(input.params.clientId) ?? asNonEmptyString(input.params.legacyId)
    const name = asNonEmptyString(input.params.name)

    if (!clientId || !name) {
      return {
        success: false,
        data: { error: 'clientId and name are required.' },
        userMessage: 'Please provide both the client and the team member name.',
      }
    }

    const role = asNonEmptyString(input.params.role) ?? undefined

    await ctx.runMutation(api.clients.addTeamMember, {
      workspaceId: input.workspaceId,
      legacyId: clientId,
      name,
      role,
    })

    return {
      success: true,
      data: { clientId, name, role: role ?? 'Contributor' },
      userMessage: `Added ${name} to the client team.`,
    }
  },

  async createProposalDraft(ctx, input) {
    const now = Date.now()
    const formDataPatch = asRecord(input.params.formData) ?? {}
    const formData = mergeProposalForm(formDataPatch)
    const status = normalizeProposalStatus(input.params.status) ?? 'draft'
    const stepProgress = asNumber(input.params.stepProgress) ?? 0
    const clientId = asNonEmptyString(input.params.clientId) ?? asNonEmptyString(input.context?.activeClientId ?? null)
    const clientName = asNonEmptyString(input.params.clientName)

    const rawResult = await ctx.runMutation(api.proposals.create, {
      workspaceId: input.workspaceId,
      ownerId: input.userId,
      status,
      stepProgress,
      formData,
      clientId: clientId ?? null,
      clientName: clientName ?? null,
      agentConversationId: input.conversationId,
      lastAgentInteractionAtMs: now,
    })

    const unwrapped = unwrapConvexResult(rawResult)
    const record = asRecord(unwrapped)
    const proposalId = asNonEmptyString(record?.legacyId)

    return {
      success: true,
      data: { proposalId, status, stepProgress },
      userMessage: proposalId ? `Created proposal draft ${proposalId}.` : 'Created proposal draft.',
    }
  },

  async updateProposalDraft(ctx, input) {
    const proposalId = resolveProposalId(input.params, input.context)
    if (!proposalId) {
      return {
        success: false,
        data: { error: 'proposalId is required.' },
        userMessage: 'Tell me which proposal to update, or open it first and ask again.',
      }
    }

    const now = Date.now()
    const current = await ctx.runQuery(api.proposals.getByLegacyId, {
      workspaceId: input.workspaceId,
      legacyId: proposalId,
    })

    const currentRecord = asRecord(current)
    if (!currentRecord) {
      return {
        success: false,
        data: { error: 'Proposal not found.' },
        userMessage: `I could not find proposal ${proposalId}.`,
      }
    }

    const updateArgs: {
      workspaceId: string
      legacyId: string
      updatedAtMs: number
      lastAutosaveAtMs: number
      agentConversationId: string
      lastAgentInteractionAtMs: number
      formData?: JsonRecord
      status?: string
      stepProgress?: number
      clientId?: string | null
      clientName?: string | null
    } = {
      workspaceId: input.workspaceId,
      legacyId: proposalId,
      updatedAtMs: now,
      lastAutosaveAtMs: now,
      agentConversationId: input.conversationId,
      lastAgentInteractionAtMs: now,
    }

    const formPatch = asRecord(input.params.formPatch) ?? asRecord(input.params.formData)
    if (formPatch) {
      const mergedForm = mergeProposalPatch(asRecord(currentRecord.formData) ?? {}, formPatch)
      updateArgs.formData = mergedForm as JsonRecord
    }

    const status = normalizeProposalStatus(input.params.status)
    if (status) {
      updateArgs.status = status
    }

    const stepProgress = asNumber(input.params.stepProgress)
    if (stepProgress !== null) {
      updateArgs.stepProgress = stepProgress
    }

    if ('clientId' in input.params) {
      updateArgs.clientId = asString(input.params.clientId)
    }
    if ('clientName' in input.params) {
      updateArgs.clientName = asString(input.params.clientName)
    }

    const changedFields = Object.keys(updateArgs).filter(
      (field) => !['workspaceId', 'legacyId', 'updatedAtMs', 'lastAutosaveAtMs'].includes(field)
    )

    if (changedFields.length === 0) {
      return {
        success: false,
        data: { error: 'No valid proposal fields to update.' },
        userMessage: 'Tell me what to refine on the proposal (section fields, status, step progress, etc.).',
      }
    }

    await ctx.runMutation(api.proposals.update, updateArgs)

    return {
      success: true,
      data: { proposalId, updatedFields: changedFields },
      userMessage: 'Proposal draft updated.',
    }
  },

  async generateProposalFromDraft(ctx, input) {
    const proposalId = resolveProposalId(input.params, input.context)
    if (!proposalId) {
      return {
        success: false,
        data: { error: 'proposalId is required.' },
        userMessage: 'Please tell me which proposal draft to generate.',
      }
    }

    const now = Date.now()
    await ctx.runMutation(api.proposals.update, {
      workspaceId: input.workspaceId,
      legacyId: proposalId,
      updatedAtMs: now,
      lastAutosaveAtMs: now,
      agentConversationId: input.conversationId,
      lastAgentInteractionAtMs: now,
    })

    const rawGeneration = await ctx.runAction(api.proposalGeneration.generateFromProposal, {
      workspaceId: input.workspaceId,
      legacyId: proposalId,
    })

    const generation = unwrapConvexResult(rawGeneration)
    const generationRecord = asRecord(generation)
    const status = asNonEmptyString(generationRecord?.status) ?? 'unknown'
    const success = status !== 'failed'

    return {
      success,
      data: {
        proposalId,
        status,
        result: generationRecord ?? { value: generation },
      },
      userMessage: success
        ? `Proposal generation started for ${proposalId}.`
        : `Proposal generation failed for ${proposalId}.`,
      retryable: !success,
    }
  },

  async updateAdsCampaignStatus(ctx, input) {
    const providerId = normalizeProviderId(input.params.providerId ?? input.params.provider)
    const campaignId = asNonEmptyString(input.params.campaignId) ?? asNonEmptyString(input.params.id)
    if (!providerId || !campaignId) {
      return {
        success: false,
        data: { error: 'providerId and campaignId are required.' },
        userMessage: 'Please provide providerId and campaignId for the campaign update.',
      }
    }

    const action =
      normalizeCampaignAction(input.params.action) ??
      normalizeCampaignAction(input.params.status)

    if (!action) {
      return {
        success: false,
        data: { error: 'A supported action/status is required.' },
        userMessage: 'Use action/status like enable, pause, updateBudget, updateBidding, or remove.',
      }
    }

    const clientId = asNonEmptyString(input.params.clientId) ?? asNonEmptyString(input.context?.activeClientId ?? null)
    const budget = asNumber(input.params.budget)
    const biddingValue = asNumber(input.params.biddingValue)

    const rawResult = await ctx.runAction(api.adsCampaigns.updateCampaign, {
      workspaceId: input.workspaceId,
      providerId,
      clientId: clientId ?? null,
      campaignId,
      action,
      budget: budget ?? undefined,
      budgetMode: asNonEmptyString(input.params.budgetMode) ?? undefined,
      biddingType: asNonEmptyString(input.params.biddingType) ?? undefined,
      biddingValue: biddingValue ?? undefined,
    })

    const unwrapped = unwrapConvexResult(rawResult)
    const result = asRecord(unwrapped)

    return {
      success: true,
      data: {
        providerId,
        campaignId,
        action,
        result,
      },
      userMessage: `Campaign ${campaignId} updated on ${providerId}.`,
    }
  },

  async updateAdsCreativeStatus(ctx, input) {
    const providerId = normalizeProviderId(input.params.providerId ?? input.params.provider)
    const creativeId = asNonEmptyString(input.params.creativeId) ?? asNonEmptyString(input.params.id)
    if (!providerId || !creativeId) {
      return {
        success: false,
        data: { error: 'providerId and creativeId are required.' },
        userMessage: 'Please provide providerId and creativeId for the creative update.',
      }
    }

    const clientId = asNonEmptyString(input.params.clientId) ?? asNonEmptyString(input.context?.activeClientId ?? null)
    const status = normalizeCreativeStatus(input.params.status)

    const rawResult = await ctx.runAction(api.adsCreatives.updateCreativeStatus, {
      workspaceId: input.workspaceId,
      providerId,
      clientId: clientId ?? null,
      creativeId,
      adGroupId: asNonEmptyString(input.params.adGroupId) ?? undefined,
      status,
    })

    const unwrapped = unwrapConvexResult(rawResult)
    const result = asRecord(unwrapped)

    return {
      success: true,
      data: {
        providerId,
        creativeId,
        status,
        result,
      },
      userMessage: `Creative ${creativeId} updated on ${providerId}.`,
    }
  },

  async generatePerformanceReport(ctx, input) {
    const period = normalizeReportPeriod(input.params.period)
    const { periodLabel, startDate, endDate, startDateMs, endDateMs } = getPeriodWindow(period)

    const clientId = asNonEmptyString(input.params.clientId) ?? asNonEmptyString(input.context?.activeClientId ?? null)
    const providerIds = asStringArray(input.params.providerIds)

    const metricsRaw = await ctx.runQuery(api.adsMetrics.listMetricsWithSummary, {
      workspaceId: input.workspaceId,
      clientId: clientId ?? undefined,
      providerIds: providerIds.length > 0 ? providerIds : undefined,
      startDate,
      endDate,
      aggregate: true,
      limit: 500,
    })

    const metricsPayload = asRecord(unwrapConvexResult(metricsRaw)) ?? asRecord(metricsRaw) ?? {}
    const metricsSummary = asRecord(metricsPayload.summary) ?? {}
    const totals = asRecord(metricsSummary.totals) ?? {}
    const spend = asNumber(totals.spend) ?? 0
    const impressions = asNumber(totals.impressions) ?? 0
    const clicks = asNumber(totals.clicks) ?? 0
    const conversions = asNumber(totals.conversions) ?? 0
    const revenue = asNumber(totals.revenue) ?? 0
    const roas = spend > 0 ? revenue / spend : 0
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0

    const proposalRaw = await ctx.runQuery(api.proposalAnalytics.summarize, {
      workspaceId: input.workspaceId,
      startDateMs,
      endDateMs,
      clientId: clientId ?? null,
      limit: 500,
    })
    const proposalPayload = asRecord(unwrapConvexResult(proposalRaw)) ?? asRecord(proposalRaw) ?? {}
    const proposalSummary = asRecord(proposalPayload.summary) ?? {}

    const reportText = [
      `${periodLabel} Performance Report (${startDate} to ${endDate})`,
      `Ad Spend: ${formatCurrency(spend)}`,
      `Revenue: ${formatCurrency(revenue)}`,
      `ROAS: ${roas.toFixed(2)}`,
      `Impressions: ${Math.round(impressions)}`,
      `Clicks: ${Math.round(clicks)}`,
      `CTR: ${ctr.toFixed(2)}%`,
      `Conversions: ${Math.round(conversions)}`,
      `Proposals Submitted: ${Math.round(asNumber(proposalSummary.totalSubmitted) ?? 0)}`,
      `Proposal AI Success Rate: ${Number(asNumber(proposalSummary.aiSuccessRate) ?? 0).toFixed(2)}%`,
    ].join('\n')

    const notificationLegacyId = `agent_report_${period}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    let inAppDelivered = false

    try {
      await ctx.runMutation(api.notifications.create, {
        workspaceId: input.workspaceId,
        legacyId: notificationLegacyId,
        kind: 'report.generated',
        title: `${periodLabel} report is ready`,
        body: `Spend ${formatCurrency(spend)} · Revenue ${formatCurrency(revenue)} · ROAS ${roas.toFixed(2)}`,
        actorId: input.userId,
        actorName: null,
        resourceType: 'report',
        resourceId: notificationLegacyId,
        recipientRoles: ['admin', 'team'],
        recipientClientId: clientId ?? null,
        recipientClientIds: clientId ? [clientId] : undefined,
        recipientUserIds: [input.userId],
        metadata: {
          period,
          startDate,
          endDate,
          reportText,
          totals: {
            spend,
            revenue,
            roas,
            impressions,
            clicks,
            ctr,
            conversions,
          },
          proposalSummary,
        },
        createdAtMs: Date.now(),
        updatedAtMs: Date.now(),
      })
      inAppDelivered = true
    } catch {
      inAppDelivered = false
    }

    return {
      success: true,
      data: {
        reportId: notificationLegacyId,
        period,
        periodLabel,
        startDate,
        endDate,
        reportText,
        metricsSummary,
        proposalSummary,
        delivery: {
          inApp: inAppDelivered,
          email: false,
        },
      },
      userMessage: `Generated your ${period} performance report${inAppDelivered ? ' and shared it in-app.' : '.'}`,
    }
  },
}

async function safeExecuteOperation(
  ctx: ActionCtx,
  args: OperationInput & {
    operation: string
  }
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
      const prompt = `${SYSTEM_PROMPT}${formatConversationHistory(args.context)}\nUser: ${
        args.message
      }\n\nRespond with JSON only:`

      let agentAction = 'chat'
      let agentRoute: string | null = null
      let agentMessage = "I didn't quite understand that."
      let agentOperation: string | null = null
      let agentParams: Record<string, unknown> | null = null
      let executeResult: {
        success: boolean
        data?: Record<string, unknown>
        retryable?: boolean
        userMessage?: string
      } | null = null

      const deterministicIntent = resolveDeterministicAgentIntent(args.message, args.context)

      if (deterministicIntent?.action === 'navigate') {
        agentAction = 'navigate'
        agentRoute = deterministicIntent.route
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
        })

        executeResult = {
          success: result.success,
          data: result.data,
          retryable: result.retryable,
          userMessage: result.userMessage,
        }

        agentMessage =
          deterministicIntent.message ||
          executeResult.userMessage ||
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
            })

            executeResult = {
              success: result.success,
              data: result.data,
              retryable: result.retryable,
              userMessage: result.userMessage,
            }
          }

          agentMessage =
            (typeof parsed.message === 'string' && parsed.message.trim()) ||
            executeResult?.userMessage ||
            (executeResult?.success ? 'Action completed.' : 'I could not complete that action.')
        } else {
          agentMessage = typeof parsed.message === 'string' ? parsed.message : agentMessage
        }
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
        params: agentParams as JsonRecord | null,
        executeResult: executeResult as JsonRecord | null,
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
          startedAt: typeof row.startedAt === 'number' ? new Date(row.startedAt).toISOString() : null,
          lastMessageAt:
            typeof row.lastMessageAt === 'number' ? new Date(row.lastMessageAt).toISOString() : null,
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
