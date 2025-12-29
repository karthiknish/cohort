import { 
  differenceInDays, 
  startOfDay, 
  subDays
} from 'date-fns'
import { parseDate, toISO, formatDate, DATE_FORMATS } from './dates'
import type { FinanceSummaryResponse } from '@/types/finance'
import type { TaskRecord } from '@/types/tasks'
import type { ClientComparisonSummary, DashboardTaskItem, MetricRecord } from '@/types/dashboard'
import { formatCurrency } from '@/lib/utils'
import { formatUserFacingErrorMessage } from '@/lib/user-friendly-error'

export async function resolveJson(response: Response, fallbackMessage: string): Promise<unknown> {
  if (response.ok) {
    return await response.json()
  }

  let message = fallbackMessage
  try {
    const payload = (await response.json()) as { error?: unknown }
    if (typeof payload?.error === 'string' && payload.error.trim().length > 0) {
      message = payload.error
    }
  } catch {
    // swallow JSON parse failures, fall back to default message
  }
  throw new Error(message)
}

type BuildComparisonSummaryArgs = {
  clientId: string
  clientName: string
  finance: FinanceSummaryResponse | null
  metrics: MetricRecord[]
  periodDays: number
}

export function buildClientComparisonSummary({ clientId, clientName, finance, metrics, periodDays }: BuildComparisonSummaryArgs): ClientComparisonSummary {
  const cutoff = subDays(new Date(), periodDays).getTime()
  const revenueRecords = finance?.revenue ?? []
  const filteredRevenue = revenueRecords.filter((record) => isRevenueRecordWithinPeriod(record, cutoff))
  const totalRevenue = filteredRevenue.reduce((sum, record) => sum + record.revenue, 0)
  const totalOperatingExpenses = filteredRevenue.reduce((sum, record) => sum + record.operatingExpenses, 0)

  const filteredMetrics = metrics.filter((record) => isMetricWithinPeriod(record, cutoff))
  const totalAdSpend = filteredMetrics.reduce((sum, record) => sum + record.spend, 0)
  const totalConversions = filteredMetrics.reduce((sum, record) => sum + record.conversions, 0)
  const roas = totalAdSpend > 0 ? totalRevenue / totalAdSpend : totalRevenue > 0 ? Number.POSITIVE_INFINITY : 0
  const cpa = totalConversions > 0 ? totalAdSpend / totalConversions : null

  const outstanding = sumOutstandingTotals(finance?.payments?.totals ?? [])
  const currency = determineDominantCurrency(finance)

  return {
    clientId,
    clientName,
    totalRevenue,
    totalOperatingExpenses,
    totalAdSpend,
    totalConversions,
    roas,
    cpa,
    outstanding,
    currency,
    periodDays,
  }
}

export function groupMetricsByClient(records: MetricRecord[]): Map<string | null, MetricRecord[]> {
  const map = new Map<string | null, MetricRecord[]>()
  records.forEach((record) => {
    const key = record.clientId ?? null
    const bucket = map.get(key)
    if (bucket) {
      bucket.push(record)
      return
    }
    map.set(key, [record])
  })
  return map
}

function sumOutstandingTotals(totals: { totalOutstanding: number; currency?: string | null }[]): number {
  if (!Array.isArray(totals) || totals.length === 0) {
    return 0
  }
  return totals.reduce((sum, entry) => sum + (Number.isFinite(entry.totalOutstanding) ? entry.totalOutstanding : 0), 0)
}

function determineDominantCurrency(finance: FinanceSummaryResponse | null): string {
  const revenueCurrency = finance?.revenue?.find((record) => typeof record.currency === 'string' && record.currency)?.currency
  if (revenueCurrency) {
    return revenueCurrency
  }
  const paymentsCurrency = finance?.payments?.totals?.find((total) => typeof total.currency === 'string' && total.currency)
  if (paymentsCurrency?.currency) {
    return paymentsCurrency.currency
  }
  return 'USD'
}

function isRevenueRecordWithinPeriod(record: { createdAt?: string | null; period?: string }, cutoff: number): boolean {
  const timestamp = parsePeriodDate(record)
  if (timestamp === null) {
    return true
  }
  return timestamp >= cutoff
}

