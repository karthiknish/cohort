// =============================================================================
// TREND ANALYSIS ALGORITHMS
// =============================================================================

import type {
  MetricDataPoint,
  TimeSeriesPoint,
  TrendResult,
  AnomalyPoint,
} from './types'

/**
 * Calculate linear regression for trend analysis
 */
function linearRegression(points: number[]): { slope: number; intercept: number; r2: number } {
  const n = points.length
  if (n < 2) return { slope: 0, intercept: points[0] || 0, r2: 0 }

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0

  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += points[i]
    sumXY += i * points[i]
    sumX2 += i * i
    sumY2 += points[i] * points[i]
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  // Calculate R-squared
  const yMean = sumY / n
  let ssRes = 0, ssTot = 0
  for (let i = 0; i < n; i++) {
    const predicted = intercept + slope * i
    ssRes += (points[i] - predicted) ** 2
    ssTot += (points[i] - yMean) ** 2
  }
  const r2 = ssTot > 0 ? 1 - (ssRes / ssTot) : 0

  return { slope, intercept, r2 }
}

/**
 * Calculate exponential moving average
 */
function exponentialMovingAverage(points: number[], alpha: number = 0.3): number[] {
  if (points.length === 0) return []

  const ema: number[] = [points[0]]
  for (let i = 1; i < points.length; i++) {
    ema.push(alpha * points[i] + (1 - alpha) * ema[i - 1])
  }
  return ema
}

/**
 * Calculate momentum (weighted recent trend strength)
 */
function calculateMomentum(points: number[]): number {
  if (points.length < 3) return 50 // Neutral

  const recentCount = Math.min(7, Math.floor(points.length / 2))
  const recent = points.slice(-recentCount)
  const older = points.slice(0, -recentCount)

  const recentAvg = recent.reduce((s, v) => s + v, 0) / recent.length
  const olderAvg = older.length > 0 ? older.reduce((s, v) => s + v, 0) / older.length : recentAvg

  if (olderAvg === 0) return 50

  const change = (recentAvg - olderAvg) / olderAvg
  // Map to 0-100 scale, with 50 being neutral
  return Math.round(Math.min(100, Math.max(0, 50 + change * 100)))
}

/**
 * Detect anomalies using z-score
 */
function detectAnomalies(
  points: { date: string; value: number }[],
  threshold: number = 2.0
): AnomalyPoint[] {
  if (points.length < 5) return []

  const values = points.map(p => p.value)
  const mean = values.reduce((s, v) => s + v, 0) / values.length
  const stdDev = Math.sqrt(
    values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length
  )

  if (stdDev === 0) return []

  const anomalies: AnomalyPoint[] = []

  for (const point of points) {
    const zScore = (point.value - mean) / stdDev
    if (Math.abs(zScore) > threshold) {
      anomalies.push({
        date: point.date,
        value: point.value,
        expectedValue: mean,
        deviation: zScore,
        severity: Math.abs(zScore) > 3 ? 'high' : Math.abs(zScore) > 2.5 ? 'medium' : 'low',
      })
    }
  }

  return anomalies
}

/**
 * Detect seasonality (weekly patterns)
 */
function detectSeasonality(points: { date: string; value: number }[]): boolean {
  if (points.length < 14) return false // Need at least 2 weeks

  // Group by day of week
  const byDayOfWeek: Record<number, number[]> = {}
  for (const point of points) {
    const day = new Date(point.date).getDay()
    if (!byDayOfWeek[day]) byDayOfWeek[day] = []
    byDayOfWeek[day].push(point.value)
  }

  // Calculate variance within each day vs overall variance
  const allValues = points.map(p => p.value)
  const overallMean = allValues.reduce((s, v) => s + v, 0) / allValues.length
  const overallVar = allValues.reduce((s, v) => s + (v - overallMean) ** 2, 0) / allValues.length

  let withinDayVar = 0
  let dayCount = 0
  for (const values of Object.values(byDayOfWeek)) {
    if (values.length < 2) continue
    const dayMean = values.reduce((s, v) => s + v, 0) / values.length
    withinDayVar += values.reduce((s, v) => s + (v - dayMean) ** 2, 0)
    dayCount += values.length
  }
  withinDayVar /= dayCount

  // If within-day variance is significantly lower, seasonality exists
  return overallVar > 0 && (withinDayVar / overallVar) < 0.6
}

