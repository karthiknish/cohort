/**
 * Central motion system: numeric tokens mirror `:root` in `src/app/globals.css`
 * (`--motion-duration-*`, `--motion-ease-*`). Use composed classes below in components
 * instead of one-off `transition-[...]` strings.
 */
export const motionDurationMs = {
  fast: 160,
  normal: 220,
  slow: 280,
  xslow: 1000,
  page: 220,
} as const

export const motionDurationSeconds = {
  fast: motionDurationMs.fast / 1000,
  normal: motionDurationMs.normal / 1000,
  slow: motionDurationMs.slow / 1000,
  xslow: motionDurationMs.xslow / 1000,
  page: motionDurationMs.page / 1000,
} as const

export const motionEasing = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  standard: [0.4, 0, 0.2, 1] as const,
  linear: 'linear' as const,
} as const

export const motionLoopSeconds = {
  pulse: 2,
  pulseSlow: 3,
  shimmer: 1.5,
  heroOrbit: 12,
  glowA: 14,
  glowB: 15,
  glowC: 16,
  glowD: 17,
  glowE: 18,
  blob: 20,
  blobSlow: 25,
  trackLong: 60,
} as const

export const motionDurationClasses = {
  fast: 'duration-[var(--motion-duration-fast)]',
  normal: 'duration-[var(--motion-duration-normal)]',
  slow: 'duration-[var(--motion-duration-slow)]',
  xslow: 'duration-[var(--motion-duration-xslow)]',
  page: 'duration-[var(--motion-duration-page)]',
} as const

export const motionEasingClasses = {
  out: 'ease-[var(--motion-ease-out)]',
  inOut: 'ease-[var(--motion-ease-in-out)]',
  standard: 'ease-[var(--motion-ease-standard)]',
} as const

export const interactiveTransitionClass = [
  'transition-[color,background-color,border-color,box-shadow,transform,opacity]',
  motionDurationClasses.fast,
  motionEasingClasses.standard,
  'motion-reduce:transition-none',
].join(' ')

/** Full chrome transition — see `.motion-chromatic` in `globals.css`. */
export const chromaticTransitionClass = 'motion-chromatic'

/** Normal duration + standard ease (emphasis cards, icon chrome). */
export const chromaticTransitionLgClass = 'motion-chromatic-lg'

/** Normal duration + in-out (sidebar width, FAB). */
export const chromaticTransitionNormalClass = 'motion-chromatic-layout'

/** Slow + ease-out (progress ticks, deck chrome). */
export const chromaticTransitionSlowClass = 'motion-chromatic-slow'

/** Extra-slow + ease-out (wide progress fills). */
export const chromaticTransitionXSlowClass = 'motion-chromatic-xslow'

/** Slow + in-out (step progress bar). */
export const chromaticTransitionSlowInOutClass = 'motion-chromatic-slow-inout'

/** List / message row entrance (tailwind `animate-in`). */
export const listRowEnterAnimationClass = [
  'animate-in fade-in-0 slide-in-from-bottom-1',
  motionDurationClasses.fast,
  'ease-[var(--motion-ease-standard)]',
  'motion-reduce:animate-none',
].join(' ')

export const pressableScaleClass = 'active:scale-[0.98] motion-reduce:active:scale-100'

export const surfaceMotionClasses = {
  overlay: [
    'data-[state=open]:animate-in',
    'data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-0',
    'data-[state=open]:fade-in-0',
    motionDurationClasses.normal,
    motionEasingClasses.out,
    'motion-reduce:animate-none',
  ].join(' '),
  modalContent: [
    'data-[state=open]:animate-in',
    'data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-0',
    'data-[state=open]:fade-in-0',
    'data-[state=closed]:zoom-out-95',
    'data-[state=open]:zoom-in-95',
    'data-[state=closed]:slide-out-to-left-1/2',
    'data-[state=closed]:slide-out-to-top-[48%]',
    'data-[state=open]:slide-in-from-left-1/2',
    'data-[state=open]:slide-in-from-top-[48%]',
    motionDurationClasses.normal,
    motionEasingClasses.out,
    'motion-reduce:animate-none',
  ].join(' '),
  popoverContent: [
    'data-[state=open]:animate-in',
    'data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-0',
    'data-[state=open]:fade-in-0',
    'data-[state=closed]:zoom-out-95',
    'data-[state=open]:zoom-in-95',
    'data-[side=bottom]:slide-in-from-top-2',
    'data-[side=left]:slide-in-from-right-2',
    'data-[side=right]:slide-in-from-left-2',
    'data-[side=top]:slide-in-from-bottom-2',
    motionDurationClasses.fast,
    motionEasingClasses.out,
    'motion-reduce:animate-none',
  ].join(' '),
  sheetContent: [
    'data-[state=open]:animate-in',
    'data-[state=closed]:animate-out',
    motionDurationClasses.slow,
    motionEasingClasses.out,
    'motion-reduce:animate-none',
  ].join(' '),
  navigationViewport: [
    'data-[state=open]:animate-in',
    'data-[state=closed]:animate-out',
    'data-[state=closed]:zoom-out-95',
    'data-[state=open]:zoom-in-90',
    motionDurationClasses.fast,
    motionEasingClasses.out,
    'motion-reduce:animate-none',
  ].join(' '),
  navigationIndicator: [
    'data-[state=visible]:animate-in',
    'data-[state=hidden]:animate-out',
    'data-[state=hidden]:fade-out',
    'data-[state=visible]:fade-in',
    motionDurationClasses.fast,
    motionEasingClasses.out,
    'motion-reduce:animate-none',
  ].join(' '),
} as const
