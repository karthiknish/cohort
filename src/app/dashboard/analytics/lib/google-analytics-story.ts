export type AnalyticsTotals = {
  users: number
  sessions: number
  conversions: number
  revenue: number
}

export type DailyAnalyticsPoint = {
  date: string
  users: number
  sessions: number
  conversions: number
  revenue: number
  conversionRate?: number
}

export type MetricDelta = {
  current: number
  previous: number
  deltaPercent: number | null
  direction: 'up' | 'down' | 'flat' | 'new'
}

export type GoogleAnalyticsStory = {
  activeDays: number
  coverageRatio: number
  momentum: 'up' | 'down' | 'steady'
  deltas: Record<'users' | 'sessions' | 'conversions' | 'revenue', MetricDelta>
  topSessionsDay: DailyAnalyticsPoint | null
  topConversionDay: DailyAnalyticsPoint | null
  topRevenueDay: DailyAnalyticsPoint | null
}

function buildDelta(current: number, previous: number): MetricDelta {
  if (previous <= 0) {
    return { current, previous, deltaPercent: null, direction: current > 0 ? 'new' : 'flat' }
  }

  const deltaPercent = ((current - previous) / previous) * 100
  if (Math.abs(deltaPercent) < 1) return { current, previous, deltaPercent, direction: 'flat' }
  return { current, previous, deltaPercent, direction: deltaPercent > 0 ? 'up' : 'down' }
}

function pickTopDay(chartData: DailyAnalyticsPoint[], key: 'sessions' | 'conversions' | 'revenue') {
  if (chartData.length === 0) return null
  return chartData.reduce<DailyAnalyticsPoint | null>((best, point) => {
    if (!best) return point
    return point[key] > best[key] ? point : best
  }, null)
}

export function buildGoogleAnalyticsStory(params: {
  currentTotals: AnalyticsTotals
  previousTotals: AnalyticsTotals
  chartData: DailyAnalyticsPoint[]
  selectedRangeDays: number
}): GoogleAnalyticsStory {
  const { currentTotals, previousTotals, chartData, selectedRangeDays } = params
  const deltas = {
    users: buildDelta(currentTotals.users, previousTotals.users),
    sessions: buildDelta(currentTotals.sessions, previousTotals.sessions),
    conversions: buildDelta(currentTotals.conversions, previousTotals.conversions),
    revenue: buildDelta(currentTotals.revenue, previousTotals.revenue),
  }

  const positiveSignals = Object.values(deltas).filter((delta) => delta.direction === 'up' || delta.direction === 'new').length
  const negativeSignals = Object.values(deltas).filter((delta) => delta.direction === 'down').length

  return {
    activeDays: chartData.length,
    coverageRatio: selectedRangeDays > 0 ? chartData.length / selectedRangeDays : 0,
    momentum: positiveSignals > negativeSignals ? 'up' : negativeSignals > positiveSignals ? 'down' : 'steady',
    deltas,
    topSessionsDay: pickTopDay(chartData, 'sessions'),
    topConversionDay: pickTopDay(chartData, 'conversions'),
    topRevenueDay: pickTopDay(chartData, 'revenue'),
  }
}