'use client'

import { useState, useCallback, useEffect } from 'react'
import { ChevronUp, ChevronDown, X, Filter, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type MobileBreakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

interface MobileResponsiveProps {
  children: React.ReactNode
  breakpoint?: MobileBreakpoint
  className?: string
}

/**
 * Wrapper that only shows content on mobile devices
 */
export function MobileOnly({ children, breakpoint = 'md', className }: MobileResponsiveProps) {
  const breakpoints = {
    sm: 'max-sm:',
    md: 'max-md:',
    lg: 'max-lg:',
    xl: 'max-xl:',
    '2xl': 'max-2xl:',
  }

  return <div className={cn(breakpoints[breakpoint], 'block', className)}>{children}</div>
}

/**
 * Wrapper that only shows content on desktop devices
 */
export function DesktopOnly({ children, breakpoint = 'md', className }: MobileResponsiveProps) {
  const breakpoints = {
    sm: 'sm:',
    md: 'md:',
    lg: 'lg:',
    xl: 'xl:',
    '2xl': '2xl:',
  }

  return <div className={cn(breakpoints[breakpoint], 'hidden', className)}>{children}</div>
}

interface MobileCollapsibleProps {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
  className?: string
  triggerClassName?: string
  contentClassName?: string
}

/**
 * Collapsible section optimized for mobile
 * Automatically expands on mobile, can be collapsed on desktop
 */
export function MobileCollapsible({
  title,
  defaultOpen = true,
  children,
  className,
  triggerClassName,
  contentClassName,
}: MobileCollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Always show content on mobile by default
  const shouldShow = isMobile || isOpen

  return (
    <div className={cn('space-y-2', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-muted md:bg-background md:hover:bg-muted/50',
          triggerClassName
        )}
      >
        <span>{title}</span>
        {!isMobile && (
          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        )}
      </button>
      {shouldShow && (
        <div className={cn('space-y-2 pb-2', contentClassName)}>
          {children}
        </div>
      )}
    </div>
  )
}

interface MobileFilterSheetProps {
  title?: string
  description?: string
  children: React.ReactNode
  trigger?: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
  filterCount?: number
}

/**
 * Bottom sheet for filters on mobile devices
 */
export function MobileFilterSheet({
  title = 'Filters',
  description,
  children,
  trigger,
  open,
  onOpenChange,
  filterCount,
}: MobileFilterSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger && (
        <SheetTrigger asChild>
          {trigger}
        </SheetTrigger>
      )}
      <SheetContent
        side="bottom"
        className="h-[80vh] rounded-t-2xl border-t"
      >
        <div className="flex items-center justify-between mb-4">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5" />
              {title}
              {filterCount && filterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filterCount} active
                </Badge>
              )}
            </SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="overflow-y-auto pb-20">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  )
}

interface MobileQuickActionsProps {
  actions: Array<{
    label: string
    icon: React.ComponentType<{ className?: string }>
    onClick: () => void
    badge?: string | number
  }>
  className?: string
}

/**
 * Bottom action bar for quick actions on mobile
 */
export function MobileQuickActions({ actions, className }: MobileQuickActionsProps) {
  return (
    <>
      {/* Mobile bottom bar */}
      <div className={cn(
        'fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-safe-bottom md:hidden',
        className
      )}>
        <div className="grid grid-cols-4 gap-1 p-2">
          {actions.slice(0, 4).map((action, idx) => (
            <button
              key={idx}
              type="button"
              onClick={action.onClick}
              className="flex flex-col items-center gap-1 rounded-lg p-2 text-xs text-muted-foreground transition-colors hover:bg-muted/50 active:bg-muted"
            >
              <div className="relative">
                <action.icon className="h-5 w-5" />
                {action.badge && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
                    {action.badge}
                  </span>
                )}
              </div>
              <span className="line-clamp-1">{action.label}</span>
            </button>
          ))}
          {actions.length > 4 && (
            <MobileActionSheet actions={actions.slice(4)} />
          )}
        </div>
      </div>

      {/* Spacer to prevent content from being hidden */}
      <div className="h-16 md:hidden" />
    </>
  )
}

interface MobileActionSheetProps {
  actions: Array<{
    label: string
    icon: React.ComponentType<{ className?: string }>
    onClick: () => void
  }>
}

