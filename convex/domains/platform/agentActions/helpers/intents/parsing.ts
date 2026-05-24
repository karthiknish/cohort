import type {
  AgentRequestContextType,
  DeterministicAgentIntent,
  ProviderId,
  ReportPeriod,
} from '../../types'

import { parseTaskTimeWindowFromIntent } from '../../operations/taskSummary'
import { parseDateRangeFromIntent, resolveIntentDateRange } from '../dates'
import { asNonEmptyString } from '../values'

export function normalizeIntentText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function includesAnyPhrase(input: string, phrases: string[]): boolean {
  return phrases.some((phrase) => input.includes(phrase))
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function extractTrailingText(message: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = pattern.exec(message)
    if (!match) continue
    const extracted = asNonEmptyString(match[1])
    if (!extracted) continue
    return extracted.replace(/^[\s:,-]+/, '').replace(/[\s.]+$/, '')
  }

  return null
}

export function extractEntityIdFromIntent(message: string, entity: 'task' | 'project' | 'client' | 'campaign' | 'creative' | 'proposal'): string | null {
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

export function inferPriorityFromIntent(normalized: string): 'low' | 'medium' | 'high' | null {
  if (includesAnyPhrase(normalized, ['high priority', 'urgent', 'asap'])) return 'high'
  if (includesAnyPhrase(normalized, ['low priority', 'later'])) return 'low'
  if (includesAnyPhrase(normalized, ['medium priority', 'normal priority'])) return 'medium'
  return null
}

export function inferProviderFromIntent(message: string): ProviderId | null {
  const normalized = normalizeIntentText(message)
  if (includesAnyPhrase(normalized, ['google ads', 'google campaign', 'google'])) return 'google'
  if (includesAnyPhrase(normalized, ['meta ads', 'facebook ads', 'facebook', 'meta'])) return 'facebook'
  if (includesAnyPhrase(normalized, ['tiktok ads', 'tiktok'])) return 'tiktok'
  if (includesAnyPhrase(normalized, ['linkedin ads', 'linkedin'])) return 'linkedin'
  return null
}

export function inferProviderFiltersFromIntent(message: string): ProviderId[] {
  const normalized = normalizeIntentText(message)
  const providers: ProviderId[] = []

  if (includesAnyPhrase(normalized, ['google ads', 'google campaign', 'google'])) providers.push('google')
  if (includesAnyPhrase(normalized, ['meta ads', 'facebook ads', 'facebook', 'meta'])) providers.push('facebook')
  if (includesAnyPhrase(normalized, ['tiktok ads', 'tiktok'])) providers.push('tiktok')
  if (includesAnyPhrase(normalized, ['linkedin ads', 'linkedin'])) providers.push('linkedin')

  return Array.from(new Set(providers))
}

export function inferReportPeriodFromIntent(normalized: string): ReportPeriod {
  return includesAnyPhrase(normalized, ['today', 'yesterday', 'daily', 'last 24'])
    ? 'daily'
    : includesAnyPhrase(normalized, ['month', 'monthly', '30 day', 'quarter', 'q1', 'q2', 'q3', 'q4'])
      ? 'monthly'
      : 'weekly'
}

export function cleanCampaignQuery(value: string | null): string | null {
  const cleaned = value
    ?.replace(/\b(?:the|active|live|running|current|currently)\b/gi, ' ')
    .replace(/\b(?:ad|ads|campaign|campaigns)\b/gi, ' ')
    .replace(/\b(?:in|on|for|from|at)\s*$/i, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return cleaned && cleaned.length >= 2 ? cleaned : null
}

export function extractCampaignQueryFromIntent(message: string): string | null {
  const extracted = extractTrailingText(message, [
    /(?:metrics|performance|snapshot|numbers|stats)\s+(?:for|on|about)\s+(.+?)\s+(?:ad\s+)?campaign\b/i,
    /(?:for|on|about)\s+(.+?)\s+(?:ad\s+)?campaign\b/i,
    /(?:campaign)\s+(?:called|named)\s+(.+)$/i,
  ])

  return cleanCampaignQuery(extracted)
}

export function cleanDirectMessageTarget(value: string | null): string | null {
  const cleaned = value
    ?.replace(/^@+/, '')
    .replace(/[,:;.!?]+$/, '')
    .trim()

  return cleaned && cleaned.length >= 2 ? cleaned : null
}

export function extractDirectMessageTargetFromIntent(message: string): string | null {
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

export function cleanClientReference(value: string | null): string | null {
  const cleaned = value
    ?.replace(/^@+/, '')
    .replace(/[,:;.!?]+$/, '')
    .trim()

  return cleaned && cleaned.length >= 2 ? cleaned : null
}

export function extractClientReferenceFromIntent(message: string): string | null {
  const extracted = extractTrailingText(message, [
    /@([A-Za-z0-9._-]+)\s+client\b/i,
    /client\s+@([A-Za-z0-9._-]+)\b/i,
    /tasks?\s+(?:for|in)\s+@?([A-Za-z0-9._-]+)\s+client\b/i,
    /tasks?\s+(?:for|in)\s+client\s+([A-Za-z0-9._-]+(?:\s+[A-Za-z0-9._-]+){0,2})/i,
    /client\s+([A-Za-z0-9._-]+(?:\s+[A-Za-z0-9._-]+){0,2})\s+(?:task\s+summary|summary\s+for\s+tasks|tasks?)\b/i,
  ])

  return cleanClientReference(extracted)
}

export function cleanDirectMessageContent(value: string | null): string | null {
  const cleaned = value
    ?.replace(/^["'“”]+/, '')
    .replace(/["'“”]+$/, '')
    .trim()

  return cleaned && cleaned.length > 0 ? cleaned : null
}

export function hasAttachmentContext(context?: AgentRequestContextType): boolean {
  return Boolean(context?.attachmentContext?.some((attachment) => attachment.extractionStatus === 'ready' && asNonEmptyString(attachment.extractedText)))
}

export function toTitleCase(value: string): string {
  return value
    .split(/\s+/)
    .flatMap((word) => (word ? [word.charAt(0).toUpperCase() + word.slice(1)] : []))
    .join(' ')
}

export function deriveEntityDraftLabelFromAttachment(context?: AgentRequestContextType): string | null {
  const attachment = context?.attachmentContext?.find((candidate) => candidate.extractionStatus === 'ready')
  if (!attachment) return null

  const fileStem = attachment.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim()
  if (fileStem.length >= 3) {
    return toTitleCase(fileStem)
  }

  const excerpt = asNonEmptyString(attachment.excerpt) ?? asNonEmptyString(attachment.extractedText) ?? null
  if (!excerpt) return null

  const sentence = excerpt
    .split(/[.!?\n]/)
    .map((part) => part.trim())
    .find((part) => part.length >= 3)

  if (!sentence) return null
  return sentence.slice(0, 80).trim()
}

export function sanitizeEntityDraftLabel(value: string | null): string | null {
  const cleaned = value
    ?.replace(/^[\s"'`]+|[\s"'`]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (!cleaned) return null

  const normalized = normalizeIntentText(cleaned)
  const invalidPhrases = [
    'from this doc',
    'from this document',
    'from this file',
    'from this attachment',
    'from this brief',
    'from that doc',
    'from attached doc',
    'from attached document',
    'from the attached doc',
    'from the attached document',
    'from the attached brief',
    'from attached file',
    'from the attached file',
    'using this doc',
    'using this document',
    'using the attached doc',
    'using the attached document',
    'using the attached file',
  ]

  if (invalidPhrases.includes(normalized)) return null
  if (/^(?:this|that|attached|attachment|document|doc|file|brief)$/i.test(cleaned)) return null

  return cleaned
}

export function extractDirectMessageContentFromIntent(message: string): string | null {
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

export function inferCampaignStatusAction(normalized: string): 'enable' | 'pause' | null {
  if (includesAnyPhrase(normalized, ['pause', 'paused', 'disable', 'disabled', 'stop', 'stopped', 'turn off'])) {
    return 'pause'
  }

  if (includesAnyPhrase(normalized, ['enable', 'enabled', 'resume', 'resumed', 'activate', 'activated', 'active', 'live', 'turn on'])) {
    return 'enable'
  }

  return null
}

export function buildCollaborationRoute(args: {
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

export function buildAvailableContextLabel(context?: AgentRequestContextType): string {
  const labels: string[] = []
  if (context?.activeClientId) labels.push('current client')
  if (context?.activeProjectId) labels.push('current project')
  if (context?.activeProposalId) labels.push('current proposal')

  if (labels.length === 0) return 'client, project, or proposal'
  if (labels.length === 1) return labels[0] ?? 'current context'
  if (labels.length === 2) return `${labels[0]} or ${labels[1]}`
  return `${labels.slice(0, -1).join(', ')}, or ${labels[labels.length - 1]}`
}

export function buildClarificationMessage(
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

  return `Happy to help — what would you like me to do, and what ${buildAvailableContextLabel(context)} should I use?`
}

export function resolveWeakCommandClarification(
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
    'this quarter', 'last quarter', 'this year', 'last year', 'q1', 'q2', 'q3', 'q4',
  ]) || resolveIntentDateRange(message) !== null

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

export function getProviderDisplayName(providerId: ProviderId): string {
  switch (providerId) {
    case 'facebook': return 'Meta'
    case 'google': return 'Google'
    case 'tiktok': return 'TikTok'
    case 'linkedin': return 'LinkedIn'
  }
}

export function wantsOrganicSocialIntent(normalized: string): boolean {
  if (
    includesAnyPhrase(normalized, [
      'paid social',
      'social ads',
      'instagram ads',
      'facebook ads',
      'ad spend',
      'roas',
      'campaign spend',
    ])
  ) {
    return false
  }

  if (
    includesAnyPhrase(normalized, [
      'organic social',
      'socials',
      'social media',
      'instagram insights',
      'facebook insights',
      'facebook page',
      'instagram performance',
      'meta social',
      'social performance',
      'social metrics',
      'social summary',
      'instagram reach',
      'facebook reach',
      'social engagement',
      'follower growth',
    ])
  ) {
    return true
  }

  const mentionsSocialSurface =
    normalized.includes('instagram') ||
    normalized.includes('facebook page') ||
    /\bfb page\b/.test(normalized)
  const asksSocialPerformance = includesAnyPhrase(normalized, [
    'performing',
    'performance',
    'insights',
    'metrics',
    'reach',
    'engagement',
    'followers',
    'how is',
    'how are',
    'how s',
    'summary',
    'snapshot',
  ])

  return mentionsSocialSurface && asksSocialPerformance
}

export function resolveSpreadsheetSourceFromMessage(
  normalized: string,
  context?: { activeClientId?: string | null },
  clientReference?: string | null,
): string | null {
  if (
    normalized.includes('report') &&
    (normalized.includes('performance report') ||
      normalized.includes('weekly report') ||
      normalized.includes('monthly report') ||
      normalized.includes('daily report') ||
      normalized.includes('excel') ||
      normalized.includes('xlsx') ||
      normalized.includes('spreadsheet'))
  ) {
    return 'report'
  }
  if (normalized.includes('meeting')) return 'meetings'
  if (normalized.includes('proposal')) return 'proposals'
  if (normalized.includes('project')) return 'projects'
  if (normalized.includes('client') && !normalized.includes('task')) return 'clients'
  if (normalized.includes('task')) {
    if (clientReference || context?.activeClientId || normalized.includes('client')) {
      return 'clientTasks'
    }
    return 'tasks'
  }
  if (
    normalized.includes('instagram') ||
    normalized.includes('facebook page') ||
    normalized.includes('organic social') ||
    (normalized.includes('social') && !normalized.includes('ad spend'))
  ) {
    return 'social'
  }
  if (
    normalized.includes('analytics') ||
    normalized.includes('ga4') ||
    normalized.includes('website traffic') ||
    normalized.includes('site traffic') ||
    normalized.includes('sessions') ||
    normalized.includes('pageviews')
  ) {
    return 'analytics'
  }
  if (
    normalized.includes('ads') ||
    normalized.includes('campaign') ||
    normalized.includes('roas') ||
    normalized.includes('ad spend')
  ) {
    return 'ads'
  }
  return null
}

export function wantsSpreadsheetExportIntent(normalized: string): boolean {
  if (
    includesAnyPhrase(normalized, [
      'export conversation',
      'export chat',
      'export this chat',
      'export markdown',
      'share chat',
    ])
  ) {
    return false
  }

  return (
    includesAnyPhrase(normalized, [
      'export to excel',
      'export as excel',
      'excel export',
      'download excel',
      'download as excel',
      'save as excel',
      'excel file',
      'xlsx file',
      'xlsx',
      'spreadsheet',
      'export spreadsheet',
      'download spreadsheet',
      'workbook',
    ]) ||
    (includesAnyPhrase(normalized, ['export', 'download']) &&
      includesAnyPhrase(normalized, ['excel', 'xlsx', 'spreadsheet']))
  )
}

export function getProviderSummaryLabel(providerIds: ProviderId[]): string {
  const [firstProvider, secondProvider] = providerIds
  if (providerIds.length === 1 && firstProvider) return `${getProviderDisplayName(firstProvider)} Ads`
  if (providerIds.length === 2 && firstProvider && secondProvider) return `${getProviderDisplayName(firstProvider)} + ${getProviderDisplayName(secondProvider)} Ads`
  return 'Ads'
}