/**
 * Analyze trend for a specific metric
 */
export function analyzeTrend(
  dataPoints: MetricDataPoint[],
  metricKey: 'spend' | 'revenue' | 'clicks' | 'conversions' | 'impressions'
): TrendResult {
  // Sort by date
  const sorted = [...dataPoints].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const points = sorted.map(d => ({
    date: d.date,
    value: d[metricKey],
  }))

  const values = points.map(p => p.value)

  if (values.length < 2) {
    return {
      metric: metricKey,
      direction: 'stable',
      velocity: 0,
      acceleration: 0,
      momentum: 50,
      forecast7Day: values[0] || 0,
      confidence: 0,
      seasonalityDetected: false,
      anomalies: [],
    }
  }

  // Linear regression for trend
  const { slope, intercept, r2 } = linearRegression(values)

  // Determine direction
  const direction: 'up' | 'down' | 'stable' =
    slope > 0.01 ? 'up' : slope < -0.01 ? 'down' : 'stable'

  // Calculate acceleration (change in slope)
  const firstHalf = values.slice(0, Math.floor(values.length / 2))
  const secondHalf = values.slice(Math.floor(values.length / 2))
  const firstSlope = linearRegression(firstHalf).slope
  const secondSlope = linearRegression(secondHalf).slope
  const acceleration = secondSlope - firstSlope

  // Momentum
  const momentum = calculateMomentum(values)

  // Forecast
  const forecast7Day = intercept + slope * (values.length + 7)

  // Anomalies
  const anomalies = detectAnomalies(points)

  // Seasonality
  const seasonalityDetected = detectSeasonality(points)

  return {
    metric: metricKey,
    direction,
    velocity: slope,
    acceleration,
    momentum,
    forecast7Day: Math.max(0, forecast7Day),
    confidence: Math.min(1, Math.max(0, r2)),
    seasonalityDetected,
    anomalies,
  }
}

/**
 * Analyze multiple metrics and return comprehensive trend data
 */
export function analyzeAllTrends(dataPoints: MetricDataPoint[]): Record<string, TrendResult> {
  const metrics: Array<'spend' | 'revenue' | 'clicks' | 'conversions' | 'impressions'> = [
    'spend', 'revenue', 'clicks', 'conversions', 'impressions'
  ]

  const results: Record<string, TrendResult> = {}
  for (const metric of metrics) {
    results[metric] = analyzeTrend(dataPoints, metric)
  }

  // Calculate derived metric trends
  if (dataPoints.length > 0) {
    const roasPoints = dataPoints.map(d => ({
      date: d.date,
      value: d.spend > 0 ? d.revenue / d.spend : 0,
    }))
    results['roas'] = {
      ...analyzeTrend(dataPoints, 'revenue'),
      metric: 'roas',
      forecast7Day: roasPoints.length > 0
        ? roasPoints[roasPoints.length - 1].value
        : 0,
    }
  }

  return results
}

/**
 * Get trend chart data for visualization
 */
export function getTrendChartData(
  dataPoints: MetricDataPoint[],
  metricKey: string
): { date: string; actual: number; trend: number; forecast?: number }[] {
  const sorted = [...dataPoints].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const values = sorted.map(d => {
    if (metricKey === 'roas') {
      return d.spend > 0 ? d.revenue / d.spend : 0
    }
    return (d as any)[metricKey] || 0
  })

  const { slope, intercept } = linearRegression(values)
  const ema = exponentialMovingAverage(values)

  return sorted.map((d, i) => ({
    date: d.date,
    actual: values[i],
    trend: ema[i] || values[i],
    forecast: i === sorted.length - 1 ? intercept + slope * (i + 7) : undefined,
  }))
}
