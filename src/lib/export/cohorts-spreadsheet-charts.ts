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

const CHART_WIDTH = 640
const CHART_HEIGHT = 320
const CHART_PADDING = { top: 52, right: 24, bottom: 48, left: 56 }
const DEFAULT_COLORS = CHART_COLORS.primary

function parseNumeric(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, ''))
    if (Number.isFinite(parsed)) return parsed
  }
  return 0
}

function truncateLabel(label: string, max = 14): string {
  const trimmed = label.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 1)}…`
}

function sortByLabel(points: SpreadsheetChartPoint[]): SpreadsheetChartPoint[] {
  return [...points].sort((a, b) => {
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

  if (chartPoints.length === 0) return null

  return {
    title,
    kind,
    series: [{ name: field, points: chartPoints }],
  }
}

export function buildMetricSnapshotChart(
  metrics: Record<string, number>,
  title: string,
): SpreadsheetChartSpec | null {
  const points = Object.entries(metrics)
    .filter(([, value]) => Number.isFinite(value) && value > 0)
    .map(([label, value]) => ({ label, value }))

  if (points.length === 0) return null

  return {
    title,
    kind: 'bar',
    series: [{ name: 'Count', points: limitPoints(points, 8) }],
  }
}

export function buildTimeSeriesChart(
  rows: Record<string, unknown>[],
  dateField: string,
  valueField: string,
  title: string,
  kind: SpreadsheetChartKind = 'line',
): SpreadsheetChartSpec | null {
  const points = aggregateByDate(rows, dateField, valueField)
  if (points.length === 0) return null

  return {
    title,
    kind,
    series: [{ name: valueField, points }],
  }
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

  const spendTrend = buildTimeSeriesChart(rows, 'date', 'spend', 'Daily spend', 'area')
  if (spendTrend) charts.push(spendTrend)

  const revenueTrend = buildTimeSeriesChart(rows, 'date', 'revenue', 'Daily revenue', 'line')
  if (revenueTrend) charts.push(revenueTrend)

  const platformPoints = aggregateByField(rows, 'platform', 'spend')
  if (platformPoints.length > 0) {
    charts.push({
      title: 'Spend by platform',
      kind: 'pie',
      series: [{ name: 'Spend', points: platformPoints }],
    })
  }

  return charts
}

export function buildAdsMetricsCharts(
  rows: Array<{ date: string; providerId: string; spend: number }>,
): SpreadsheetChartSpec[] {
  const chartRows = rows.map((row) => ({
    date: row.date,
    providerId: row.providerId,
    spend: row.spend,
  }))

  const charts: SpreadsheetChartSpec[] = []

  const spendTrend = buildTimeSeriesChart(chartRows, 'date', 'spend', 'Daily ad spend', 'area')
  if (spendTrend) charts.push(spendTrend)

  const providerPoints = aggregateByField(chartRows, 'providerId', 'spend')
  if (providerPoints.length > 0) {
    charts.push({
      title: 'Spend by provider',
      kind: 'pie',
      series: [{ name: 'Spend', points: providerPoints }],
    })
  }

  return charts
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

  const activityPoints = sortByLabel(
    Array.from(byDay.entries()).map(([label, value]) => ({ label, value })),
  )

  if (activityPoints.length > 0) {
    charts.push({
      title: 'Messages over time',
      kind: 'line',
      series: [{ name: 'Messages', points: activityPoints }],
    })
  }

  const senderCounts = rows.reduce<Map<string, number>>((map, row) => {
    const sender = String(row.sender ?? 'Unknown').trim() || 'Unknown'
    map.set(sender, (map.get(sender) ?? 0) + 1)
    return map
  }, new Map())

  const senderChartPoints = limitPoints(
    Array.from(senderCounts.entries()).map(([label, value]) => ({ label, value })),
    8,
  )

  if (senderChartPoints.length > 0) {
    charts.push({
      title: 'Messages by sender',
      kind: 'bar',
      series: [{ name: 'Messages', points: senderChartPoints }],
    })
  }

  return charts
}

export function buildSpreadsheetChartsFromTableData(
  rows: Array<Record<string, unknown>>,
  title = 'Export summary',
): SpreadsheetChartSpec[] {
  if (rows.length === 0) return []

  const charts: SpreadsheetChartSpec[] = []
  const firstRow = rows[0]
  if (!firstRow) return charts

  if ('date' in firstRow && 'value' in firstRow) {
    const trend = buildInteractiveChartExportSpec({
      title: `${title} trend`,
      kind: 'line',
      xAxisKey: 'date',
      dataKey: 'value',
      rows,
    })
    if (trend) charts.push(trend)
  }

  for (const field of ['Status', 'Priority', 'platform', 'Platform', 'category', 'Category']) {
    if (!(field in firstRow)) continue
    const chart = buildCategoryCountChart(rows, field, `${title} by ${field.toLowerCase()}`, 'pie')
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

  if ('spend' in firstRow && 'date' in firstRow) {
    charts.push(...buildAnalyticsExportCharts(rows))
  }

  return charts.slice(0, 3)
}

export function buildInteractiveChartExportSpec(options: {
  title: string
  kind: SpreadsheetChartKind
  xAxisKey: string
  dataKey: string
  rows: Array<Record<string, unknown>>
}): SpreadsheetChartSpec | null {
  const points = options.rows
    .map((row) => ({
      label: String(row[options.xAxisKey] ?? ''),
      value: parseNumeric(row[options.dataKey]),
    }))
    .filter((point) => point.label.length > 0)

  if (points.length === 0) return null

  return {
    title: options.title,
    kind: options.kind,
    series: [{ name: String(options.dataKey), points: sortByLabel(points) }],
  }
}

function drawChartFrame(ctx: CanvasRenderingContext2D, title: string) {
  const theme = COHORTS_SPREADSHEET_THEME

  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, CHART_WIDTH, CHART_HEIGHT)

  ctx.strokeStyle = `#${theme.colors.border.slice(2)}`
  ctx.lineWidth = 1
  ctx.strokeRect(0.5, 0.5, CHART_WIDTH - 1, CHART_HEIGHT - 1)

  ctx.fillStyle = `#${theme.colors.foreground.slice(2)}`
  ctx.font = 'bold 16px Calibri, Arial, sans-serif'
  ctx.fillText(title, CHART_PADDING.left, 28)

  ctx.fillStyle = `#${theme.colors.primary.slice(2)}`
  ctx.fillRect(CHART_PADDING.left, 36, 28, 3)
}

