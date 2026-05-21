'use client'

import { cn } from '@/lib/utils'

const dotPatternStyle = {
  backgroundImage:
    'radial-gradient(rgb(from var(--primary) r g b / 0.11) 1px, transparent 1px)',
  backgroundSize: '20px 20px',
} as const

const gridPatternStyle = {
  backgroundImage: `
    linear-gradient(rgb(from var(--primary) r g b / 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgb(from var(--primary) r g b / 0.05) 1px, transparent 1px)
  `,
  backgroundSize: '56px 56px',
} as const

type SectionPatternBackgroundProps = {
  className?: string
  /** Softer wash for nested cards vs full sections */
  variant?: 'default' | 'subtle'
}

/**
 * Light dot + grid pattern with primary wash — for elevated marketing / For You sections.
 */
export function SectionPatternBackground({
  className,
  variant = 'default',
}: SectionPatternBackgroundProps) {
  const washOpacity = variant === 'subtle' ? 'from-primary/[0.06]' : 'from-primary/[0.09]'

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
      <div className={cn('absolute inset-0 bg-gradient-to-br via-background/40 to-background', washOpacity)} />
      <div className="absolute inset-0 opacity-50 motion-reduce:opacity-35" style={dotPatternStyle} />
      <div
        className="absolute inset-0 opacity-[0.45] [mask-image:radial-gradient(ellipse_90%_80%_at_50%_0%,black,transparent)] motion-reduce:opacity-30"
        style={gridPatternStyle}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
      <div
        className="absolute inset-0 opacity-[0.03] motion-reduce:hidden"
        style={{
          backgroundImage:
            'repeating-linear-gradient(118deg, rgb(from var(--primary) r g b / 0.4) 0px, rgb(from var(--primary) r g b / 0.4) 1px, transparent 1px, transparent 40px)',
        }}
      />
    </div>
  )
}
