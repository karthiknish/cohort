import type { ClientRecord } from '@/types/clients'
import type { MetricRecord } from '@/types/dashboard'
import type { ProposalDraft, ProposalStatus } from '@/types/proposals'

import type { TaskSummary } from '../components'
import type { IntegrationStatusSummary } from '../hooks'

export type ClientSummaryProviderSnapshot = {
  providerId: string
  spend: number
  revenue: number
  conversions: number
  roas: number | null
}

export type ProposalSummarySnapshot = Record<ProposalStatus, number> & {
  total: number
}

export type ClientSummarySnapshot = {
  clientId: string
  clientName: string
  accountManager: string | null
  teamHighlights: string[]
  lastRefreshedIso: string | null
  totalSpend: number
  totalRevenue: number
  totalClicks: number
  totalConversions: number
  roas: number | null
  activeChannels: number
  topProvider: string | null
  providerSnapshots: ClientSummaryProviderSnapshot[]
  taskSummary: TaskSummary
  proposalSummary: ProposalSummarySnapshot
  integrationSummary: Pick<IntegrationStatusSummary, 'totalIntegrations' | 'failedCount' | 'pendingCount' | 'neverCount'>
}

export type ClientSummaryResult = {
  headline: string
  bullets: string[]
  model: string | null
  usedFallback: boolean
  generatedAt: string
}

const CLIENT_SUMMARY_HASH_VERSION = 'v1'

function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatRoasValue(value: number | null): string {
  if (value === null) {
    return 'n/a'
  }

  if (!Number.isFinite(value)) {
    return 'very high'
  }

  return `${value.toFixed(2)}x`
}

