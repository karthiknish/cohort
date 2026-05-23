import type {
  AgentRequestContextType,
  DeterministicAgentIntent,
  ProviderId,
  ReportPeriod,
} from '../../types'

import { parseTaskTimeWindowFromIntent } from '../../operations/taskSummary'
import { parseDateRangeFromIntent, resolveIntentDateRange } from '../dates'
import { asNonEmptyString } from '../values'
import {
  buildClarificationMessage,
  buildCollaborationRoute,
  extractCampaignQueryFromIntent,
  extractClientReferenceFromIntent,
  extractDirectMessageContentFromIntent,
  extractDirectMessageTargetFromIntent,
  extractEntityIdFromIntent,
  extractTrailingText,
  getProviderSummaryLabel,
  includesAnyPhrase,
  inferCampaignStatusAction,
  inferPriorityFromIntent,
  inferProviderFiltersFromIntent,
  inferProviderFromIntent,
  inferReportPeriodFromIntent,
  normalizeIntentText,
  sanitizeEntityDraftLabel,
  deriveEntityDraftLabelFromAttachment,
  hasAttachmentContext,
  wantsOrganicSocialIntent,
} from './parsing'

export function resolveDeterministicExecuteIntent(message: string, context?: AgentRequestContextType): DeterministicAgentIntent | null {
  const normalized = normalizeIntentText(message)
  const providerIds = inferProviderFiltersFromIntent(message)
  const inferredPeriod = inferReportPeriodFromIntent(normalized)
  const parsedDateRange = resolveIntentDateRange(message)
  const campaignQuery = extractCampaignQueryFromIntent(message)
  const clientReference = extractClientReferenceFromIntent(message)
  const directMessageTarget = extractDirectMessageTargetFromIntent(message)
  const directMessageContent = extractDirectMessageContentFromIntent(message)
  const wantsToSendDirectMessage = includesAnyPhrase(normalized, ['send', 'write', 'dm', 'direct message', 'chat', 'message']) && includesAnyPhrase(normalized, ['to', '@'])
  const adsStatusSnapshotIntent = includesAnyPhrase(normalized, ['ads', 'ad', 'campaign', 'campaigns', 'google', 'facebook', 'meta', 'tiktok', 'linkedin']) && includesAnyPhrase(normalized, ['active', 'currently', 'running', 'live'])
  const wantsTaskSummary = includesAnyPhrase(normalized, ['summary', 'summarize', 'overview'])
  const wantsTaskList = includesAnyPhrase(normalized, ['list', 'show', 'all tasks', 'what tasks', 'what are the tasks'])
  const wantsMyTasksExplicit =
    includesAnyPhrase(normalized, [
      'my tasks',
      'my task',
      'tasks assigned to me',
      'assigned to me',
      'on my plate',
      'what are my tasks',
      'tasks for me',
    ]) ||
    (normalized.includes('my') && includesAnyPhrase(normalized, ['task', 'tasks']))
  const wantsClientTasks = includesAnyPhrase(normalized, ['task', 'tasks']) && (
    includesAnyPhrase(normalized, ['client', 'this client', 'current client']) ||
    clientReference !== null ||
    (Boolean(context?.activeClientId) && !wantsMyTasksExplicit)
  )

  const wantsMyTaskDigest =
    includesAnyPhrase(normalized, ['task', 'tasks']) &&
    (wantsTaskSummary || wantsTaskList) &&
    wantsMyTasksExplicit

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

  if (
    includesAnyPhrase(normalized, [
      'mark all notifications',
      'mark notifications read',
      'clear all notifications',
      'clear notifications',
      'notifications as read',
      'read all notifications',
      'dismiss all notifications',
      'clear notification badge',
      'mark notification',
      'zero unread notifications',
    ])
  ) {
    return {
      action: 'execute',
      operation: 'markAllNotificationsRead',
      params: {},
      message: 'Marking your unread notifications as read now.',
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

  const wantsPaidAdsSummary =
    includesAnyPhrase(normalized, [
      'ads summary',
      'ad summary',
      'ads snapshot',
      'ad snapshot',
      'paid ads',
      'ad spend',
      'campaign spend',
    ]) ||
    adsStatusSnapshotIntent

  const wantsAnalyticsSummary =
    !wantsPaidAdsSummary &&
    (
      includesAnyPhrase(normalized, [
        'google analytics',
        'ga4',
        'website traffic',
        'site traffic',
        'web traffic',
        'web analytics',
        'traffic summary',
      ]) ||
      (
        includesAnyPhrase(normalized, ['analytics']) &&
        includesAnyPhrase(normalized, [
          'summary',
          'summarize',
          'overview',
          'snapshot',
          'performance',
          'metrics',
          'numbers',
          'how are',
          'how is',
          'last month',
          'last week',
          'last 7',
          'last 30',
          'last 100',
        ])
      )
    )

  if (
    wantsOrganicSocialIntent(normalized) &&
    includesAnyPhrase(normalized, [
      'sync social',
      'sync instagram',
      'sync facebook',
      'refresh social',
      'sync organic',
      'resync social',
      'update social metrics',
    ])
  ) {
    const params: Record<string, unknown> = {}
    if (context?.activeClientId) params.clientId = context.activeClientId
    if (parsedDateRange) Object.assign(params, parsedDateRange)
    if (normalized.includes('instagram')) params.surface = 'instagram'
    if (normalized.includes('facebook')) params.surface = 'facebook'
    return {
      action: 'execute',
      operation: 'requestSocialSync',
      params,
      message: 'Queuing an organic social metrics sync now.',
    }
  }

  if (
    wantsOrganicSocialIntent(normalized) &&
    includesAnyPhrase(normalized, [
      'summary',
      'summarize',
      'overview',
      'snapshot',
      'performance',
      'metrics',
      'insights',
      'how are',
      'how is',
      'how\'s',
    ])
  ) {
    const params: Record<string, unknown> = { period: inferredPeriod }
    if (context?.activeClientId) params.clientId = context.activeClientId
    if (parsedDateRange) Object.assign(params, parsedDateRange)
    if (normalized.includes('instagram')) params.surface = 'instagram'
    if (normalized.includes('facebook')) params.surface = 'facebook'
    return {
      action: 'execute',
      operation: 'summarizeSocialPerformance',
      params,
      message: parsedDateRange
        ? `Pulling organic social performance for ${parsedDateRange.startDate} to ${parsedDateRange.endDate} now.`
        : 'Pulling your organic social summary now.',
    }
  }

  if (wantsAnalyticsSummary) {
    const params: Record<string, unknown> = { period: inferredPeriod }
    if (context?.activeClientId) params.clientId = context.activeClientId
    if (parsedDateRange) Object.assign(params, parsedDateRange)
    return {
      action: 'execute',
      operation: 'summarizeAnalyticsPerformance',
      params,
      message: parsedDateRange
        ? `Pulling Google Analytics for ${parsedDateRange.startDate} to ${parsedDateRange.endDate} now.`
        : `Pulling your ${inferredPeriod} analytics summary now.`,
    }
  }

  if (includesAnyPhrase(normalized, ['meta ad metric', 'meta ad metrics', 'facebook ad metric', 'facebook ad metrics', 'ad metric', 'ad metrics', 'ads metric', 'ads metrics', 'meta performance', 'facebook performance', 'ads performance', 'ad performance', 'ads snapshot', 'ad snapshot', 'how are my ads doing', 'how are meta ads doing', 'current meta ad situation', 'current ad situation', 'metrics for', 'metrics from', 'metrics between', 'active ads', 'active campaigns', 'currently active ads', 'currently active campaigns', 'running ads', 'running campaigns', 'live ads', 'live campaigns', 'what ads are active', 'which ads are active', 'what campaigns are active', 'which campaigns are active']) || adsStatusSnapshotIntent || wantsPaidAdsSummary) {
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

  if (wantsMyTaskDigest) {
    const mode = wantsTaskSummary ? 'summary' : 'list'
    const timeWindow = parseTaskTimeWindowFromIntent(message)
    return {
      action: 'execute',
      operation: 'summarizeMyTasks',
      params: { mode, timeWindow },
      message: mode === 'summary' ? 'Pulling your workspace task summary now.' : 'Listing your tasks now.',
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
    const timeWindow = parseTaskTimeWindowFromIntent(message)
    const params: Record<string, unknown> = { mode, timeWindow }

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
    let title = sanitizeEntityDraftLabel(
      extractTrailingText(message, [/remind\s+me\s+to\s+(.+)$/i, /(?:create|add)\s+(?:a\s+)?task(?:\s+(?:to|for))?\s+(.+)$/i, /new\s+task\s+(.+)$/i]) ?? null
    )
    if (!title && hasAttachmentContext(context)) {
      title = deriveEntityDraftLabelFromAttachment(context)
    }
    if (!title) return { action: 'clarify', message: buildClarificationMessage('task', context) }
    const priority = inferPriorityFromIntent(normalized)
    const params: Record<string, unknown> = { title }
    if (context?.attachmentContext?.[0]?.excerpt) params.description = context.attachmentContext[0].excerpt
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
    let name = sanitizeEntityDraftLabel(
      extractTrailingText(message, [/(?:create|add)\s+(?:a\s+)?project(?:\s+(?:called|named))?\s+(.+)$/i, /new\s+project\s+(.+)$/i]) ?? null
    )
    if (!name && hasAttachmentContext(context)) {
      name = deriveEntityDraftLabelFromAttachment(context)
    }
    if (!name) return { action: 'clarify', message: 'I can create that project — what should I name it, and should I link it to the current client?' }
    const params: Record<string, unknown> = { name }
    if (context?.attachmentContext?.[0]?.excerpt) params.description = context.attachmentContext[0].excerpt
    if (context?.activeClientId) params.clientId = context.activeClientId
    return { action: 'execute', operation: 'createProject', params, message: `Creating project ${name}.` }
  }

  if (includesAnyPhrase(normalized, ['update project', 'update this project', 'edit project', 'edit this project'])) {
    const projectId = extractEntityIdFromIntent(message, 'project') ?? asNonEmptyString(context?.activeProjectId ?? null)
    if (!projectId) return { action: 'clarify', message: 'I can update that project — which project should I use?' }
    const params: Record<string, unknown> = { projectId }
    const status = extractTrailingText(message, [/status\s+(?:to\s+)?([a-zA-Z_-]+)/i])
    if (status) params.status = status
    if (Object.keys(params).length === 1) {
      return {
        action: 'clarify',
        message: 'I can update that project — what should I change: status, name, dates, client, description, or tags?',
      }
    }
    return { action: 'execute', operation: 'updateProject', params, message: 'Updating that project now.' }
  }

  if (includesAnyPhrase(normalized, ['create client', 'add client', 'new client'])) {
    const name = extractTrailingText(message, [/(?:create|add)\s+(?:a\s+)?client(?:\s+(?:called|named))?\s+(.+)$/i, /new\s+client\s+(.+)$/i]) ?? null
    if (!name) return { action: 'clarify', message: 'I can create that client — what name should I use?' }
    return { action: 'execute', operation: 'createClient', params: { name }, message: `Creating client ${name}.` }
  }

  if (
    (includesAnyPhrase(normalized, ['list clients', 'workspace clients', 'show all clients', 'all clients in workspace']) ||
      (includesAnyPhrase(normalized, ['show clients', 'our clients']) && !includesAnyPhrase(normalized, ['create client', 'add client', 'new client']))) &&
    !includesAnyPhrase(normalized, ['create client', 'add client', 'new client', 'team member', 'teammate'])
  ) {
    const params: Record<string, unknown> = {}
    const queryHint = extractTrailingText(message, [/clients?\s+(?:named|matching|like)\s+(.+)$/i])
    if (queryHint) params.query = queryHint
    return {
      action: 'execute',
      operation: 'listWorkspaceClients',
      params,
      message: 'Pulling the workspace client list now.',
    }
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
