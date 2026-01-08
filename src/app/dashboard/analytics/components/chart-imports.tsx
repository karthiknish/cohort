'use client'

import dynamic from 'next/dynamic'

const ChartPlaceholder = () => (
    <div className="h-[320px] w-full animate-pulse rounded-lg bg-muted/40" />
)

// Shadcn Chart components
export const ChartContainer = dynamic(
    () => import('@/components/ui/chart').then((m) => m.ChartContainer),
    { ssr: false, loading: ChartPlaceholder }
)

export const ChartTooltip = dynamic(
    () => import('@/components/ui/chart').then((m) => m.ChartTooltip),
    { ssr: false, loading: () => null }
)

export const ChartTooltipContent = dynamic(
    () => import('@/components/ui/chart').then((m) => m.ChartTooltipContent),
    { ssr: false, loading: () => null }
)

export const ChartLegend = dynamic(
    () => import('@/components/ui/chart').then((m) => m.ChartLegend),
    { ssr: false, loading: () => null }
)

export const ChartLegendContent = dynamic(
    () => import('@/components/ui/chart').then((m) => m.ChartLegendContent),
    { ssr: false, loading: () => null }
)

// Recharts components
export const LineChart = dynamic(
    () => import('@/components/ui/recharts-dynamic').then((m) => m.LineChart),
    { ssr: false, loading: ChartPlaceholder }
)

export const Line = dynamic(
    () => import('@/components/ui/recharts-dynamic').then((m) => m.Line),
    { ssr: false, loading: () => null }
)

export const BarChart = dynamic(
    () => import('@/components/ui/recharts-dynamic').then((m) => m.BarChart),
    { ssr: false, loading: ChartPlaceholder }
)

export const Bar = dynamic(
    () => import('@/components/ui/recharts-dynamic').then((m) => m.Bar),
    { ssr: false, loading: () => null }
)

export const PieChart = dynamic(
    () => import('@/components/ui/recharts-dynamic').then((m) => m.PieChart),
    { ssr: false, loading: ChartPlaceholder }
)

export const Pie = dynamic(
    () => import('@/components/ui/recharts-dynamic').then((m) => m.Pie),
    { ssr: false, loading: () => null }
)

export const Cell = dynamic(
    () => import('@/components/ui/recharts-dynamic').then((m) => m.Cell),
    { ssr: false, loading: () => null }
)

export const XAxis = dynamic(
    () => import('@/components/ui/recharts-dynamic').then((m) => m.XAxis),
    { ssr: false, loading: () => null }
)

export const YAxis = dynamic(
    () => import('@/components/ui/recharts-dynamic').then((m) => m.YAxis),
    { ssr: false, loading: () => null }
)

export const CartesianGrid = dynamic(
    () => import('@/components/ui/recharts-dynamic').then((m) => m.CartesianGrid),
    { ssr: false, loading: () => null }
)

export { ChartPlaceholder }
