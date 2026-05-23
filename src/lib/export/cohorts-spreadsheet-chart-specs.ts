import { CHART_COLORS } from '@/lib/colors'

import { COHORTS_SPREADSHEET_THEME } from './cohorts-spreadsheet-theme'

export type SpreadsheetChartKind = 'line' | 'bar' | 'area' | 'pie'

export type SpreadsheetChartPoint = {
  label: string
  value: number
}

export type SpreadsheetChartSeries = {
  name: string
  color?: string
  points: SpreadsheetChartPoint[]
}

export type SpreadsheetChartSpec = {
  title: string
  subtitle?: string
  kind: SpreadsheetChartKind
  series: SpreadsheetChartSeries[]
  valueFormatter?: (value: number) => string
}

export type SpreadsheetChartImage = {
  title: string
  base64: string
  width: number
  height: number
}

export const CHART_WIDTH = 640
export const CHART_HEIGHT = 320
export const CHART_PADDING = { top: 52, right: 24, bottom: 48, left: 56 }
export const DEFAULT_COLORS = CHART_COLORS.primary

export const MIN_TIME_SERIES_POINTS = 3
export const MIN_CATEGORY_POINTS = 2
const MIN_TOTAL_VALUE = 0.0001
const MIN_PIE_SLICE_SHARE = 0.04
const MAX_EXPORT_CHARTS = 5

function parseNumeric(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, ''))
    if (Number.isFinite(parsed)) return parsed
  }
  return 0
}

export function positivePoints(points: SpreadsheetChartPoint[]): SpreadsheetChartPoint[] {
  return points.filter((point) => Number.isFinite(point.value) && point.value > MIN_TOTAL_VALUE)
}

function sumPointValues(points: SpreadsheetChartPoint[]): number {
  return points.reduce((sum, point) => sum + point.value, 0)
}

export function computeAxisMax(values: number[]): number {
  const filtered = values.filter((value) => Number.isFinite(value) && value >= 0)
  const max = filtered.length > 0 ? Math.max(...filtered) : 0
  if (max <= 0) return 1
  if (max < 1) {
    return Math.ceil(max * 20) / 20 || 0.05
  }
  const magnitude = Math.pow(10, Math.floor(Math.log10(max)))
  const niceMax = Math.ceil(max / magnitude) * magnitude
  return niceMax > max ? niceMax : max * 1.15
}