function getPlotArea() {
  return {
    x: CHART_PADDING.left,
    y: CHART_PADDING.top,
    width: CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right,
    height: CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom,
  }
}

function drawAxes(
  ctx: CanvasRenderingContext2D,
  labels: string[],
  maxValue: number,
  valueFormatter: (value: number) => string,
) {
  const plot = getPlotArea()
  const theme = COHORTS_SPREADSHEET_THEME

  ctx.strokeStyle = `#${theme.colors.border.slice(2)}`
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(plot.x, plot.y)
  ctx.lineTo(plot.x, plot.y + plot.height)
  ctx.lineTo(plot.x + plot.width, plot.y + plot.height)
  ctx.stroke()

  ctx.fillStyle = `#${theme.colors.mutedForeground.slice(2)}`
  ctx.font = '11px Calibri, Arial, sans-serif'

  const ticks = 4
  for (let index = 0; index <= ticks; index += 1) {
    const ratio = index / ticks
    const value = maxValue * (1 - ratio)
    const y = plot.y + plot.height * ratio
    ctx.fillText(valueFormatter(value), 8, y + 4)

    ctx.strokeStyle = `#${theme.colors.muted.slice(2)}`
    ctx.beginPath()
    ctx.moveTo(plot.x, y)
    ctx.lineTo(plot.x + plot.width, y)
    ctx.stroke()
  }

  const step = labels.length > 1 ? plot.width / (labels.length - 1) : plot.width
  labels.forEach((label, index) => {
    const x = plot.x + step * index
    ctx.save()
    ctx.translate(x, plot.y + plot.height + 16)
    ctx.rotate(-Math.PI / 6)
    ctx.fillText(truncateLabel(label), 0, 0)
    ctx.restore()
  })
}

function renderLineLikeChart(
  ctx: CanvasRenderingContext2D,
  spec: SpreadsheetChartSpec,
  filled: boolean,
  valueFormatter: (value: number) => string,
) {
  const series = spec.series[0]
  if (!series || series.points.length === 0) return

  const points = sortByLabel(series.points)
  const labels = points.map((point) => point.label)
  const maxValue = Math.max(...points.map((point) => point.value), 1)
  const plot = getPlotArea()
  const color = series.color ?? DEFAULT_COLORS[0]!

  drawAxes(ctx, labels, maxValue, valueFormatter)

  const step = points.length > 1 ? plot.width / (points.length - 1) : 0
  const coords = points.map((point, index) => {
    const x = plot.x + step * index
    const y = plot.y + plot.height - (point.value / maxValue) * plot.height
    return { x, y }
  })

  if (filled) {
    ctx.beginPath()
    coords.forEach((coord, index) => {
      if (index === 0) ctx.moveTo(coord.x, coord.y)
      else ctx.lineTo(coord.x, coord.y)
    })
    ctx.lineTo(coords[coords.length - 1]?.x ?? plot.x, plot.y + plot.height)
    ctx.lineTo(coords[0]?.x ?? plot.x, plot.y + plot.height)
    ctx.closePath()
    ctx.fillStyle = `${color}33`
    ctx.fill()
  }

  ctx.strokeStyle = color
  ctx.lineWidth = 2.5
  ctx.beginPath()
  coords.forEach((coord, index) => {
    if (index === 0) ctx.moveTo(coord.x, coord.y)
    else ctx.lineTo(coord.x, coord.y)
  })
  ctx.stroke()

  ctx.fillStyle = color
  coords.forEach((coord) => {
    ctx.beginPath()
    ctx.arc(coord.x, coord.y, 3.5, 0, Math.PI * 2)
    ctx.fill()
  })
}

