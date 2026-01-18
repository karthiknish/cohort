'use client'

import * as React from 'react'
import {
  Area as RechartsArea,
  AreaChart as RechartsAreaChart,
  Bar as RechartsBar,
  BarChart as RechartsBarChart,
  CartesianGrid as RechartsCartesianGrid,
  Cell as RechartsCell,
  Line as RechartsLine,
  LineChart as RechartsLineChart,
  Pie as RechartsPie,
  PieChart as RechartsPieChart,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
} from 'recharts'
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

export const AreaChart: React.FC<React.ComponentPropsWithoutRef<typeof RechartsAreaChart>> = (props) => (
  <RechartsAreaChart {...props} />
)

export const BarChart: React.FC<React.ComponentPropsWithoutRef<typeof RechartsBarChart>> = (props) => (
  <RechartsBarChart {...props} />
)

export const LineChart: React.FC<React.ComponentPropsWithoutRef<typeof RechartsLineChart>> = (props) => (
  <RechartsLineChart {...props} />
)

export const PieChart: React.FC<React.ComponentPropsWithoutRef<typeof RechartsPieChart>> = (props) => (
  <RechartsPieChart {...props} />
)

export const CartesianGrid: React.FC<CartesianGridProps> = (props) => (
  <RechartsCartesianGrid {...props} />
)

export const XAxis: React.FC<XAxisProps> = (props) => (
  <RechartsXAxis {...props} />
)

export const YAxis: React.FC<YAxisProps> = (props) => (
  <RechartsYAxis {...props} />
)

export const Line: React.FC<WithoutRef<LineProps>> = (props) => (
  <RechartsLine {...props} />
)

export const Bar: React.FC<WithoutRef<BarProps>> = (props) => <RechartsBar {...props} />

export const Area: React.FC<WithoutRef<AreaProps>> = (props) => (
  <RechartsArea {...props} />
)

export const Pie: React.FC<WithoutRef<PieProps>> = (props) => <RechartsPie {...props} />

export const Cell: React.FC<CellProps> = (props) => <RechartsCell {...props} />
