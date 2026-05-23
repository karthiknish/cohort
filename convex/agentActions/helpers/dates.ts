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

function getUtcCalendarMonthBounds(year: number, monthIndex: number): { startDate: string; endDate: string } {
  const start = new Date(Date.UTC(year, monthIndex, 1))
  const end = new Date(Date.UTC(year, monthIndex + 1, 0))
  return { startDate: toIsoDate(start), endDate: toIsoDate(end) }
}

function getPreviousCalendarMonthRange(nowMs: number = Date.now()): { startDate: string; endDate: string } {
  const now = new Date(nowMs)
  const monthIndex = now.getUTCMonth()
  const year = now.getUTCFullYear()
  const prevMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1
  const prevYear = monthIndex === 0 ? year - 1 : year
  return getUtcCalendarMonthBounds(prevYear, prevMonthIndex)
}

function getCurrentCalendarMonthRange(nowMs: number = Date.now()): { startDate: string; endDate: string } {
  const now = new Date(nowMs)
  return {
    startDate: toIsoDate(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))),
    endDate: toIsoDate(now),
  }
}

function getPreviousCalendarYearRange(nowMs: number = Date.now()): { startDate: string; endDate: string } {
  const year = new Date(nowMs).getUTCFullYear() - 1
  return {
    startDate: toIsoDate(new Date(Date.UTC(year, 0, 1))),
    endDate: toIsoDate(new Date(Date.UTC(year, 11, 31))),
  }
}

function getCalendarQuarterBounds(year: number, quarterIndex: number): { startDate: string; endDate: string } {
  const startMonth = quarterIndex * 3
  const start = new Date(Date.UTC(year, startMonth, 1))
  const end = new Date(Date.UTC(year, startMonth + 3, 0))
  return { startDate: toIsoDate(start), endDate: toIsoDate(end) }
}

function getPreviousCalendarQuarterRange(nowMs: number = Date.now()): { startDate: string; endDate: string } {
  const now = new Date(nowMs)
  const quarterIndex = Math.floor(now.getUTCMonth() / 3)
  if (quarterIndex === 0) {
    return getCalendarQuarterBounds(now.getUTCFullYear() - 1, 3)
  }
  return getCalendarQuarterBounds(now.getUTCFullYear(), quarterIndex - 1)
}

function getCurrentCalendarQuarterRange(nowMs: number = Date.now()): { startDate: string; endDate: string } {
  const now = new Date(nowMs)
  const quarterIndex = Math.floor(now.getUTCMonth() / 3)
  return {
    startDate: getCalendarQuarterBounds(now.getUTCFullYear(), quarterIndex).startDate,
    endDate: toIsoDate(now),
  }
}

function getNamedCalendarQuarterRange(
  quarterIndex: number,
  year: number | null,
  nowMs: number = Date.now(),
): { startDate: string; endDate: string } | null {
  if (quarterIndex < 0 || quarterIndex > 3) return null
  const resolvedYear = year ?? new Date(nowMs).getUTCFullYear()
  const bounds = getCalendarQuarterBounds(resolvedYear, quarterIndex)
  const now = new Date(nowMs)
  if (resolvedYear === now.getUTCFullYear() && quarterIndex === Math.floor(now.getUTCMonth() / 3)) {
    return { startDate: bounds.startDate, endDate: toIsoDate(now) }
  }
  return bounds
}

function getCurrentCalendarYearRange(nowMs: number = Date.now()): { startDate: string; endDate: string } {
  const now = new Date(nowMs)
  return {
    startDate: toIsoDate(new Date(Date.UTC(now.getUTCFullYear(), 0, 1))),
    endDate: toIsoDate(now),
  }
}

