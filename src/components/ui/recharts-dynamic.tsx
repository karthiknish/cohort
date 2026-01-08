'use client'

import * as React from 'react'
import * as Recharts from 'recharts'
import type {
  AreaProps,
  BarProps,
  CartesianGridProps,
  CellProps,
  LineProps,
  PieProps,
  XAxisProps,
  YAxisProps,
} from 'recharts'

type WithoutRef<T> = Omit<T, 'ref'>

export const AreaChart: React.FC<React.ComponentPropsWithoutRef<typeof Recharts.AreaChart>> = (props) => (
  <Recharts.AreaChart {...props} />
)

export const BarChart: React.FC<React.ComponentPropsWithoutRef<typeof Recharts.BarChart>> = (props) => (
  <Recharts.BarChart {...props} />
)

export const LineChart: React.FC<React.ComponentPropsWithoutRef<typeof Recharts.LineChart>> = (props) => (
  <Recharts.LineChart {...props} />
)

export const PieChart: React.FC<React.ComponentPropsWithoutRef<typeof Recharts.PieChart>> = (props) => (
  <Recharts.PieChart {...props} />
)

export const CartesianGrid: React.FC<CartesianGridProps> = (props) => (
  <Recharts.CartesianGrid {...props} />
)

export const XAxis: React.FC<XAxisProps> = (props) => (
  <Recharts.XAxis {...props} />
)

export const YAxis: React.FC<YAxisProps> = (props) => (
  <Recharts.YAxis {...props} />
)

export const Line: React.FC<WithoutRef<LineProps>> = (props) => (
  <Recharts.Line {...props} />
)

export const Bar: React.FC<WithoutRef<BarProps>> = (props) => <Recharts.Bar {...props} />

export const Area: React.FC<WithoutRef<AreaProps>> = (props) => (
  <Recharts.Area {...props} />
)

export const Pie: React.FC<WithoutRef<PieProps>> = (props) => <Recharts.Pie {...props} />

export const Cell: React.FC<CellProps> = (props) => <Recharts.Cell {...props} />
