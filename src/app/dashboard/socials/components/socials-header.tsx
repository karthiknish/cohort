'use client'

import { CalendarRange, Share2 } from 'lucide-react'

import { DateRangePicker, type DateRange } from '@/app/dashboard/ads/components/date-range-picker'
import { FadeIn } from '@/components/ui/animate-in'
import { Badge } from '@/components/ui/badge'
import { DASHBOARD_THEME, PAGE_TITLES, getBadgeClasses } from '@/lib/dashboard-theme'

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
      <div className={DASHBOARD_THEME.layout.header}>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className={DASHBOARD_THEME.icons.container}>
              <Share2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className={DASHBOARD_THEME.layout.title}>
                {PAGE_TITLES.socials?.title ?? 'Socials'}
              </h1>
              <p className={DASHBOARD_THEME.layout.subtitle}>
                {PAGE_TITLES.socials?.description ??
                  'Connect Meta business accounts to monitor Facebook and Instagram performance.'}
              </p>
            </div>
          </div>
          {selectedClientName ? (
            <Badge className={getBadgeClasses('primary')}>
              Active workspace: {selectedClientName}
            </Badge>
          ) : null}
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          <Badge className={`hidden md:inline-flex ${getBadgeClasses('secondary')}`}>
            <CalendarRange className="mr-1.5 h-3.5 w-3.5" />
            Date range
          </Badge>
          <DateRangePicker value={dateRange} onChange={onDateRangeChange} />
        </div>
      </div>
    </FadeIn>
  )
}
