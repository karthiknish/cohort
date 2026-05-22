'use client'

import type { LucideIcon } from 'lucide-react'

import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme'
import { CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { cn } from '@/lib/utils'

type StatChip = {
  label: string
  value: string | number
}

type Props = {
  icon: LucideIcon
  eyebrow?: string
  title: string
  description?: React.ReactNode
  actions?: React.ReactNode
  stats?: StatChip[]
  className?: string
}

export function CampaignControlHeader({
  icon: Icon,
  eyebrow = 'Campaign settings',
  title,
  description,
  actions,
  stats,
  className,
}: Props) {
  return (
    <CardHeader className={cn('border-b border-border/50 pb-5', className)}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3.5">
            <div className={ADS_PAGE_THEME.controlHeaderIcon}>
              <Icon className="size-5 text-primary" aria-hidden />
            </div>
            <div className="min-w-0 space-y-1">
              <p className={ADS_PAGE_THEME.sectionEyebrow}>{eyebrow}</p>
              <CardTitle className="text-lg font-semibold tracking-tight">{title}</CardTitle>
              {description ? (
                <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
              ) : null}
            </div>
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
        </div>

        {stats && stats.length > 0 ? (
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className={ADS_PAGE_THEME.controlStatChip}>
                <span className={ADS_PAGE_THEME.controlStatChipLabel}>{stat.label}</span>
                <span className={ADS_PAGE_THEME.controlStatChipValue}>{stat.value}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </CardHeader>
  )
}
