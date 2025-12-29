import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  value: number,
  currency = 'USD',
  options: Intl.NumberFormatOptions = {},
) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
    ...options,
  }).format(value)
}

export function exportToCsv<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[]
) {
  if (!data.length) return

  const headers = columns
    ? columns.map((c) => c.label)
    : Object.keys(data[0]).map((k) => k.charAt(0).toUpperCase() + k.slice(1))

  const keys = columns ? columns.map((c) => c.key) : Object.keys(data[0])

  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      keys
        .map((key) => {
          const value = row[key]
          const sanitizedValue = sanitizeCsvValue(value)
          
          if (sanitizedValue.includes(',') || sanitizedValue.includes('"') || sanitizedValue.includes('\n')) {
            return `"${sanitizedValue.replace(/"/g, '""')}"`
          }
          return sanitizedValue
        })
        .join(',')
    ),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// Convert Firestore Timestamp-like, Date, or ISO strings to ISO string; fallback null
export function toISO(value: unknown): string | null {
  if (value === null || value === undefined) return null

  // Firestore Timestamp duck-typing
  if (typeof value === 'object' && value !== null) {
    const asDate = (value as { toDate?: () => Date }).toDate?.()
    if (asDate instanceof Date) {
      const iso = asDate.toISOString()
      return iso
    }
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (typeof value === 'string') {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString()
    }
    return value
  }

  return null
}

/**
 * Basic XSS protection by stripping HTML tags from strings.
 */
export function sanitizeInput(value: string): string {
  if (typeof value !== 'string') return value
  // Strip HTML tags and trim
  return value.replace(/<[^>]*>?/gm, '').trim()
}

/**
 * Sanitize a value for CSV export to prevent formula injection.
 * Prefixes values starting with =, +, -, or @ with a single quote.
 */
export function sanitizeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  const stringValue = String(value)
  
  // CSV Injection protection: if the value starts with a sensitive character, prefix with '
  if (/^[=+\-@\t\r]/.test(stringValue)) {
    return `'${stringValue}`
  }
  
  return stringValue
}

// Normalize arrays of strings, trimming and removing empties
export function coerceStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0)
}

// Coerce number from mixed inputs
export function coerceNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }
  return null
}

// Coerce boolean from mixed inputs
export function coerceBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim()
    return lower === 'true' || lower === '1' || lower === 'yes' || lower === 'on'
  }
  if (typeof value === 'number') return value !== 0
  return false
}

// Coerce Date from mixed inputs
export function coerceDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }
  // Firestore Timestamp
  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as any).toDate === 'function') {
    return (value as any).toDate()
  }
  return null
}
