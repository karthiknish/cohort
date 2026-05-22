'use client'

import { AlertCircle, CheckCircle2, CircleDashed, Instagram, LoaderCircle, PlugZap } from 'lucide-react'

import { getBadgeClasses } from '@/lib/dashboard-theme'
import { cn } from '@/lib/utils'
import { Badge } from '@/shared/ui/badge'

import type { SocialsSurfaceStatus } from './socials-state'

export type SurfaceTabBadge = {
  label: string
  className: string
  icon: typeof CheckCircle2
}

export function getSurfaceTabBadge(status: SocialsSurfaceStatus): SurfaceTabBadge {
  switch (status) {
    case 'ready':
      return { label: 'Live', className: getBadgeClasses('success'), icon: CheckCircle2 }
    case 'loading':
      return { label: 'Loading', className: getBadgeClasses('primary'), icon: LoaderCircle }
    case 'source_required':
      return { label: 'Setup', className: getBadgeClasses('warning'), icon: CircleDashed }
    case 'empty':
      return { label: 'No IG link', className: getBadgeClasses('secondary'), icon: Instagram }
    case 'error':
      return { label: 'Error', className: getBadgeClasses('destructive'), icon: AlertCircle }
    case 'disconnected':
      return { label: 'Offline', className: getBadgeClasses('secondary'), icon: PlugZap }
    default:
      return { label: 'Pending', className: getBadgeClasses('secondary'), icon: CircleDashed }
  }
}

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
