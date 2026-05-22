import type { CSSProperties } from 'react'

export const ADS_CHART_HEIGHT = 280

export const ADS_CHART_CONTAINER_CLASSNAME = 'aspect-auto h-[280px] min-h-[280px] w-full'

export const ADS_AXIS_TICK_STYLE = {
  fontSize: 11,
  fill: 'var(--muted-foreground)',
} as const

export const ADS_CHART_MARGIN = { top: 8, right: 12, left: 4, bottom: 4 } as const

export const ADS_CHART_MARGIN_CATEGORY_Y = { top: 8, right: 16, left: 8, bottom: 8 } as const

export const ADS_CHART_TOOLTIP_PROPS = {
  wrapperStyle: { zIndex: 60, outline: 'none' } satisfies CSSProperties,
  allowEscapeViewBox: { x: true, y: true },
  isAnimationActive: false,
} as const

export const ADS_TOOLTIP_CURSOR = { strokeDasharray: '3 3' } as const

export const ADS_ACTIVE_DOT = { r: 4, strokeWidth: 0 } as const
