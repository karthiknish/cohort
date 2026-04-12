'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { CSSProperties } from 'react'
import { useState, useMemo, useEffect, useCallback, useRef, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { getPreviewSettingsProfile } from '@/lib/preview-data'
import { DASHBOARD_NAVIGATION_GROUPS } from '@/lib/workforce-routes'
import { useAuth } from '@/shared/contexts/auth-context'
import { usePreview } from '@/shared/contexts/preview-context'
import {
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  Shield,
  Rocket,
  AlertCircle,
} from 'lucide-react'

import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'

const DASHBOARD_SIDEBAR_TRANSITION_STYLE = { viewTransitionName: 'dashboard-sidebar' } satisfies CSSProperties
const DASHBOARD_HEADER_TRANSITION_STYLE = { viewTransitionName: 'dashboard-header' } satisfies CSSProperties
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/shared/ui/sheet'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Badge } from '@/shared/ui/badge'
import { ClientWorkspaceSelector } from '@/shared/components/client-workspace-selector'
import { NotificationsDropdown } from '@/shared/components/notifications-dropdown'
import { CommandMenu } from '@/shared/layout/navigation/command-menu'
import { HelpModal, useHelpModal } from '@/shared/layout/navigation/help-modal'
import { KeyboardShortcutBadge } from '@/shared/hooks/use-keyboard-shortcuts'
import { ProblemReportModal } from '@/shared/layout/navigation/problem-report-modal'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'

type NavItem = {
  name: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  description: string
  roles?: ('admin' | 'team' | 'client')[] // If undefined, available to all roles
}

const NavItemLink = forwardRef<
  HTMLAnchorElement,
  {
    item: NavItem
    linkClasses: string
    onNavigate?: () => void
    prefetchRoute: (href: string) => void
    collapsed: boolean
  } & Omit<React.ComponentPropsWithoutRef<typeof Link>, 'href' | 'className' | 'children'>
>(function NavItemLink(
  {
    item,
    linkClasses,
    onNavigate,
    prefetchRoute,
    collapsed,
    onClick,
    onMouseEnter,
    ...linkProps
  },
  ref,
) {
  const handleMouseEnter = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    onMouseEnter?.(event)
    prefetchRoute(item.href)
  }, [onMouseEnter, prefetchRoute, item.href])

  const handleClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)

    if (!event.defaultPrevented) {
      onNavigate?.()
    }
  }, [onClick, onNavigate])

  return (
    <Link
      ref={ref}
      href={item.href}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className={linkClasses}
      aria-label={collapsed ? item.name : undefined}
      title={collapsed ? item.name : undefined}
      {...linkProps}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{item.name}</span>}
    </Link>
  )
})

