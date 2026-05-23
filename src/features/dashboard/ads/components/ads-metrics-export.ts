import { buildAdsMetricsCharts } from '@/lib/export/cohorts-spreadsheet-charts'

import type { MetricRecord } from './types'
import { formatProviderName } from '@/lib/themes'

export async function exportMetricsToCsv(
  processedMetrics: MetricRecord[],
  formatProviderNameFn: (id: string) => string = formatProviderName,
): Promise<void> {
  const { exportCohortsSpreadsheetRows } = await import('@/lib/export/cohorts-spreadsheet')

  const headers = ['Date', 'Provider', 'Spend', 'Impressions', 'Clicks', 'Conversions', 'Revenue']
  const rows = processedMetrics.map((m) => [
    m.date,
    formatProviderNameFn(m.providerId),
    m.spend.toFixed(2),
    m.impressions,
    m.clicks,
    m.conversions,
    (m.revenue || 0).toFixed(2),
  ])

  await exportCohortsSpreadsheetRows({
    filename: `ads-metrics-${new Date().toISOString().split('T')[0]}.xlsx`,
    title: 'Ad platform metrics',
    subtitle: `${processedMetrics.length} row${processedMetrics.length === 1 ? '' : 's'}`,
    sheetName: 'Ad Metrics',
    headers,
    rows,
    charts: buildAdsMetricsCharts(processedMetrics),
  })
}