export function createAxisValueFormatter(maxValue: number): (value: number) => string {
  if (maxValue < 1) {
    return (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 2 })
  }
  if (maxValue < 1000) {
    return (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 1 })
  }
  return (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

function meaningfulSeriesPoints(
  spec: SpreadsheetChartSpec,
  series: SpreadsheetChartSeries,
): SpreadsheetChartPoint[] {
  return positivePoints(series.points)
}

export function isChartSpecMeaningful(spec: SpreadsheetChartSpec): boolean {
  const activeSeries = spec.series.flatMap((series) => {
    const points = meaningfulSeriesPoints(spec, series)
    if (points.length === 0 || sumPointValues(points) < MIN_TOTAL_VALUE) return []
    return [{ series, points }]
  })

  if (activeSeries.length === 0) return false

  switch (spec.kind) {
    case 'line':
    case 'area':
      return activeSeries.some(({ points }) => points.length >= MIN_TIME_SERIES_POINTS)
    case 'pie':
    case 'bar':
      return activeSeries.some(({ points }) => points.length >= MIN_CATEGORY_POINTS)
    default:
      return activeSeries.some(({ points }) => points.length >= MIN_CATEGORY_POINTS)
  }
}

export function filterMeaningfulCharts(specs: SpreadsheetChartSpec[]): SpreadsheetChartSpec[] {
  return specs.filter(isChartSpecMeaningful)
}

function formatFieldLabel(field: string): string {
  return field
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function collapseSmallPieSlices(points: SpreadsheetChartPoint[]): SpreadsheetChartPoint[] {
  const positive = positivePoints(points)
  const total = sumPointValues(positive)
  if (total <= 0 || positive.length <= MIN_CATEGORY_POINTS) return positive

  const major: SpreadsheetChartPoint[] = []
  let otherValue = 0

  for (const point of positive) {
    if (point.value / total >= MIN_PIE_SLICE_SHARE) {
      major.push(point)
    } else {
      otherValue += point.value
    }
  }

  if (otherValue > MIN_TOTAL_VALUE) {
    major.push({ label: 'Other', value: otherValue })
  }

  return major.length >= MIN_CATEGORY_POINTS ? major : positive
}

export function truncateLabel(label: string, max = 14): string {
  const trimmed = label.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 1)}…`
}

export function sortByLabel(points: SpreadsheetChartPoint[]): SpreadsheetChartPoint[] {
  return points.toSorted((a, b) => {
    const aTime = Date.parse(a.label)
    const bTime = Date.parse(b.label)
    if (!Number.isNaN(aTime) && !Number.isNaN(bTime)) return aTime - bTime
    return a.label.localeCompare(b.label)
  })
}

function limitPoints(points: SpreadsheetChartPoint[], max = 12): SpreadsheetChartPoint[] {
  if (points.length <= max) return points
  const sorted = sortByLabel(points)
  const head = sorted.slice(0, max - 1)
  const remainder = sorted.slice(max - 1)
  const otherValue = remainder.reduce((sum, point) => sum + point.value, 0)
  return [...head, { label: 'Other', value: otherValue }]
}

function aggregateByField<T>(
  rows: T[],
  labelKey: keyof T | string,
  valueKey: keyof T | string,
): SpreadsheetChartPoint[] {
  const totals = new Map<string, number>()

  for (const row of rows) {
    const record = row as Record<string, unknown>
    const label = String(record[labelKey as string] ?? 'Unknown').trim() || 'Unknown'
    const value = parseNumeric(record[valueKey as string])
    totals.set(label, (totals.get(label) ?? 0) + value)
  }

  return limitPoints(
    Array.from(totals.entries()).map(([label, value]) => ({ label, value })),
    10,
  )
}

function aggregateByDate<T>(
  rows: T[],
  dateKey: keyof T | string,
  valueKey: keyof T | string,
): SpreadsheetChartPoint[] {
  const totals = new Map<string, number>()

  for (const row of rows) {
    const record = row as Record<string, unknown>
    const label = String(record[dateKey as string] ?? '').trim()
    if (!label) continue
    const value = parseNumeric(record[valueKey as string])
    totals.set(label, (totals.get(label) ?? 0) + value)
  }

  return sortByLabel(
    Array.from(totals.entries()).map(([label, value]) => ({ label, value })),
  )
}

export function buildCategoryCountChart(
  rows: Record<string, unknown>[],
  field: string,
  title: string,
  kind: 'bar' | 'pie' = 'bar',
): SpreadsheetChartSpec | null {
  const counts = rows.reduce<Map<string, number>>((map, row) => {
    const label = String(row[field] ?? 'Unknown').trim() || 'Unknown'
    map.set(label, (map.get(label) ?? 0) + 1)
    return map
  }, new Map())

  const chartPoints = limitPoints(
    Array.from(counts.entries()).map(([label, value]) => ({ label, value })),
    10,
  )

  const points = positivePoints(chartPoints)
  if (points.length < MIN_CATEGORY_POINTS) return null

  const spec: SpreadsheetChartSpec = {
    title,
    kind,
    series: [{ name: field, points }],
  }

  return isChartSpecMeaningful(spec) ? spec : null
}

export function buildMetricSnapshotChart(
  metrics: Record<string, number>,
  title: string,
): SpreadsheetChartSpec | null {
  const points = Object.entries(metrics).flatMap(([label, value]) =>
    Number.isFinite(value) && value > 0 ? [{ label, value }] : [],
  )

  const positive = positivePoints(limitPoints(points, 8))
  if (positive.length < MIN_CATEGORY_POINTS) return null

  const spec: SpreadsheetChartSpec = {
    title,
    kind: 'bar',
    series: [{ name: 'Count', points: positive }],
  }

  return isChartSpecMeaningful(spec) ? spec : null
}

export function buildTimeSeriesChart(
  rows: Record<string, unknown>[],
  dateField: string,
  valueField: string,
  title: string,
  kind: SpreadsheetChartKind = 'line',
  subtitle?: string,
): SpreadsheetChartSpec | null {
  const points = positivePoints(aggregateByDate(rows, dateField, valueField))
  if (points.length < MIN_TIME_SERIES_POINTS) return null

  const spec: SpreadsheetChartSpec = {
    title,
    subtitle,
    kind,
    series: [{ name: formatFieldLabel(valueField), points }],
  }

  return isChartSpecMeaningful(spec) ? spec : null
}

export function buildMultiMetricTimeSeriesChart(
  rows: Record<string, unknown>[],
  dateField: string,
  valueFields: string[],
  title: string,
  kind: SpreadsheetChartKind = 'line',
  subtitle?: string,
): SpreadsheetChartSpec | null {
  const series = valueFields.flatMap((field) => {
    const points = positivePoints(aggregateByDate(rows, dateField, field))
    if (points.length < MIN_TIME_SERIES_POINTS) return []
    return [{ name: formatFieldLabel(field), points }]
  })

  if (series.length === 0) return null

  const spec: SpreadsheetChartSpec = {
    title,
    subtitle,
    kind,
    series,
  }

  return isChartSpecMeaningful(spec) ? spec : null
}

export function buildCategoryBreakdownChart(
  rows: Record<string, unknown>[],
  labelField: string,
  valueField: string,
  title: string,
  kind: 'bar' | 'pie' = 'bar',
  subtitle?: string,
): SpreadsheetChartSpec | null {
  const rawPoints = positivePoints(aggregateByField(rows, labelField, valueField))
  const points = kind === 'pie' ? collapseSmallPieSlices(rawPoints) : rawPoints
  if (points.length < MIN_CATEGORY_POINTS) return null

  const spec: SpreadsheetChartSpec = {
    title,
    subtitle,
    kind,
    series: [{ name: formatFieldLabel(valueField), points }],
  }

  return isChartSpecMeaningful(spec) ? spec : null
}

export function buildMultiMetricTimeSeriesCharts(
  rows: Record<string, unknown>[],
  dateField: string,
  valueFields: string[],
  titlePrefix: string,
): SpreadsheetChartSpec[] {
  return valueFields
    .map((field) => buildTimeSeriesChart(rows, dateField, field, `${titlePrefix}: ${field}`, 'line'))
    .filter((chart): chart is SpreadsheetChartSpec => chart !== null)
}

export function buildAnalyticsExportCharts(
  rows: Array<Record<string, unknown>>,
): SpreadsheetChartSpec[] {
  const charts: SpreadsheetChartSpec[] = []

  const spendRevenue = buildMultiMetricTimeSeriesChart(
    rows,
    'date',
    ['spend', 'revenue'],
    'Spend vs revenue over time',
    'line',
    'Daily totals from export rows',
  )
  if (spendRevenue) charts.push(spendRevenue)

  const delivery = buildMultiMetricTimeSeriesChart(
    rows,
    'date',
    ['impressions', 'clicks'],
    'Delivery volume over time',
    'area',
    'Impressions and clicks by day',
  )
  if (delivery) charts.push(delivery)

  const spendTrend = buildTimeSeriesChart(rows, 'date', 'spend', 'Daily spend', 'area')
  if (spendTrend && !spendRevenue) charts.push(spendTrend)

  const conversionsTrend = buildTimeSeriesChart(
    rows,
    'date',
    'conversions',
    'Daily conversions',
    'line',
    'Conversion volume by day',
  )
  if (conversionsTrend) charts.push(conversionsTrend)

  const platformChart = buildCategoryBreakdownChart(
    rows,
    'platform',
    'spend',
    'Spend by platform',
    'pie',
    'Share of spend in this export window',
  )
  if (platformChart) charts.push(platformChart)

  return filterMeaningfulCharts(charts).slice(0, MAX_EXPORT_CHARTS)
}

export function buildAdsMetricsCharts(
  rows: Array<{
    date: string
    providerId: string
    spend: number
    impressions?: number
    clicks?: number
    conversions?: number
    revenue?: number
  }>,
): SpreadsheetChartSpec[] {
  const chartRows = rows.map((row) => ({
    date: row.date,
    providerId: row.providerId,
    spend: row.spend,
    impressions: row.impressions ?? 0,
    clicks: row.clicks ?? 0,
    conversions: row.conversions ?? 0,
    revenue: row.revenue ?? 0,
  }))

  const charts: SpreadsheetChartSpec[] = []

  const spendRevenue = buildMultiMetricTimeSeriesChart(
    chartRows,
    'date',
    ['spend', 'revenue'],
    'Spend vs revenue trend',
    'line',
    'Daily ad spend and attributed revenue',
  )
  if (spendRevenue) charts.push(spendRevenue)

  const spendTrend = buildTimeSeriesChart(
    chartRows,
    'date',
    'spend',
    'Daily ad spend',
    'area',
    'Total spend per day',
  )
  if (spendTrend && !spendRevenue) charts.push(spendTrend)

  const delivery = buildMultiMetricTimeSeriesChart(
    chartRows,
    'date',
    ['impressions', 'clicks'],
    'Impressions and clicks',
    'area',
    'Delivery volume by day',
  )
  if (delivery) charts.push(delivery)

  const conversionsTrend = buildTimeSeriesChart(
    chartRows,
    'date',
    'conversions',
    'Daily conversions',
    'line',
    'Conversion count by day',
  )
  if (conversionsTrend) charts.push(conversionsTrend)

  const providerChart = buildCategoryBreakdownChart(
    chartRows,
    'providerId',
    'spend',
    'Spend by provider',
    'pie',
    'Platform mix for this export',
  )
  if (providerChart) charts.push(providerChart)

  return filterMeaningfulCharts(charts).slice(0, MAX_EXPORT_CHARTS)
}

export function buildCollaborationExportCharts(
  rows: Array<Record<string, unknown>>,
): SpreadsheetChartSpec[] {
  const charts: SpreadsheetChartSpec[] = []

  const byDay = rows.reduce<Map<string, number>>((map, row) => {
    const rawDate = String(row.date ?? '').trim()
    if (!rawDate) return map
    const day = rawDate.split(',')[0]?.trim() || rawDate
    map.set(day, (map.get(day) ?? 0) + 1)
    return map
  }, new Map())

  const activityPoints = positivePoints(
    sortByLabel(Array.from(byDay.entries()).map(([label, value]) => ({ label, value }))),
  )

  if (activityPoints.length >= MIN_TIME_SERIES_POINTS) {
    charts.push({
      title: 'Messages over time',
      subtitle: 'Daily message volume in this export',
      kind: 'line',
      series: [{ name: 'Messages', points: activityPoints }],
    })
  }

  const senderChart = buildCategoryCountChart(rows, 'sender', 'Messages by sender', 'bar')
  if (senderChart) {
    charts.push({ ...senderChart, subtitle: 'Top contributors in this channel export' })
  }

  return filterMeaningfulCharts(charts).slice(0, MAX_EXPORT_CHARTS)
}

function detectDateField(row: Record<string, unknown>): string | null {
  for (const key of ['date', 'Date', 'day', 'Day', 'period', 'Period']) {
    if (key in row && String(row[key] ?? '').trim().length > 0) return key
  }
  return null
}

function detectNumericFields(rows: Record<string, unknown>[], exclude: Set<string>): string[] {
  const firstRow = rows[0]
  if (!firstRow) return []

  return Object.keys(firstRow)
    .filter((key) => !exclude.has(key))
    .flatMap((key) => {
      const total = rows.reduce((sum, row) => sum + parseNumeric(row[key]), 0)
      return total > MIN_TOTAL_VALUE ? [{ key, total }] : []
    })
    .toSorted((a, b) => b.total - a.total)
    .map((entry) => entry.key)
}

export function buildSpreadsheetChartsFromTableData(
  rows: Array<Record<string, unknown>>,
  title = 'Export summary',
): SpreadsheetChartSpec[] {
  if (rows.length === 0) return []

  const charts: SpreadsheetChartSpec[] = []
  const firstRow = rows[0]
  if (!firstRow) return charts

  if ('spend' in firstRow && 'date' in firstRow) {
    return buildAnalyticsExportCharts(rows)
  }

  const dateField = detectDateField(firstRow)

  if (dateField) {
    const numericFields = detectNumericFields(rows, new Set([dateField, 'platform', 'Platform', 'providerId']))
    const primaryFields = numericFields.slice(0, 2)

    if (primaryFields.length >= 2) {
      const combined = buildMultiMetricTimeSeriesChart(
        rows,
        dateField,
        primaryFields,
        `${title} trends`,
        'line',
        'Top numeric metrics over time',
      )
      if (combined) charts.push(combined)
    }

    for (const field of primaryFields) {
      const trend = buildTimeSeriesChart(rows, dateField, field, `${title}: ${formatFieldLabel(field)}`, 'line')
      if (trend) charts.push(trend)
    }
  }

  if ('date' in firstRow && 'value' in firstRow && charts.length === 0) {
    const trend = buildInteractiveChartExportSpec({
      title: `${title} trend`,
      kind: 'line',
      xAxisKey: 'date',
      dataKey: 'value',
      rows,
    })
    if (trend) charts.push(trend)
  }

  for (const field of ['Status', 'Priority', 'platform', 'Platform', 'category', 'Category', 'providerId']) {
    if (!(field in firstRow)) continue
    const chart = buildCategoryCountChart(rows, field, `${title} by ${formatFieldLabel(field)}`, 'pie')
    if (chart) charts.push(chart)
  }

  if (rows.length === 1) {
    const numericMetrics = Object.entries(firstRow).reduce<Record<string, number>>((acc, [key, value]) => {
      const parsed = parseNumeric(value)
      if (parsed > 0 && key !== 'value') acc[key] = parsed
      return acc
    }, {})

    const snapshot = buildMetricSnapshotChart(numericMetrics, `${title} snapshot`)
    if (snapshot) charts.push(snapshot)
  }

  return filterMeaningfulCharts(charts).slice(0, MAX_EXPORT_CHARTS)
}

export function buildInteractiveChartExportSpec(options: {
  title: string
  kind: SpreadsheetChartKind
  xAxisKey: string
  dataKey: string
  rows: Array<Record<string, unknown>>
}): SpreadsheetChartSpec | null {
  const points = options.rows.flatMap((row) => {
    const label = String(row[options.xAxisKey] ?? '')
    if (!label.length) return []
    return [{ label, value: parseNumeric(row[options.dataKey]) }]
  })

  if (points.length === 0) return null

  return {
    title: options.title,
    kind: options.kind,
    series: [{ name: String(options.dataKey), points: sortByLabel(points) }],
  }
}