function parsePeriodDate(record: { createdAt?: string | null; period?: string }): number | null {
  if (record.createdAt) {
    const parsed = parseDate(record.createdAt)
    if (parsed) {
      return parsed.getTime()
    }
  }
  if (record.period) {
    const parsedPeriod = parseDate(record.period)
    if (parsedPeriod) {
      return parsedPeriod.getTime()
    }
    // attempt to parse YYYY-MM strings by appending day
    const asMonth = parseDate(`${record.period}-01`)
    if (asMonth) {
      return asMonth.getTime()
    }
  }
  return null
}

function isMetricWithinPeriod(record: MetricRecord, cutoff: number): boolean {
  const timestamp = parseDateSafe(record.date) ?? parseDateSafe(record.createdAt ?? null)
  if (timestamp === null) {
    return true
  }
  return timestamp >= cutoff
}

function parseDateSafe(value: string | null | undefined): number | null {
  const parsed = parseDate(value)
  return parsed ? parsed.getTime() : null
}

export function formatRoas(value: number): string {
  if (value === Number.POSITIVE_INFINITY) {
    return 'INF'
  }
  if (!Number.isFinite(value) || value === 0) {
    return '—'
  }
  return `${value.toFixed(2)}x`
}

export function formatCpa(value: number | null, currency = 'USD'): string {
  if (value === null || !Number.isFinite(value)) {
    return '—'
  }
  return formatCurrency(value, currency)
}

export function mapTasksForDashboard(tasks: TaskRecord[]): DashboardTaskItem[] {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return []
  }

  const withSortKey = tasks
    .filter((task) => task.status !== 'completed')
    .map((task) => {
      const { label, timestamp } = deriveDueMetadata(task.dueDate)
      const rawTitle = typeof task.title === 'string' ? task.title.trim() : ''
      const rawClient = typeof task.client === 'string' ? task.client.trim() : ''
      return {
        id: task.id,
        title: rawTitle.length > 0 ? rawTitle : 'Untitled task',
        dueLabel: label,
        priority: normalizeTaskPriority(task.priority),
        clientName: rawClient.length > 0 ? rawClient : 'Internal',
        sortValue: timestamp,
      }
    })

  withSortKey.sort((a, b) => a.sortValue - b.sortValue)

  return withSortKey.slice(0, 5).map((task) => {
    const { sortValue, ...taskWithoutSort } = task
    void sortValue
    return taskWithoutSort
  })
}

function deriveDueMetadata(rawDue: string | null | undefined): { label: string; timestamp: number } {
  if (!rawDue) {
    return { label: 'No due date', timestamp: Number.MAX_SAFE_INTEGER }
  }

  const dueDate = parseDate(rawDue)
  if (!dueDate) {
    return { label: rawDue, timestamp: Number.MAX_SAFE_INTEGER }
  }

  const dueStart = startOfDay(dueDate).getTime()
  const todayStart = startOfDay(new Date()).getTime()
  const diffDays = differenceInDays(dueStart, todayStart)

  if (diffDays === 0) {
    return { label: 'Today', timestamp: dueStart }
  }

  if (diffDays === 1) {
    return { label: 'Tomorrow', timestamp: dueStart }
  }

  if (diffDays === -1) {
    return { label: 'Yesterday', timestamp: dueStart }
  }

  if (diffDays < -1) {
    const daysOverdue = Math.abs(diffDays)
    const suffix = daysOverdue === 1 ? 'day overdue' : 'days overdue'
    return { label: `${daysOverdue} ${suffix}`, timestamp: dueStart }
  }

  if (diffDays <= 7) {
    return { label: `In ${diffDays} days`, timestamp: dueStart }
  }

  return {
    label: formatDate(dueDate, DATE_FORMATS.SHORT),
    timestamp: dueStart,
  }
}

function normalizeTaskPriority(value: unknown): DashboardTaskItem['priority'] {
  if (value === 'low' || value === 'medium' || value === 'high' || value === 'urgent') {
    return value
  }
  return 'medium'
}

export function getErrorMessage(error: unknown, fallback: string): string {
  return formatUserFacingErrorMessage(error, fallback)
}
