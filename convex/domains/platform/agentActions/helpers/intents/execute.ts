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
  wantsSpreadsheetExportIntent,
  resolveSpreadsheetSourceFromMessage,
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

  const wantsAdsSync =
    includesAnyPhrase(normalized, ['sync', 'refresh', 'resync', 'pull latest', 'fetch latest', 'update metrics']) &&
    includesAnyPhrase(normalized, [
      'ads',
      'ad metrics',
      'ad spend',
      'campaign metrics',
      'meta ads',
      'facebook ads',
      'google ads',
      'tiktok ads',
      'linkedin ads',
      'paid media',
      'paid ads',
    ]) &&
    !wantsOrganicSocialIntent(normalized)

  if (wantsAdsSync) {
    const params: Record<string, unknown> = { period: inferredPeriod }
    if (providerIds.length === 1) params.providerId = providerIds[0]
    if (providerIds.length > 0) params.providerIds = providerIds
    if (context?.activeClientId) params.clientId = context.activeClientId
    if (parsedDateRange) Object.assign(params, parsedDateRange)
    return {
      action: 'execute',
      operation: 'requestAdsSync',
      params,
      message: parsedDateRange
        ? `Queuing an ads sync for ${parsedDateRange.startDate} to ${parsedDateRange.endDate} now.`
        : 'Queuing an ads metrics sync now.',
    }
  }

  const wantsAnalyticsSync =
    includesAnyPhrase(normalized, ['sync', 'refresh', 'resync', 'pull latest', 'fetch latest', 'update metrics']) &&
    includesAnyPhrase(normalized, [
      'analytics',
      'google analytics',
      'ga4',
      'website traffic',
      'site traffic',
      'web traffic',
    ])

  if (wantsAnalyticsSync) {
    const params: Record<string, unknown> = { period: inferredPeriod }
    if (context?.activeClientId) params.clientId = context.activeClientId
    if (parsedDateRange) Object.assign(params, parsedDateRange)
    return {
      action: 'execute',
      operation: 'requestAnalyticsSync',
      params,
      message: parsedDateRange
        ? `Queuing a Google Analytics sync for ${parsedDateRange.startDate} to ${parsedDateRange.endDate} now.`
        : 'Queuing a Google Analytics sync now.',
    }
  }

  if (wantsSpreadsheetExportIntent(normalized)) {
    const source = resolveSpreadsheetSourceFromMessage(normalized, context, clientReference)
    const params: Record<string, unknown> = { period: inferredPeriod }
    if (source) params.source = source
    if (providerIds.length === 1) params.providerId = providerIds[0]
    if (providerIds.length > 0) params.providerIds = providerIds
    if (context?.activeClientId) params.clientId = context.activeClientId
    if (clientReference) params.clientReference = clientReference
    if (parsedDateRange) Object.assign(params, parsedDateRange)
    if (normalized.includes('instagram')) params.surface = 'instagram'
    if (normalized.includes('facebook')) params.surface = 'facebook'

    if (!source) {
      return {
        action: 'clarify',
        message:
          'I can export paid ads, website analytics, organic social, tasks, clients, projects, proposals, meetings, or a performance report to Excel — which should I use?',
      }
    }

    const exportLabel =
      source === 'ads'
        ? 'ads'
        : source === 'analytics'
          ? 'analytics'
          : source === 'social'
            ? 'social'
            : source === 'tasks' || source === 'clientTasks'
              ? 'tasks'
              : source

    return {
      action: 'execute',
      operation: 'exportSpreadsheet',
      params,
      message: parsedDateRange
        ? `Building an Excel export for ${exportLabel} (${parsedDateRange.startDate} to ${parsedDateRange.endDate}) now.`
        : `Building an Excel export for ${exportLabel} now.`,
    }
  }

  if (includesAnyPhrase(normalized, ['daily report', 'weekly report', 'monthly report', 'performance report', 'generate report', 'report for', 'report from', 'report between', 'quarterly report', 'q1 report', 'q2 report', 'q3 report', 'q4 report', 'last quarter report'])) {
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
      'total spend',
      'how much spend',
      'money spent',
      'what did we spend',
      'return on ad spend',
      'cost per click',
      'cost per acquisition',
      'tiktok performance',
      'linkedin ads',
      'google ads performance',
      'meta ads performance',
    ]) ||
    includesAnyPhrase(normalized, ['roas', 'cpc', 'cpa', 'ctr']) ||
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
        'website performance',
        'site performance',
        'page views',
        'pageviews',
        'bounce rate',
        'sessions',
        'visitors',
      ]) ||
      (
        includesAnyPhrase(normalized, ['analytics', 'website', 'site traffic', 'web traffic']) &&
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
          'yesterday',
          'today',
          'this week',
          'last quarter',
          'this quarter',
        ])
      )
    )

  const wantsAmbiguousPerformanceRecap =
    includesAnyPhrase(normalized, [
      'how did we do',
      'how are we doing',
      'how did things go',
      'quick recap',
      'performance recap',
      'give me a recap',
      'business recap',
    ]) &&
    (parsedDateRange !== null ||
      includesAnyPhrase(normalized, [
        'last month',
        'this month',
        'last week',
        'this week',
        'yesterday',
        'today',
        'last quarter',
        'this quarter',
        'last year',
        'this year',
      ]))

  if (wantsAmbiguousPerformanceRecap) {
    if (wantsOrganicSocialIntent(normalized)) {
      const params: Record<string, unknown> = { period: inferredPeriod }
      if (context?.activeClientId) params.clientId = context.activeClientId
      if (parsedDateRange) Object.assign(params, parsedDateRange)
      return {
        action: 'execute',
        operation: 'summarizeSocialPerformance',
        params,
        message: 'Pulling your organic social recap now.',
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
        message: 'Pulling your website analytics recap now.',
      }
    }
    if (
      wantsPaidAdsSummary ||
      includesAnyPhrase(normalized, ['spend', 'revenue', 'campaign', 'ads', 'roas'])
    ) {
      const params: Record<string, unknown> = { period: inferredPeriod }
      if (providerIds.length === 1) params.providerId = providerIds[0]
      if (providerIds.length > 0) params.providerIds = providerIds
      if (context?.activeClientId) params.clientId = context.activeClientId
      if (parsedDateRange) Object.assign(params, parsedDateRange)
      return {
        action: 'execute',
        operation: 'summarizeAdsPerformance',
        params,
        message: 'Pulling your paid ads recap now.',
      }
    }
    return {
      action: 'clarify',
      message:
        'I can pull paid ads, website analytics, or organic social for that window — which should I use?',
    }
  }

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

  if (includesAnyPhrase(normalized, ['meta ad metric', 'meta ad metrics', 'facebook ad metric', 'facebook ad metrics', 'ad metric', 'ad metrics', 'ads metric', 'ads metrics', 'meta performance', 'facebook performance', 'ads performance', 'ad performance', 'ads snapshot', 'ad snapshot', 'how are my ads doing', 'how are meta ads doing', 'current meta ad situation', 'current ad situation', 'metrics for', 'metrics from', 'metrics between', 'active ads', 'active campaigns', 'currently active ads', 'currently active campaigns', 'running ads', 'running campaigns', 'live ads', 'live campaigns', 'what ads are active', 'which ads are active', 'what campaigns are active', 'which campaigns are active', 'spend yesterday', 'spend today', 'spend last month', 'spend last week', 'how much did we spend', 'what was our roas']) || adsStatusSnapshotIntent || wantsPaidAdsSummary) {
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
      message: campaignQuery
        ? `Checking the ${campaignQuery} campaign on ${getProviderSummaryLabel(providerIds)} now.`
        : parsedDateRange
          ? `Pulling ${getProviderSummaryLabel(providerIds)} for ${parsedDateRange.startDate} to ${parsedDateRange.endDate} now.`
          : focusActive
            ? 'Pulling the currently active ads and campaign snapshot now.'
            : undefined,
    }
  }

  const wantsOverdueTasks =
    includesAnyPhrase(normalized, ['task', 'tasks']) &&
    includesAnyPhrase(normalized, ['overdue', 'past due', 'late task', 'late tasks'])
  const wantsDueTodayTasks =
    includesAnyPhrase(normalized, ['task', 'tasks']) &&
    includesAnyPhrase(normalized, ['due today', 'tasks for today', 'tasks today'])
  const wantsHighPriorityTasks =
    includesAnyPhrase(normalized, ['task', 'tasks']) &&
    includesAnyPhrase(normalized, ['high priority', 'urgent task', 'urgent tasks'])

  if (wantsOverdueTasks && !wantsClientTasks) {
    return {
      action: 'execute',
      operation: 'summarizeMyTasks',
      params: { mode: 'list', timeWindow: 'overdue' },
      message: 'Listing your overdue tasks now.',
    }
  }

  if (wantsDueTodayTasks && !wantsClientTasks) {
    return {
      action: 'execute',
      operation: 'summarizeMyTasks',
      params: { mode: 'list', timeWindow: 'today' },
      message: 'Listing tasks due today now.',
    }
  }

  if (wantsHighPriorityTasks && !wantsClientTasks) {
    return {
      action: 'execute',
      operation: 'summarizeMyTasks',
      params: { mode: 'summary', timeWindow: 'all' },
      message: 'Pulling your high-priority tasks now.',
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

  if (wantsClientTasks && (wantsTaskSummary || wantsTaskList || wantsOverdueTasks || wantsDueTodayTasks)) {
    if (!clientReference && !context?.activeClientId && !includesAnyPhrase(normalized, ['this client', 'current client'])) {
      return {
        action: 'clarify',
        message: 'I can pull the task list for a client — which client should I use?',
      }
    }

    const mode = wantsTaskSummary && !wantsOverdueTasks && !wantsDueTodayTasks ? 'summary' : 'list'
    let timeWindow = parseTaskTimeWindowFromIntent(message)
    if (wantsOverdueTasks) timeWindow = 'overdue'
    if (wantsDueTodayTasks) timeWindow = 'today'
    const params: Record<string, unknown> = { mode, timeWindow }

    if (clientReference) {
      params.clientReference = clientReference
    } else if (context?.activeClientId) {
      params.clientId = context.activeClientId
    }

    const clientLabel = clientReference ?? 'that client'
    const statusMessage =
      timeWindow === 'overdue'
        ? `Listing overdue tasks for ${clientLabel} now.`
        : timeWindow === 'today'
          ? `Listing tasks due today for ${clientLabel} now.`
          : mode === 'summary'
            ? `Pulling the task summary for ${clientLabel} now.`
            : `Listing the tasks for ${clientLabel} now.`

    return {
      action: 'execute',
      operation: 'summarizeClientTasks',
      params,
      message: statusMessage,
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

  if (
    includesAnyPhrase(normalized, ['list projects', 'active projects', 'show projects', 'our projects']) &&
    !includesAnyPhrase(normalized, ['create project', 'add project', 'new project', 'update project', 'edit project'])
  ) {
    return {
      action: 'execute',
      operation: 'listActiveProjects',
      params: {},
      message: 'Listing active projects in this workspace now.',
    }
  }

  if (
    includesAnyPhrase(normalized, ['list proposals', 'show proposals', 'our proposals', 'proposal drafts', 'open proposals', 'draft proposals', 'proposal list']) &&
    !includesAnyPhrase(normalized, ['create proposal', 'generate proposal', 'draft proposal', 'update proposal'])
  ) {
    const params: Record<string, unknown> = {}
    if (context?.activeClientId) params.clientId = context.activeClientId
    return {
      action: 'execute',
      operation: 'listProposals',
      params,
      message: 'Listing proposal drafts now.',
    }
  }

  if (
    includesAnyPhrase(normalized, ['meeting', 'meetings']) &&
    includesAnyPhrase(normalized, [
      'summary',
      'summarize',
      'list',
      'show',
      'upcoming',
      'what',
      'next',
      'when is',
      'meetings today',
      'meetings this week',
      'next meeting',
    ]) ||
    (
      includesAnyPhrase(normalized, ['today', 'this week']) &&
      includesAnyPhrase(normalized, ['meeting', 'meetings'])
    )
  ) {
    const params: Record<string, unknown> = {}
    if (context?.activeClientId) params.clientId = context.activeClientId
    if (includesAnyPhrase(normalized, ['past', 'previous', 'history'])) params.includePast = true
    return {
      action: 'execute',
      operation: 'summarizeMeetings',
      params,
      message: 'Pulling your meetings summary now.',
    }
  }

  if (
    includesAnyPhrase(normalized, ['update proposal', 'edit proposal', 'change proposal']) &&
    !includesAnyPhrase(normalized, ['generate proposal', 'create proposal', 'draft proposal'])
  ) {
    const proposalId = extractEntityIdFromIntent(message, 'proposal') ?? asNonEmptyString(context?.activeProposalId ?? null)
    if (!proposalId) return { action: 'clarify', message: buildClarificationMessage('proposal', context) }
    const params: Record<string, unknown> = { proposalId }
    const section = extractTrailingText(message, [/section\s+(.+)$/i, /update\s+(.+?)\s+in\s+proposal/i])
    if (section) params.section = section
    if (context?.activeClientId) params.clientId = context.activeClientId
    return { action: 'execute', operation: 'updateProposalDraft', params, message: 'Updating that proposal draft now.' }
  }

  if (
    includesAnyPhrase(normalized, ['proposal question', 'answer proposal', 'continue proposal', 'next proposal question']) ||
    (includesAnyPhrase(normalized, ['proposal']) && includesAnyPhrase(normalized, ['answer', 'respond', 'reply']))
  ) {
    const answer = extractTrailingText(message, [/answer\s+(.+)$/i, /reply\s+(.+)$/i]) ?? message.trim()
    const params: Record<string, unknown> = { answer }
    if (context?.activeProposalId) params.proposalId = context.activeProposalId
    if (context?.activeClientId) params.clientId = context.activeClientId
    return {
      action: 'execute',
      operation: 'advanceProposalConversation',
      params,
      message: 'Recording your proposal answer and moving to the next step.',
    }
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