function formatShortDateRangeLabel(startDate: string, endDate: string): string {
  const start = new Date(`${startDate}T12:00:00.000Z`)
  const end = new Date(`${endDate}T12:00:00.000Z`)
  const monthDay = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
  const monthDayYear = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })

  if (startDate === endDate) {
    return monthDayYear.format(start)
  }

  const sameYear = start.getUTCFullYear() === end.getUTCFullYear()
  const sameMonth = sameYear && start.getUTCMonth() === end.getUTCMonth()

  if (sameMonth) {
    return `${monthDay.format(start)}–${end.getUTCDate()}, ${end.getUTCFullYear()}`
  }

  if (sameYear) {
    return `${monthDay.format(start)} – ${monthDayYear.format(end)}`
  }

  return `${monthDayYear.format(start)} – ${monthDayYear.format(end)}`
}

function resolvePeriodLabelForExplicitRange(
  startDate: string,
  endDate: string,
  nowMs: number = Date.now(),
): string {
  const lastMonth = getPreviousCalendarMonthRange(nowMs)
  if (startDate === lastMonth.startDate && endDate === lastMonth.endDate) {
    return 'Last month'
  }

  const thisMonth = getCurrentCalendarMonthRange(nowMs)
  if (startDate === thisMonth.startDate && endDate === thisMonth.endDate) {
    return 'This month'
  }

  const lastYear = getPreviousCalendarYearRange(nowMs)
  if (startDate === lastYear.startDate && endDate === lastYear.endDate) {
    return 'Last year'
  }

  const thisYear = getCurrentCalendarYearRange(nowMs)
  if (startDate === thisYear.startDate && endDate === thisYear.endDate) {
    return 'This year'
  }

  const lastQuarter = getPreviousCalendarQuarterRange(nowMs)
  if (startDate === lastQuarter.startDate && endDate === lastQuarter.endDate) {
    return 'Last quarter'
  }

  const thisQuarter = getCurrentCalendarQuarterRange(nowMs)
  if (startDate === thisQuarter.startDate && endDate === thisQuarter.endDate) {
    return 'This quarter'
  }

  const yesterday = new Date(nowMs)
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)
  const yesterdayDate = toIsoDate(yesterday)
  if (startDate === yesterdayDate && endDate === yesterdayDate) {
    return 'Yesterday'
  }

  const todayDate = toIsoDate(new Date(nowMs))
  if (startDate === todayDate && endDate === todayDate) {
    return 'Today'
  }

  return formatShortDateRangeLabel(startDate, endDate)
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

function normalizeIntentDateHints(message: string): string {
  return message
    .toLowerCase()
    .replace(/\b(ast|lst|lasr|lsat|lat|lastt)\s+month\b/g, 'last month')
    .replace(/\bfrom\s+[;1]?\s*ast\s+month\b/g, 'from last month')
    .replace(/[;1]ast\s+month/g, 'last month')
    .replace(/\b1ast\s+week\b/g, 'last week')
    .replace(/\b1ast\s+year\b/g, 'last year')
}

