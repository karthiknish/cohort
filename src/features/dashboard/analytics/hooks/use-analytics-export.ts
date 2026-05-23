'use client'

import { useMemo } from 'react'

import { buildAnalyticsExportCharts } from '@/lib/export/cohorts-spreadsheet-charts'

import type { MetricRecord } from './types'

export function useAnalyticsExport(metrics: MetricRecord[]) {
  const exportData = useMemo(() => {
    return metrics.map((metric) => {
      const spend = metric.spend ?? 0
      const revenue = metric.revenue ?? 0
      const clicks = metric.clicks ?? 0
      const impressions = metric.impressions ?? 0
      const conversions = metric.conversions ?? 0

      return {
        date: metric.date,
        platform: metric.providerId,
        spend,
        impressions,
        clicks,
        conversions,
        revenue,
        roas: spend > 0 ? revenue / spend : 0,
        cpc: clicks > 0 ? spend / clicks : 0,
        ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
        convRate: clicks > 0 ? (conversions / clicks) * 100 : 0,
      }
    })
  }, [metrics])

  const exportToSpreadsheet = async (filename?: string) => {
    if (exportData.length === 0) {
      throw new Error('No data to export')
    }

    const headers = [
      'Date',
      'Platform',
      'Spend',
      'Impressions',
      'Clicks',
      'Conversions',
      'Revenue',
      'ROAS',
      'CPC',
      'CTR (%)',
      'Conv Rate (%)',
    ]

    const rows = exportData.map((row) => [
      row.date,
      row.platform,
      row.spend.toFixed(2),
      row.impressions.toLocaleString(),
      row.clicks.toLocaleString(),
      row.conversions.toLocaleString(),
      row.revenue.toFixed(2),
      row.roas.toFixed(2),
      row.cpc.toFixed(2),
      row.ctr.toFixed(2),
      row.convRate.toFixed(2),
    ])

    await (async () => {
      const { exportCohortsSpreadsheetRows } = await import('@/lib/export/cohorts-spreadsheet')
      await exportCohortsSpreadsheetRows({
        filename: filename || `analytics-export-${new Date().toISOString().split('T')[0]}.xlsx`,
        title: 'Analytics export',
        subtitle: `${exportData.length} metric row${exportData.length === 1 ? '' : 's'}`,
        sheetName: 'Analytics',
        headers,
        rows,
        charts: buildAnalyticsExportCharts(exportData),
      })
    })()
  }

  const exportToJSON = (filename?: string) => {
    if (exportData.length === 0) {
      throw new Error('No data to export')
    }

    const jsonContent = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', filename || `analytics-export-${new Date().toISOString().split('T')[0]}.json`)
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return {
    exportData,
    exportToSpreadsheet,
    /** @deprecated Use exportToSpreadsheet */
    exportToCSV: exportToSpreadsheet,
    exportToJSON,
    canExport: exportData.length > 0,
  }
}