function renderBarChart(
  ctx: CanvasRenderingContext2D,
  spec: SpreadsheetChartSpec,
  valueFormatter: (value: number) => string,
) {
  const series = spec.series[0]
  if (!series || series.points.length === 0) return

  const points = series.points
  const labels = points.map((point) => point.label)
  const maxValue = Math.max(...points.map((point) => point.value), 1)
  const plot = getPlotArea()

  drawAxes(ctx, labels, maxValue, valueFormatter)

  const barWidth = Math.min(42, (plot.width / points.length) * 0.65)
  const gap = (plot.width - barWidth * points.length) / Math.max(points.length + 1, 1)

  points.forEach((point, index) => {
    const height = (point.value / maxValue) * plot.height
    const x = plot.x + gap + index * (barWidth + gap)
    const y = plot.y + plot.height - height
    const color = series.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]!

    ctx.fillStyle = color
    ctx.fillRect(x, y, barWidth, height)
  })
}

function renderPieChart(
  ctx: CanvasRenderingContext2D,
  spec: SpreadsheetChartSpec,
  valueFormatter: (value: number) => string,
) {
  const series = spec.series[0]
  if (!series || series.points.length === 0) return

  const points = series.points.filter((point) => point.value > 0)
  const total = points.reduce((sum, point) => sum + point.value, 0)
  if (total <= 0) return

  const centerX = CHART_PADDING.left + 110
  const centerY = CHART_PADDING.top + 110
  const radius = 88
  let startAngle = -Math.PI / 2

  points.forEach((point, index) => {
    const sliceAngle = (point.value / total) * Math.PI * 2
    const color = series.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]!

    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
    ctx.closePath()
    ctx.fillStyle = color
    ctx.fill()

    startAngle += sliceAngle
  })

  ctx.fillStyle = `#${COHORTS_SPREADSHEET_THEME.colors.foreground.slice(2)}`
  ctx.font = '12px Calibri, Arial, sans-serif'

  points.forEach((point, index) => {
    const y = CHART_PADDING.top + 24 + index * 24
    const color = DEFAULT_COLORS[index % DEFAULT_COLORS.length]!
    ctx.fillStyle = color
    ctx.fillRect(260, y - 10, 12, 12)
    ctx.fillStyle = `#${COHORTS_SPREADSHEET_THEME.colors.foreground.slice(2)}`
    ctx.fillText(`${truncateLabel(point.label, 18)} (${valueFormatter(point.value)})`, 280, y)
  })
}

export function renderSpreadsheetChartToBase64(spec: SpreadsheetChartSpec): string | null {
  if (typeof document === 'undefined') return null
  if (!spec.series.some((series) => series.points.length > 0)) return null

  const canvas = document.createElement('canvas')
  canvas.width = CHART_WIDTH
  canvas.height = CHART_HEIGHT

  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const valueFormatter = spec.valueFormatter ?? ((value: number) => {
    if (Math.abs(value) >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 0 })
    return value.toLocaleString(undefined, { maximumFractionDigits: 1 })
  })

  drawChartFrame(ctx, spec.title)

  switch (spec.kind) {
    case 'line':
      renderLineLikeChart(ctx, spec, false, valueFormatter)
      break
    case 'area':
      renderLineLikeChart(ctx, spec, true, valueFormatter)
      break
    case 'bar':
      renderBarChart(ctx, spec, valueFormatter)
      break
    case 'pie':
      renderPieChart(ctx, spec, valueFormatter)
      break
    default:
      return null
  }

  return canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '')
}

export function renderSpreadsheetCharts(specs: SpreadsheetChartSpec[]): SpreadsheetChartImage[] {
  return specs
    .map((spec) => {
      const base64 = renderSpreadsheetChartToBase64(spec)
      if (!base64) return null
      return {
        title: spec.title,
        base64,
        width: CHART_WIDTH,
        height: CHART_HEIGHT,
      }
    })
    .filter((chart): chart is SpreadsheetChartImage => chart !== null)
}
