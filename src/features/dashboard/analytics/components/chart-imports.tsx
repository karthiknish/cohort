'use client'

import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltipContent } from '@/shared/ui/chart'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from '@/shared/ui/recharts-dynamic'

export {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltipContent,
  Line,
  LineChart,
  Pie,
  PieChart,
  RechartsTooltip,
  XAxis,
  YAxis,
}

const ChartPlaceholder = () => (
  <div className="h-[320px] w-full animate-pulse rounded-lg bg-muted/40" />
)

export { ChartPlaceholder }
