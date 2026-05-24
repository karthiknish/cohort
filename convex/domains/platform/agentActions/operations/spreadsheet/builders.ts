import {
  asNumber,
  asRecord,
  asString,
  formatCurrency,
  formatPercent,
  formatRatio,
  formatWholeNumber,
} from '../../helpers'
import {
  formatProviderDisplayName,
  formatTaskDate,
  formatTaskPriorityLabel,
  formatTaskStatusLabel,
} from '../shared'

function asRecordArray(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    const record = asRecord(item)
    return record ? [record] : []
  })
}

export type SpreadsheetExportPayload = {
  filename: string
  title: string
  subtitle?: string
  sheetName?: string
  headers: string[]
  rows: string[][]
  extraTables?: Array<{ title: string; headers: string[]; rows: string[][] }>
  metadata?: Record<string, string>
  charts?: Array<{
    id: string
    title: string
    kind: 'line' | 'bar' | 'area' | 'pie'
    series: Array<{ name: string; points: Array<{ name: string; value: number }> }>
  }>
}

function dateStamp(): string {
  return new Date().toISOString().slice(0, 10)
}

function windowSubtitle(data: Record<string, unknown>): string | undefined {
  const periodLabel = asString(data.periodLabel)
  const startDate = asString(data.startDate)
  const endDate = asString(data.endDate)
  if (periodLabel && startDate && endDate) return `${periodLabel} · ${startDate} → ${endDate}`
  if (startDate && endDate) return `${startDate} → ${endDate}`
  return periodLabel ?? undefined
}

function buildBarChartFromRows(args: {
  id: string
  title: string
  labelIndex: number
  valueIndex: number
  rows: string[][]
  kind?: 'bar' | 'pie'
}): SpreadsheetExportPayload['charts'] {
  const points = args.rows.flatMap((row) => {
    const label = row[args.labelIndex]?.trim()
    const value = Number.parseFloat(row[args.valueIndex]?.replace(/,/g, '') ?? '')
    if (!label || !Number.isFinite(value) || value <= 0) return []
    return [{ name: label, value }]
  })
  if (points.length === 0) return undefined
  return [
    {
      id: args.id,
      title: args.title,
      kind: args.kind ?? 'bar',
      series: [{ name: args.title, points }],
    },
  ]
}

