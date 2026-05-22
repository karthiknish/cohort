'use client'

import type { ReactNode } from 'react'

export {
  ADS_ACTIVE_DOT,
  ADS_AXIS_TICK_STYLE,
  ADS_CHART_CONTAINER_CLASSNAME,
  ADS_CHART_HEIGHT,
  ADS_CHART_MARGIN,
  ADS_CHART_MARGIN_CATEGORY_Y,
  ADS_CHART_TOOLTIP_PROPS,
  ADS_TOOLTIP_CURSOR,
} from './ads-chart-primitives-constants'
export { ADS_CHART_LEGEND } from './ads-chart-primitives-legend'

export function AdsChartShell({ children }: { children: ReactNode }) {
  return (
    <div className="w-full min-w-0 rounded-xl border border-border/60 bg-card/40 p-2 sm:p-3">
      {children}
    </div>
  )
}
