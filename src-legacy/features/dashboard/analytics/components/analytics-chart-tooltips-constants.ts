import type { CSSProperties } from 'react';
export const ANALYTICS_CHART_TOOLTIP_PROPS = {
    wrapperStyle: { zIndex: 60, outline: 'none' } satisfies CSSProperties,
    allowEscapeViewBox: { x: true, y: true },
    isAnimationActive: false,
} as const;
export const ANALYTICS_CHART_CONTAINER_CLASS = 'flex w-full aspect-auto h-[280px] min-h-[280px] flex-col [&_.recharts-responsive-container]:min-h-[280px]';
