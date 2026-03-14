'use client'

import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/shared/ui/chart'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid } from '@/shared/ui/recharts-dynamic'

// Re-export chart components
export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
}

const ChartPlaceholder = () => (
    <div className="h-[320px] w-full animate-pulse rounded-lg bg-muted/40" />
)

export { ChartPlaceholder }
