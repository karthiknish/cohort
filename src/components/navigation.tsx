'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useMemo, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import {
  BarChart3,
  CheckSquare,
  CreditCard,
  FileText,
  MessageSquare,
  Settings,
  Home,
  Briefcase,
  LogOut,
  Menu,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  Activity,
  Users,
  HelpCircle,
  Shield,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { ClientWorkspaceSelector } from '@/components/client-workspace-selector'
import { NotificationsDropdown } from '@/components/notifications-dropdown'
import { CommandMenu } from '@/components/navigation/command-menu'
import { HelpModal, useHelpModal } from '@/components/navigation/help-modal'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type NavItem = {
  name: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  description: string
  roles?: ('admin' | 'team' | 'client')[] // If undefined, available to all roles
}

// Define navigation items with role-based access
const allNavigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, description: 'Overview and stats' },
  { name: 'Clients', href: '/dashboard/clients', icon: Users, description: 'Manage workspaces', roles: ['admin', 'team'] },
  { name: 'Activity', href: '/dashboard/activity', icon: Activity, description: 'Recent activity' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, description: 'Performance insights' },
  { name: 'Ads', href: '/dashboard/ads', icon: Megaphone, description: 'Ad integrations', roles: ['admin', 'team'] },
  { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare, description: 'Task management' },
  { name: 'Finance', href: '/dashboard/finance', icon: CreditCard, description: 'Invoices & costs', roles: ['admin', 'team'] },
  { name: 'Proposals', href: '/dashboard/proposals', icon: FileText, description: 'Create proposals', roles: ['admin', 'team'] },
  { name: 'Collaboration', href: '/dashboard/collaboration', icon: MessageSquare, description: 'Team chat' },
  { name: 'Projects', href: '/dashboard/projects', icon: Briefcase, description: 'Project management' },
]

