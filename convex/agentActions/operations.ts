import type { ActionCtx } from '../_generated/server'

import { api } from '../_generated/api'
import { mergeProposalForm } from '../../src/lib/proposals'

import {
  asErrorMessage,
  asNonEmptyString,
  asNumber,
  asRecord,
  asString,
  asStringArray,
  formatCurrency,
  formatPercent,
  formatRatio,
  formatWholeNumber,
  getProviderSummaryLabel,
  mergeProposalPatch,
  normalizeCampaignAction,
  normalizeCreativeStatus,
  normalizeOperationName,
  normalizeProposalStatus,
  normalizeProviderId,
  normalizeProviderIds,
  normalizeReportPeriod,
  parseDateToMs,
  resolveReportWindow,
  resolveAgentDueDateMs,
  resolveClientIdFromParams,
  resolveProposalId,
  unwrapConvexResult,
} from './helpers'
import type { JsonRecord, OperationHandler, OperationInput, OperationResult } from './types'

const ALL_PROVIDER_IDS = ['google', 'facebook', 'tiktok', 'linkedin'] as const

type AggregateMetrics = {
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
  roas: number
  ctr: number
  cpc: number
  cpa: number
}

type AggregateDelta = Record<keyof AggregateMetrics, number | null>

function isActiveCampaignStatus(status: string | null): boolean {
  const normalized = status?.toLowerCase() ?? ''
  return normalized.includes('active') || normalized.includes('enable') || normalized.includes('live')
}

function isPausedCampaignStatus(status: string | null): boolean {
  const normalized = status?.toLowerCase() ?? ''
  return normalized.includes('pause') || normalized.includes('disable') || normalized.includes('archived')
}

function toIsoDate(value: number): string {
  return new Date(value).toISOString().slice(0, 10)
}

function getPreviousDateWindow(startDate: string, endDate: string): { startDate: string; endDate: string } | null {
  const startMs = parseDateToMs(startDate)
  const endMs = parseDateToMs(endDate)
  if (startMs === null || endMs === null) return null

  const spanMs = Math.max(endMs - startMs, 0)
  const previousEndMs = startMs - 86_400_000
  const previousStartMs = previousEndMs - spanMs

  return {
    startDate: toIsoDate(previousStartMs),
    endDate: toIsoDate(previousEndMs),
  }
}

function formatProviderDisplayName(providerId: string): string {
  switch (providerId) {
    case 'google':
      return 'Google Ads'
    case 'facebook':
    case 'meta':
      return 'Meta Ads'
    case 'linkedin':
      return 'LinkedIn Ads'
    case 'tiktok':
      return 'TikTok Ads'
    default:
      return providerId
  }
}

type DirectMessageRecipient = {
  id: string
  name: string
  email?: string
  role?: string
}

type ClientLookupRecord = {
  legacyId: string
  name: string
  workspaceId: string
}

type ClientTaskRecord = {
  legacyId: string
  title: string
  status: string
  priority: string
  dueDateMs: number | null
  assignedTo: string[] | null
}

