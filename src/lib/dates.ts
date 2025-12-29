import { format, parseISO, isValid, formatDistanceToNow as fdn } from 'date-fns'
import { formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz'

const DEFAULT_TIMEZONE = process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE || 'UTC'

/**
 * Formats a date string or object into a standardized format.
 */
export function formatDate(
  date: Date | string | number | null | undefined,
  formatStr = 'PPP',
  timeZone = DEFAULT_TIMEZONE
): string {
  if (!date) return ''
  const d = typeof date === 'string' ? parseISO(date) : new Date(date)
  if (!isValid(d)) return ''
  
  return formatInTimeZone(d, timeZone, formatStr)
}

/**
 * Formats a date as an ISO string in UTC.
 */
export function toISO(date: Date | string | number = new Date()): string {
  const d = typeof date === 'string' ? parseISO(date) : new Date(date)
  return d.toISOString()
}

/**
 * Returns a relative time string (e.g., "2 hours ago").
 */
export function formatRelativeTime(date: Date | string | number | null | undefined): string {
  if (!date) return ''
  const d = typeof date === 'string' ? parseISO(date) : new Date(date)
  if (!isValid(d)) return ''
  return fdn(d, { addSuffix: true })
}

/**
 * Parses a date string safely.
 */
export function parseDate(date: string | null | undefined): Date | null {
  if (!date) return null
  const d = parseISO(date)
  return isValid(d) ? d : null
}

/**
 * Converts a UTC date to a specific timezone.
 */
export function toLocalTime(date: Date | string | number, timeZone = DEFAULT_TIMEZONE): Date {
  const d = typeof date === 'string' ? parseISO(date) : new Date(date)
  return toZonedTime(d, timeZone)
}

/**
 * Converts a local date from a specific timezone back to UTC.
 */
export function toUtcTime(date: Date | string | number, timeZone = DEFAULT_TIMEZONE): Date {
  const d = typeof date === 'string' ? parseISO(date) : new Date(date)
  return fromZonedTime(d, timeZone)
}

/**
 * Standard date formats for the application.
 */
export const DATE_FORMATS = {
  SHORT: 'MMM d, yyyy',
  LONG: 'MMMM d, yyyy',
  WITH_TIME: 'MMM d, yyyy h:mm a',
  ISO_DATE: 'yyyy-MM-dd',
  MONTH_YEAR: 'MMMM yyyy',
}
