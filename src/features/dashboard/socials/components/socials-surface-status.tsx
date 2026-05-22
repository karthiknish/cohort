'use client'

import { AlertCircle, CheckCircle2, CircleDashed, Instagram, LoaderCircle, PlugZap } from 'lucide-react'

import { getBadgeClasses } from '@/lib/dashboard-theme'
import { cn } from '@/lib/utils'
import { Badge } from '@/shared/ui/badge'

import type { SocialsSurfaceStatus } from './socials-state'

import { getSurfaceTabBadge } from './socials-surface-status-utils'

export function SurfaceTabStatusBadge({ status }: { status: SocialsSurfaceStatus }) {
  const { label, className, icon: Icon } = getSurfaceTabBadge(status)
  const spinning = status === 'loading'

  return (
    <Badge variant="outline" className={cn('ml-2 gap-1 border-0 px-2 py-0 text-[10px] font-semibold normal-case tracking-normal', className)}>
      <Icon className={cn('size-3', spinning && 'animate-spin')} aria-hidden />
      {label}
    </Badge>
  )
}
