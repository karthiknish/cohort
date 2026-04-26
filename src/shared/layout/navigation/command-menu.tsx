'use client'

import { useCallback, useState, type ComponentType } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart3,
  CheckSquare,
  FileText,
  MessageSquare,
  Home,
  Briefcase,
  Megaphone,
  Video,
  Activity,
  Users,
  Search,
  Settings,
  CircleHelp,
  Keyboard,
  Plus,
  Share2,
} from 'lucide-react'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/shared/ui/command'
import { useAuth } from '@/shared/contexts/auth-context'
import { useKeyboardShortcut, KeyboardShortcutBadge } from '@/shared/hooks/use-keyboard-shortcuts'

function CommandMenuRouteItem({
  description,
  href,
  icon: Icon,
  label,
  onNavigate,
}: {
  description: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  onNavigate: (href: string) => void
}) {
  const handleSelect = useCallback(() => {
    onNavigate(href)
  }, [href, onNavigate])

  return (
    <CommandItem onSelect={handleSelect} className="gap-2">
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span className="min-w-0 max-w-[45%] truncate text-xs text-muted-foreground">{description}</span>
    </CommandItem>
  )
}

function CommandMenuActionItem({
  children,
  icon: Icon,
  label,
  onSelect,
}: {
  children?: React.ReactNode
  icon: React.ComponentType<{ className?: string }>
  label: string
  onSelect: () => void
}) {
  const handleSelect = useCallback(() => {
    onSelect()
  }, [onSelect])

  return (
    <CommandItem onSelect={handleSelect} className="gap-2">
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span className="min-w-0 flex-1">{label}</span>
      {children}
    </CommandItem>
  )
}

interface CommandMenuProps {
  onOpenHelp?: () => void
}

const navigationItemDefs: Array<{
  name: string
  href: string
  icon: ComponentType<{ className?: string }>
  description: string
  /** When set, only these roles see the item (default: all roles) */
  roles?: readonly ('admin' | 'team' | 'client')[]
}> = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, description: 'Overview and stats' },
  {
    name: 'Clients',
    href: '/admin/clients',
    icon: Users,
    description: 'Manage client workspaces',
    roles: ['admin'] as const,
  },
  { name: 'For You', href: '/dashboard/for-you', icon: Activity, description: 'Personalized activity feed' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, description: 'Performance insights' },
  { name: 'Ads', href: '/dashboard/ads', icon: Megaphone, description: 'Ad platform integrations', roles: ['admin', 'team'] as const },
  { name: 'Socials', href: '/dashboard/socials', icon: Share2, description: 'Meta social insights & AI suggestions', roles: ['admin', 'team'] as const },
  { name: 'Meetings', href: '/dashboard/meetings', icon: Video, description: 'Schedule and run meetings' },
  { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare, description: 'Task management' },
  { name: 'Proposals', href: '/dashboard/proposals', icon: FileText, description: 'Create proposals', roles: ['admin', 'team'] as const },
  { name: 'Collaboration', href: '/dashboard/collaboration', icon: MessageSquare, description: 'Team chat' },
  { name: 'Projects', href: '/dashboard/projects', icon: Briefcase, description: 'Project management' },
]

const quickActions: Array<{
  name: string
  action: string
  icon: ComponentType<{ className?: string }>
  description: string
  roles?: readonly ('admin' | 'team' | 'client')[]
}> = [
  {
    name: 'Create proposal',
    action: '/dashboard/proposals',
    icon: Plus,
    description: 'Generate new proposal',
    roles: ['admin', 'team'] as const,
  },
  { name: 'Add task', action: '/dashboard/tasks?action=create', icon: Plus, description: 'Create a new task' },
  { name: 'Open projects', action: '/dashboard/projects', icon: Plus, description: 'Jump to active projects' },
]

/** Exposed for tests: command palette entries filtered the same as the rendered menu. */
export function getNavigationItemsForUserRole(userRole: string | null) {
  const role = (userRole ?? 'client') as 'admin' | 'team' | 'client'
  return navigationItemDefs.filter((item) => {
    if (!item.roles) return true
    return item.roles.includes(role)
  })
}

export function getQuickActionsForUserRole(userRole: string | null) {
  const role = (userRole ?? 'client') as 'admin' | 'team' | 'client'
  return quickActions.filter((item) => {
    if (!item.roles) return true
    return item.roles.includes(role)
  })
}

export function CommandMenu({ onOpenHelp }: CommandMenuProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  const navigationItems = getNavigationItemsForUserRole(user?.role ?? null)
  const quickActionItems = getQuickActionsForUserRole(user?.role ?? null)

  useKeyboardShortcut({
    combo: 'mod+k',
    callback: () => setOpen((prev) => !prev),
  })

  const handleOpen = useCallback(() => {
    setOpen(true)
  }, [])

  const handleNavigate = useCallback(
    (href: string) => {
      setOpen(false)
      router.push(href)
    },
    [router]
  )

  const handleSettingsSelect = useCallback(() => {
    handleNavigate('/settings')
  }, [handleNavigate])

  const handleHelpSelect = useCallback(() => {
    setOpen(false)
    onOpenHelp?.()
  }, [onOpenHelp])

  const handleKeyboardShortcutsSelect = useCallback(() => {
    setOpen(false)
    onOpenHelp?.()
  }, [onOpenHelp])

  return (
    <>
      {/* Mobile: compact icon button */}
      <button
        onClick={handleOpen}
        className="inline-flex sm:hidden items-center justify-center rounded-md border border-input bg-background p-2 text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground"
        aria-label="Open quick navigation"
        aria-expanded={open}
        aria-haspopup="dialog"
        type="button"
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden />
      </button>

      {/* Desktop: full button with text */}
      <button
        id="tour-command-menu"
        onClick={handleOpen}
        type="button"
        aria-label="Search and quick navigation"
        aria-expanded={open}
        aria-haspopup="dialog"
        className="hidden sm:inline-flex w-full items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground"
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden />
        <span className="flex-1 text-left truncate">Quick navigation...</span>
        <KeyboardShortcutBadge combo="mod+k" />
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages, actions, or type a command…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Quick Actions">
            {quickActionItems.map((item) => {
              const Icon = item.icon
              return (
                <CommandMenuRouteItem
                  key={item.name}
                  description={item.description}
                  href={item.action}
                  icon={Icon}
                  label={item.name}
                  onNavigate={handleNavigate}
                />
              )
            })}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Navigation">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <CommandMenuRouteItem
                  key={item.name}
                  description={item.description}
                  href={item.href}
                  icon={Icon}
                  label={item.name}
                  onNavigate={handleNavigate}
                />
              )
            })}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Help">
            <CommandMenuActionItem icon={Settings} label="Settings" onSelect={handleSettingsSelect} />
            {onOpenHelp && (
              <CommandMenuActionItem icon={CircleHelp} label="Help & Shortcuts" onSelect={handleHelpSelect}>
                <CommandShortcut>?</CommandShortcut>
              </CommandMenuActionItem>
            )}
            <CommandMenuActionItem
              icon={Keyboard}
              label="Keyboard shortcuts"
              onSelect={handleKeyboardShortcutsSelect}
            />
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

export function useCommandMenu() {
  const [open, setOpen] = useState(false)

  const toggle = useCallback(() => setOpen((prev) => !prev), [])

  return { open, setOpen, toggle }
}