function NavigationList({ onNavigate, collapsed = false }: { onNavigate?: () => void; collapsed?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const prefetchedRef = useRef<Set<string>>(new Set())

  const prefetchRoute = useCallback((href: string) => {
    if (!href) return
    const target = href.split('?')[0]
    if (target && target !== pathname && !prefetchedRef.current.has(target)) {
      prefetchedRef.current.add(target)
      try {
        router.prefetch(href)
      } catch {
        // ignore prefetch failures
      }
    }
  }, [pathname, router])

  const prefetchAdmin = useCallback(() => prefetchRoute('/admin'), [prefetchRoute])
  const prefetchSettings = useCallback(() => prefetchRoute('/settings'), [prefetchRoute])

  // Persist last visited dashboard tab
  useEffect(() => {
    if (pathname.startsWith('/dashboard')) {
      localStorage.setItem('cohorts_last_tab', pathname)
    }
  }, [pathname])

  // Filter navigation items based on user role
  const navigationGroups = useMemo(() => {
    const userRole = user?.role ?? 'client'
    return DASHBOARD_NAVIGATION_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!item.roles) return true
        return item.roles.includes(userRole as 'admin' | 'team' | 'client')
      }),
    })).filter((group) => group.items.length > 0)
  }, [user?.role])

  return (
    <TooltipProvider delayDuration={300} skipDelayDuration={100}>
      <nav className="flex flex-1 flex-col space-y-4">
        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-4 px-1">
            {navigationGroups.map((group) => (
              <div key={group.id} className="space-y-1.5">
                {!collapsed ? (
                  <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/65">
                    {group.label}
                  </p>
                ) : null}
                {group.items.map((item) => {
                  const isDashboardRoot = item.href === '/dashboard'
                  const isActive = isDashboardRoot
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(`${item.href}/`)

                  const linkClasses = cn(
                    'flex h-9 w-full items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors',
                    collapsed ? 'justify-center px-0' : 'justify-start',
                    isActive
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                  )

                  const navLink = (
                    <NavItemLink
                      key={item.name}
                      item={item}
                      linkClasses={linkClasses}
                      onNavigate={onNavigate}
                      prefetchRoute={prefetchRoute}
                      collapsed={collapsed}
                    />
                  )

                  if (collapsed) {
                    return (
                      <Tooltip key={item.name}>
                        <TooltipTrigger asChild>
                          {navLink}
                        </TooltipTrigger>
                        <TooltipContent side="right" className="flex flex-col gap-0.5">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-xs text-muted-foreground">{item.description}</span>
                        </TooltipContent>
                      </Tooltip>
                    )
                  }

                  return navLink
                })}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="space-y-2 border-t pt-4 px-1">
          {/* Admin Panel Link - Only for admins */}
          {user?.role === 'admin' && (
            collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/admin"
                    onClick={onNavigate}
                    onMouseEnter={prefetchAdmin}
                    className="flex h-9 w-full items-center justify-center gap-2 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/80"
                  >
                    <Shield className="h-4 w-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <span className="font-medium">Admin Panel</span>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Link
                href="/admin"
                onClick={onNavigate}
                onMouseEnter={prefetchAdmin}
                className="flex h-9 w-full items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/80"
              >
                <Shield className="h-4 w-4" />
                <span>Admin Panel</span>
              </Link>
            )
          )}

          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/settings"
                  onClick={onNavigate}
                  onMouseEnter={prefetchSettings}
                  className="flex h-9 w-full items-center justify-center gap-2 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/80"
                >
                  <Settings className="h-4 w-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <span className="font-medium">Settings</span>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              href="/settings"
              onClick={onNavigate}
              onMouseEnter={prefetchSettings}
              className="flex h-9 w-full items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/80"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
          )}
        </div>
      </nav>
    </TooltipProvider>
  )
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }

    try {
      const stored = localStorage.getItem('cohorts.sidebar.collapsed')
      if (stored === 'true') return true
      if (stored === 'false') return false
    } catch {
      // ignore storage failures
    }

    return true
  })

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('cohorts.sidebar.collapsed', String(next))
        }
      } catch {
        // ignore storage failures
      }
      return next
    })
  }, [])

  return (
    <aside
      id="tour-sidebar"
      className={cn(
        'hidden min-h-0 h-full shrink-0 border-r bg-background/60 backdrop-blur-sm transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] duration-(--motion-duration-normal) ease-(--motion-ease-in-out) motion-reduce:transition-none lg:flex',
        collapsed ? 'w-16 flex-col items-center p-3' : 'w-64 flex-col p-4'
      )}
      style={DASHBOARD_SIDEBAR_TRANSITION_STYLE}
    >
      <button
        type="button"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className={cn(
          'mb-6 inline-flex h-9 w-9 items-center justify-center rounded-md border border-muted/60 text-muted-foreground transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] duration-(--motion-duration-fast) ease-(--motion-ease-standard) motion-reduce:transition-none hover:border-primary/40 hover:text-primary hover:bg-muted/50',
          collapsed && 'mt-2'
        )}
        onClick={toggleCollapsed}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4 transition-transform" />
        ) : (
          <ChevronLeft className="h-4 w-4 transition-transform" />
        )}
      </button>
      <div className={cn('min-h-0 flex-1', collapsed ? 'w-full' : '')}>
        <NavigationList collapsed={collapsed} />
      </div>
    </aside>
  )
}

