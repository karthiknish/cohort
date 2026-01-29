'use client'

import { useMemo } from 'react'
import type { MetricRecord } from './types'

export interface ExportData {
  date: string
  platform: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
  roas: number
  cpc: number
  ctr: number
  convRate: number
}

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

  const exportToCSV = (filename?: string) => {
    if (exportData.length === 0) {
      throw new Error('No data to export')
    }

    // CSV header
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

    // CSV rows
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

    // Combine header and rows
    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.join(',')),
    ].join('\n')

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', filename || `analytics-export-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
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
    exportToCSV,
    exportToJSON,
    canExport: exportData.length > 0,
  }
}
