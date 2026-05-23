import { COHORTS_SPREADSHEET_THEME } from './cohorts-spreadsheet-theme'

import {
  CHART_HEIGHT,
  CHART_PADDING,
  CHART_WIDTH,
  DEFAULT_COLORS,
  MIN_CATEGORY_POINTS,
  MIN_TIME_SERIES_POINTS,
  collapseSmallPieSlices,
  computeAxisMax,
  createAxisValueFormatter,
  filterMeaningfulCharts,
  positivePoints,
  sortByLabel,
  truncateLabel,
  type SpreadsheetChartImage,
  type SpreadsheetChartPoint,
  type SpreadsheetChartSeries,
  type SpreadsheetChartSpec,
} from './cohorts-spreadsheet-chart-specs'

function drawChartFrame(ctx: CanvasRenderingContext2D, title: string, subtitle?: string) {
  const theme = COHORTS_SPREADSHEET_THEME

  ctx.fillStyle = `#${theme.colors.white.slice(2)}`
  ctx.fillRect(0, 0, CHART_WIDTH, CHART_HEIGHT)

  ctx.strokeStyle = `#${theme.colors.border.slice(2)}`
  ctx.lineWidth = 1
  ctx.strokeRect(0.5, 0.5, CHART_WIDTH - 1, CHART_HEIGHT - 1)

  ctx.fillStyle = `#${theme.colors.foreground.slice(2)}`
  ctx.font = 'bold 16px Calibri, Arial, sans-serif'
  ctx.fillText(title, CHART_PADDING.left, 28)

  if (subtitle?.trim()) {
    ctx.fillStyle = `#${theme.colors.mutedForeground.slice(2)}`
    ctx.font = '12px Calibri, Arial, sans-serif'
    ctx.fillText(truncateLabel(subtitle.trim(), 72), CHART_PADDING.left, 44)
  }

  ctx.fillStyle = `#${theme.colors.primary.slice(2)}`
  ctx.fillRect(CHART_PADDING.left, subtitle?.trim() ? 50 : 36, 28, 3)
}

function drawSeriesLegend(
  ctx: CanvasRenderingContext2D,
  series: SpreadsheetChartSeries[],
  plot: { x: number; y: number; width: number },
) {
  if (series.length <= 1) return

  const theme = COHORTS_SPREADSHEET_THEME
  ctx.font = '11px Calibri, Arial, sans-serif'

  series.forEach((entry, index) => {
    const color = entry.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]!
    const x = plot.x + plot.width - 148
    const y = plot.y + 8 + index * 18

    ctx.fillStyle = color
    ctx.fillRect(x, y - 8, 10, 10)
    ctx.fillStyle = `#${theme.colors.foreground.slice(2)}`
    ctx.fillText(truncateLabel(entry.name, 16), x + 14, y)
  })
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
  const activeSeries = spec.series.flatMap((series) => {
    const points = sortByLabel(positivePoints(series.points))
    return points.length >= MIN_TIME_SERIES_POINTS ? [{ series, points }] : []
  })

  if (activeSeries.length === 0) return

  const labels = Array.from(
    new Set(activeSeries.flatMap(({ points }) => points.map((point) => point.label))),
  ).toSorted((a, b) => {
    const aTime = Date.parse(a)
    const bTime = Date.parse(b)
    if (!Number.isNaN(aTime) && !Number.isNaN(bTime)) return aTime - bTime
    return a.localeCompare(b)
  })

  const maxValue = computeAxisMax(
    activeSeries.flatMap(({ points }) => points.map((point) => point.value)),
  )
  const plot = getPlotArea()

  drawAxes(ctx, labels, maxValue, valueFormatter)
  drawSeriesLegend(ctx, activeSeries.map(({ series }) => series), plot)

  const step = labels.length > 1 ? plot.width / (labels.length - 1) : 0

  activeSeries.forEach(({ series, points }, seriesIndex) => {
    const color = series.color ?? DEFAULT_COLORS[seriesIndex % DEFAULT_COLORS.length]!
    const valueByLabel = new Map(points.map((point) => [point.label, point.value]))
    const coords = labels.flatMap((label, index) => {
      const value = valueByLabel.get(label)
      if (value === undefined) return []
      const x = plot.x + step * index
      const y = plot.y + plot.height - (value / maxValue) * plot.height
      return [{ x, y }]
    })

    if (coords.length < 2) return

    if (filled && activeSeries.length === 1) {
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
  })
}

function renderBarChart(
  ctx: CanvasRenderingContext2D,
  spec: SpreadsheetChartSpec,
  valueFormatter: (value: number) => string,
) {
  const series = spec.series[0]
  if (!series || series.points.length === 0) return

  const points = positivePoints(series.points)
  if (points.length < MIN_CATEGORY_POINTS) return

  const labels = points.map((point) => point.label)
  const maxValue = computeAxisMax(points.map((point) => point.value))
  const plot = getPlotArea()

  drawAxes(ctx, labels, maxValue, valueFormatter)

  const barWidth = Math.min(42, (plot.width / points.length) * 0.65)
  const gap = (plot.width - barWidth * points.length) / Math.max(points.length + 1, 1)

  points.forEach((point: SpreadsheetChartPoint, index: number) => {
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

  const points = collapseSmallPieSlices(series.points)
  const total = points.reduce((sum: number, point: SpreadsheetChartPoint) => sum + point.value, 0)
  if (total <= 0) return

  const centerX = CHART_PADDING.left + 110
  const centerY = CHART_PADDING.top + 110
  const radius = 88
  let startAngle = -Math.PI / 2

  points.forEach((point: SpreadsheetChartPoint, index: number) => {
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

  points.forEach((point: SpreadsheetChartPoint, index: number) => {
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

  const axisValues = spec.series.flatMap((series) => series.points.map((point) => point.value))
  const axisMax = computeAxisMax(axisValues)
  const valueFormatter = spec.valueFormatter ?? createAxisValueFormatter(axisMax)

  drawChartFrame(ctx, spec.title, spec.subtitle)

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
  return filterMeaningfulCharts(specs)
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
