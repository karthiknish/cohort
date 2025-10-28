import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}

export function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toString()
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function calculateROAS(revenue: number, spend: number): number {
  return spend > 0 ? revenue / spend : 0
}

export function calculateCTR(clicks: number, impressions: number): number {
  return impressions > 0 ? clicks / impressions : 0
}

export function calculateCPC(spend: number, clicks: number): number {
  return clicks > 0 ? spend / clicks : 0
}

export function calculateConversionRate(conversions: number, clicks: number): number {
  return clicks > 0 ? conversions / clicks : 0
}

export function calculateCPL(spend: number, leads: number): number {
  return leads > 0 ? spend / leads : 0
}

export function getDateRange(range: 'today' | 'week' | 'month' | 'quarter' | 'year'): { start: Date; end: Date } {
  const now = new Date()
  const start = new Date()
  const end = new Date()

  switch (range) {
    case 'today':
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      break
    case 'week':
      start.setDate(now.getDate() - now.getDay())
      start.setHours(0, 0, 0, 0)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      break
    case 'month':
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(now.getMonth() + 1, 0)
      end.setHours(23, 59, 59, 999)
      break
    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3)
      start.setMonth(quarter * 3, 1)
      start.setHours(0, 0, 0, 0)
      end.setMonth((quarter + 1) * 3, 0)
      end.setHours(23, 59, 59, 999)
      break
    case 'year':
      start.setMonth(0, 1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(11, 31)
      end.setHours(23, 59, 59, 999)
      break
  }

  return { start, end }
}