export function buildAdsSpreadsheetExport(data: Record<string, unknown>): SpreadsheetExportPayload | null {
  const totals = asRecord(data.totals)
  const providerBreakdown = asRecordArray(data.providerBreakdown)
  const topCampaigns = asRecordArray(data.topCampaigns)
  const currencyBreakdown = asRecordArray(data.currencyBreakdown)
  const currencyCode = asString(data.currencyCode) ?? 'USD'

  if (!totals && providerBreakdown.length === 0 && topCampaigns.length === 0) {
    return null
  }

  const headers = ['Platform', 'Spend', 'Impressions', 'Clicks', 'Conversions', 'Revenue', 'ROAS']
  const rows = providerBreakdown.map((row) => [
    formatProviderDisplayName(asString(row.providerId) ?? 'unknown'),
    formatCurrency(asNumber(row.spend) ?? 0, currencyCode),
    formatWholeNumber(asNumber(row.impressions) ?? 0),
    formatWholeNumber(asNumber(row.clicks) ?? 0),
    formatWholeNumber(asNumber(row.conversions) ?? 0),
    formatCurrency(asNumber(row.revenue) ?? 0, currencyCode),
    formatRatio(asNumber(row.roas) ?? 0),
  ])

  const totalRows = totals
    ? [
        ['Spend', formatCurrency(asNumber(totals.spend) ?? 0, currencyCode)],
        ['Impressions', formatWholeNumber(asNumber(totals.impressions) ?? 0)],
        ['Clicks', formatWholeNumber(asNumber(totals.clicks) ?? 0)],
        ['Conversions', formatWholeNumber(asNumber(totals.conversions) ?? 0)],
        ['Revenue', formatCurrency(asNumber(totals.revenue) ?? 0, currencyCode)],
        ['ROAS', formatRatio(asNumber(totals.roas) ?? 0)],
        ['CTR', formatPercent(asNumber(totals.ctr) ?? 0)],
        ['CPC', formatCurrency(asNumber(totals.cpc) ?? 0, currencyCode)],
        ['CPA', formatCurrency(asNumber(totals.cpa) ?? 0, currencyCode)],
      ]
    : []

  const campaignHeaders = ['Campaign', 'Platform', 'Spend', 'Clicks', 'Conversions', 'Revenue', 'ROAS']
  const campaignRows = topCampaigns.map((campaign) => [
    asString(campaign.name) ?? 'Campaign',
    formatProviderDisplayName(asString(campaign.providerId) ?? 'unknown'),
    formatCurrency(asNumber(campaign.spend) ?? 0, currencyCode),
    formatWholeNumber(asNumber(campaign.clicks) ?? 0),
    formatWholeNumber(asNumber(campaign.conversions) ?? 0),
    formatCurrency(asNumber(campaign.revenue) ?? 0, currencyCode),
    formatRatio(asNumber(campaign.roas) ?? 0),
  ])

  const currencyHeaders = ['Currency', 'Spend', 'Revenue']
  const currencyRows = currencyBreakdown.map((row) => [
    asString(row.currency) ?? currencyCode,
    formatCurrency(asNumber(row.spend) ?? 0, asString(row.currency) ?? currencyCode),
    formatCurrency(asNumber(row.revenue) ?? 0, asString(row.currency) ?? currencyCode),
  ])

  const extraTables = [
    totalRows.length > 0 ? { title: 'Totals', headers: ['Metric', 'Value'], rows: totalRows } : null,
    campaignRows.length > 0
      ? { title: 'Top campaigns', headers: campaignHeaders, rows: campaignRows }
      : null,
    currencyRows.length > 0
      ? { title: 'Spend by currency', headers: currencyHeaders, rows: currencyRows }
      : null,
  ].filter((table): table is { title: string; headers: string[]; rows: string[][] } => table !== null)

  const primaryRows =
    rows.length > 0
      ? rows
      : totalRows.length > 0
        ? totalRows
        : [['No synced metrics', '—']]

  const primaryHeaders =
    rows.length > 0 ? headers : totalRows.length > 0 ? ['Metric', 'Value'] : ['Status', 'Detail']

  return {
    filename: `ads-export-${dateStamp()}.xlsx`,
    title: 'Ads performance export',
    subtitle: windowSubtitle(data),
    sheetName: 'Ads',
    headers: primaryHeaders,
    rows: primaryRows,
    extraTables,
    metadata: {
      Source: asString(data.providerLabel) ?? 'Connected ad platforms',
      Currency: currencyCode,
    },
    charts: buildBarChartFromRows({
      id: 'ads-spend-by-platform',
      title: 'Spend by platform',
      labelIndex: 0,
      valueIndex: 1,
      rows: providerBreakdown.map((row) => [
        formatProviderDisplayName(asString(row.providerId) ?? 'unknown'),
        String(asNumber(row.spend) ?? 0),
      ]),
    }),
  }
}

export function buildAnalyticsSpreadsheetExport(data: Record<string, unknown>): SpreadsheetExportPayload | null {
  const totals = asRecord(data.totals)
  if (!totals) return null

  const currencyCode = asString(data.currencyCode) ?? 'USD'
  const rows = [
    ['Users', formatWholeNumber(asNumber(totals.users) ?? 0)],
    ['Sessions', formatWholeNumber(asNumber(totals.sessions) ?? 0)],
    ['Conversions', formatWholeNumber(asNumber(totals.conversions) ?? 0)],
    ['Revenue', formatCurrency(asNumber(totals.revenue) ?? 0, currencyCode)],
    ['Conversion rate', formatPercent(asNumber(totals.conversionRate) ?? 0)],
    ['Revenue / session', formatCurrency(asNumber(totals.revenuePerSession) ?? 0, currencyCode)],
    ['Sessions / user', formatRatio(asNumber(totals.sessionsPerUser) ?? 0)],
  ]

  return {
    filename: `analytics-export-${dateStamp()}.xlsx`,
    title: 'Analytics export',
    subtitle: windowSubtitle(data),
    sheetName: 'Analytics',
    headers: ['Metric', 'Value'],
    rows,
    metadata: {
      'Synced days': formatWholeNumber(asNumber(data.syncedDays) ?? 0),
    },
    charts: buildBarChartFromRows({
      id: 'analytics-sessions',
      title: 'Traffic snapshot',
      labelIndex: 0,
      valueIndex: 1,
      rows: [
        ['Users', String(asNumber(totals.users) ?? 0)],
        ['Sessions', String(asNumber(totals.sessions) ?? 0)],
        ['Conversions', String(asNumber(totals.conversions) ?? 0)],
      ],
      kind: 'bar',
    }),
  }
}