function formatProviderLabel(providerId: string): string {
  return providerId
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function summarizeProposals(proposals: ProposalDraft[]): ProposalSummarySnapshot {
  const summary: ProposalSummarySnapshot = {
    total: proposals.length,
    draft: 0,
    in_progress: 0,
    ready: 0,
    partial_success: 0,
    sent: 0,
    failed: 0,
  }

  for (const proposal of proposals) {
    if (proposal.status in summary) {
      summary[proposal.status] += 1
    }
  }

  return summary
}

export function buildClientSummarySnapshot(options: {
  selectedClient: ClientRecord
  metrics: MetricRecord[]
  taskSummary: TaskSummary
  proposals: ProposalDraft[]
  integrationSummary: Pick<IntegrationStatusSummary, 'totalIntegrations' | 'failedCount' | 'pendingCount' | 'neverCount'>
  lastRefreshed: Date
}): ClientSummarySnapshot {
  const { selectedClient, metrics, taskSummary, proposals, integrationSummary, lastRefreshed } = options

  const providerMap = new Map<string, ClientSummaryProviderSnapshot>()

  let totalSpend = 0
  let totalRevenue = 0
  let totalClicks = 0
  let totalConversions = 0

  for (const metric of metrics) {
    totalSpend += metric.spend
    totalRevenue += metric.revenue ?? 0
    totalClicks += metric.clicks
    totalConversions += metric.conversions

    const current = providerMap.get(metric.providerId) ?? {
      providerId: metric.providerId,
      spend: 0,
      revenue: 0,
      conversions: 0,
      roas: null,
    }

    current.spend += metric.spend
    current.revenue += metric.revenue ?? 0
    current.conversions += metric.conversions
    current.roas = current.spend > 0 ? current.revenue / current.spend : null

    providerMap.set(metric.providerId, current)
  }

  const providerSnapshots = Array.from(providerMap.values())
    .sort((left, right) => right.spend - left.spend)
    .slice(0, 4)

  const topProvider = providerSnapshots[0] ? formatProviderLabel(providerSnapshots[0].providerId) : null
  const teamHighlights = selectedClient.teamMembers
    .slice(0, 4)
    .map((member) => `${member.name}${member.role ? ` (${member.role})` : ''}`)

  return {
    clientId: selectedClient.id,
    clientName: selectedClient.name,
    accountManager: selectedClient.accountManager || null,
    teamHighlights,
    lastRefreshedIso: lastRefreshed.toISOString(),
    totalSpend,
    totalRevenue,
    totalClicks,
    totalConversions,
    roas: totalSpend > 0 ? totalRevenue / totalSpend : null,
    activeChannels: providerMap.size,
    topProvider,
    providerSnapshots,
    taskSummary,
    proposalSummary: summarizeProposals(proposals),
    integrationSummary,
  }
}

export function buildClientSummarySnapshotHash(snapshot: ClientSummarySnapshot): string {
  const stablePayload = JSON.stringify({
    version: CLIENT_SUMMARY_HASH_VERSION,
    clientId: snapshot.clientId,
    clientName: snapshot.clientName,
    accountManager: snapshot.accountManager,
    teamHighlights: snapshot.teamHighlights,
    totalSpend: snapshot.totalSpend,
    totalRevenue: snapshot.totalRevenue,
    totalClicks: snapshot.totalClicks,
    totalConversions: snapshot.totalConversions,
    roas: snapshot.roas,
    activeChannels: snapshot.activeChannels,
    topProvider: snapshot.topProvider,
    providerSnapshots: snapshot.providerSnapshots,
    taskSummary: snapshot.taskSummary,
    proposalSummary: snapshot.proposalSummary,
    integrationSummary: snapshot.integrationSummary,
  })

  let hash = 2166136261
  for (let index = 0; index < stablePayload.length; index += 1) {
    hash ^= stablePayload.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return `client-summary-${(hash >>> 0).toString(36)}`
}

export function buildClientSummaryPrompt(snapshot: ClientSummarySnapshot): string {
  const channelLines = snapshot.providerSnapshots.length > 0
    ? snapshot.providerSnapshots
        .map((provider) => `- ${formatProviderLabel(provider.providerId)}: spend ${formatMoney(provider.spend)}, revenue ${formatMoney(provider.revenue)}, conversions ${provider.conversions}, ROAS ${formatRoasValue(provider.roas)}`)
        .join('\n')
    : '- No paid-media channel data is available yet.'

  return [
    'You are a senior client strategist writing an executive dashboard snapshot for an agency team.',
    'Return exactly 1 headline line and exactly 3 bullet lines.',
    'Format:',
    'Headline: <8 to 12 words>',
    '- <performance bullet>',
    '- <delivery or risk bullet>',
    '- <recommended next step bullet>',
    'Rules:',
    '- Keep each bullet under 24 words.',
    '- Be specific, direct, and factual.',
    '- Do not mention AI, the model, or that this was generated.',
    '- If data is thin, say that clearly instead of inventing context.',
    '',
    `Client: ${snapshot.clientName}`,
    snapshot.accountManager ? `Account manager: ${snapshot.accountManager}` : null,
    snapshot.teamHighlights.length > 0 ? `Team: ${snapshot.teamHighlights.join(', ')}` : 'Team: Not specified',
    snapshot.lastRefreshedIso ? `Snapshot timestamp: ${snapshot.lastRefreshedIso}` : null,
    `Paid media totals: spend ${formatMoney(snapshot.totalSpend)}, revenue ${formatMoney(snapshot.totalRevenue)}, clicks ${snapshot.totalClicks}, conversions ${snapshot.totalConversions}, ROAS ${formatRoasValue(snapshot.roas)}, active channels ${snapshot.activeChannels}, top channel ${snapshot.topProvider ?? 'none'}.`,
    `Task load: ${snapshot.taskSummary.total} open, ${snapshot.taskSummary.overdue} overdue, ${snapshot.taskSummary.dueSoon} due soon, ${snapshot.taskSummary.highPriority} high priority.`,
    `Proposals: total ${snapshot.proposalSummary.total}, ready ${snapshot.proposalSummary.ready}, sent ${snapshot.proposalSummary.sent}, in progress ${snapshot.proposalSummary.in_progress}, draft ${snapshot.proposalSummary.draft}, failed ${snapshot.proposalSummary.failed}.`,
    `Integrations: total ${snapshot.integrationSummary.totalIntegrations}, failed ${snapshot.integrationSummary.failedCount}, pending ${snapshot.integrationSummary.pendingCount}, never synced ${snapshot.integrationSummary.neverCount}.`,
    'Channel detail:',
    channelLines,
  ].filter((line): line is string => Boolean(line)).join('\n')
}

export function parseClientSummaryResponse(options: {
  raw: string
  generatedAt: string
  model: string
}): ClientSummaryResult | null {
  const { raw, generatedAt, model } = options

  const lines = raw
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length === 0) {
    return null
  }

  const headlineLine = lines.find((line) => /^headline:/i.test(line)) ?? lines.find((line) => !line.startsWith('-'))
  const headline = headlineLine?.replace(/^headline:\s*/i, '').trim() ?? ''

  const bullets = lines
    .filter((line) => line.startsWith('-'))
    .map((line) => line.replace(/^-+\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 3)

  if (!headline || bullets.length < 2) {
    return null
  }

  return {
    headline,
    bullets,
    model,
    usedFallback: false,
    generatedAt,
  }
}

export function buildFallbackClientSummary(snapshot: ClientSummarySnapshot, generatedAt: string): ClientSummaryResult {
  const performanceBullet = snapshot.totalSpend > 0 || snapshot.totalRevenue > 0
    ? `${snapshot.clientName} is at ${formatMoney(snapshot.totalRevenue)} revenue on ${formatMoney(snapshot.totalSpend)} spend with ${formatRoasValue(snapshot.roas)} ROAS across ${snapshot.activeChannels} channel${snapshot.activeChannels === 1 ? '' : 's'}.`
    : `Paid-media data for ${snapshot.clientName} is still thin, so performance momentum is not established yet.`

  const operationsBullet = `Delivery shows ${snapshot.taskSummary.total} open tasks, ${snapshot.taskSummary.overdue} overdue, and ${snapshot.proposalSummary.total} proposal${snapshot.proposalSummary.total === 1 ? '' : 's'} in motion.`

  let focusBullet = 'Next focus: tighten the next reporting cycle and define one clear growth experiment.'

  if (snapshot.integrationSummary.failedCount > 0) {
    focusBullet = `Next focus: resolve ${snapshot.integrationSummary.failedCount} failed integration${snapshot.integrationSummary.failedCount === 1 ? '' : 's'} before expanding optimizations.`
  } else if (snapshot.taskSummary.overdue > 0) {
    focusBullet = `Next focus: clear ${snapshot.taskSummary.overdue} overdue task${snapshot.taskSummary.overdue === 1 ? '' : 's'} so delivery risk does not compound.`
  } else if (snapshot.topProvider) {
    focusBullet = `Next focus: turn ${snapshot.topProvider} learnings into the next client-ready recommendation and budget move.`
  }

  return {
    headline: `${snapshot.clientName} dashboard snapshot`,
    bullets: [performanceBullet, operationsBullet, focusBullet],
    model: null,
    usedFallback: true,
    generatedAt,
  }
}