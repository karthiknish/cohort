'use client'

import { useClientFormattedTime } from '@/lib/hooks/use-client-formatted-time'
import { cn } from '@/lib/utils'

type ClientFormattedDateProps = {
  value: string | number | Date | null | undefined
  formatStr: string
  className?: string
  fallback?: string | null
  dateTime?: string
}

export function ClientFormattedDate({
  value,
  formatStr,
  className,
  fallback = null,
  dateTime,
}: ClientFormattedDateProps) {
  const label = useClientFormattedTime(value, formatStr)

  if (!label) {
    return fallback ? <span className={cn(className)}>{fallback}</span> : null
  }

  if (dateTime) {
    return (
      <time className={cn(className)} dateTime={dateTime} suppressHydrationWarning>
        {label}
      </time>
    )
  }

  return (
    <span className={cn(className)} suppressHydrationWarning>
      {label}
    </span>
  )
}