export function buildSocialSpreadsheetExport(data: Record<string, unknown>): SpreadsheetExportPayload | null {
  const surfaces: Array<'facebook' | 'instagram'> = ['facebook', 'instagram']
  const rows: string[][] = []

  for (const surface of surfaces) {
    const snapshot = asRecord(data[surface])
    if (!snapshot) continue
    rows.push([
      surface === 'facebook' ? 'Facebook' : 'Instagram',
      formatWholeNumber(asNumber(snapshot.reach) ?? 0),
      formatWholeNumber(asNumber(snapshot.impressions) ?? 0),
      formatWholeNumber(asNumber(snapshot.engagement) ?? 0),
      formatWholeNumber(asNumber(snapshot.followers) ?? 0),
    ])
  }

  if (rows.length === 0) return null

  return {
    filename: `social-export-${dateStamp()}.xlsx`,
    title: 'Organic social export',
    subtitle: windowSubtitle(data),
    sheetName: 'Social',
    headers: ['Surface', 'Reach', 'Impressions', 'Engagement', 'Followers'],
    rows,
    charts: buildBarChartFromRows({
      id: 'social-reach',
      title: 'Reach by surface',
      labelIndex: 0,
      valueIndex: 1,
      rows,
    }),
  }
}

function mapTaskRows(tasks: Record<string, unknown>[]): string[][] {
  return tasks.map((task) => [
    asString(task.title) ?? 'Untitled',
    formatTaskStatusLabel(asString(task.status) ?? 'unknown'),
    formatTaskPriorityLabel(asString(task.priority) ?? 'medium'),
    asString(task.clientName) ?? '',
    asString(task.projectName) ?? '',
    asString(task.dueLabel) ?? formatTaskDate(asNumber(task.dueDate)) ?? 'No due date',
  ])
}

export function buildTasksSpreadsheetExport(data: Record<string, unknown>): SpreadsheetExportPayload | null {
  const tasks = asRecordArray(data.tasks)
  const focusTasks = asRecordArray(data.focusTasks)
  const source = tasks.length > 0 ? tasks : focusTasks
  if (source.length === 0) return null

  const headers = ['Title', 'Status', 'Priority', 'Client', 'Project', 'Due']
  const rows = mapTaskRows(source)

  return {
    filename: `tasks-export-${dateStamp()}.xlsx`,
    title: asString(data.scopeLabel) ? `Tasks — ${asString(data.scopeLabel)}` : 'Tasks export',
    subtitle: asString(data.timeWindowLabel) ?? undefined,
    sheetName: 'Tasks',
    headers,
    rows,
    metadata: {
      Open: formatWholeNumber(asNumber(data.openTasks) ?? 0),
      Completed: formatWholeNumber(asNumber(data.completedTasks) ?? 0),
      Overdue: formatWholeNumber(asNumber(data.overdueTasks) ?? 0),
    },
    charts: (() => {
      const statusCounts = new Map<string, number>()
      for (const row of rows) {
        const status = row[1] ?? 'Unknown'
        statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1)
      }
      const statusRows = [...statusCounts.entries()].map(([status, count]) => [status, String(count)])
      return buildBarChartFromRows({
        id: 'tasks-by-status',
        title: 'Tasks by status',
        labelIndex: 0,
        valueIndex: 1,
        rows: statusRows,
        kind: 'pie',
      })
    })(),
  }
}

export function buildClientsSpreadsheetExport(data: Record<string, unknown>): SpreadsheetExportPayload | null {
  const clients = asRecordArray(data.clients)
  if (clients.length === 0) return null

  const headers = ['Client', 'Client ID']
  const rows = clients.map((client) => [
    asString(client.name) ?? 'Unnamed client',
    asString(client.clientId) ?? '',
  ])

  return {
    filename: `clients-export-${dateStamp()}.xlsx`,
    title: 'Workspace clients',
    subtitle: `${formatWholeNumber(asNumber(data.total) ?? clients.length)} clients`,
    sheetName: 'Clients',
    headers,
    rows,
  }
}

export function buildProjectsSpreadsheetExport(data: Record<string, unknown>): SpreadsheetExportPayload | null {
  const projects = asRecordArray(data.projects)
  if (projects.length === 0) return null

  const headers = ['Project', 'Client', 'Status']
  const rows = projects.map((project) => [
    asString(project.name) ?? 'Unnamed project',
    asString(project.clientName) ?? '',
    asString(project.status) ?? '',
  ])

  return {
    filename: `projects-export-${dateStamp()}.xlsx`,
    title: 'Active projects',
    subtitle: `${formatWholeNumber(asNumber(data.total) ?? projects.length)} projects`,
    sheetName: 'Projects',
    headers,
    rows,
  }
}

