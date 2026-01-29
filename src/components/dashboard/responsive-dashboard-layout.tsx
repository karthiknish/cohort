'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ResponsiveDashboardLayoutProps {
  children: ReactNode
  className?: string
}

/**
 * Responsive wrapper for dashboard content
 * Handles padding and spacing adjustments for mobile vs desktop
 */
export function ResponsiveDashboardLayout({
  children,
  className,
}: ResponsiveDashboardLayoutProps) {
  return (
    <div className={cn(
      // Mobile: minimal padding
      'px-3 py-4',
      // Tablet: moderate padding
      'sm:px-4 sm:py-5',
      // Desktop: standard padding
      'md:px-6 md:py-6',
      // Large desktop: more padding
      'lg:px-8 lg:py-6',
      className
    )}>
      {children}
    </div>
  )
}

interface ResponsiveGridProps {
  children: ReactNode
  mobile?: 1 | 2
  tablet?: 1 | 2 | 3
  desktop?: 1 | 2 | 3 | 4
  className?: string
  gap?: 'sm' | 'md' | 'lg'
}

/**
 * Responsive grid that adjusts columns based on screen size
 */
export function ResponsiveGrid({
  children,
  mobile = 1,
  tablet = 2,
  desktop = 3,
  className,
  gap = 'md',
}: ResponsiveGridProps) {
  const gaps = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-4 sm:gap-5',
    lg: 'gap-6 sm:gap-8',
  }

  const cols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }

  const colClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }[desktop] || cols[3]

  // Override based on props
  const finalColClass = cn(
    mobile === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2',
    tablet === 1 ? 'sm:grid-cols-1' : tablet === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3',
    desktop === 1 ? 'lg:grid-cols-1' : desktop === 2 ? 'lg:grid-cols-2' : desktop === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
  )

  return (
    <div className={cn('grid', gaps[gap], finalColClass, className)}>
      {children}
    </div>
  )
}

interface ResponsiveSplitProps {
  children: [ReactNode, ReactNode]
  reverse?: boolean
  splitAt?: 'md' | 'lg' | 'xl'
  ratio?: '1/1' | '1/2' | '1/3' | '2/3' | '2/1' | '3/1'
  className?: string
}

/**
 * Responsive split layout that stacks on mobile and splits on desktop
 */
export function ResponsiveSplit({
  children,
  reverse = false,
  splitAt = 'lg',
  ratio = '2/1',
  className,
}: ResponsiveSplitProps) {
  const [left, right] = children

  const splitClasses = {
    '1/1': 'grid-cols-1 lg:grid-cols-2',
    '2/1': 'grid-cols-1 lg:grid-cols-3',
    '1/2': 'grid-cols-1 lg:grid-cols-3',
    '3/1': 'grid-cols-1 lg:grid-cols-4',
    '1/3': 'grid-cols-1 lg:grid-cols-4',
    '2/3': 'grid-cols-1 lg:grid-cols-5',
  }

  const spanClasses = {
    '1/1': ['lg:col-span-1', 'lg:col-span-1'],
    '2/1': ['lg:col-span-2', 'lg:col-span-1'],
    '1/2': ['lg:col-span-1', 'lg:col-span-2'],
    '3/1': ['lg:col-span-3', 'lg:col-span-1'],
    '1/3': ['lg:col-span-1', 'lg:col-span-3'],
    '2/3': ['lg:col-span-2', 'lg:col-span-3'],
  }

  const [leftSpan, rightSpan] = spanClasses[ratio]

  return (
    <div className={cn(
      'grid gap-4',
      splitClasses[ratio],
      reverse && 'lg:flex lg:flex-row-reverse',
      className
    )}>
      <div className={cn(reverse ? rightSpan : leftSpan)}>
        {reverse ? right : left}
      </div>
      <div className={cn(reverse ? leftSpan : rightSpan)}>
        {reverse ? left : right}
      </div>
    </div>
  )
}

interface HideOnScrollProps {
  children: ReactNode
  threshold?: number
  className?: string
}

/**
 * Wrapper that hides content when scrolling down (useful for mobile headers)
 */
export function HideOnScroll({ children, className }: HideOnScrollProps) {
  return (
    <div className={cn(
      'sticky top-0 z-40 transition-transform duration-300',
      className
    )}>
      {children}
    </div>
  )
}

interface MobileFullWidthProps {
  children: ReactNode
  className?: string
  breakpoint?: 'sm' | 'md' | 'lg'
}

/**
 * Component that becomes full width on mobile
 */
