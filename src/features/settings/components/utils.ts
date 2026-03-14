// Settings page utility functions

import { DATE_FORMATS, formatDate as formatDateLib } from '@/lib/dates'

/**
 * Format a date string for display.
 */
export function formatDate(value: string | null | undefined): string {
  return formatDateLib(value, DATE_FORMATS.SHORT, undefined, 'Date unavailable')
}

/**
 * Compute avatar initials from a name or email.
 */
export function getAvatarInitials(name?: string | null, email?: string | null): string {
  const source = name?.trim() || email?.trim() || 'C'
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return 'C'
  }
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : ''
  const value = `${first}${last}`.toUpperCase()
  return value || 'C'
}