function parseRelativeDayRangeFromIntent(
  message: string,
  nowMs: number = Date.now(),
): { startDate: string; endDate: string } | null {
  const normalized = normalizeIntentDateHints(message).replace(/\s+/g, ' ').trim()
  const end = new Date(nowMs)

  const lastDaysMatch = normalized.match(/(?:last|past|previous)\s+(\d{1,4})\s+days?/)
  if (lastDaysMatch) {
    const days = Number.parseInt(lastDaysMatch[1] ?? '', 10)
    if (Number.isFinite(days) && days > 0 && days <= 3650) {
      const start = new Date(end)
      start.setDate(start.getDate() - (days - 1))
      return { startDate: toIsoDate(start), endDate: toIsoDate(end) }
    }
  }

  if (/(?:this|current)\s+month\b/.test(normalized)) {
    return getCurrentCalendarMonthRange(nowMs)
  }

  if (/(?:last|past|previous|prior)\s+month\b/.test(normalized)) {
    return getPreviousCalendarMonthRange(nowMs)
  }

  const lastMonthsMatch = normalized.match(/(?:last|past|previous)\s+(\d{1,2})\s+months?/)
  if (lastMonthsMatch) {
    const months = Number.parseInt(lastMonthsMatch[1] ?? '', 10)
    if (Number.isFinite(months) && months > 0 && months <= 36) {
      if (months === 1) {
        return getPreviousCalendarMonthRange(nowMs)
      }
      const start = new Date(end)
      start.setMonth(start.getMonth() - months)
      start.setDate(start.getDate() + 1)
      return { startDate: toIsoDate(start), endDate: toIsoDate(end) }
    }
  }

  if (/(?:last|past|previous)\s+week\b/.test(normalized)) {
    const start = new Date(end)
    start.setDate(start.getDate() - 6)
    return { startDate: toIsoDate(start), endDate: toIsoDate(end) }
  }

  if (/(?:this|current)\s+week\b/.test(normalized)) {
    const now = new Date(nowMs)
    const daysFromMonday = (now.getUTCDay() + 6) % 7
    const start = new Date(nowMs)
    start.setUTCDate(start.getUTCDate() - daysFromMonday)
    return { startDate: toIsoDate(start), endDate: toIsoDate(now) }
  }

  if (/\byesterday\b/.test(normalized)) {
    const day = new Date(nowMs)
    day.setUTCDate(day.getUTCDate() - 1)
    const iso = toIsoDate(day)
    return { startDate: iso, endDate: iso }
  }

  if (/\btoday\b/.test(normalized) && !/(?:due today|tasks today|tasks for today)\b/.test(normalized)) {
    const iso = toIsoDate(end)
    return { startDate: iso, endDate: iso }
  }

  if (/(?:last|past|previous|prior)\s+quarter\b/.test(normalized)) {
    return getPreviousCalendarQuarterRange(nowMs)
  }

  if (/(?:this|current)\s+quarter\b/.test(normalized)) {
    return getCurrentCalendarQuarterRange(nowMs)
  }

  const quarterNumberMatch = normalized.match(/\bq([1-4])\b(?:\s*(20\d{2}))?/)
  if (quarterNumberMatch) {
    const quarterIndex = Number.parseInt(quarterNumberMatch[1] ?? '', 10) - 1
    const year = quarterNumberMatch[2] ? Number.parseInt(quarterNumberMatch[2], 10) : null
    const range = getNamedCalendarQuarterRange(quarterIndex, year, nowMs)
    if (range) return range
  }

  const quarterWordMatch = normalized.match(/\b(first|second|third|fourth)\s+quarter(?:\s+(20\d{2}))?/)
  if (quarterWordMatch) {
    const quarterIndex = ['first', 'second', 'third', 'fourth'].indexOf(quarterWordMatch[1] ?? '')
    const year = quarterWordMatch[2] ? Number.parseInt(quarterWordMatch[2], 10) : null
    const range = getNamedCalendarQuarterRange(quarterIndex, year, nowMs)
    if (range) return range
  }

  if (/(?:this|current)\s+year\b/.test(normalized)) {
    return getCurrentCalendarYearRange(nowMs)
  }

  if (/(?:last|past|previous|prior)\s+year\b/.test(normalized)) {
    return getPreviousCalendarYearRange(nowMs)
  }

  return null
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
    periodLabel: resolvePeriodLabelForExplicitRange(sortedStart, sortedEnd),
    startDate: sortedStart,
    endDate: sortedEnd,
    startDateMs: toStartOfUtcDayMs(sortedStart),
    endDateMs: toEndOfUtcDayMs(sortedEnd),
  }
}

function resolveIntentDateRange(message: string): { startDate: string; endDate: string } | null {
  const hinted = normalizeIntentDateHints(message)
  return parseDateRangeFromIntent(hinted) ?? parseRelativeDayRangeFromIntent(hinted)
}

export {
  formatShortDateRangeLabel,
  getCalendarQuarterBounds,
  getCurrentCalendarMonthRange,
  getCurrentCalendarQuarterRange,
  getCurrentCalendarYearRange,
  getPeriodWindow,
  getPreviousCalendarMonthRange,
  getPreviousCalendarQuarterRange,
  getPreviousCalendarYearRange,
  parseDateRangeFromIntent,
  parseRelativeDayRangeFromIntent,
  parseDateToMs,
  resolveAgentDueDateMs,
  resolveIntentDateRange,
  resolvePeriodLabelForExplicitRange,
  resolveReportWindow,
  toIsoDate,
}