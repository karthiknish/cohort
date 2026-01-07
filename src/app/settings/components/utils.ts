// Settings page utility functions and constants

import { DATE_FORMATS, formatDate as formatDateLib } from '@/lib/dates'

export const subscriptionStatusStyles: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  trialing: 'bg-blue-100 text-blue-700',
  past_due: 'bg-amber-100 text-amber-700',
  canceled: 'bg-muted text-muted-foreground border border-border/50',
  unpaid: 'bg-red-100 text-red-700',
  incomplete: 'bg-amber-100 text-amber-700',
  incomplete_expired: 'bg-gray-200 text-gray-600',
  paused: 'bg-slate-200 text-slate-700',
}

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

/**
 * Format an invoice amount with currency.
 */
export function formatInvoiceAmount(
  amount: number | null,
  currency: string | null
): string | null {
  if (amount === null) return null
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: (currency || 'usd').toUpperCase(),
      minimumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `$${amount.toFixed(2)}`
  }
}

/**
 * Determine invoice badge variant based on status.
 */
export function getInvoiceBadgeVariant(
  status: string | null,
  isOutstanding: boolean
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (isOutstanding) return 'destructive'
  if (status === 'paid') return 'secondary'
  return 'outline'
}

/**
 * Check if an invoice status is considered outstanding.
 */
export function isInvoiceOutstanding(status: string | null): boolean {
  return status === 'open' || status === 'uncollectible'
}