export function buildProposalsSpreadsheetExport(data: Record<string, unknown>): SpreadsheetExportPayload | null {
  const proposals = asRecordArray(data.proposals)
  if (proposals.length === 0) return null

  const headers = ['Proposal', 'Client', 'Status', 'Progress']
  const rows = proposals.map((proposal) => [
    asString(proposal.title) ?? 'Untitled proposal',
    asString(proposal.clientName) ?? '',
    asString(proposal.status) ?? '',
    asNumber(proposal.stepProgress) !== null ? `${formatWholeNumber(asNumber(proposal.stepProgress)!)}%` : '',
  ])

  return {
    filename: `proposals-export-${dateStamp()}.xlsx`,
    title: 'Proposal drafts',
    subtitle: `${formatWholeNumber(asNumber(data.total) ?? proposals.length)} proposals`,
    sheetName: 'Proposals',
    headers,
    rows,
  }
}

export function buildMeetingsSpreadsheetExport(data: Record<string, unknown>): SpreadsheetExportPayload | null {
  const meetings = asRecordArray(data.meetings)
  if (meetings.length === 0) return null

  const headers = ['Meeting', 'When', 'Status', 'Notes']
  const rows = meetings.map((meeting) => [
    asString(meeting.title) ?? 'Untitled meeting',
    asString(meeting.when) ?? '',
    asString(meeting.status) ?? '',
    meeting.hasTranscript === true ? 'Transcript available' : '—',
  ])

  return {
    filename: `meetings-export-${dateStamp()}.xlsx`,
    title: 'Meetings export',
    subtitle: windowSubtitle(data) ?? `${formatWholeNumber(asNumber(data.total) ?? meetings.length)} meetings`,
    sheetName: 'Meetings',
    headers,
    rows,
  }
}

export function buildReportSpreadsheetExport(data: Record<string, unknown>): SpreadsheetExportPayload | null {
  const totals = asRecord(data.totals)
  const reportText = asString(data.reportText)
  const currencyCode = asString(data.currencyCode) ?? 'USD'

  const summaryRows = totals
    ? [
        ['Spend', formatCurrency(asNumber(totals.spend) ?? 0, currencyCode)],
        ['Revenue', formatCurrency(asNumber(totals.revenue) ?? 0, currencyCode)],
        ['ROAS', formatRatio(asNumber(totals.roas) ?? 0)],
        ['Impressions', formatWholeNumber(asNumber(totals.impressions) ?? 0)],
        ['Clicks', formatWholeNumber(asNumber(totals.clicks) ?? 0)],
        ['Conversions', formatWholeNumber(asNumber(totals.conversions) ?? 0)],
      ]
    : []

  const narrativeRows = reportText
    ? reportText
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => [line])
    : []

  if (summaryRows.length === 0 && narrativeRows.length === 0) return null

  return {
    filename: `performance-report-${dateStamp()}.xlsx`,
    title: 'Performance report',
    subtitle: windowSubtitle(data),
    sheetName: 'Report',
    headers: summaryRows.length > 0 ? ['Metric', 'Value'] : ['Summary'],
    rows: summaryRows.length > 0 ? summaryRows : narrativeRows,
    extraTables:
      summaryRows.length > 0 && narrativeRows.length > 0
        ? [{ title: 'Narrative', headers: ['Section'], rows: narrativeRows }]
        : undefined,
  }
}

export function buildSpreadsheetExportFromOperationData(
  operation: string,
  data: Record<string, unknown>,
): SpreadsheetExportPayload | null {
  switch (operation) {
    case 'summarizeAdsPerformance':
      return buildAdsSpreadsheetExport(data)
    case 'summarizeAnalyticsPerformance':
      return buildAnalyticsSpreadsheetExport(data)
    case 'summarizeSocialPerformance':
      return buildSocialSpreadsheetExport(data)
    case 'summarizeMyTasks':
    case 'summarizeClientTasks':
      return buildTasksSpreadsheetExport(data)
    case 'listWorkspaceClients':
      return buildClientsSpreadsheetExport(data)
    case 'listActiveProjects':
      return buildProjectsSpreadsheetExport(data)
    case 'listProposals':
      return buildProposalsSpreadsheetExport(data)
    case 'summarizeMeetings':
      return buildMeetingsSpreadsheetExport(data)
    case 'generatePerformanceReport':
      return buildReportSpreadsheetExport(data)
    default:
      return null
  }
}
