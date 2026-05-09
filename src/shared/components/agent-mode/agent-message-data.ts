import { formatProviderName } from '@/lib/themes'

type DeltaTone = 'positive' | 'negative' | 'neutral'
type MetricItem = { label: string; value: string; delta?: string | null; deltaTone?: DeltaTone }
type ListItem = { primary: string; secondary?: string; href?: string | null; delta?: string | null; deltaTone?: DeltaTone }

export type AgentDataSection =
  | { type: 'metrics'; title: string; items: MetricItem[] }
  | { type: 'list'; title: string; items: ListItem[] }

const AGENT_MESSAGE_CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const AGENT_MESSAGE_WHOLE_NUMBER_FORMATTER = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
})

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function asRecordArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value)
    ? value.map((item) => asRecord(item)).filter((item): item is Record<string, unknown> => item !== null)
    : []
}

function compact<T>(items: Array<T | null>): T[] {
  return items.filter((item): item is T => item !== null)
}

function formatCurrency(value: number): string {
  return AGENT_MESSAGE_CURRENCY_FORMATTER.format(value)
}

function formatWholeNumber(value: number): string {
  return AGENT_MESSAGE_WHOLE_NUMBER_FORMATTER.format(value)
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`
}

function formatRatio(value: number): string {
  return `${value.toFixed(2)}x`
}

function formatLabel(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function formatTaskDueDate(value: number | string | null): string | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Date(value).toISOString().slice(0, 10)
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim()
  }
  return null
}

function formatDateValue(value: number | string | null): string | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Date(value).toISOString().slice(0, 10)
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim()
  }
  return null
}

function formatDeltaPercent(value: number | null, digits = 1): string | null {
  if (value === null || !Number.isFinite(value) || Math.abs(value) < 0.01) return null
  return `${value > 0 ? '+' : ''}${value.toFixed(digits)}%`
}

function getDeltaTone(value: number | null, invertTrend = false): DeltaTone {
  if (value === null || !Number.isFinite(value) || Math.abs(value) < 0.01) return 'neutral'
  const positive = value > 0
  if (invertTrend) return positive ? 'negative' : 'positive'
  return positive ? 'positive' : 'negative'
}

function buildMetricsFromTotals(
  totals: Record<string, unknown> | null,
  comparison: Record<string, unknown> | null,
): MetricItem[] {
  if (!totals) return []

  const spend = asNumber(totals.spend)
  const revenue = asNumber(totals.revenue)
  const roas = asNumber(totals.roas)
  const impressions = asNumber(totals.impressions)
  const clicks = asNumber(totals.clicks)
  const ctr = asNumber(totals.ctr)
  const conversions = asNumber(totals.conversions)
  const deltaPercent = asRecord(comparison?.deltaPercent)

  return compact<MetricItem>([
    spend !== null
      ? {
          label: 'Spend',
          value: formatCurrency(spend),
          delta: formatDeltaPercent(asNumber(deltaPercent?.spend)),
          deltaTone: getDeltaTone(asNumber(deltaPercent?.spend), true),
        }
      : null,
    revenue !== null
      ? {
          label: 'Revenue',
          value: formatCurrency(revenue),
          delta: formatDeltaPercent(asNumber(deltaPercent?.revenue)),
          deltaTone: getDeltaTone(asNumber(deltaPercent?.revenue)),
        }
      : null,
    roas !== null
      ? {
          label: 'ROAS',
          value: formatRatio(roas),
          delta: formatDeltaPercent(asNumber(deltaPercent?.roas)),
          deltaTone: getDeltaTone(asNumber(deltaPercent?.roas)),
        }
      : null,
    impressions !== null
      ? {
          label: 'Impressions',
          value: formatWholeNumber(impressions),
          delta: formatDeltaPercent(asNumber(deltaPercent?.impressions)),
          deltaTone: getDeltaTone(asNumber(deltaPercent?.impressions)),
        }
      : null,
    clicks !== null
      ? {
          label: 'Clicks',
          value: formatWholeNumber(clicks),
          delta: formatDeltaPercent(asNumber(deltaPercent?.clicks)),
          deltaTone: getDeltaTone(asNumber(deltaPercent?.clicks)),
        }
      : null,
    ctr !== null
      ? {
          label: 'CTR',
          value: formatPercent(ctr),
          delta: formatDeltaPercent(asNumber(deltaPercent?.ctr)),
          deltaTone: getDeltaTone(asNumber(deltaPercent?.ctr)),
        }
      : null,
    conversions !== null
      ? {
          label: 'Conversions',
          value: formatWholeNumber(conversions),
          delta: formatDeltaPercent(asNumber(deltaPercent?.conversions)),
          deltaTone: getDeltaTone(asNumber(deltaPercent?.conversions)),
        }
      : null,
  ])
}

function resolveTotals(data: Record<string, unknown>): Record<string, unknown> | null {
  const directTotals = asRecord(data.totals)
  if (directTotals) return directTotals

  const metricsSummary = asRecord(data.metricsSummary)
  if (!metricsSummary) return null

  return asRecord(metricsSummary.totals) ?? asRecord(asRecord(metricsSummary.summary)?.totals)
}

export function buildAgentDataSections(operation: string | undefined, data: Record<string, unknown> | undefined): AgentDataSection[] {
  if (!data) return []

  const sections: AgentDataSection[] = []
  const details: MetricItem[] = []

  const periodLabel = asString(data.periodLabel)
  const providerLabel = asString(data.providerLabel)
  const startDate = asString(data.startDate)
  const endDate = asString(data.endDate)
  const comparison = asRecord(data.comparison)
  const previousWindow = asRecord(comparison?.previousWindow) ?? asRecord(data.previousWindow)
  const campaignQuery = asString(data.campaignQuery)
  const matchedCampaignCount = asNumber(data.matchedCampaignCount)
  const metricsAvailable = typeof data.metricsAvailable === 'boolean'
    ? data.metricsAvailable
    : asNumber(asRecord(data.metricsSummary)?.count) !== null
      ? (asNumber(asRecord(data.metricsSummary)?.count) ?? 0) > 0
      : null

  if (periodLabel) details.push({ label: 'Window', value: periodLabel })
  if (startDate || endDate) details.push({ label: 'Dates', value: startDate && endDate ? `${startDate} → ${endDate}` : startDate ?? endDate ?? '' })
  if (providerLabel) details.push({ label: 'Providers', value: providerLabel })
  if (metricsAvailable === false) details.push({ label: 'Ads Data', value: 'No synced metrics in this window' })
  if (campaignQuery) details.push({ label: 'Campaign Filter', value: campaignQuery })
  if (matchedCampaignCount !== null) details.push({ label: 'Matches', value: formatWholeNumber(matchedCampaignCount) })
  if (previousWindow) {
    const prevStart = asString(previousWindow.startDate)
    const prevEnd = asString(previousWindow.endDate)
    if (prevStart || prevEnd) {
      details.push({ label: 'Compared To', value: prevStart && prevEnd ? `${prevStart} → ${prevEnd}` : prevStart ?? prevEnd ?? '' })
    }
  }

  const campaignCounts = asRecord(data.campaignCounts)
  if (campaignCounts) {
    const active = asNumber(campaignCounts.active)
    const paused = asNumber(campaignCounts.paused)
    const total = asNumber(campaignCounts.total)
    if (total !== null) details.push({ label: 'Campaigns', value: `${formatWholeNumber(total)} total` })
    if (active !== null) details.push({ label: 'Active', value: formatWholeNumber(active) })
    if (paused !== null) details.push({ label: 'Paused', value: formatWholeNumber(paused) })
  }

  if (details.length > 0) sections.push({ type: 'metrics', title: 'Overview', items: details })

  const totalsMetrics = buildMetricsFromTotals(resolveTotals(data), comparison)
  if (totalsMetrics.length > 0 && metricsAvailable !== false) sections.push({ type: 'metrics', title: 'Performance', items: totalsMetrics })

  const providerBreakdown = asRecordArray(data.providerBreakdown)
  if (providerBreakdown.length > 0 && metricsAvailable !== false) {
    sections.push({
      type: 'list',
      title: 'Platform Breakdown',
      items: providerBreakdown.slice(0, 4).map<ListItem>((provider) => {
        const providerId = asString(provider.providerId) ?? 'unknown'
        const totals = asRecord(provider.totals)
        const deltaPercent = asRecord(provider.deltaPercent)
        const spend = asNumber(totals?.spend)
        const roas = asNumber(totals?.roas)
        const conversionsValue = asNumber(totals?.conversions)
        const deltaValue = asNumber(deltaPercent?.roas) ?? asNumber(deltaPercent?.revenue) ?? asNumber(deltaPercent?.spend)

        return {
          primary: asString(provider.label) ?? formatProviderName(providerId),
          secondary: [
            spend !== null ? formatCurrency(spend) : null,
            roas !== null ? `${formatRatio(roas)} ROAS` : null,
            conversionsValue !== null ? `${formatWholeNumber(conversionsValue)} conv` : null,
          ].filter((item): item is string => Boolean(item)).join(' • ') || undefined,
          delta: formatDeltaPercent(deltaValue),
          deltaTone: getDeltaTone(deltaValue),
        }
      }),
    })
  }

  const activeCampaigns = asRecordArray(data.activeCampaigns)
  if (activeCampaigns.length > 0) {
    sections.push({
      type: 'list',
      title: campaignQuery ? 'Matching Campaigns' : 'Active Campaigns',
      items: activeCampaigns.slice(0, 6).map<ListItem>((campaign) => ({
        primary: asString(campaign.name) ?? 'Unnamed campaign',
        secondary: formatProviderName(asString(campaign.providerId) ?? 'unknown'),
        href: asString(campaign.route),
      })),
    })
  }

  const topCampaigns = asRecordArray(data.topCampaigns)
  if (topCampaigns.length > 0) {
    sections.push({
      type: 'list',
      title: 'Top Campaigns',
      items: topCampaigns.slice(0, 5).map<ListItem>((campaign) => {
        const spend = asNumber(campaign.spend)
        const roas = asNumber(campaign.roas)
        const conversions = asNumber(campaign.conversions)
        const pieces = [
          spend !== null ? formatCurrency(spend) : null,
          roas !== null ? `${formatRatio(roas)} ROAS` : null,
          conversions !== null ? `${formatWholeNumber(conversions)} conv` : null,
        ].filter((item): item is string => Boolean(item))

        return {
          primary: asString(campaign.name) ?? 'Unnamed campaign',
          secondary: pieces.join(' • ') || undefined,
          href: asString(campaign.route),
        }
      }),
    })
  }

  const proposalSummary = asRecord(data.proposalSummary)
  const delivery = asRecord(data.delivery)
  const reportItems: MetricItem[] = []
  const totalSubmitted = asNumber(proposalSummary?.totalSubmitted)
  const aiSuccessRate = asNumber(proposalSummary?.aiSuccessRate)
  const deliveredInApp = typeof delivery?.inApp === 'boolean' ? delivery.inApp : null

  if (metricsAvailable === false) reportItems.push({ label: 'Ads Data', value: 'Awaiting synced metrics' })
  if (totalSubmitted !== null) reportItems.push({ label: 'Proposals', value: formatWholeNumber(totalSubmitted) })
  if (aiSuccessRate !== null) reportItems.push({ label: 'AI Success', value: formatPercent(aiSuccessRate) })
  if (deliveredInApp !== null) reportItems.push({ label: 'In-app Delivery', value: deliveredInApp ? 'Delivered' : 'Not delivered' })

  if (reportItems.length > 0) sections.push({ type: 'metrics', title: 'Report Highlights', items: reportItems })

  const totalTasks = asNumber(data.totalTasks)
  const openTasks = asNumber(data.openTasks)
  const completedTasks = asNumber(data.completedTasks)
  const overdueTasks = asNumber(data.overdueTasks)
  const dueSoonTasks = asNumber(data.dueSoonTasks)
  const highPriorityTasks = asNumber(data.highPriorityTasks)
  const clientName = asString(data.clientName)

  if (operation === 'summarizeClientTasks') {
    const taskSummaryItems = compact<MetricItem>([
      clientName ? { label: 'Client', value: clientName } : null,
      totalTasks !== null ? { label: 'Total Tasks', value: formatWholeNumber(totalTasks) } : null,
      openTasks !== null ? { label: 'Open', value: formatWholeNumber(openTasks) } : null,
      completedTasks !== null ? { label: 'Completed', value: formatWholeNumber(completedTasks) } : null,
      overdueTasks !== null ? { label: 'Overdue', value: formatWholeNumber(overdueTasks) } : null,
      dueSoonTasks !== null ? { label: 'Due Soon', value: formatWholeNumber(dueSoonTasks) } : null,
      highPriorityTasks !== null ? { label: 'High Priority', value: formatWholeNumber(highPriorityTasks) } : null,
    ])

    if (taskSummaryItems.length > 0) {
      sections.push({ type: 'metrics', title: 'Task Summary', items: taskSummaryItems })
    }

    const statusBreakdown = asRecordArray(data.statusBreakdown)
    if (statusBreakdown.length > 0) {
      sections.push({
        type: 'metrics',
        title: 'Status Breakdown',
        items: statusBreakdown.slice(0, 5).map((entry) => ({
          label: formatLabel(asString(entry.status) ?? 'unknown'),
          value: formatWholeNumber(asNumber(entry.count) ?? 0),
        })),
      })
    }

    const tasks = asRecordArray(data.tasks)
    if (tasks.length > 0) {
      sections.push({
        type: 'list',
        title: 'Tasks',
        items: tasks.slice(0, 8).map<ListItem>((task) => {
          const status = asString(task.status)
          const priority = asString(task.priority)
          const dueDate = formatTaskDueDate(asNumber(task.dueDate) ?? asString(task.dueDate))
          const assignedTo = Array.isArray(task.assignedTo)
            ? task.assignedTo.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
            : []

          const secondary = [
            status ? formatLabel(status) : null,
            priority ? formatLabel(priority) : null,
            dueDate ? `Due ${dueDate}` : null,
            assignedTo.length > 0 ? assignedTo.join(', ') : null,
          ].filter((item): item is string => Boolean(item)).join(' • ')

          return {
            primary: asString(task.title) ?? 'Untitled task',
            secondary: secondary || undefined,
          }
        }),
      })
    }
  }

  if (operation === 'createProject' || operation === 'updateProject') {
    const projectName = asString(data.name)
    const projectId = asString(data.projectId)
    const projectStatus = asString(data.status)
    const projectClientName = asString(data.clientName)
    const startDateValue = formatDateValue(asNumber(data.startDateMs) ?? asString(data.startDate))
    const endDateValue = formatDateValue(asNumber(data.endDateMs) ?? asString(data.endDate))
    const tags = Array.isArray(data.tags)
      ? data.tags.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
      : []
    const updatedFields = Array.isArray(data.updatedFields)
      ? data.updatedFields.filter((field): field is string => typeof field === 'string' && field.trim().length > 0)
      : []

    const projectItems = compact<MetricItem>([
      projectName ? { label: 'Project', value: projectName } : null,
      projectId ? { label: 'Project ID', value: projectId } : null,
      projectStatus ? { label: 'Status', value: formatLabel(projectStatus) } : null,
      projectClientName ? { label: 'Client', value: projectClientName } : null,
      startDateValue ? { label: 'Start Date', value: startDateValue } : null,
      endDateValue ? { label: 'End Date', value: endDateValue } : null,
      tags.length > 0 ? { label: 'Tags', value: tags.join(', ') } : null,
    ])

    if (projectItems.length > 0) {
      sections.push({ type: 'metrics', title: 'Project Details', items: projectItems })
    }

    if (updatedFields.length > 0) {
      sections.push({
        type: 'list',
        title: 'Updated Fields',
        items: updatedFields.map((field) => ({ primary: formatLabel(field) })),
      })
    }
  }

  if (sections.length === 0 || operation === 'createTask' || operation === 'sendDirectMessage') {
    const title = asString(data.title)
    const taskId = asString(data.taskId)
    const projectId = asString(data.projectId)
    const clientId = asString(data.clientId)
    const campaignId = asString(data.campaignId)
    const creativeId = asString(data.creativeId)
    const recipientName = asString(data.recipientName)
    const preview = asString(data.preview)
    const status = asString(data.status)
    const action = asString(data.action)

    const genericItems = compact<MetricItem>([
      title ? { label: 'Title', value: title } : null,
      taskId ? { label: 'Task ID', value: taskId } : null,
      projectId ? { label: 'Project ID', value: projectId } : null,
      clientId ? { label: 'Client ID', value: clientId } : null,
      campaignId ? { label: 'Campaign ID', value: campaignId } : null,
      creativeId ? { label: 'Creative ID', value: creativeId } : null,
      recipientName ? { label: 'Recipient', value: recipientName } : null,
      preview ? { label: 'Message', value: preview } : null,
      status ? { label: 'Status', value: status } : null,
      action ? { label: 'Action', value: action } : null,
    ])

    if (genericItems.length > 0) sections.push({ type: 'metrics', title: 'Details', items: genericItems })
  }

  return sections
}