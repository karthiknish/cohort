import { formatProviderName } from '@/lib/themes'

import type { AgentChartPoint, AgentChartSeries } from './types'
import {
  asNumber,
  asRecord,
  asRecordArray,
  asString,
  compact,
  formatCurrency,
  formatLabel,
  formatPercent,
  formatWholeNumber,
  resolveMetricsAvailable,
  resolveTotals,
} from './helpers'

export function buildAgentMessageCharts(
  operation: string | undefined,
  data: Record<string, unknown> | undefined,
): AgentChartSeries[] {
  if (!data) return []

  const charts: AgentChartSeries[] = []
  const metricsAvailable = resolveMetricsAvailable(data)
  if (metricsAvailable === false) return charts

  const dataKind = asString(data.dataKind)
  const isAnalytics = operation === 'summarizeAnalyticsPerformance' || dataKind === 'analytics'
  const isSocial = operation === 'summarizeSocialPerformance' || dataKind === 'social'
  const comparison = asRecord(data.comparison)
  const deltaPercent = asRecord(comparison?.deltaPercent)
  const totals = isAnalytics ? asRecord(data.totals) : resolveTotals(data)

  if (totals && isAnalytics) {
    const users = asNumber(totals.users)
    const sessions = asNumber(totals.sessions)
    const conversions = asNumber(totals.conversions)
    const trafficPoints = compact<AgentChartPoint>([
      users !== null && users > 0 ? { name: 'Users', value: users } : null,
      sessions !== null && sessions > 0 ? { name: 'Sessions', value: sessions } : null,
      conversions !== null && conversions > 0 ? { name: 'Conversions', value: conversions } : null,
    ])
    if (trafficPoints.length >= 2) {
      charts.push({
        id: 'analytics-traffic',
        title: 'Traffic volume',
        points: trafficPoints,
        valueFormat: 'number',
        layout: 'horizontal',
      })
    }
  }

  if (totals && !isAnalytics) {
    const spend = asNumber(totals.spend)
    const revenue = asNumber(totals.revenue)
    const financialPoints = compact<AgentChartPoint>([
      spend !== null && spend > 0 ? { name: 'Spend', value: spend } : null,
      revenue !== null && revenue > 0 ? { name: 'Revenue', value: revenue } : null,
    ])
    if (financialPoints.length >= 2) {
      charts.push({
        id: 'financial',
        title: 'Spend vs revenue',
        subtitle: 'Synced totals for this window',
        points: financialPoints,
        valueFormat: 'currency',
        layout: 'vertical',
      })
    }

    const deliveryPoints = compact<AgentChartPoint>([
      asNumber(totals.impressions) !== null && (asNumber(totals.impressions) ?? 0) > 0
        ? { name: 'Impressions', value: asNumber(totals.impressions)! }
        : null,
      asNumber(totals.clicks) !== null && (asNumber(totals.clicks) ?? 0) > 0
        ? { name: 'Clicks', value: asNumber(totals.clicks)! }
        : null,
      asNumber(totals.conversions) !== null && (asNumber(totals.conversions) ?? 0) > 0
        ? { name: 'Conversions', value: asNumber(totals.conversions)! }
        : null,
    ])
    if (deliveryPoints.length >= 2) {
      charts.push({
        id: 'delivery',
        title: 'Delivery volume',
        points: deliveryPoints,
        valueFormat: 'number',
        layout: 'horizontal',
      })
    }
  }

  if (deltaPercent) {
    const deltaPoints = isAnalytics
      ? compact<AgentChartPoint>([
          asNumber(deltaPercent.users) !== null
            ? { name: 'Users', value: asNumber(deltaPercent.users)! }
            : null,
          asNumber(deltaPercent.sessions) !== null
            ? { name: 'Sessions', value: asNumber(deltaPercent.sessions)! }
            : null,
          asNumber(deltaPercent.conversions) !== null
            ? { name: 'Conversions', value: asNumber(deltaPercent.conversions)! }
            : null,
          asNumber(deltaPercent.revenue) !== null
            ? { name: 'Revenue', value: asNumber(deltaPercent.revenue)! }
            : null,
        ])
      : compact<AgentChartPoint>([
          asNumber(deltaPercent.spend) !== null
            ? { name: 'Spend', value: asNumber(deltaPercent.spend)! }
            : null,
          asNumber(deltaPercent.revenue) !== null
            ? { name: 'Revenue', value: asNumber(deltaPercent.revenue)! }
            : null,
          asNumber(deltaPercent.roas) !== null
            ? { name: 'ROAS', value: asNumber(deltaPercent.roas)! }
            : null,
          asNumber(deltaPercent.conversions) !== null
            ? { name: 'Conversions', value: asNumber(deltaPercent.conversions)! }
            : null,
        ])

    const filteredDeltaPoints = deltaPoints
      .filter((point) => Math.abs(point.value) >= 0.05)
      .filter((point) => Math.abs(point.value) <= 300)

    if (filteredDeltaPoints.length >= 2) {
      charts.push({
        id: isAnalytics ? 'analytics-period-delta' : 'period-delta',
        title: 'Period change',
        subtitle: 'Percent vs previous window',
        points: filteredDeltaPoints,
        valueFormat: 'percent',
        layout: 'horizontal',
      })
    }
  }

  const providerBreakdown = asRecordArray(data.providerBreakdown)
  if (providerBreakdown.length > 0) {
    const points = providerBreakdown.flatMap((provider) => {
        const spend = asNumber(asRecord(provider.totals)?.spend)
        if (spend === null || spend <= 0) return []
        const providerId = asString(provider.providerId) ?? 'unknown'
        return [{
          name: asString(provider.label) ?? formatProviderName(providerId),
          value: spend,
        }]
      })

    if (points.length >= 1) {
      charts.push({
        id: 'providers',
        title: 'Spend by platform',
        points,
        valueFormat: 'currency',
        layout: 'horizontal',
      })
    }
  }

  const topCampaigns = asRecordArray(data.topCampaigns)
  if (topCampaigns.length > 0) {
    const points = compact<AgentChartPoint>(
      topCampaigns.map((campaign) => {
        const spend = asNumber(campaign.spend)
        if (spend === null || spend <= 0) return null
        const name = asString(campaign.name) ?? 'Campaign'
        return {
          name: name.length > 28 ? `${name.slice(0, 26)}…` : name,
          value: spend,
          href: asString(campaign.route) ?? undefined,
        }
      }),
    )

    if (points.length >= 2) {
      charts.push({
        id: 'top-campaigns',
        title: 'Top campaigns by spend',
        points: points.slice(0, 5),
        valueFormat: 'currency',
        layout: 'horizontal',
      })
    }
  }

  if (isSocial) {
    for (const surface of ['facebook', 'instagram'] as const) {
      const surfaceData = asRecord(data[surface])
      if (!surfaceData) continue

      const engagementPoints = compact<AgentChartPoint>([
        asNumber(surfaceData.reach) !== null && (asNumber(surfaceData.reach) ?? 0) > 0
          ? { name: 'Reach', value: asNumber(surfaceData.reach)! }
          : null,
        asNumber(surfaceData.impressions) !== null && (asNumber(surfaceData.impressions) ?? 0) > 0
          ? { name: 'Impressions', value: asNumber(surfaceData.impressions)! }
          : null,
        asNumber(surfaceData.engagedUsers) !== null && (asNumber(surfaceData.engagedUsers) ?? 0) > 0
          ? { name: 'Engaged Users', value: asNumber(surfaceData.engagedUsers)! }
          : null,
      ])

      if (engagementPoints.length >= 2) {
        charts.push({
          id: `social-${surface}`,
          title: `${formatLabel(surface)} reach & engagement`,
          points: engagementPoints,
          valueFormat: 'number',
          layout: 'horizontal',
        })
      }

      const posts = asRecordArray(asRecord(data.topContent)?.[surface])
      const postPoints = compact<AgentChartPoint>(
        posts.map((post, index) => {
          const reach = asNumber(post.reach) ?? asNumber(post.engagedUsers)
          if (reach === null || reach <= 0) return null
          const preview = asString(post.message)
          const label =
            preview && preview.length > 0
              ? preview.length > 24
                ? `${preview.slice(0, 22)}…`
                : preview
              : `Post ${index + 1}`
          return { name: label, value: reach }
        }),
      ).slice(0, 5)

      if (postPoints.length >= 2) {
        charts.push({
          id: `social-top-${surface}`,
          title: `Top ${formatLabel(surface)} posts by reach`,
          points: postPoints,
          valueFormat: 'number',
          layout: 'horizontal',
        })
      }
    }
  }

  if (operation === 'summarizeClientTasks' || operation === 'summarizeMyTasks') {
    const statusBreakdown = asRecordArray(data.statusBreakdown)
    const statusPoints = statusBreakdown.flatMap((entry) => {
        const count = asNumber(entry.count)
        if (count === null || count <= 0) return []
        return [{
          name: formatLabel(asString(entry.status) ?? 'unknown'),
          value: count,
        }]
      })

    if (statusPoints.length >= 2) {
      charts.push({
        id: 'task-status',
        title: 'Tasks by status',
        points: statusPoints,
        valueFormat: 'number',
        layout: 'horizontal',
      })
    }
  }

  return charts
}
