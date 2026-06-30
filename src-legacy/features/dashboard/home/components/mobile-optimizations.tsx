'use client';
import { useState, useCallback, useMemo } from 'react';
import { useMediaQuery, useWindowWidth } from '@/lib/hooks/use-media-query';
import { ChevronUp, ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useIsMobile as useIsMobileHook } from '@/shared/hooks/use-is-mobile';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger, } from '@/shared/ui/drawer';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/shared/ui/sheet';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/lib/utils';
export type MobileBreakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
interface MobileResponsiveProps {
    children: React.ReactNode;
    breakpoint?: MobileBreakpoint;
    className?: string;
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
    };
    return <div className={cn(breakpoints[breakpoint], 'block', className)}>{children}</div>;
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
    };
    return <div className={cn(breakpoints[breakpoint], 'hidden', className)}>{children}</div>;
}
interface MobileCollapsibleProps {
    title: string;
    children: React.ReactNode;
    className?: string;
    triggerClassName?: string;
    contentClassName?: string;
}
/**
 * Collapsible section optimized for mobile
 * Automatically expands on mobile, can be collapsed on desktop
 */
export function MobileCollapsible({ title, children, className, triggerClassName, contentClassName, }: MobileCollapsibleProps) {
    const [isOpen, setIsOpen] = useState(true);
    const isMobile = useMediaQuery('(max-width: 767px)');
    const handleToggle = () => {
        setIsOpen((current) => !current);
    };
    // Always show content on mobile by default
    const shouldShow = isMobile || isOpen;
    return (<div className={cn('space-y-2', className)}>
      <button type="button" onClick={handleToggle} className={cn('flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-muted md:bg-background md:hover:bg-muted/50', triggerClassName)}>
        <span>{title}</span>
        {!isMobile && (<span aria-hidden="true" className="inline-flex size-6 shrink-0 items-center justify-center rounded-md">
            {isOpen ? <ChevronUp className="size-4"/> : <ChevronDown className="size-4"/>}
          </span>)}
      </button>
      {shouldShow && (<div className={cn('space-y-2 pb-2', contentClassName)}>
          {children}
        </div>)}
    </div>);
}
interface MobileFilterSheetProps {
    title?: string;
    description?: string;
    children: React.ReactNode;
    trigger?: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    filterCount?: number;
}
/**
 * Bottom sheet for filters on mobile devices
 */
export function MobileFilterSheet({ title = 'Filters', description, children, trigger, open, onOpenChange, filterCount, }: MobileFilterSheetProps) {
    const handleClose = () => {
        onOpenChange(false);
    };
    return (<Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      {trigger ? <DrawerTrigger asChild>{trigger}</DrawerTrigger> : null}
      <DrawerContent className="h-[80dvh] max-h-[80dvh] rounded-t-2xl">
        <DrawerHeader className="relative flex-row items-start justify-between gap-4 border-b border-border/60 pb-4 text-left">
          <div className="min-w-0 space-y-1">
            <DrawerTitle className="flex items-center gap-2">
              <SlidersHorizontal className="size-5" aria-hidden/>
              {title}
              {filterCount && filterCount > 0 ? (<Badge variant="secondary" className="ml-2">
                  {filterCount} active
                </Badge>) : null}
            </DrawerTitle>
            {description ? <DrawerDescription>{description}</DrawerDescription> : null}
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose} aria-label="Close filters">
            <X className="size-5" aria-hidden/>
          </Button>
        </DrawerHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </DrawerContent>
    </Drawer>);
}
interface MobileQuickActionsProps {
    actions: Array<{
        label: string;
        icon: React.ComponentType<{
            className?: string;
        }>;
        onClick: () => void;
        badge?: string | number;
    }>;
    className?: string;
}
/**
 * Bottom action bar for quick actions on mobile
 */
export function MobileQuickActions({ actions, className }: MobileQuickActionsProps) {
    return (<>
      {/* Mobile bottom bar */}
      <div className={cn('fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-safe-bottom md:hidden', className)}>
        <div className="grid grid-cols-4 gap-1 p-2">
            {actions.slice(0, 4).map((action) => (<button key={action.label} type="button" onClick={action.onClick} className="flex flex-col items-center gap-1 rounded-lg p-2 text-xs text-muted-foreground transition-colors hover:bg-muted/50 active:bg-muted">
              <div className="relative">
                <action.icon className="size-5"/>
                {action.badge && (<span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                    {action.badge}
                  </span>)}
              </div>
              <span className="line-clamp-1">{action.label}</span>
            </button>))}
          {actions.length > 4 && (<MobileActionSheet actions={actions.slice(4)}/>)}
        </div>
      </div>

      {/* Spacer to prevent content from being hidden */}
      <div className="h-16 md:hidden"/>
    </>);
}
interface MobileActionSheetProps {
    actions: Array<{
        label: string;
        icon: React.ComponentType<{
            className?: string;
        }>;
        onClick: () => void;
    }>;
}
function MobileActionSheet({ actions }: MobileActionSheetProps) {
    const [open, setOpen] = useState(false);
    const handleClose = () => {
        setOpen(false);
    };
    return (<Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button type="button" className="flex flex-col items-center gap-1 rounded-lg p-2 text-xs text-muted-foreground transition-colors hover:bg-muted/50 active:bg-muted">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
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
          {actions.map((action) => (<MobileActionSheetItem key={action.label} action={action} onClose={handleClose}/>))}
        </div>
      </SheetContent>
    </Sheet>);
}
function MobileActionSheetItem({ action, onClose, }: {
    action: MobileActionSheetProps['actions'][number];
    onClose: () => void;
}) {
    const onRunFabAction = () => {
        action.onClick();
        onClose();
    };
    return (<button type="button" onClick={onRunFabAction} className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted">
      <action.icon className="size-5 text-muted-foreground"/>
      <span className="text-sm font-medium">{action.label}</span>
    </button>);
}
interface ResponsiveGridProps {
    children: React.ReactNode;
    mobileCols?: 1 | 2;
    tabletCols?: 1 | 2 | 3;
    desktopCols?: 1 | 2 | 3 | 4;
    gap?: number;
    className?: string;
}
/**
 * Grid that adapts to screen size
 */
