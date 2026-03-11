'use client'

import { BadgeCheck, CalendarRange, Share2 } from 'lucide-react'

import { FadeIn } from '@/components/ui/animate-in'
import { Badge } from '@/components/ui/badge'
import { DateRangePicker, type DateRange } from '@/app/dashboard/ads/components/date-range-picker'
import { DASHBOARD_THEME, PAGE_TITLES } from '@/lib/dashboard-theme'

type SocialsHeaderProps = {
  selectedClientName: string | null
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
}

export function SocialsHeader({
  selectedClientName,
  dateRange,
  onDateRangeChange,
}: SocialsHeaderProps) {
  return (
    <FadeIn>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-sm">
              <Share2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className={DASHBOARD_THEME.layout.title}>
                {PAGE_TITLES.socials?.title ?? 'Socials'}
              </h1>
              <p className={DASHBOARD_THEME.layout.subtitle}>
                {PAGE_TITLES.socials?.description ??
                  'Connect Facebook and Instagram surfaces, review performance, and keep AI social suggestions in one place.'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <BadgeCheck className="mr-1.5 h-3.5 w-3.5" />
              One Meta login unlocks both Facebook and Instagram
            </Badge>
            {selectedClientName ? (
              <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                Active workspace: {selectedClientName}
              </Badge>
            ) : (
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                Choose a client workspace to scope the sync
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 self-start lg:self-auto">
          <Badge variant="outline" className="hidden rounded-full px-3 py-2 text-xs text-muted-foreground md:inline-flex">
            <CalendarRange className="mr-1.5 h-3.5 w-3.5" />
            Rolling paid-social window
          </Badge>
          <DateRangePicker value={dateRange} onChange={onDateRangeChange} />
        </div>
      </div>
    </FadeIn>
  )
}