export function Header() {
  const { user, signOut } = useAuth()
  const { isPreviewMode } = usePreview()
  const [open, setOpen] = useState(false)
  const { open: helpOpen, onOpenChange: onHelpOpenChange, showWelcome, setShowWelcome } = useHelpModal()
  const [problemReportOpen, setProblemReportOpen] = useState(false)
  const previewProfile = getPreviewSettingsProfile()
  const displayedName = isPreviewMode ? previewProfile.name : (user?.name ?? 'Account')
  const displayedEmail = isPreviewMode ? previewProfile.email : (user?.email ?? 'user@example.com')

  const initialsSource = displayedName
  const initials = initialsSource
    ? initialsSource
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
    : 'US'

  const handleNavigate = useCallback(() => setOpen(false), [])
  const handleSignOut = useCallback(() => {
    setOpen(false)
    signOut()
  }, [signOut])
  const handleShowOnboarding = useCallback(() => {
    setShowWelcome(true)
    void onHelpOpenChange(true)
  }, [setShowWelcome, onHelpOpenChange])
  const handleOpenHelp = useCallback(() => {
    setShowWelcome(false)
    void onHelpOpenChange(true)
  }, [setShowWelcome, onHelpOpenChange])
  const handleOpenProblemReport = useCallback(() => setProblemReportOpen(true), [])

  const roleLabel = useMemo(() => {
    switch (user?.role) {
      case 'admin': return 'Admin'
      case 'team': return 'Team'
      case 'client': return 'Client'
      default: return null
    }
  }, [user?.role])

  const roleBadgeVariant = useMemo(() => {
    switch (user?.role) {
      case 'admin': return 'default'
      case 'team': return 'secondary'
      case 'client': return 'outline'
      default: return 'outline'
    }
  }, [user?.role])

  return (
    <>
      <header
        className="sticky top-0 z-1000 border-b bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur supports-backdrop-filter:bg-background/60"
        style={DASHBOARD_HEADER_TRANSITION_STYLE}
      >
        <div className="flex h-14 items-center justify-between gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6 lg:px-8">
          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0" aria-label="Open navigation menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-70 p-0">
                <SheetHeader className="border-b px-4 py-3">
                  <SheetTitle className="text-base font-semibold">Workspace</SheetTitle>
                </SheetHeader>
                <div className="p-4">
                  <NavigationList onNavigate={handleNavigate} />
                  <Button
                    variant="ghost"
                    className="mt-6 w-full justify-start gap-2 text-sm font-medium"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    Sign Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Workspace selector */}
          <div className="min-w-0 flex-1 sm:flex-none sm:max-w-65">
            <ClientWorkspaceSelector className="w-full" />
          </div>

          {/* Search / Command menu (takes remaining space on desktop) */}
          <div className="hidden sm:flex flex-1 sm:max-w-md">
            <CommandMenu onOpenHelp={handleOpenHelp} />
          </div>

          {/* Right side actions (pinned to the right) */}
          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            {/* Mobile search button - only visible on small screens */}
            <div className="sm:hidden">
              <CommandMenu onOpenHelp={handleOpenHelp} />
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleOpenProblemReport}
                    className="hidden sm:inline-flex"
                    aria-label="Report a problem"
                  >
                    <AlertCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <span>Report a problem</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleShowOnboarding}
                    className="hidden sm:inline-flex"
                    aria-label="Show onboarding tour"
                  >
                    <Rocket className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="flex items-center gap-2">
                    <span>Onboarding</span>
                    <KeyboardShortcutBadge combo="shift+?" />
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>


            <NotificationsDropdown />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="sm:h-auto sm:w-auto sm:px-2 sm:py-1.5" aria-label="Open account menu">
                  <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                    <AvatarFallback className="text-xs sm:text-sm">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium sm:ml-2 sm:inline">
                    {displayedName}
                  </span>
                  {isPreviewMode ? (
                    <Badge variant="secondary" className="hidden sm:ml-1.5 sm:inline-flex text-[10px] px-1.5 py-0">
                      Preview
                    </Badge>
                  ) : null}
                  {roleLabel && (
                    <Badge variant={roleBadgeVariant as 'default' | 'secondary' | 'outline'} className="hidden sm:ml-1.5 sm:inline-flex text-[10px] px-1.5 py-0">
                      {roleLabel}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{displayedName}</span>
                      {isPreviewMode ? (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          Preview
                        </Badge>
                      ) : null}
                      {roleLabel && (
                        <Badge variant={roleBadgeVariant as 'default' | 'secondary' | 'outline'} className="text-[10px] px-1.5 py-0">
                          {roleLabel}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{displayedEmail}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user?.role === 'admin' && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleOpenHelp}>
                  Help & Navigation
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={signOut} className="text-destructive focus:text-destructive">
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

  <HelpModal open={helpOpen} onOpenChange={onHelpOpenChange} showWelcome={showWelcome} />
      <ProblemReportModal open={problemReportOpen} onOpenChange={setProblemReportOpen} />
    </>
  )
}
