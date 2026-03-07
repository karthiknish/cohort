import { parseNavigationIntent } from '../../../src/lib/navigation-intents'

import type {
  AgentRequestContextType,
  DeterministicAgentIntent,
  ProviderId,
  ReportPeriod,
} from '../types'

import { parseDateRangeFromIntent } from './dates'
import { asNonEmptyString } from './values'

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
    /\b([a-zA-Z]+_[a-zA-Z0-9_-]+)\b/i,
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

function inferReportPeriodFromIntent(normalized: string): ReportPeriod {
  return includesAnyPhrase(normalized, ['today', 'daily', 'last 24'])
    ? 'daily'
    : includesAnyPhrase(normalized, ['month', 'monthly', '30 day'])
      ? 'monthly'
      : 'weekly'
}

function cleanCampaignQuery(value: string | null): string | null {
  const cleaned = value
    ?.replace(/\b(?:the|active|live|running|current|currently)\b/gi, ' ')
    .replace(/\b(?:ad|ads|campaign|campaigns)\b/gi, ' ')
    .replace(/\b(?:in|on|for|from|at)\s*$/i, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return cleaned && cleaned.length >= 2 ? cleaned : null
}

function extractCampaignQueryFromIntent(message: string): string | null {
  const extracted = extractTrailingText(message, [
    /(?:metrics|performance|snapshot|numbers|stats)\s+(?:for|on|about)\s+(.+?)\s+(?:ad\s+)?campaign\b/i,
    /(?:for|on|about)\s+(.+?)\s+(?:ad\s+)?campaign\b/i,
    /(?:campaign)\s+(?:called|named)\s+(.+)$/i,
  ])

  return cleanCampaignQuery(extracted)
}

function cleanDirectMessageTarget(value: string | null): string | null {
  const cleaned = value
    ?.replace(/^@+/, '')
    .replace(/[,:;.!?]+$/, '')
    .trim()

  return cleaned && cleaned.length >= 2 ? cleaned : null
}

function extractDirectMessageTargetFromIntent(message: string): string | null {
  const explicitMention = message.match(/@([A-Za-z0-9._-]+)/)
  if (explicitMention) {
    return cleanDirectMessageTarget(explicitMention[1] ?? null)
  }

  const extracted = extractTrailingText(message, [
    /(?:send|write)\s+(?:a\s+)?(?:dm|direct\s+message|message|chat)\s+(?:to|for)\s+([A-Za-z0-9._-]+(?:\s+[A-Za-z0-9._-]+){0,2})/i,
    /(?:dm|direct\s+message|message|chat)\s+([A-Za-z0-9._-]+(?:\s+[A-Za-z0-9._-]+){0,2})\b/i,
  ])

  return cleanDirectMessageTarget(extracted)
}

function cleanClientReference(value: string | null): string | null {
  const cleaned = value
    ?.replace(/^@+/, '')
    .replace(/[,:;.!?]+$/, '')
    .trim()

  return cleaned && cleaned.length >= 2 ? cleaned : null
}

function extractClientReferenceFromIntent(message: string): string | null {
  const extracted = extractTrailingText(message, [
    /@([A-Za-z0-9._-]+)\s+client\b/i,
    /client\s+@([A-Za-z0-9._-]+)\b/i,
    /tasks?\s+(?:for|in)\s+@?([A-Za-z0-9._-]+)\s+client\b/i,
    /tasks?\s+(?:for|in)\s+client\s+([A-Za-z0-9._-]+(?:\s+[A-Za-z0-9._-]+){0,2})/i,
    /client\s+([A-Za-z0-9._-]+(?:\s+[A-Za-z0-9._-]+){0,2})\s+(?:task\s+summary|summary\s+for\s+tasks|tasks?)\b/i,
  ])

  return cleanClientReference(extracted)
}

function cleanDirectMessageContent(value: string | null): string | null {
  const cleaned = value
    ?.replace(/^["'“”]+/, '')
    .replace(/["'“”]+$/, '')
    .trim()

  return cleaned && cleaned.length > 0 ? cleaned : null
}

function extractDirectMessageContentFromIntent(message: string): string | null {
  const target = extractDirectMessageTargetFromIntent(message)
  const escapedTarget = target ? escapeRegex(target) : null
  const extracted = extractTrailingText(message, [
    /(?:saying|say|that)\s+(.+)$/i,
    ...(escapedTarget
      ? [
          new RegExp(`(?:send|write)\\s+(?:a\\s+)?(?:dm|direct\\s+message|message|chat)\\s+(?:to|for)\\s+@?${escapedTarget}\\s+(.+)$`, 'i'),
          new RegExp(`(?:dm|direct\\s+message|message|chat)\\s+@?${escapedTarget}\\s+(.+)$`, 'i'),
        ]
      : []),
  ])

  return cleanDirectMessageContent(extracted)
}

function inferCampaignStatusAction(normalized: string): 'enable' | 'pause' | null {
  if (includesAnyPhrase(normalized, ['pause', 'paused', 'disable', 'disabled', 'stop', 'stopped', 'turn off'])) {
    return 'pause'
  }

  if (includesAnyPhrase(normalized, ['enable', 'enabled', 'resume', 'resumed', 'activate', 'activated', 'active', 'live', 'turn on'])) {
    return 'enable'
  }

  return null
}

function buildCollaborationRoute(args: {
  activeProjectId?: string | null
  activeClientId?: string | null
  channelType?: 'team' | 'client' | 'project'
}): string {
  const params = new URLSearchParams()

  if (args.channelType) params.set('channelType', args.channelType)
  if (args.channelType === 'project' && args.activeProjectId) params.set('projectId', args.activeProjectId)
  if (args.channelType === 'client' && args.activeClientId) params.set('clientId', args.activeClientId)

  const query = params.toString()
  return query ? `/dashboard/collaboration?${query}` : '/dashboard/collaboration'
}

function buildAvailableContextLabel(context?: AgentRequestContextType): string {
  const labels: string[] = []
  if (context?.activeClientId) labels.push('current client')
  if (context?.activeProjectId) labels.push('current project')
  if (context?.activeProposalId) labels.push('current proposal')

  if (labels.length === 0) return 'client, project, or proposal'
  if (labels.length === 1) return labels[0] ?? 'current context'
  if (labels.length === 2) return `${labels[0]} or ${labels[1]}`
  return `${labels.slice(0, -1).join(', ')}, or ${labels[labels.length - 1]}`
}

function buildClarificationMessage(
  kind: 'generic' | 'task' | 'metrics' | 'report' | 'proposal' | 'campaign' | 'creative' | 'dmTarget' | 'dmContent',
  context?: AgentRequestContextType,
  targetName?: string | null,
): string {
  switch (kind) {
    case 'task':
      return `Happy to do that — what should I put in the task, and should I tie it to the ${buildAvailableContextLabel(context)}?`
    case 'metrics':
      return `I can pull that for you — what date range should I use, and which client or ad platform should I focus on?`
    case 'report':
      return `Absolutely — what date range do you want in the report, and should I use a specific client or ad platform?`
    case 'proposal':
      return `I can help with that — do you want me to create a draft, refine the current one, or generate a proposal, and which proposal/client should I use?`
    case 'campaign':
      return 'I can update that campaign — which campaign is it, and what platform is it on?'
    case 'creative':
      return 'I can update that creative — which creative is it, and what platform is it on?'
    case 'dmTarget':
      return 'Sure — who should I send that message to?'
    case 'dmContent':
      return `Sure — what would you like me to send${targetName ? ` to ${targetName}` : ''}?`
    default:
      return `Happy to help — what would you like me to do, and what ${buildAvailableContextLabel(context)} should I use?`
  }
}

function resolveWeakCommandClarification(
  message: string,
  context?: AgentRequestContextType,
): DeterministicAgentIntent | null {
  const normalized = normalizeIntentText(message)
  const words = normalized.split(' ').filter(Boolean)
  const wordCount = words.length
  const hasDeicticReference = includesAnyPhrase(normalized, ['this', 'that', 'it', 'them', 'those', 'these'])
  const hasWeakVerb = includesAnyPhrase(normalized, ['do', 'fix', 'handle', 'work on', 'take care of', 'update', 'change', 'continue', 'help', 'try again'])
  const hasTimeframe = includesAnyPhrase(normalized, [
    'today', 'yesterday', 'daily', 'weekly', 'monthly', 'this week', 'last week', 'this month', 'last month', 'last 7', 'last 30',
  ]) || parseDateRangeFromIntent(message) !== null

  if (includesAnyPhrase(normalized, ['metrics', 'numbers', 'performance', 'snapshot', 'report']) && !hasTimeframe && inferProviderFiltersFromIntent(message).length === 0 && !context?.activeClientId) {
    return { action: 'clarify', message: buildClarificationMessage(normalized.includes('report') ? 'report' : 'metrics', context) }
  }
  if (wordCount <= 3 && includesAnyPhrase(normalized, ['create task', 'add task', 'new task', 'task'])) {
    return { action: 'clarify', message: buildClarificationMessage('task', context) }
  }
  if (wordCount <= 4 && includesAnyPhrase(normalized, ['proposal', 'draft'])) {
    return { action: 'clarify', message: buildClarificationMessage('proposal', context) }
  }
  if (wordCount <= 4 && includesAnyPhrase(normalized, ['campaign']) && includesAnyPhrase(normalized, ['pause', 'enable', 'resume', 'activate', 'disable', 'update'])) {
    return { action: 'clarify', message: buildClarificationMessage('campaign', context) }
  }
  if (wordCount <= 4 && includesAnyPhrase(normalized, ['creative']) && includesAnyPhrase(normalized, ['pause', 'enable', 'resume', 'activate', 'disable', 'update'])) {
    return { action: 'clarify', message: buildClarificationMessage('creative', context) }
  }
  if ((hasDeicticReference && hasWeakVerb) || (wordCount <= 3 && (hasDeicticReference || hasWeakVerb))) {
    return { action: 'clarify', message: buildClarificationMessage('generic', context) }
  }

  return null
}

function getProviderDisplayName(providerId: ProviderId): string {
  switch (providerId) {
    case 'facebook': return 'Meta'
    case 'google': return 'Google'
    case 'tiktok': return 'TikTok'
    case 'linkedin': return 'LinkedIn'
  }
}

function getProviderSummaryLabel(providerIds: ProviderId[]): string {
  const [firstProvider, secondProvider] = providerIds
  if (providerIds.length === 1 && firstProvider) return `${getProviderDisplayName(firstProvider)} Ads`
  if (providerIds.length === 2 && firstProvider && secondProvider) return `${getProviderDisplayName(firstProvider)} + ${getProviderDisplayName(secondProvider)} Ads`
  return 'Ads'
}

function resolveDeterministicExecuteIntent(message: string, context?: AgentRequestContextType): DeterministicAgentIntent | null {
  const normalized = normalizeIntentText(message)
  const providerIds = inferProviderFiltersFromIntent(message)
  const inferredPeriod = inferReportPeriodFromIntent(normalized)
  const parsedDateRange = parseDateRangeFromIntent(message)
  const campaignQuery = extractCampaignQueryFromIntent(message)
  const clientReference = extractClientReferenceFromIntent(message)
  const directMessageTarget = extractDirectMessageTargetFromIntent(message)
  const directMessageContent = extractDirectMessageContentFromIntent(message)
  const wantsToSendDirectMessage = includesAnyPhrase(normalized, ['send', 'write', 'dm', 'direct message', 'chat', 'message']) && includesAnyPhrase(normalized, ['to', '@'])
  const adsStatusSnapshotIntent = includesAnyPhrase(normalized, ['ads', 'ad', 'campaign', 'campaigns', 'google', 'facebook', 'meta', 'tiktok', 'linkedin']) && includesAnyPhrase(normalized, ['active', 'currently', 'running', 'live'])
  const wantsTaskSummary = includesAnyPhrase(normalized, ['summary', 'summarize', 'overview'])
  const wantsTaskList = includesAnyPhrase(normalized, ['list', 'show', 'all tasks', 'what tasks', 'what are the tasks'])
  const wantsClientTasks = includesAnyPhrase(normalized, ['task', 'tasks']) && (
    includesAnyPhrase(normalized, ['client', 'this client', 'current client']) ||
    clientReference !== null ||
    Boolean(context?.activeClientId)
  )

  if (wantsToSendDirectMessage && directMessageTarget && !directMessageContent) {
    return { action: 'clarify', message: buildClarificationMessage('dmContent', context, directMessageTarget) }
  }
  if (wantsToSendDirectMessage && !directMessageTarget && directMessageContent) {
    return { action: 'clarify', message: buildClarificationMessage('dmTarget', context) }
  }
  if (wantsToSendDirectMessage && directMessageTarget && directMessageContent) {
    return {
      action: 'execute',
      operation: 'sendDirectMessage',
      params: { recipientQuery: directMessageTarget, content: directMessageContent },
      message: `Sending that message to ${directMessageTarget} now.`,
    }
  }

  if (includesAnyPhrase(normalized, ['daily report', 'weekly report', 'monthly report', 'performance report', 'generate report', 'report for', 'report from', 'report between'])) {
    const period: ReportPeriod = includesAnyPhrase(normalized, ['daily']) ? 'daily' : includesAnyPhrase(normalized, ['monthly']) ? 'monthly' : inferredPeriod
    const params: Record<string, unknown> = { period }
    if (providerIds.length > 0) params.providerIds = providerIds
    if (context?.activeClientId) params.clientId = context.activeClientId
    if (parsedDateRange) Object.assign(params, parsedDateRange)
    return {
      action: 'execute',
      operation: 'generatePerformanceReport',
      params,
      message: parsedDateRange ? `Generating your performance report for ${parsedDateRange.startDate} to ${parsedDateRange.endDate}...` : `Generating your ${period} performance report...`,
    }
  }

  if (includesAnyPhrase(normalized, ['meta ad metric', 'meta ad metrics', 'facebook ad metric', 'facebook ad metrics', 'ad metric', 'ad metrics', 'ads metric', 'ads metrics', 'meta performance', 'facebook performance', 'ads performance', 'ad performance', 'ads snapshot', 'ad snapshot', 'how are my ads doing', 'how are meta ads doing', 'current meta ad situation', 'current ad situation', 'metrics for', 'metrics from', 'metrics between', 'active ads', 'active campaigns', 'currently active ads', 'currently active campaigns', 'running ads', 'running campaigns', 'live ads', 'live campaigns', 'what ads are active', 'which ads are active', 'what campaigns are active', 'which campaigns are active']) || adsStatusSnapshotIntent) {
    const focusActive = adsStatusSnapshotIntent || includesAnyPhrase(normalized, ['active ads', 'active campaigns', 'currently active', 'running ads', 'running campaigns', 'live ads', 'live campaigns', 'what ads are active', 'which ads are active', 'what campaigns are active', 'which campaigns are active'])
    const params: Record<string, unknown> = { period: inferredPeriod }
    if (providerIds.length === 1) params.providerId = providerIds[0]
    if (providerIds.length > 0) params.providerIds = providerIds
    if (context?.activeClientId) params.clientId = context.activeClientId
    if (parsedDateRange) Object.assign(params, parsedDateRange)
    if (focusActive) params.focus = 'active'
    if (campaignQuery) params.campaignQuery = campaignQuery
    return {
      action: 'execute',
      operation: 'summarizeAdsPerformance',
      params,
      message: campaignQuery ? `Checking the ${campaignQuery} campaign on ${getProviderSummaryLabel(providerIds)} now.` : focusActive ? 'Pulling the currently active ads and campaign snapshot now.' : undefined,
    }
  }

  if (wantsClientTasks && (wantsTaskSummary || wantsTaskList)) {
    if (!clientReference && !context?.activeClientId && !includesAnyPhrase(normalized, ['this client', 'current client'])) {
      return {
        action: 'clarify',
        message: 'I can pull the task list for a client — which client should I use?',
      }
    }

    const mode = wantsTaskSummary ? 'summary' : 'list'
    const params: Record<string, unknown> = { mode }

    if (clientReference) {
      params.clientReference = clientReference
    } else if (context?.activeClientId) {
      params.clientId = context.activeClientId
    }

    const clientLabel = clientReference ?? 'that client'

    return {
      action: 'execute',
      operation: 'summarizeClientTasks',
      params,
      message: mode === 'summary'
        ? `Pulling the task summary for ${clientLabel} now.`
        : `Listing the tasks for ${clientLabel} now.`,
    }
  }

  if (includesAnyPhrase(normalized, ['remind me to', 'create task', 'add task', 'new task']) && !includesAnyPhrase(normalized, ['update task', 'complete task', 'close task', 'mark task'])) {
    const title = extractTrailingText(message, [/remind\s+me\s+to\s+(.+)$/i, /(?:create|add)\s+(?:a\s+)?task(?:\s+(?:to|for))?\s+(.+)$/i, /new\s+task\s+(.+)$/i]) ?? null
    if (!title) return { action: 'clarify', message: buildClarificationMessage('task', context) }
    const priority = inferPriorityFromIntent(normalized)
    const params: Record<string, unknown> = { title }
    if (priority) params.priority = priority
    if (context?.activeClientId) params.clientId = context.activeClientId
    return { action: 'execute', operation: 'createTask', params, message: 'Creating that task now.' }
  }

  if (includesAnyPhrase(normalized, ['complete task', 'mark task', 'close task', 'update task'])) {
    const taskId = extractEntityIdFromIntent(message, 'task')
    if (!taskId) return { action: 'clarify', message: 'I can update that task — which task should I use?' }
    const params: Record<string, unknown> = { taskId }
    if (includesAnyPhrase(normalized, ['complete', 'completed', 'done', 'close'])) params.status = 'done'
    const priority = inferPriorityFromIntent(normalized)
    if (priority) params.priority = priority
    return { action: 'execute', operation: 'updateTask', params, message: 'Updating that task now.' }
  }

  if (includesAnyPhrase(normalized, ['create project', 'add project', 'new project'])) {
    const name = extractTrailingText(message, [/(?:create|add)\s+(?:a\s+)?project(?:\s+(?:called|named))?\s+(.+)$/i, /new\s+project\s+(.+)$/i]) ?? null
    if (!name) return { action: 'clarify', message: 'I can create that project — what should I name it, and should I link it to the current client?' }
    const params: Record<string, unknown> = { name }
    if (context?.activeClientId) params.clientId = context.activeClientId
    return { action: 'execute', operation: 'createProject', params, message: `Creating project ${name}.` }
  }

  if (includesAnyPhrase(normalized, ['update project', 'edit project'])) {
    const projectId = extractEntityIdFromIntent(message, 'project') ?? asNonEmptyString(context?.activeProjectId ?? null)
    if (!projectId) return { action: 'clarify', message: 'I can update that project — which project should I use?' }
    const params: Record<string, unknown> = { projectId }
    const status = extractTrailingText(message, [/status\s+(?:to\s+)?([a-zA-Z_-]+)/i])
    if (status) params.status = status
    return { action: 'execute', operation: 'updateProject', params, message: 'Updating that project now.' }
  }

  if (includesAnyPhrase(normalized, ['create client', 'add client', 'new client'])) {
    const name = extractTrailingText(message, [/(?:create|add)\s+(?:a\s+)?client(?:\s+(?:called|named))?\s+(.+)$/i, /new\s+client\s+(.+)$/i]) ?? null
    if (!name) return { action: 'clarify', message: 'I can create that client — what name should I use?' }
    return { action: 'execute', operation: 'createClient', params: { name }, message: `Creating client ${name}.` }
  }

  if (includesAnyPhrase(normalized, ['add team member', 'add teammate'])) {
    const clientId = extractEntityIdFromIntent(message, 'client')
    const memberName = extractTrailingText(message, [/add\s+team\s+member\s+(.+)\s+to\s+client/i, /add\s+teammate\s+(.+)\s+to\s+client/i])
    if (!clientId || !memberName) return { action: 'clarify', message: 'I can add that teammate — what is their name, and which client should I add them to?' }
    return { action: 'execute', operation: 'addClientTeamMember', params: { clientId, name: memberName }, message: `Adding ${memberName} to that client.` }
  }

  if (includesAnyPhrase(normalized, ['create proposal draft', 'new proposal draft', 'draft proposal'])) {
    if (!context?.activeClientId && !includesAnyPhrase(normalized, ['for client', 'for '])) {
      return { action: 'clarify', message: 'I can draft that proposal — which client should I create it for?' }
    }
    const params: Record<string, unknown> = {}
    if (context?.activeClientId) params.clientId = context.activeClientId
    return { action: 'execute', operation: 'createProposalDraft', params, message: 'Creating a proposal draft now.' }
  }

  if (includesAnyPhrase(normalized, ['generate proposal', 'generate this proposal', 'run proposal generation'])) {
    const proposalId = extractEntityIdFromIntent(message, 'proposal') ?? asNonEmptyString(context?.activeProposalId ?? null)
    if (!proposalId) return { action: 'clarify', message: buildClarificationMessage('proposal', context) }
    return { action: 'execute', operation: 'generateProposalFromDraft', params: { proposalId }, message: 'Starting proposal generation now.' }
  }

  if (includesAnyPhrase(normalized, ['campaign']) && (includesAnyPhrase(normalized, ['status', 'update', 'set', 'mark', 'pause', 'enable', 'resume', 'activate', 'disable']) || includesAnyPhrase(normalized, ['pause campaign', 'enable campaign', 'resume campaign', 'activate campaign']))) {
    const providerId = inferProviderFromIntent(message)
    const campaignId = extractEntityIdFromIntent(message, 'campaign')
    const action = inferCampaignStatusAction(normalized)
    if (!campaignId || !providerId || !action) return { action: 'clarify', message: buildClarificationMessage('campaign', context) }
    const params: Record<string, unknown> = { providerId, campaignId, action }
    if (context?.activeClientId) params.clientId = context.activeClientId
    return { action: 'execute', operation: 'updateAdsCampaignStatus', params, message: `Updating campaign ${campaignId} on ${providerId}.` }
  }

  if (includesAnyPhrase(normalized, ['creative']) && (includesAnyPhrase(normalized, ['status', 'update', 'set', 'mark', 'pause', 'enable', 'resume', 'activate', 'disable']) || includesAnyPhrase(normalized, ['pause creative', 'enable creative', 'resume creative', 'activate creative']))) {
    const providerId = inferProviderFromIntent(message)
    const creativeId = extractEntityIdFromIntent(message, 'creative')
    const action = inferCampaignStatusAction(normalized)
    if (!creativeId || !providerId || !action) return { action: 'clarify', message: buildClarificationMessage('creative', context) }
    const status = action === 'pause' ? 'paused' : 'active'
    const params: Record<string, unknown> = { providerId, creativeId, status }
    if (context?.activeClientId) params.clientId = context.activeClientId
    return { action: 'execute', operation: 'updateAdsCreativeStatus', params, message: `Updating creative ${creativeId} on ${providerId}.` }
  }

  return null
}

function resolveDeterministicNavigationIntent(message: string, context?: AgentRequestContextType): { route: string; message: string } | null {
  const normalized = normalizeIntentText(message)
  const meetingIntent = includesAnyPhrase(normalized, ['meeting', 'meet', 'google meet', 'call', 'calendar', 'invite'])
  const meetingTask = includesAnyPhrase(normalized, ['schedule', 'scedule', 'start', 'join', 'reschedule', 'cancel', 'book', 'set up', 'setup', 'quick meet'])
  if (meetingIntent && meetingTask) return { route: '/dashboard/meetings', message: 'Opening Meetings so you can schedule or start the call.' }

  const adsIntent = includesAnyPhrase(normalized, ['ads', 'ad campaign', 'campaign', 'ad spend', 'roas', 'creative', 'google ads', 'meta ads', 'facebook ads', 'tiktok ads', 'linkedin ads'])
  const adsNavigation = includesAnyPhrase(normalized, ['open', 'go to', 'take me', 'show', 'view', 'check', 'manage', 'sync', 'connect', 'setup', 'set up', 'configure', 'optimize'])
  if (adsIntent && adsNavigation) return { route: '/dashboard/ads', message: 'Opening Ads Hub so you can manage campaigns and ad tasks.' }

  const collaborationIntent = includesAnyPhrase(normalized, ['collaboration', 'chat', 'message', 'messages', 'team chat', 'team channel', 'direct message', 'dm', 'discussion', 'thread', 'conversation'])
  const collaborationNavigation = includesAnyPhrase(normalized, ['open', 'go to', 'take me', 'show', 'view', 'check', 'bring me', 'navigate', 'reply', 'send'])
  if (collaborationIntent && collaborationNavigation) {
    if (includesAnyPhrase(normalized, ['project chat', 'project collaboration', 'project discussion', 'this project']) && context?.activeProjectId) {
      return { route: buildCollaborationRoute({ activeProjectId: context.activeProjectId, channelType: 'project' }), message: 'Opening project collaboration.' }
    }
    if (includesAnyPhrase(normalized, ['client chat', 'client collaboration', 'client thread', 'this client']) && context?.activeClientId) {
      return { route: buildCollaborationRoute({ activeClientId: context.activeClientId, channelType: 'client' }), message: 'Opening the client collaboration space.' }
    }
    if (includesAnyPhrase(normalized, ['team chat', 'team channel', 'team collaboration', 'internal chat'])) {
      return { route: buildCollaborationRoute({ channelType: 'team' }), message: 'Opening team collaboration.' }
    }
    return { route: '/dashboard/collaboration', message: 'Opening Collaboration for you.' }
  }

  const parsedNavigationIntent = parseNavigationIntent(message)
  const hasExplicitNavVerb = includesAnyPhrase(normalized, ['go to', 'take me', 'open', 'show', 'view', 'navigate', 'check', 'bring me'])
  if (parsedNavigationIntent && (parsedNavigationIntent.confidence >= 0.75 || hasExplicitNavVerb)) {
    if (parsedNavigationIntent.route === '/dashboard/meetings') {
      return { route: '/dashboard/meetings', message: 'Opening Meetings so you can handle scheduling and call actions.' }
    }
    return { route: parsedNavigationIntent.route, message: `Opening ${parsedNavigationIntent.name} for you.` }
  }

  return null
}

function resolveDeterministicAgentIntent(message: string, context?: AgentRequestContextType): DeterministicAgentIntent | null {
  const executeIntent = resolveDeterministicExecuteIntent(message, context)
  if (executeIntent) return executeIntent
  const navigationIntent = resolveDeterministicNavigationIntent(message, context)
  if (navigationIntent) return { action: 'navigate', route: navigationIntent.route, message: navigationIntent.message }
  const clarificationIntent = resolveWeakCommandClarification(message, context)
  if (clarificationIntent) return clarificationIntent
  return null
}

export {
  extractCampaignQueryFromIntent,
  getProviderSummaryLabel,
  resolveDeterministicAgentIntent,
  resolveWeakCommandClarification,
}