export function MobileFullWidth({
  children,
  className,
  breakpoint = 'md',
}: MobileFullWidthProps) {
  const breakpointClass = {
    sm: 'sm:mx-0 sm:max-w-none',
    md: 'md:mx-0 md:max-w-none',
    lg: 'lg:mx-0 lg:max-w-none',
  }

  return (
    <div className={cn(
      '-mx-3 sm:-mx-4 w-[calc(100%+1.5rem)] sm:w-[calc(100%+2rem)]',
      breakpointClass[breakpoint],
      className
    )}>
      {children}
    </div>
  )
}

interface MobileStackProps {
  children: ReactNode
  className?: string
  spacing?: 'tight' | 'normal' | 'loose'
}

/**
 * Stacks children vertically on mobile, maintains desktop layout
 */
export function MobileStack({
  children,
  className,
  spacing = 'normal',
}: MobileStackProps) {
  const spacingClasses = {
    tight: 'space-y-2 md:space-y-0 md:space-x-2 md:flex',
    normal: 'space-y-4 md:space-y-0 md:space-x-4 md:flex',
    loose: 'space-y-6 md:space-y-0 md:space-x-6 md:flex',
  }

  return (
    <div className={cn(spacingClasses[spacing], className)}>
      {children}
    </div>
  )
}

interface ResponsiveTextProps {
  children: ReactNode
  className?: string
  size?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl'
}

/**
 * Text that scales appropriately across device sizes
 */
export function ResponsiveText({
  children,
  className,
  size = 'base',
}: ResponsiveTextProps) {
  const sizeClasses = {
    sm: 'text-xs sm:text-sm',
    base: 'text-sm sm:text-base',
    lg: 'text-base sm:text-lg',
    xl: 'text-lg sm:text-xl lg:text-2xl',
    '2xl': 'text-xl sm:text-2xl lg:text-3xl',
    '3xl': 'text-2xl sm:text-3xl lg:text-4xl',
  }

  return (
    <p className={cn(sizeClasses[size], className)}>
      {children}
    </p>
  )
}

interface MobileHiddenProps {
  children: ReactNode
  className?: string
}

/**
 * Hides content on mobile, shows on desktop
 */
export function MobileHidden({ children, className }: MobileHiddenProps) {
  return (
    <div className={cn('hidden md:block', className)}>
      {children}
    </div>
  )
}

interface DesktopHiddenProps {
  children: ReactNode
  className?: string
}

/**
 * Shows content on mobile, hides on desktop
 */
export function DesktopHidden({ children, className }: DesktopHiddenProps) {
  return (
    <div className={cn('block md:hidden', className)}>
      {children}
    </div>
  )
}

interface TouchOptimizedProps {
  children: ReactNode
  className?: string
  minTouchSize?: number // in pixels (default 44px - Apple HIG recommendation)
}

/**
 * Ensures touch targets meet minimum size requirements
 */
export function TouchOptimized({
  children,
  className,
  minTouchSize = 44,
}: TouchOptimizedProps) {
  return (
    <div
      className={cn('inline-block', className)}
      style={{ minHeight: minTouchSize, minWidth: minTouchSize }}
    >
      {children}
    </div>
  )
}

interface SafeAreaInsetProps {
  children: ReactNode
  position?: 'top' | 'bottom' | 'both' | 'none'
  className?: string
}

/**
 * Handles safe area insets for notched devices (iPhone X+)
 */
export function SafeAreaInset({
  children,
  position = 'top',
  className,
}: SafeAreaInsetProps) {
  const insets = {
    top: 'pt-[env(safe-area-inset-top)]',
    bottom: 'pb-[env(safe-area-inset-bottom)]',
    both: 'pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]',
    none: '',
  }

  return (
    <div className={cn(insets[position], className)}>
      {children}
    </div>
  )
}

interface MobileScrollContainerProps {
  children: ReactNode
  className?: string
  horizontal?: boolean
  hideScrollbar?: boolean
}

/**
 * Optimized scroll container for mobile
 */
export function MobileScrollContainer({
  children,
  className,
  horizontal = false,
  hideScrollbar = true,
}: MobileScrollContainerProps) {
  return (
    <div
      className={cn(
        'overflow-auto',
        horizontal ? 'flex flex-row snap-x snap-mandatory' : 'flex flex-col',
        hideScrollbar && [
          'scrollbar-hide',
          '-webkit-overflow-scrolling: touch',
          horizontal ? 'scroll-snap-type:x mandatory' : 'scroll-snap-type:y mandatory',
        ],
        className
      )}
    >
      {children}
    </div>
  )
}
