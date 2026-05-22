'use client'

import { CalendarRange, Share2, Sparkles } from 'lucide-react'

import { DateRangePicker, type DateRange } from '@/features/dashboard/ads/components/date-range-picker'
import { FadeIn } from '@/shared/ui/animate-in'
import { Badge } from '@/shared/ui/badge'
import { DASHBOARD_THEME, PAGE_TITLES, getBadgeClasses } from '@/lib/dashboard-theme'
import { cn } from '@/lib/utils'

type SocialsHeaderProps = {
  selectedClientName: string | null
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
  metricsReady?: boolean
}

export function SocialsHeader({
  selectedClientName,
  dateRange,
  onDateRangeChange,
  metricsReady = false,
}: SocialsHeaderProps) {
  return (
    <FadeIn>
      <header
        className={cn(
          DASHBOARD_THEME.layout.header,
          'relative overflow-hidden rounded-2xl border border-muted/40 bg-linear-to-br from-info/[0.06] via-background to-accent/[0.04] p-5 shadow-sm sm:p-6',
        )}
      >
        <div
          className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-info/10 blur-3xl"
          aria-hidden
        />
        <div className="relative space-y-3">
          <div className="flex flex-wrap items-start gap-4">
            <div className={cn(DASHBOARD_THEME.icons.container, 'bg-info/10 text-info border-info/25')}>
              <Share2 className="size-6" aria-hidden />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
                  Organic social
                </p>
                {metricsReady ? (
                  <Badge className={cn(getBadgeClasses('success'), 'gap-1 normal-case tracking-normal')}>
                    <Sparkles className="size-3" aria-hidden />
                    Metrics live
                  </Badge>
                ) : null}
              </div>
              <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                {PAGE_TITLES.socials?.title ?? 'Socials'}
              </h1>
              <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                {PAGE_TITLES.socials?.description ??
                  'Organic reach and engagement from Meta Pages and Instagram — separate from paid ads.'}
              </p>
            </div>
          </div>
          {selectedClientName ? (
            <Badge className={getBadgeClasses('primary')}>Workspace · {selectedClientName}</Badge>
          ) : null}
        </div>

        <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <Badge className={cn('w-fit', getBadgeClasses('secondary'), 'hidden sm:inline-flex')}>
            <CalendarRange className="mr-1.5 size-3.5" aria-hidden />
            Compare periods
          </Badge>
          <DateRangePicker value={dateRange} onChange={onDateRangeChange} />
        </div>
      </header>
    </FadeIn>
  )
}
