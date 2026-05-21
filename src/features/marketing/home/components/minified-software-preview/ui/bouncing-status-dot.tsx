'use client'

import { useMemo } from 'react'

export function BouncingStatusDot({ style }: { style: { animationDelay: string } }) {
  const dotStyle = useMemo(() => style, [style])

  return (
    <span
      className="block h-1.5 w-1.5 animate-subtle-dot-drift rounded-full bg-accent"
      style={dotStyle}
    />
  )
}
