'use client'

import { useCallback, useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'

import { Badge } from '@/shared/ui/badge'

const MIN = 0
const MAX = 48000
const STEP = 1000

const TICKS = ['$0', '$12K', '$24K', '$36K', '$48K']

function formatValue(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`
  return `$${n}`
}

export function RetainerSlider() {
  const [value, setValue] = useState(33600) // 70% of max → matches old static thumb

  const pct = ((value - MIN) / (MAX - MIN)) * 100
  const fillStyle = useMemo(() => ({ width: `${pct}%` }), [pct])
  const thumbStyle = useMemo(() => ({ left: `calc(${pct}% - 8px)` }), [pct])
  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setValue(Number(event.target.value))
  }, [])

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border px-5 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Monthly retainer target</span>
        <Badge className="rounded-full px-1.5">{formatValue(value)}</Badge>
      </div>

      <div className="relative flex w-full items-center py-1">
        {/* Track */}
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="absolute h-full bg-primary transition-[width] duration-75"
            style={fillStyle}
          />
        </div>

        {/* Native range input — invisible but fully interactive, sits on top */}
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={value}
          onChange={handleChange}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label="Monthly retainer target"
        />

        {/* Thumb */}
        <div
          className="pointer-events-none absolute size-4 rounded-full border border-primary bg-background shadow-sm transition-[left] duration-75"
          style={thumbStyle}
          aria-hidden="true"
        />
      </div>

      <div className="flex items-center justify-between px-0.5 text-sm font-medium text-muted-foreground">
        {TICKS.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </div>
  )
}