function normalizeRecipientLookupText(value: string | null | undefined): string {
  return (value ?? '')
    .toLowerCase()
    .replace(/^@+/, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function resolveDirectMessageRecipient(
  recipients: DirectMessageRecipient[],
  recipientQuery: string,
): { match: DirectMessageRecipient | null; matches: DirectMessageRecipient[] } {
  const normalizedQuery = normalizeRecipientLookupText(recipientQuery)
  if (!normalizedQuery) return { match: null, matches: [] }

  const exactMatches = recipients.filter((recipient) => (
    normalizeRecipientLookupText(recipient.id) === normalizedQuery ||
    normalizeRecipientLookupText(recipient.name) === normalizedQuery ||
    normalizeRecipientLookupText(recipient.email) === normalizedQuery
  ))
  if (exactMatches.length === 1) return { match: exactMatches[0] ?? null, matches: exactMatches }
  if (exactMatches.length > 1) return { match: null, matches: exactMatches }

  const tokenMatches = recipients.filter((recipient) => {
    const nameTokens = normalizeRecipientLookupText(recipient.name).split(' ').filter(Boolean)
    return nameTokens.includes(normalizedQuery)
  })
  if (tokenMatches.length === 1) return { match: tokenMatches[0] ?? null, matches: tokenMatches }
  if (tokenMatches.length > 1) return { match: null, matches: tokenMatches }

  const partialMatches = recipients.filter((recipient) => (
    normalizeRecipientLookupText(recipient.name).includes(normalizedQuery) ||
    normalizeRecipientLookupText(recipient.email).includes(normalizedQuery)
  ))
  if (partialMatches.length === 1) return { match: partialMatches[0] ?? null, matches: partialMatches }

  return { match: null, matches: partialMatches }
}

function truncateMessagePreview(content: string): string {
  return content.length > 80 ? `${content.slice(0, 77)}...` : content
}

function normalizeLookupText(value: string | null | undefined): string {
  return (value ?? '')
    .toLowerCase()
    .replace(/^@+/, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractClientLookupRecords(value: unknown): ClientLookupRecord[] {
  const items = Array.isArray(value)
    ? value
    : Array.isArray((value as { items?: unknown[] } | null)?.items)
      ? (value as { items: unknown[] }).items
      : []

  return items
    .map((item) => asRecord(item))
    .map((item) => ({
      legacyId: asNonEmptyString(item?.legacyId) ?? '',
      name: asNonEmptyString(item?.name) ?? '',
      workspaceId: asNonEmptyString(item?.workspaceId) ?? '',
    }))
    .filter((item) => item.legacyId.length > 0 && item.name.length > 0 && item.workspaceId.length > 0)
}

function resolveClientLookupMatch(
  clients: ClientLookupRecord[],
  clientQuery: string,
): { match: ClientLookupRecord | null; matches: ClientLookupRecord[] } {
  const normalizedQuery = normalizeLookupText(clientQuery)
  if (!normalizedQuery) return { match: null, matches: [] }

  const exactMatches = clients.filter((client) => (
    normalizeLookupText(client.legacyId) === normalizedQuery ||
    normalizeLookupText(client.name) === normalizedQuery
  ))
  if (exactMatches.length === 1) return { match: exactMatches[0] ?? null, matches: exactMatches }
  if (exactMatches.length > 1) return { match: null, matches: exactMatches }

  const tokenMatches = clients.filter((client) => {
    const nameTokens = normalizeLookupText(client.name).split(' ').filter(Boolean)
    return nameTokens.includes(normalizedQuery)
  })
  if (tokenMatches.length === 1) return { match: tokenMatches[0] ?? null, matches: tokenMatches }
  if (tokenMatches.length > 1) return { match: null, matches: tokenMatches }

  const partialMatches = clients.filter((client) => (
    normalizeLookupText(client.legacyId).includes(normalizedQuery) ||
    normalizeLookupText(client.name).includes(normalizedQuery)
  ))
  if (partialMatches.length === 1) return { match: partialMatches[0] ?? null, matches: partialMatches }

  return { match: null, matches: partialMatches }
}

function isCompletedTaskStatus(status: string): boolean {
  const normalized = status.trim().toLowerCase()
  return normalized === 'completed' || normalized === 'done' || normalized === 'archived'
}

function formatTaskDate(value: number | null): string | null {
  return typeof value === 'number' && Number.isFinite(value)
    ? new Date(value).toISOString().slice(0, 10)
    : null
}

function formatTaskStatusLabel(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function formatTaskPriorityLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function extractClientTaskRecords(value: unknown): ClientTaskRecord[] {
  const items = Array.isArray(value)
    ? value
    : Array.isArray((value as { items?: unknown[] } | null)?.items)
      ? (value as { items: unknown[] }).items
      : []

  return items
    .map((item) => asRecord(item))
    .map((item) => ({
      legacyId: asNonEmptyString(item?.legacyId) ?? '',
      title: asNonEmptyString(item?.title) ?? 'Untitled task',
      status: asNonEmptyString(item?.status) ?? 'unknown',
      priority: asNonEmptyString(item?.priority) ?? 'medium',
      dueDateMs: asNumber(item?.dueDateMs),
      assignedTo: Array.isArray(item?.assignedTo)
        ? item.assignedTo.map((entry) => asNonEmptyString(entry)).filter((entry): entry is string => entry !== null)
        : null,
    }))
    .filter((item) => item.legacyId.length > 0)
}

function buildCampaignRoute(args: {
  providerId?: string | null
  campaignId?: string | null
  campaignName?: string | null
  startDate: string
  endDate: string
  clientId?: string | null
}): string | null {
  if (!args.providerId || !args.campaignId) return null

  const params = new URLSearchParams({
    startDate: args.startDate,
    endDate: args.endDate,
  })
  if (args.clientId) params.set('clientId', args.clientId)
  if (args.campaignName) params.set('campaignName', args.campaignName)

  return `/dashboard/ads/campaigns/${args.providerId}/${args.campaignId}?${params.toString()}`
}

function computeAggregateMetrics(source: Record<string, unknown> | null): AggregateMetrics {
  const spend = asNumber(source?.spend) ?? 0
  const impressions = asNumber(source?.impressions) ?? 0
  const clicks = asNumber(source?.clicks) ?? 0
  const conversions = asNumber(source?.conversions) ?? 0
  const revenue = asNumber(source?.revenue) ?? 0

  return {
    spend,
    impressions,
    clicks,
    conversions,
    revenue,
    roas: spend > 0 ? revenue / spend : 0,
    ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
    cpc: clicks > 0 ? spend / clicks : 0,
    cpa: conversions > 0 ? spend / conversions : 0,
  }
}

function computeAggregateMetricsFromRows(rows: Record<string, unknown>[]): AggregateMetrics {
  const totals = rows.reduce<{ spend: number; impressions: number; clicks: number; conversions: number; revenue: number }>((acc, row) => {
    acc.spend += asNumber(row.spend) ?? 0
    acc.impressions += asNumber(row.impressions) ?? 0
    acc.clicks += asNumber(row.clicks) ?? 0
    acc.conversions += asNumber(row.conversions) ?? 0
    acc.revenue += asNumber(row.revenue) ?? 0
    return acc
  }, {
    spend: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    revenue: 0,
  })

  return computeAggregateMetrics(totals)
}

function normalizeCampaignLookupText(value: string | null | undefined): string {
  return (value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\b(?:the|active|live|running|current|currently|ad|ads|campaign|campaigns)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function matchesCampaignQuery(value: string | null | undefined, campaignQuery: string): boolean {
  const normalizedValue = normalizeCampaignLookupText(value)
  if (!normalizedValue || !campaignQuery) return false
  if (normalizedValue.includes(campaignQuery)) return true

  const tokens = campaignQuery.split(' ').filter(Boolean)
  return tokens.length > 0 && tokens.every((token) => normalizedValue.includes(token))
}

function buildProviderBreakdownFromRows(
  currentRows: Record<string, unknown>[],
  previousRows: Record<string, unknown>[]
): Array<{
  providerId: string
  label: string
  totals: AggregateMetrics
  delta: AggregateDelta
  deltaPercent: AggregateDelta
}> {
  const accumulate = (rows: Record<string, unknown>[]) => {
    const map = new Map<string, { spend: number; impressions: number; clicks: number; conversions: number; revenue: number }>()

    for (const row of rows) {
      const providerId = asNonEmptyString(row.providerId) ?? 'unknown'
      const current = map.get(providerId) ?? { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 }
      current.spend += asNumber(row.spend) ?? 0
      current.impressions += asNumber(row.impressions) ?? 0
      current.clicks += asNumber(row.clicks) ?? 0
      current.conversions += asNumber(row.conversions) ?? 0
      current.revenue += asNumber(row.revenue) ?? 0
      map.set(providerId, current)
    }

    return map
  }

  const currentMap = accumulate(currentRows)
  const previousMap = accumulate(previousRows)
  const providerIds = Array.from(new Set([...currentMap.keys(), ...previousMap.keys()]))

  return providerIds.map((providerId) => {
    const totals = computeAggregateMetrics(currentMap.get(providerId) ?? null)
    const previousTotals = computeAggregateMetrics(previousMap.get(providerId) ?? null)
    const comparison = buildAggregateComparison(totals, previousTotals)

    return {
      providerId,
      label: formatProviderDisplayName(providerId),
      totals,
      delta: comparison.delta,
      deltaPercent: comparison.deltaPercent,
    }
  }).sort((left, right) => right.totals.spend - left.totals.spend)
}

function computeDelta(current: number, previous: number): number | null {
  return Number.isFinite(current) && Number.isFinite(previous) ? current - previous : null
}

function computeDeltaPercent(current: number, previous: number): number | null {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) return null
  return ((current - previous) / previous) * 100
}

function buildAggregateComparison(current: AggregateMetrics, previous: AggregateMetrics): {
  previousTotals: AggregateMetrics
  delta: AggregateDelta
  deltaPercent: AggregateDelta
} {
  const keys: Array<keyof AggregateMetrics> = ['spend', 'impressions', 'clicks', 'conversions', 'revenue', 'roas', 'ctr', 'cpc', 'cpa']

  const delta = {} as AggregateDelta
  const deltaPercent = {} as AggregateDelta

  for (const key of keys) {
    delta[key] = computeDelta(current[key], previous[key])
    deltaPercent[key] = computeDeltaPercent(current[key], previous[key])
  }

  return {
    previousTotals: previous,
    delta,
    deltaPercent,
  }
}

function buildProviderBreakdown(args: {
  currentProviders: Record<string, unknown> | null
  previousProviders: Record<string, unknown> | null
}): Array<{
  providerId: string
  label: string
  totals: AggregateMetrics
  delta: AggregateDelta
  deltaPercent: AggregateDelta
}> {
  const currentProviders = args.currentProviders ?? {}
  const previousProviders = args.previousProviders ?? {}
  const providerIds = Array.from(new Set([...Object.keys(currentProviders), ...Object.keys(previousProviders)]))

  return providerIds
    .map((providerId) => {
      const current = computeAggregateMetrics(asRecord(currentProviders[providerId]))
      const previous = computeAggregateMetrics(asRecord(previousProviders[providerId]))
      const comparison = buildAggregateComparison(current, previous)

      return {
        providerId,
        label: formatProviderDisplayName(providerId),
        totals: current,
        delta: comparison.delta,
        deltaPercent: comparison.deltaPercent,
      }
    })
    .sort((left, right) => right.totals.spend - left.totals.spend)
}

const operationHandlers: Record<string, OperationHandler> = {
  async sendDirectMessage(ctx, input) {
    const recipientQuery = asNonEmptyString(input.params.recipientQuery)
    const content = asNonEmptyString(input.params.content)

    if (!recipientQuery) {
      return {
        success: false,
        data: { error: 'Recipient is required.' },
        userMessage: 'Who would you like me to message?',
      }
    }

    if (!content) {
      return {
        success: false,
        data: { error: 'Message content is required.' },
        userMessage: `What would you like me to send to ${recipientQuery}?`,
      }
    }

    const currentUser = await ctx.runQuery(api.users.getByLegacyId, {
      legacyId: input.userId,
    })

    const recipients = await ctx.runQuery(api.users.listDMParticipants, {
      workspaceId: input.workspaceId,
      currentUserId: input.userId,
      currentUserRole: currentUser.role ?? null,
      limit: 200,
    })

    const { match, matches } = resolveDirectMessageRecipient(recipients, recipientQuery)
    if (!match) {
      const suggestions = matches.slice(0, 5).map((recipient) => recipient.name)
      const noMatches = suggestions.length === 0

      return {
        success: false,
        retryable: false,
        data: {
          recipientQuery,
          suggestions,
        },
        userMessage: noMatches
          ? `I couldn’t find anyone matching “${recipientQuery}” to message.`
          : `I found multiple people matching “${recipientQuery}”: ${suggestions.join(', ')}. Which one should I message?`,
      }
    }

    const conversation = await ctx.runMutation(api.directMessages.getOrCreateConversation, {
      workspaceId: input.workspaceId,
      otherUserId: match.id,
      otherUserName: match.name,
      otherUserRole: match.role ?? null,
    })

    const sendResult = await ctx.runMutation(api.directMessages.sendMessage, {
      workspaceId: input.workspaceId,
      conversationLegacyId: conversation.legacyId,
      content,
    })

    return {
      success: true,
      route: '/dashboard/collaboration',
      data: {
        recipientName: match.name,
        recipientId: match.id,
        conversationLegacyId: conversation.legacyId,
        messageLegacyId: asNonEmptyString(asRecord(sendResult)?.legacyId),
        preview: truncateMessagePreview(content),
        route: '/dashboard/collaboration',
      },
      userMessage: `Sent your message to ${match.name}: “${truncateMessagePreview(content)}”`,
    }
  },

  async summarizeClientTasks(ctx, input) {
    const mode = asNonEmptyString(input.params.mode)?.toLowerCase() === 'summary' ? 'summary' : 'list'
    const lookupQuery =
      asNonEmptyString(input.params.clientReference) ??
      asNonEmptyString(input.params.clientName) ??
      asNonEmptyString(input.params.clientId) ??
      asNonEmptyString(input.context?.activeClientId ?? null)

    if (!lookupQuery) {
      return {
        success: false,
        retryable: false,
        data: { error: 'Client reference is required.' },
        userMessage: 'Which client should I use for that task request?',
      }
    }

    let matchedClient: ClientLookupRecord | null = null

    try {
      const exactClient = await ctx.runQuery(api.clients.getByLegacyIdServer, {
        workspaceId: input.workspaceId,
        legacyId: lookupQuery,
      }) as { legacyId?: unknown; name?: unknown } | null

      const exactLegacyId = asNonEmptyString(exactClient?.legacyId)
      const exactName = asNonEmptyString(exactClient?.name)
      if (exactLegacyId && exactName) {
        matchedClient = {
          legacyId: exactLegacyId,
          name: exactName,
          workspaceId: input.workspaceId,
        }
      }
    } catch {
      // Fall back to broader lookup below.
    }

    let matches: ClientLookupRecord[] = matchedClient ? [matchedClient] : []

    if (!matchedClient) {
      const rawClients = await ctx.runQuery(api.clients.list, {
        workspaceId: input.workspaceId,
        limit: 500,
        includeAllWorkspaces: true,
      })

      const clients = extractClientLookupRecords(rawClients)
      const resolved = resolveClientLookupMatch(clients, lookupQuery)
      matchedClient = resolved.match
      matches = resolved.matches
    }

    if (!matchedClient) {
      const suggestions = matches.slice(0, 5).map((client) => client.name)
      return {
        success: false,
        retryable: false,
        data: { lookupQuery, suggestions },
        userMessage: suggestions.length === 0
          ? `I couldn’t find a client matching “${lookupQuery}”.`
          : `I found multiple clients matching “${lookupQuery}”: ${suggestions.join(', ')}. Which one should I use?`,
      }
    }

    const rawTasks = await ctx.runQuery(api.tasks.listByClient, {
      workspaceId: matchedClient.workspaceId,
      clientId: matchedClient.legacyId,
      limit: 200,
    })

    const tasks = extractClientTaskRecords(rawTasks)
    const nowMs = Date.now()
    const dueSoonCutoffMs = nowMs + 3 * 24 * 60 * 60 * 1000
    const openTasks = tasks.filter((task) => !isCompletedTaskStatus(task.status))
    const completedTasks = tasks.length - openTasks.length
    const overdueTasks = openTasks.filter((task) => typeof task.dueDateMs === 'number' && task.dueDateMs < nowMs).length
    const dueSoonTasks = openTasks.filter((task) => typeof task.dueDateMs === 'number' && task.dueDateMs >= nowMs && task.dueDateMs <= dueSoonCutoffMs).length
    const highPriorityTasks = openTasks.filter((task) => {
      const normalized = task.priority.toLowerCase()
      return normalized === 'high' || normalized === 'urgent'
    }).length

    const statusBreakdown = Array.from(tasks.reduce<Map<string, number>>((acc, task) => {
      const status = task.status.trim().toLowerCase() || 'unknown'
      acc.set(status, (acc.get(status) ?? 0) + 1)
      return acc
    }, new Map()))
      .map(([status, count]) => ({ status, count }))
      .sort((left, right) => right.count - left.count)

    const listedTasks = tasks.slice(0, 10).map((task) => ({
      taskId: task.legacyId,
      title: task.title,
      status: formatTaskStatusLabel(task.status),
      priority: formatTaskPriorityLabel(task.priority),
      dueDate: formatTaskDate(task.dueDateMs),
      assignedTo: task.assignedTo ?? [],
    }))

    if (tasks.length === 0) {
      return {
        success: true,
        data: {
          clientId: matchedClient.legacyId,
          clientName: matchedClient.name,
          totalTasks: 0,
          openTasks: 0,
          completedTasks: 0,
          overdueTasks: 0,
          dueSoonTasks: 0,
          highPriorityTasks: 0,
          statusBreakdown: [],
          tasks: [],
        },
        userMessage: `I couldn’t find any tasks for ${matchedClient.name}.`,
      }
    }

    return {
      success: true,
      data: {
        clientId: matchedClient.legacyId,
        clientName: matchedClient.name,
        mode,
        totalTasks: tasks.length,
        openTasks: openTasks.length,
        completedTasks,
        overdueTasks,
        dueSoonTasks,
        highPriorityTasks,
        statusBreakdown,
        tasks: listedTasks,
      },
      userMessage: mode === 'summary'
        ? `Here’s the task summary for ${matchedClient.name}: ${openTasks.length} open, ${completedTasks} completed, ${overdueTasks} overdue.`
        : `I found ${tasks.length} task${tasks.length === 1 ? '' : 's'} for ${matchedClient.name}.`,
    }
  },

  async createTask(ctx, input) {
    const title = asNonEmptyString(input.params.title)

    if (!title) {
      return { success: false, data: { error: 'Task title is required.' }, userMessage: 'Please provide a task title.' }
    }

    const description = asNonEmptyString(input.params.description)
    const priorityRaw = asNonEmptyString(input.params.priority)?.toLowerCase()
    const priority = priorityRaw === 'low' || priorityRaw === 'high' || priorityRaw === 'medium' ? priorityRaw : 'medium'
    const status = asNonEmptyString(input.params.status) ?? 'todo'
    const dueDateMs = resolveAgentDueDateMs({
      dueDateMs: input.params.dueDateMs,
      dueDate: input.params.dueDate,
      rawMessage: input.rawMessage,
      nowMs: Date.now(),
    })
    const tags = asStringArray(input.params.tags)
    const assignedTo = asStringArray(input.params.assignedTo)
    const { clientId, clientName } = await resolveClientIdFromParams(ctx, input.workspaceId, input.params, input.context)

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
        route: '/dashboard/tasks',
      },
      route: '/dashboard/tasks',
      userMessage: taskId ? `Created task “${title}” (${taskId}).` : `Created task “${title}”.`,
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

    const dueDateMs = resolveAgentDueDateMs({
      dueDateMs: input.params.dueDateMs,
      dueDate: input.params.dueDate,
      rawMessage: input.rawMessage,
      nowMs: Date.now(),
    })
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

  async summarizeAdsPerformance(ctx, input) {
    const period = normalizeReportPeriod(input.params.period)
    const { periodLabel, startDate, endDate } = resolveReportWindow(period, input.params)
    const previousWindow = getPreviousDateWindow(startDate, endDate)

    const clientId = asNonEmptyString(input.params.clientId) ?? asNonEmptyString(input.context?.activeClientId ?? null)
    const explicitProvider = normalizeProviderId(input.params.providerId)
    const providerIds = normalizeProviderIds(input.params.providerIds)
    const focus = asNonEmptyString(input.params.focus)?.toLowerCase() ?? 'summary'
    const campaignQuery = asNonEmptyString(input.params.campaignQuery)
    const normalizedCampaignQuery = normalizeCampaignLookupText(campaignQuery)

    if (explicitProvider && !providerIds.includes(explicitProvider)) {
      providerIds.unshift(explicitProvider)
    }

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
    const metricsRows = Array.isArray(metricsPayload.metrics)
      ? metricsPayload.metrics.map((item) => asRecord(item)).filter((item): item is Record<string, unknown> => item !== null)
      : []

    const previousSummaryPayload = previousWindow
      ? asRecord(
          unwrapConvexResult(
            await ctx.runQuery(api.adsMetrics.listMetricsWithSummary, {
              workspaceId: input.workspaceId,
              clientId: clientId ?? undefined,
              providerIds: providerIds.length > 0 ? providerIds : undefined,
              startDate: previousWindow.startDate,
              endDate: previousWindow.endDate,
              aggregate: true,
              limit: 500,
            })
          )
        )
      : null
    const previousSummary = asRecord(previousSummaryPayload?.summary) ?? {}
    const previousMetricsRows = Array.isArray(previousSummaryPayload?.metrics)
      ? previousSummaryPayload.metrics.map((item) => asRecord(item)).filter((item): item is Record<string, unknown> => item !== null)
      : []

    let campaignCounts: { total: number | null; active: number | null; paused: number | null } = {
      total: null,
      active: null,
      paused: null,
    }
    const campaignProviders = providerIds.length > 0 ? providerIds : [...ALL_PROVIDER_IDS]
    const campaignResults = await Promise.allSettled(
      campaignProviders.map(async (providerId) => {
        const campaignsRaw = await ctx.runAction(api.adsCampaigns.listCampaigns, {
          workspaceId: input.workspaceId,
          providerId,
          clientId: clientId ?? undefined,
        })

        return Array.isArray(campaignsRaw)
          ? campaignsRaw.map((item) => asRecord(item)).filter((item): item is Record<string, unknown> => item !== null)
          : []
      })
    )

    const allCampaigns = campaignResults.flatMap((result, index) => {
      if (result.status !== 'fulfilled') return []

      return result.value.map((campaign) => ({
        providerId: campaignProviders[index],
        id: asNonEmptyString(campaign.id),
        name: asNonEmptyString(campaign.name) ?? 'Unnamed campaign',
        status: asNonEmptyString(campaign.status),
        route: buildCampaignRoute({
          providerId: campaignProviders[index],
          campaignId: asNonEmptyString(campaign.id),
          campaignName: asNonEmptyString(campaign.name),
          startDate,
          endDate,
          clientId,
        }),
      }))
    })

    if (allCampaigns.length > 0) {
      const active = allCampaigns.filter((campaign) => isActiveCampaignStatus(campaign.status))
      const paused = allCampaigns.filter((campaign) => isPausedCampaignStatus(campaign.status))

      campaignCounts = {
        total: allCampaigns.length,
        active: active.length,
        paused: paused.length,
      }
    }

    const matchingCampaigns = normalizedCampaignQuery
      ? allCampaigns.filter((campaign) => matchesCampaignQuery(campaign.name, normalizedCampaignQuery))
      : []
    const matchingCampaignIds = new Set(matchingCampaigns.map((campaign) => campaign.id).filter((id): id is string => Boolean(id)))

    const filteredMetricsRows = normalizedCampaignQuery
      ? metricsRows.filter((row) => {
          const campaignId = asNonEmptyString(row.campaignId)
          if (campaignId && matchingCampaignIds.has(campaignId)) return true
          return matchesCampaignQuery(asNonEmptyString(row.campaignName), normalizedCampaignQuery)
        })
      : metricsRows
    const filteredPreviousMetricsRows = normalizedCampaignQuery
      ? previousMetricsRows.filter((row) => {
          const campaignId = asNonEmptyString(row.campaignId)
          if (campaignId && matchingCampaignIds.has(campaignId)) return true
          return matchesCampaignQuery(asNonEmptyString(row.campaignName), normalizedCampaignQuery)
        })
      : previousMetricsRows

    const currentTotals = normalizedCampaignQuery
      ? computeAggregateMetricsFromRows(filteredMetricsRows)
      : computeAggregateMetrics(asRecord(metricsSummary.totals))
    const previousTotals = normalizedCampaignQuery
      ? computeAggregateMetricsFromRows(filteredPreviousMetricsRows)
      : computeAggregateMetrics(asRecord(previousSummary.totals))
    const totalsComparison = buildAggregateComparison(currentTotals, previousTotals)
    const providerBreakdown = normalizedCampaignQuery
      ? buildProviderBreakdownFromRows(filteredMetricsRows, filteredPreviousMetricsRows)
      : buildProviderBreakdown({
          currentProviders: asRecord(metricsSummary.providers),
          previousProviders: asRecord(previousSummary.providers),
        })

    const { spend, impressions, clicks, conversions, revenue, roas, ctr, cpc, cpa } = currentTotals

    const campaignMap = new Map<string, {
      id: string | null
      name: string
      providerId: string | null
      spend: number
      clicks: number
      conversions: number
      revenue: number
      impressions: number
    }>()

    for (const row of filteredMetricsRows) {
      const campaignId = asNonEmptyString(row.campaignId) ?? null
      const campaignName = asNonEmptyString(row.campaignName) ?? campaignId ?? 'Unlabeled campaign'
      const campaignKey = campaignId ?? campaignName
      const existing = campaignMap.get(campaignKey) ?? {
        id: campaignId,
        name: campaignName,
        providerId: asNonEmptyString(row.providerId),
        spend: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0,
        impressions: 0,
      }

      existing.spend += asNumber(row.spend) ?? 0
      existing.clicks += asNumber(row.clicks) ?? 0
      existing.conversions += asNumber(row.conversions) ?? 0
      existing.revenue += asNumber(row.revenue) ?? 0
      existing.impressions += asNumber(row.impressions) ?? 0

      campaignMap.set(campaignKey, existing)
    }

    const topCampaigns = Array.from(campaignMap.values())
      .map((campaign) => ({
        ...campaign,
        roas: campaign.spend > 0 ? campaign.revenue / campaign.spend : 0,
        ctr: campaign.impressions > 0 ? (campaign.clicks / campaign.impressions) * 100 : 0,
      }))
      .sort((left, right) => {
        if (right.spend !== left.spend) return right.spend - left.spend
        if (right.clicks !== left.clicks) return right.clicks - left.clicks
        return right.conversions - left.conversions
      })
      .slice(0, 3)

    const activeCampaignPool = allCampaigns.filter((campaign) => isActiveCampaignStatus(campaign.status))
    const matchingActiveCampaigns = normalizedCampaignQuery
      ? activeCampaignPool.filter((campaign) => matchesCampaignQuery(campaign.name, normalizedCampaignQuery))
      : []
    const activeCampaigns = normalizedCampaignQuery
      ? (matchingActiveCampaigns.length > 0 ? matchingActiveCampaigns : activeCampaignPool).slice(0, 6)
      : activeCampaignPool.slice(0, 6)

    const providerLabel = getProviderSummaryLabel(providerIds)
    const matchingSummary = normalizedCampaignQuery
      ? matchingActiveCampaigns.length > 0
        ? `I found ${matchingActiveCampaigns.length} active ${matchingActiveCampaigns.length === 1 ? 'campaign' : 'campaigns'} matching “${campaignQuery}”.`
        : matchingCampaigns.length > 0
          ? `I found ${matchingCampaigns.length} ${matchingCampaigns.length === 1 ? 'campaign' : 'campaigns'} matching “${campaignQuery}”, but none are currently active.`
          : `I couldn’t find a campaign matching “${campaignQuery}”, so here are the current active ${providerLabel} campaigns instead.`
      : null

    if (spend <= 0 && impressions <= 0 && clicks <= 0 && conversions <= 0 && revenue <= 0) {
      const activeCampaignLines = activeCampaigns.length > 0
        ? activeCampaigns.map((campaign, index) => `${index + 1}. ${campaign.name} (${campaign.providerId})`)
        : ['No active campaigns were returned from the connected providers.']

      return {
        success: true,
        data: {
          period,
          periodLabel,
          providerIds,
          providerLabel,
          startDate,
          endDate,
          previousWindow,
          comparison: {
            ...totalsComparison,
            previousWindow,
          },
          providerBreakdown,
          metricsAvailable: false,
          campaignCounts,
          campaignQuery,
          matchedCampaignCount: normalizedCampaignQuery ? matchingCampaigns.length : null,
          activeCampaigns,
        },
        userMessage: [
          normalizedCampaignQuery ? `${providerLabel} Campaign Check` : focus === 'active' ? `${providerLabel} Active Ads` : `${providerLabel} Snapshot`,
          `${periodLabel} window: ${startDate} to ${endDate}`,
          ...(matchingSummary ? [matchingSummary] : []),
          normalizedCampaignQuery
            ? 'I don’t have synced metrics for that campaign and date window yet.'
            : 'No synced metrics are available for this window yet.',
          ...(focus === 'active' || normalizedCampaignQuery ? [normalizedCampaignQuery ? 'Best matching campaigns:' : 'Active campaigns:', ...activeCampaignLines] : []),
          normalizedCampaignQuery
            ? 'You can open a matching campaign below, widen the date range, or check that recent syncs have completed.'
            : 'Check that the integration is connected and that recent syncs have completed.',
        ].join('\n'),
      }
    }

    const currentSituation = [
      spend > 0
        ? roas >= 3
          ? 'ROAS is strong right now.'
          : roas >= 1.5
            ? 'ROAS is stable but still has room to improve.'
            : 'ROAS is soft and needs attention.'
        : 'Spend has not started flowing yet.',
      ctr >= 1.5
        ? 'CTR is healthy.'
        : impressions > 0
          ? 'CTR is light, so creative or audience tuning may help.'
          : 'Delivery is still light.',
      conversions > 0
        ? `${formatWholeNumber(conversions)} conversions are tracked in this window.`
        : clicks > 0
          ? 'Traffic is coming in, but conversions are still thin.'
          : 'Clicks are still light in this window.',
    ].join(' ')

    const topCampaignLines = topCampaigns.length > 0
      ? topCampaigns.map((campaign, index) => (
        `${index + 1}. ${campaign.name}: ${formatCurrency(campaign.spend)} spend, ${formatWholeNumber(campaign.clicks)} clicks, ${formatWholeNumber(campaign.conversions)} conversions, ${formatRatio(campaign.roas)} ROAS`
      ))
      : ['Top campaigns: unavailable from current synced metrics.']

    const campaignStateLine = campaignCounts.total !== null
      ? `Campaigns: ${campaignCounts.total} total, ${campaignCounts.active ?? 0} active, ${campaignCounts.paused ?? 0} paused`
      : null
    const activeCampaignLines = activeCampaigns.length > 0
      ? activeCampaigns.map((campaign, index) => `${index + 1}. ${campaign.name} (${campaign.providerId})`)
      : ['No active campaigns were returned from the connected providers.']

    const leaderLine = topCampaigns[0]
      ? `Leading campaign: ${topCampaigns[0].name}`
      : null

    return {
      success: true,
      data: {
        period,
        periodLabel,
        providerIds,
        providerLabel,
        startDate,
        endDate,
        previousWindow,
        totals: {
          spend,
          impressions,
          clicks,
          conversions,
          revenue,
          roas,
          ctr,
          cpc,
          cpa,
        },
        comparison: {
          ...totalsComparison,
          previousWindow,
        },
        providerBreakdown,
        campaignCounts,
        campaignQuery,
        matchedCampaignCount: normalizedCampaignQuery ? matchingCampaigns.length : null,
        activeCampaigns,
        topCampaigns: topCampaigns.map((campaign) => ({
          id: campaign.id,
          name: campaign.name,
          providerId: campaign.providerId,
          spend: campaign.spend,
          clicks: campaign.clicks,
          conversions: campaign.conversions,
          revenue: campaign.revenue,
          impressions: campaign.impressions,
          roas: campaign.roas,
          ctr: campaign.ctr,
          route: buildCampaignRoute({
            providerId: campaign.providerId,
            campaignId: campaign.id,
            campaignName: campaign.name,
            startDate,
            endDate,
            clientId,
          }),
        })),
        currentSituation,
      },
      userMessage: [
        focus === 'active' ? `${providerLabel} Active Ads` : `${providerLabel} Snapshot`,
        `${periodLabel} window: ${startDate} to ${endDate}`,
        `Spend: ${formatCurrency(spend)}`,
        `Revenue: ${formatCurrency(revenue)}`,
        `ROAS: ${formatRatio(roas)}`,
        `Impressions: ${formatWholeNumber(impressions)}`,
        `Clicks: ${formatWholeNumber(clicks)}`,
        `CTR: ${formatPercent(ctr)}`,
        `CPC: ${formatCurrency(cpc)}`,
        `CPA: ${conversions > 0 ? formatCurrency(cpa) : 'N/A'}`,
        `Conversions: ${formatWholeNumber(conversions)}`,
        campaignStateLine,
        leaderLine,
        ...(focus === 'active' ? ['Active campaigns:', ...activeCampaignLines] : []),
        'Top campaigns:',
        ...topCampaignLines,
        `Current situation: ${currentSituation}`,
      ].filter((line): line is string => Boolean(line)).join('\n'),
    }
  },

  async generatePerformanceReport(ctx, input) {
    const period = normalizeReportPeriod(input.params.period)
    const { periodLabel, startDate, endDate, startDateMs, endDateMs } = resolveReportWindow(period, input.params)
    const previousWindow = getPreviousDateWindow(startDate, endDate)

    const clientId = asNonEmptyString(input.params.clientId) ?? asNonEmptyString(input.context?.activeClientId ?? null)
    const explicitProvider = normalizeProviderId(input.params.providerId)
    const providerIds = normalizeProviderIds(input.params.providerIds)

    if (explicitProvider && !providerIds.includes(explicitProvider)) {
      providerIds.unshift(explicitProvider)
    }

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
    const metricsRecordCount = Math.max(0, Math.trunc(asNumber(metricsSummary.count) ?? 0))
    const metricsAvailable = metricsRecordCount > 0
    const previousSummaryPayload = previousWindow
      ? asRecord(
          unwrapConvexResult(
            await ctx.runQuery(api.adsMetrics.listMetricsWithSummary, {
              workspaceId: input.workspaceId,
              clientId: clientId ?? undefined,
              providerIds: providerIds.length > 0 ? providerIds : undefined,
              startDate: previousWindow.startDate,
              endDate: previousWindow.endDate,
              aggregate: true,
              limit: 500,
            })
          )
        )
      : null
    const previousSummary = asRecord(previousSummaryPayload?.summary) ?? {}
    const currentTotals = computeAggregateMetrics(asRecord(metricsSummary.totals))
    const previousTotals = computeAggregateMetrics(asRecord(previousSummary.totals))
    const totalsComparison = buildAggregateComparison(currentTotals, previousTotals)
    const providerBreakdown = buildProviderBreakdown({
      currentProviders: asRecord(metricsSummary.providers),
      previousProviders: asRecord(previousSummary.providers),
    })
    const { spend, impressions, clicks, conversions, revenue, roas, ctr } = currentTotals

    const proposalRaw = await ctx.runQuery(api.proposalAnalytics.summarize, {
      workspaceId: input.workspaceId,
      startDateMs,
      endDateMs,
      clientId: clientId ?? null,
      limit: 500,
    })
    const proposalPayload = asRecord(unwrapConvexResult(proposalRaw)) ?? asRecord(proposalRaw) ?? {}
    const proposalSummary = asRecord(proposalPayload.summary) ?? {}
    const proposalCount = Math.max(0, Math.trunc(asNumber(proposalSummary.totalSubmitted) ?? 0))

    const reportText = [
      `${periodLabel} Performance Report (${startDate} to ${endDate})`,
      metricsAvailable ? `Ad Spend: ${formatCurrency(spend)}` : 'Ad Spend: No synced metrics in this window',
      metricsAvailable ? `Revenue: ${formatCurrency(revenue)}` : 'Revenue: No synced metrics in this window',
      metricsAvailable ? `ROAS: ${formatRatio(roas)}` : 'ROAS: No synced metrics in this window',
      metricsAvailable ? `Impressions: ${formatWholeNumber(impressions)}` : 'Impressions: No synced metrics in this window',
      metricsAvailable ? `Clicks: ${formatWholeNumber(clicks)}` : 'Clicks: No synced metrics in this window',
      metricsAvailable ? `CTR: ${formatPercent(ctr)}` : 'CTR: No synced metrics in this window',
      metricsAvailable ? `Conversions: ${formatWholeNumber(conversions)}` : 'Conversions: No synced metrics in this window',
      `Proposals Submitted: ${proposalCount}`,
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
        body: metricsAvailable
          ? `Spend ${formatCurrency(spend)} · Revenue ${formatCurrency(revenue)} · ROAS ${formatRatio(roas)}`
          : `No synced ads metrics yet · ${proposalCount} proposal${proposalCount === 1 ? '' : 's'} submitted`,
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
          metricsAvailable,
          metricsRecordCount,
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
        metricsAvailable,
        metricsRecordCount,
        previousWindow,
        comparison: {
          ...totalsComparison,
          previousWindow,
        },
        providerBreakdown,
        proposalSummary,
        delivery: {
          inApp: inAppDelivered,
          email: false,
        },
      },
      userMessage: metricsAvailable
        ? `Generated your ${periodLabel.toLowerCase()} performance report${inAppDelivered ? ' and shared it in-app.' : '.'}`
        : `Generated your ${periodLabel.toLowerCase()} report${inAppDelivered ? ' and shared it in-app.' : '.'} No synced ads metrics were available for that window yet.`,
    }
  },
}

export async function safeExecuteOperation(
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

