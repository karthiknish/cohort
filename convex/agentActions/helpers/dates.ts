import type { ReportPeriod } from '../types'

import { asNumber } from './values'

function parseDateToMs(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value !== 'string') return null
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : null
}

function toIsoDate(value: Date): string {
  return value.toISOString().slice(0, 10)
}

function toStartOfUtcDayMs(isoDate: string): number {
  return Date.parse(`${isoDate}T00:00:00.000Z`)
}

function toEndOfUtcDayMs(isoDate: string): number {
  return Date.parse(`${isoDate}T23:59:59.999Z`)
}

function getLocalDayStamp(value: number): number {
  const date = new Date(value)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

function messageSpecifiesYear(value: string | null | undefined): boolean {
  if (typeof value !== 'string') return false
  return /\b(19|20)\d{2}\b/.test(value)
}

function rollDateForwardToFuture(inputMs: number, nowMs: number): number {
  const next = new Date(inputMs)
  const now = new Date(nowMs)

  while (
    next.getUTCFullYear() < now.getUTCFullYear() ||
    (next.getUTCFullYear() === now.getUTCFullYear() && next.getTime() <= nowMs)
  ) {
    next.setUTCFullYear(next.getUTCFullYear() + 1)
  }

  return next.getTime()
}

function resolveAgentDueDateMs(args: {
  dueDateMs: unknown
  dueDate: unknown
  rawMessage?: string
  nowMs: number
}): number | null {
  const parsedDueDateMs = asNumber(args.dueDateMs) ?? parseDateToMs(args.dueDate)
  if (parsedDueDateMs === null) return null

  if (getLocalDayStamp(parsedDueDateMs) >= getLocalDayStamp(args.nowMs)) {
    return parsedDueDateMs
  }

  if (messageSpecifiesYear(args.rawMessage)) {
    return parsedDueDateMs
  }

  return rollDateForwardToFuture(parsedDueDateMs, args.nowMs)
}

function normalizeParsedDate(value: unknown): string | null {
  const parsed = parseDateToMs(value)
  if (parsed === null) return null
  return toIsoDate(new Date(parsed))
}

function parseDateRangeFromIntent(message: string): { startDate: string; endDate: string } | null {
  const rangePatterns = [
    /(?:from|between)\s+([A-Za-z]+\s+\d{1,2}(?:,\s*\d{4})?|\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4})\s+(?:to|and|through|thru|-|until)\s+([A-Za-z]+\s+\d{1,2}(?:,\s*\d{4})?|\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    /([A-Za-z]+\s+\d{1,2}(?:,\s*\d{4})?|\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4})\s*(?:to|through|thru|-|until)\s*([A-Za-z]+\s+\d{1,2}(?:,\s*\d{4})?|\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4})/i,
  ]

  for (const pattern of rangePatterns) {
    const match = message.match(pattern)
    if (!match) continue

    const startDate = normalizeParsedDate(match[1])
    const endDate = normalizeParsedDate(match[2])
    if (startDate && endDate) {
      return startDate <= endDate ? { startDate, endDate } : { startDate: endDate, endDate: startDate }
    }
  }

  const singleDateMatch = message.match(/(?:for|on)\s+([A-Za-z]+\s+\d{1,2}(?:,\s*\d{4})?|\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4})/i)
  if (!singleDateMatch) return null

  const singleDate = normalizeParsedDate(singleDateMatch[1])
  return singleDate ? { startDate: singleDate, endDate: singleDate } : null
}

function getPeriodWindow(period: ReportPeriod): {
  periodLabel: string
  startDate: string
  endDate: string
  startDateMs: number
  endDateMs: number
} {
  const end = new Date()
  const start = new Date(end)

  if (period === 'daily') {
    start.setDate(start.getDate())
  } else if (period === 'monthly') {
    start.setDate(start.getDate() - 29)
  } else {
    start.setDate(start.getDate() - 6)
  }

  const periodLabel = period.charAt(0).toUpperCase() + period.slice(1)
  const startDate = toIsoDate(start)
  const endDate = toIsoDate(end)

  return {
    periodLabel,
    startDate,
    endDate,
    startDateMs: toStartOfUtcDayMs(startDate),
    endDateMs: toEndOfUtcDayMs(endDate),
  }
}

function resolveReportWindow(period: ReportPeriod, params: Record<string, unknown>): {
  periodLabel: string
  startDate: string
  endDate: string
  startDateMs: number
  endDateMs: number
} {
  const requestedStart = normalizeParsedDate(params.startDate ?? params.fromDate ?? params.start)
  const requestedEnd = normalizeParsedDate(params.endDate ?? params.toDate ?? params.end)

  if (!requestedStart && !requestedEnd) {
    return getPeriodWindow(period)
  }

  const startDate = requestedStart ?? requestedEnd ?? getPeriodWindow(period).startDate
  const endDate = requestedEnd ?? requestedStart ?? startDate
  const sortedStart = startDate <= endDate ? startDate : endDate
  const sortedEnd = startDate <= endDate ? endDate : startDate

  return {
    periodLabel: 'Custom',
    startDate: sortedStart,
    endDate: sortedEnd,
    startDateMs: toStartOfUtcDayMs(sortedStart),
    endDateMs: toEndOfUtcDayMs(sortedEnd),
  }
}

export {
  getPeriodWindow,
  parseDateRangeFromIntent,
  parseDateToMs,
  resolveAgentDueDateMs,
  resolveReportWindow,
  toIsoDate,
}