'use client'

import type { ReactNode } from 'react'

import { useClientRelativeTime } from '@/lib/hooks/use-client-relative-time'
import { cn } from '@/lib/utils'

type ClientRelativeTimeProps = {
  value: string | number | Date | null | undefined
  className?: string
  children?: (label: string) => ReactNode
}

export function ClientRelativeTime({ value, className, children }: ClientRelativeTimeProps) {
  const label = useClientRelativeTime(value)

  if (!label) {
    return null
  }

  if (children) {
    return <>{children(label)}</>
  }

  return (
    <span className={cn(className)} suppressHydrationWarning>
      {label}
    </span>
  )
}