export function ResponsiveGrid({ children, mobileCols = 1, tabletCols = 2, desktopCols = 3, gap = 4, className, }: ResponsiveGridProps) {
    const gridClasses = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
    };
    const gridStyle = ({ gap: `${gap * 0.25}rem` });
    return (<div className={cn('grid gap-4', gridClasses[mobileCols], `sm:${gridClasses[tabletCols]} lg:${gridClasses[desktopCols]}`, className)} style={gridStyle}>
      {children}
    </div>);
}
interface MobileStickyHeaderProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
    onBack?: () => void;
    className?: string;
}
/**
 * Sticky header for mobile pages
 */
export function MobileStickyHeader({ title, subtitle, action, onBack, className, }: MobileStickyHeaderProps) {
    return (<div className={cn('sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden', className)}>
      <div className="flex h-14 items-center gap-3 px-4">
        {onBack && (<Button variant="ghost" size="icon" onClick={onBack} className="shrink-0" aria-label="Go back">
            ←
          </Button>)}
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-semibold truncate">{title}</h1>
          {subtitle && (<p className="text-xs text-muted-foreground truncate">{subtitle}</p>)}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>);
}
interface PullToRefreshProps {
    onRefresh: () => Promise<void> | void;
    isRefreshing: boolean;
    children: React.ReactNode;
    threshold?: number;
    className?: string;
}
/**
 * Pull-to-refresh functionality for mobile
 */
export function PullToRefresh({ onRefresh, isRefreshing, children, threshold = 80, className, }: PullToRefreshProps) {
    const [touchStart, setTouchStart] = useState(0);
    const [touchCurrent, setTouchCurrent] = useState(0);
    const [isPulling, setIsPulling] = useState(false);
    const handleTouchStart = (e: React.TouchEvent) => {
        if (window.scrollY === 0) {
            setTouchStart(e.touches[0]?.clientY ?? 0);
        }
    };
    const handleTouchMove = (e: React.TouchEvent) => {
        if (window.scrollY === 0 && touchStart > 0) {
            const current = e.touches[0]?.clientY ?? 0;
            const diff = current - touchStart;
            if (diff > 10) {
                setTouchCurrent(current);
                setIsPulling(true);
            }
        }
    };
    const handleTouchEnd = async () => {
        if (isPulling) {
            const diff = touchCurrent - touchStart;
            if (diff > threshold) {
                await onRefresh();
            }
        }
        setTouchStart(0);
        setTouchCurrent(0);
        setIsPulling(false);
    };
    const pullDistance = Math.min(touchCurrent - touchStart, threshold * 1.5);
    const rotation = (pullDistance / threshold) * 360;
    const indicatorStyle = ({
        transform: `translateY(${Math.max(0, pullDistance - threshold)}px)`,
        opacity: isPulling ? pullDistance / threshold : 0,
    });
    const rotationStyle = ({ transform: `rotate(${rotation}deg)` });
    return (<div className={cn('relative min-h-screen', className)} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      {/* Pull indicator */}
      <div className="fixed left-0 right-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur transition-transform duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-out)] motion-reduce:transition-none md:hidden" style={indicatorStyle}>
        <div className="text-muted-foreground transition-transform" style={rotationStyle}>
          <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
        </div>
      </div>

      {children}

      {isRefreshing && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm md:hidden">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"/>
        </div>)}
    </div>);
}
/**
 * Hook to detect if current viewport is mobile
 */
/** @deprecated Import from `@/shared/hooks/use-is-mobile` */
export function useIsMobile(breakpoint: number = 768) {
    return useIsMobileHook(breakpoint);
}
function resolveBreakpoint(width: number): MobileBreakpoint {
    if (width < 640)
        return 'sm';
    if (width < 768)
        return 'md';
    if (width < 1024)
        return 'lg';
    if (width < 1280)
        return 'xl';
    return '2xl';
}
/**
 * Hook to get current breakpoint
 */
export function useBreakpoint() {
    const width = useWindowWidth();
    return resolveBreakpoint(width);
}
/**
 * Mobile-safe click handler that prevents double-tap zoom
 */
export function useMobileClick(onClick: () => void, delay: number = 300) {
    const [lastClick, setLastClick] = useState(0);
    return () => {
        const now = Date.now();
        if (now - lastClick > delay) {
            onClick();
            setLastClick(now);
        }
    };
}