function NavigationList({ onNavigate, collapsed = false }: { onNavigate?: () => void; collapsed?: boolean }) {
  const pathname = usePathname()
  const { user } = useAuth()
  
  // Persist last visited dashboard tab
  useEffect(() => {
    if (pathname.startsWith('/dashboard')) {
      localStorage.setItem('cohorts_last_tab', pathname)
    }
  }, [pathname])
  
  // Filter navigation items based on user role
  const navigation = useMemo(() => {
    const userRole = user?.role ?? 'client'
    return allNavigation.filter(item => {
      if (!item.roles) return true // Available to all roles
      return item.roles.includes(userRole as 'admin' | 'team' | 'client')
    })
  }, [user?.role])

  return (
    <TooltipProvider delayDuration={0}>
      <nav className="flex flex-1 flex-col space-y-4">
        <ScrollArea className="flex-1">
          <div className="space-y-1 px-1">
            {navigation.map((item) => {
              const isDashboardRoot = item.href === '/dashboard'
              const isActive = isDashboardRoot
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`)
              
              const navButton = (
                <Button
                  key={item.name}
                  asChild
                  variant={isActive ? 'default' : 'ghost'}
                  className={cn(
                    'w-full gap-2 text-sm font-medium transition-all duration-200',
                    collapsed ? 'justify-center px-0' : 'justify-start',
                    isActive
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                  )}
                >
                  <Link href={item.href} onClick={onNavigate} className="flex w-full items-center gap-2">
                    <item.icon className={cn('h-4 w-4 shrink-0 transition-transform duration-200', !isActive && 'group-hover:scale-110')} />
                    <span className={cn(collapsed && 'hidden', 'truncate')}>{item.name}</span>
                  </Link>
                </Button>
              )

              if (collapsed) {
                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      {navButton}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="flex flex-col gap-0.5">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return navButton
            })}
          </div>
        </ScrollArea>

        <div className="space-y-2 border-t pt-4 px-1">
          {/* Admin Panel Link - Only for admins */}
          {user?.role === 'admin' && (
            collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    variant="ghost"
                    className={cn('w-full gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200', collapsed ? 'justify-center px-0' : 'justify-start')}
                  >
                    <Link href="/admin" onClick={onNavigate}>
                      <Shield className="h-4 w-4" />
                      <span className={cn(collapsed && 'hidden')}>Admin</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <span className="font-medium">Admin Panel</span>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button
                asChild
                variant="ghost"
                className={cn('w-full gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200', collapsed ? 'justify-center px-0' : 'justify-start')}
              >
                <Link href="/admin" onClick={onNavigate}>
                  <Shield className="mr-2 h-4 w-4" />
                  <span className={cn(collapsed && 'hidden')}>Admin Panel</span>
                </Link>
              </Button>
            )
          )}
          
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant="ghost"
                  className={cn('w-full gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200', collapsed ? 'justify-center px-0' : 'justify-start')}
                >
                  <Link href="/settings" onClick={onNavigate}>
                    <Settings className="h-4 w-4" />
                    <span className={cn(collapsed && 'hidden')}>Settings</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <span className="font-medium">Settings</span>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              asChild
              variant="ghost"
              className={cn('w-full gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200', collapsed ? 'justify-center px-0' : 'justify-start')}
            >
              <Link href="/settings" onClick={onNavigate}>
                <Settings className="mr-2 h-4 w-4" />
                <span className={cn(collapsed && 'hidden')}>Settings</span>
              </Link>
            </Button>
          )}
        </div>
      </nav>
    </TooltipProvider>
  )
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'hidden h-full border-r bg-background/60 backdrop-blur-sm transition-all duration-300 ease-in-out lg:flex',
        collapsed ? 'w-16 flex-col items-center p-3' : 'w-64 flex-col p-4'
      )}
    >
      <button
        type="button"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className={cn(
          'mb-6 inline-flex h-9 w-9 items-center justify-center rounded-md border border-muted/60 text-muted-foreground transition-all duration-200 hover:border-primary/40 hover:text-primary hover:bg-muted/50',
          collapsed && 'mt-2'
        )}
        onClick={() => setCollapsed((prev) => !prev)}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4 transition-transform" />
        ) : (
          <ChevronLeft className="h-4 w-4 transition-transform" />
        )}
      </button>
      <div className={cn('flex-1', collapsed ? 'w-full' : '')}>
        <NavigationList collapsed={collapsed} />
      </div>
    </aside>
  )
}

export function Header() {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const { open: helpOpen, setOpen: setHelpOpen, showWelcome } = useHelpModal()

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'US'

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
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[260px] p-0">
                  <SheetHeader className="border-b px-4 py-3">
                    <SheetTitle className="text-base font-semibold">Workspace</SheetTitle>
                  </SheetHeader>
                  <div className="p-4">
                    <NavigationList onNavigate={() => setOpen(false)} />
                    <Button
                      variant="ghost"
                      className="mt-6 w-full justify-start gap-2 text-sm font-medium"
                      onClick={() => {
                        setOpen(false)
                        signOut()
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="hidden text-sm font-semibold text-primary lg:block">Cohorts</div>
          </div>

          <div className="flex w-full flex-1 flex-col gap-3 lg:ml-8 lg:flex-row lg:items-center">
            <ClientWorkspaceSelector className="w-full lg:w-[260px]" />
            <CommandMenu onOpenHelp={() => setHelpOpen(true)} />
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setHelpOpen(true)}
                    className="hidden sm:inline-flex"
                  >
                    <HelpCircle className="h-4 w-4" />
                    <span className="sr-only">Help</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Help & Navigation <kbd className="ml-2 rounded bg-muted px-1 text-[10px]">?</kbd></p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <NotificationsDropdown />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium sm:inline">
                    {user?.name ?? 'Account User'}
                  </span>
                  {roleLabel && (
                    <Badge variant={roleBadgeVariant as 'default' | 'secondary' | 'outline'} className="hidden sm:inline-flex text-[10px] px-1.5 py-0">
                      {roleLabel}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{user?.name ?? 'Account User'}</span>
                      {roleLabel && (
                        <Badge variant={roleBadgeVariant as 'default' | 'secondary' | 'outline'} className="text-[10px] px-1.5 py-0">
                          {roleLabel}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{user?.email ?? 'user@example.com'}</span>
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
                <DropdownMenuItem onSelect={() => setHelpOpen(true)}>
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
      
      <HelpModal open={helpOpen} onOpenChange={setHelpOpen} showWelcome={showWelcome} />
    </>
  )
}
