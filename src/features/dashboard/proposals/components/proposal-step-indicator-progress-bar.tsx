'use client'

import { useMemo } from 'react'

export function ProposalStepIndicatorProgressBar({ percentage }: { percentage: number }) {
  const progressStyle = useMemo(() => ({ width: `${percentage}%` }), [percentage])

  return (
    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted/30">
      <div
        className="h-full bg-primary motion-chromatic-slow-inout"
        style={progressStyle}
      />
    </div>
  )
}
