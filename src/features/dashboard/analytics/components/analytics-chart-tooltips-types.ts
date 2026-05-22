import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import type { TooltipProps } from 'recharts/types/component/Tooltip'

export type AnalyticsChartPoint = {
  date: string
  users: number
  sessions: number
  revenue: number
  conversions: number
  conversionRate: number
}

export type AnalyticsChartTooltipProps = TooltipProps<ValueType, NameType>
