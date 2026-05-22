'use client'

import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'
import type * as Recharts from 'recharts'

type RechartsModule = typeof Recharts

function createRechartsComponent<K extends keyof RechartsModule>(exportName: K) {
  return dynamic(
    () =>
      import('recharts').then((module) => ({
        default: module[exportName] as ComponentType<Record<string, unknown>>,
      })),
    { ssr: false },
  ) as unknown as RechartsModule[K]
}

export const Area = createRechartsComponent('Area')
export const AreaChart = createRechartsComponent('AreaChart')
export const Bar = createRechartsComponent('Bar')
export const BarChart = createRechartsComponent('BarChart')
export const CartesianGrid = createRechartsComponent('CartesianGrid')
export const Cell = createRechartsComponent('Cell')
export const Funnel = createRechartsComponent('Funnel')
export const FunnelChart = createRechartsComponent('FunnelChart')
export const LabelList = createRechartsComponent('LabelList')
export const PolarAngleAxis = createRechartsComponent('PolarAngleAxis')
export const PolarGrid = createRechartsComponent('PolarGrid')
export const PolarRadiusAxis = createRechartsComponent('PolarRadiusAxis')
export const Radar = createRechartsComponent('Radar')
export const RadarChart = createRechartsComponent('RadarChart')
export const Line = createRechartsComponent('Line')
export const LineChart = createRechartsComponent('LineChart')
export const Pie = createRechartsComponent('Pie')
export const PieChart = createRechartsComponent('PieChart')
export const XAxis = createRechartsComponent('XAxis')
export const YAxis = createRechartsComponent('YAxis')
export const ResponsiveContainer = createRechartsComponent('ResponsiveContainer')
export const Tooltip = createRechartsComponent('Tooltip')
export const Legend = createRechartsComponent('Legend')
