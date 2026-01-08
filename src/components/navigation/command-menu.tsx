'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart3,
  CheckSquare,
  CreditCard,
  FileText,
  MessageSquare,
  Home,
  Briefcase,
  Megaphone,
  Activity,
  Users,
  Search,
  Settings,
  CircleHelp,
  Keyboard,
  Plus,
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
} from '@/components/ui/command'
import { useKeyboardShortcut, KeyboardShortcutBadge } from '@/hooks/use-keyboard-shortcuts'

interface CommandMenuProps {
  onOpenHelp?: () => void
}

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, description: 'Overview and stats' },
  { name: 'Clients', href: '/dashboard/clients', icon: Users, description: 'Manage client workspaces' },
  { name: 'Activity', href: '/dashboard/activity', icon: Activity, description: 'Recent activity feed' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, description: 'Performance insights' },
  { name: 'Ads', href: '/dashboard/ads', icon: Megaphone, description: 'Ad platform integrations' },
  { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare, description: 'Task management' },
  { name: 'Finance', href: '/dashboard/finance', icon: CreditCard, description: 'Invoices and costs' },
  { name: 'Proposals', href: '/dashboard/proposals', icon: FileText, description: 'Create proposals' },
  { name: 'Collaboration', href: '/dashboard/collaboration', icon: MessageSquare, description: 'Team chat' },
  { name: 'Projects', href: '/dashboard/projects', icon: Briefcase, description: 'Project management' },
]

const quickActions = [
  { name: 'Create proposal', action: '/dashboard/proposals', icon: Plus, description: 'Generate new proposal' },
  { name: 'Add task', action: '/dashboard/tasks?new=true', icon: Plus, description: 'Create a new task' },
  { name: 'Log expense', action: '/dashboard/finance?tab=costs', icon: Plus, description: 'Record a new expense' },
]

export function CommandMenu({ onOpenHelp }: CommandMenuProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useKeyboardShortcut({
    combo: 'mod+k',
    callback: () => setOpen((prev) => !prev),
  })

  const runCommand = useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-md border border-input bg-background p-2 text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground sm:hidden"
        aria-label="Open quick navigation"
        type="button"
      >
        <Search className="h-4 w-4" />
      </button>

      <button
        id="tour-command-menu"
        onClick={() => setOpen(true)}
        className="hidden sm:inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground"
      >
        <Search className="h-4 w-4" />
        <span>Quick navigation...</span>
        <KeyboardShortcutBadge combo="mod+k" />
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages, actions, or type a command..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Quick Actions">
            {quickActions.map((item) => {
              const Icon = item.icon
              return (
                <CommandItem
                  key={item.name}
                  onSelect={() => runCommand(() => router.push(item.action))}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{item.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{item.description}</span>
                </CommandItem>
              )
            })}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Navigation">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <CommandItem
                  key={item.name}
                  onSelect={() => runCommand(() => router.push(item.href))}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{item.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{item.description}</span>
                </CommandItem>
              )
            })}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Help">
            <CommandItem onSelect={() => runCommand(() => router.push('/settings'))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
            {onOpenHelp && (
              <CommandItem onSelect={() => runCommand(onOpenHelp)}>
                <CircleHelp className="mr-2 h-4 w-4" />
                <span>Help & Shortcuts</span>
                <CommandShortcut>?</CommandShortcut>
              </CommandItem>
            )}
            <CommandItem onSelect={() => runCommand(() => { })}>
              <Keyboard className="mr-2 h-4 w-4" />
              <span>Keyboard shortcuts</span>
            </CommandItem>
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