function MobileActionSheet({ actions }: MobileActionSheetProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="flex flex-col items-center gap-1 rounded-lg p-2 text-xs text-muted-foreground transition-colors hover:bg-muted/50 active:bg-muted"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <span className="text-sm font-medium">{actions.length + 4}</span>
          </div>
          <span>More</span>
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl border-t">
        <SheetHeader className="mb-4">
          <SheetTitle>More Actions</SheetTitle>
        </SheetHeader>
        <div className="space-y-1">
          {actions.map((action, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                action.onClick()
                setOpen(false)
              }}
              className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted"
            >
              <action.icon className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}

interface ResponsiveGridProps {
  children: React.ReactNode
  mobileCols?: 1 | 2
  tabletCols?: 1 | 2 | 3
  desktopCols?: 1 | 2 | 3 | 4
  gap?: number
  className?: string
}

/**
 * Grid that adapts to screen size
 */
export function ResponsiveGrid({
  children,
  mobileCols = 1,
  tabletCols = 2,
  desktopCols = 3,
  gap = 4,
  className,
}: ResponsiveGridProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }

  return (
    <div
      className={cn(
        'grid gap-4',
        `sm:${gridClasses[tabletCols]} lg:${gridClasses[desktopCols]}`,
        className
      )}
      style={{ gap: `${gap * 0.25}rem` }}
    >
      {children}
    </div>
  )
}

interface MobileStickyHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  onBack?: () => void
  className?: string
}

/**
 * Sticky header for mobile pages
 */
export function MobileStickyHeader({
  title,
  subtitle,
  action,
  onBack,
  className,
}: MobileStickyHeaderProps) {
  return (
    <div
      className={cn(
        'sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden',
        className
      )}
    >
      <div className="flex h-14 items-center gap-3 px-4">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
            ←
          </Button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-semibold truncate">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  )
}

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void
  isRefreshing: boolean
  children: React.ReactNode
  threshold?: number
  className?: string
}

/**
 * Pull-to-refresh functionality for mobile
 */
export function PullToRefresh({
  onRefresh,
  isRefreshing,
  children,
  threshold = 80,
  className,
}: PullToRefreshProps) {
  const [touchStart, setTouchStart] = useState(0)
  const [touchCurrent, setTouchCurrent] = useState(0)
  const [isPulling, setIsPulling] = useState(false)
  const [shouldRefresh, setShouldRefresh] = useState(false)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setTouchStart(e.touches[0]?.clientY ?? 0)
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0 && touchStart > 0) {
      const current = e.touches[0]?.clientY ?? 0
      const diff = current - touchStart

      if (diff > 10) {
        setTouchCurrent(current)
        setIsPulling(true)
      }
    }
  }, [touchStart])

  const handleTouchEnd = useCallback(async () => {
    if (isPulling) {
      const diff = touchCurrent - touchStart
      if (diff > threshold) {
        setShouldRefresh(true)
        await onRefresh()
        setShouldRefresh(false)
      }
    }
    setTouchStart(0)
    setTouchCurrent(0)
    setIsPulling(false)
  }, [isPulling, touchCurrent, touchStart, threshold, onRefresh])

  const pullDistance = Math.min(touchCurrent - touchStart, threshold * 1.5)
  const rotation = (pullDistance / threshold) * 360

  return (
    <div
      className={cn('relative min-h-screen', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="fixed left-0 right-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur transition-transform duration-200 ease-out md:hidden"
        style={{
          transform: `translateY(${Math.max(0, pullDistance - threshold)}px)`,
          opacity: isPulling ? pullDistance / threshold : 0,
        }}
      >
        <div
          className="text-muted-foreground transition-transform"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      </div>

      {children}

      {isRefreshing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm md:hidden">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  )
}

/**
 * Hook to detect if current viewport is mobile
 */
export function useIsMobile(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  )

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < breakpoint)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [breakpoint])

  return isMobile
}

/**
 * Hook to get current breakpoint
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<MobileBreakpoint>('2xl')

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 640) setBreakpoint('sm')
      else if (width < 768) setBreakpoint('md')
      else if (width < 1024) setBreakpoint('lg')
      else if (width < 1280) setBreakpoint('xl')
      else setBreakpoint('2xl')
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return breakpoint
}

/**
 * Mobile-safe click handler that prevents double-tap zoom
 */
export function useMobileClick(onClick: () => void, delay: number = 300) {
  const [lastClick, setLastClick] = useState(0)

  return useCallback(() => {
    const now = Date.now()
    if (now - lastClick > delay) {
      onClick()
      setLastClick(now)
    }
  }, [onClick, lastClick, delay])
}
