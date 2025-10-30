'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import {
  BarChart3,
  Users,
  CheckSquare,
  CreditCard,
  FileText,
  MessageSquare,
  Settings,
  Home,
  Briefcase,
  LogOut,
  Bell,
  Menu,
  Megaphone,
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
import { Input } from '@/components/ui/input'
import { ClientWorkspaceSelector } from '@/components/client-workspace-selector'

type NavItem = {
  name: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Ads', href: '/dashboard/ads', icon: Megaphone },
  { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { name: 'Finance', href: '/dashboard/finance', icon: CreditCard },
  { name: 'Proposals', href: '/dashboard/proposals', icon: FileText },
  { name: 'Collaboration', href: '/dashboard/collaboration', icon: MessageSquare },
  { name: 'Projects', href: '/dashboard/projects', icon: Briefcase },
]

function NavigationList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-1 flex-col space-y-4">
      <ScrollArea className="flex-1">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Button
                key={item.name}
                asChild
                variant={isActive ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-2 text-sm font-medium',
                  isActive
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Link href={item.href} onClick={onNavigate} className="flex w-full items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              </Button>
            )
          })}
        </div>
      </ScrollArea>

      <div className="space-y-2 border-t pt-4">
        <Button asChild variant="ghost" className="justify-start gap-2 text-sm font-medium">
          <Link href="/settings" onClick={onNavigate}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </Button>
      </div>
    </nav>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden h-full w-64 flex-col border-r bg-background/60 p-4 lg:flex">
      <div className="mb-6" />
      <NavigationList />
    </aside>
  )
}

export function Header() {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'US'

  return (
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

          <div className="hidden text-sm font-semibold text-primary lg:block">Workspace</div>
        </div>

        <div className="flex w-full flex-1 flex-col gap-3 lg:ml-8 lg:flex-row lg:items-center">
          <ClientWorkspaceSelector className="w-full lg:w-[260px]" />
          <div className="relative hidden w-full max-w-md sm:block">
            <Input
              type="search"
              placeholder="Search clients, tasks, or campaigns..."
              className="pl-9"
            />
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="sr-only">View notifications</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:inline">
                  {user?.name ?? 'Account User'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{user?.name ?? 'Account User'}</span>
                  <span className="text-xs text-muted-foreground">{user?.email ?? 'user@example.com'}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
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
  )
}
