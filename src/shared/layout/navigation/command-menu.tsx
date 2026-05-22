'use client'

import { useCallback, useMemo, useState, type ComponentType } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from 'convex/react'
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

import { clientsApi, projectsApi, proposalsApi, tasksApi } from '@/lib/convex-api'
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
import { can, capabilityForHref, type DashboardCapability } from '@/lib/access-control/dashboard-access'
import { useAuth } from '@/shared/contexts/auth-context'
import { useClientContext } from '@/shared/contexts/client-context'
import { useKeyboardShortcut, KeyboardShortcutBadge } from '@/shared/hooks/use-keyboard-shortcuts'

const COMMAND_MENU_STATUS_ID = 'command-menu-status'

type SearchableClient = {
  legacyId: string
  name: string
}

type SearchableTask = {
  legacyId: string
  title: string
  status?: string | null
  projectName?: string | null
}

type SearchableProject = {
  legacyId: string
  name: string
  status?: string | null
}

type SearchableProposal = {
  legacyId: string
  clientName?: string | null
  status?: string | null
}

type SearchEntityResult = {
  id: string
  href: string
  label: string
  description: string
  icon: ComponentType<{ className?: string }>
  group: 'Clients' | 'Tasks' | 'Projects' | 'Proposals'
}

function includesQuery(value: string | null | undefined, query: string): boolean {
  return typeof value === 'string' && value.toLowerCase().includes(query)
}

function limitResults<T>(items: T[], limit = 4): T[] {
  return items.slice(0, limit)
}

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
  onOpenShortcuts?: () => void
}

const navigationItemDefs: Array<{
  name: string
  href: string
  icon: ComponentType<{ className?: string }>
  description: string
  capability?: DashboardCapability
}> = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, description: 'Overview and stats' },
  {
    name: 'Clients',
    href: '/admin/clients',
    icon: Users,
    description: 'Manage client workspaces',
    capability: 'admin.directory',
  },
  { name: 'For You', href: '/for-you', icon: Activity, description: 'Personalized activity feed' },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    description: 'Performance insights',
    capability: 'analytics.view',
  },
  {
    name: 'Ads',
    href: '/dashboard/ads',
    icon: Megaphone,
    description: 'Ad platform integrations',
    capability: 'agency.ads',
  },
  {
    name: 'Socials',
    href: '/dashboard/socials',
    icon: Share2,
    description: 'Meta social insights & AI suggestions',
    capability: 'agency.socials',
  },
  { name: 'Meetings', href: '/dashboard/meetings', icon: Video, description: 'Schedule and run meetings' },
  { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare, description: 'Task management' },
  {
    name: 'Proposals',
    href: '/dashboard/proposals',
    icon: FileText,
    description: 'View shared proposals and decks',
    capability: 'proposals.view',
  },
  { name: 'Collaboration', href: '/dashboard/collaboration', icon: MessageSquare, description: 'Team chat' },
  { name: 'Projects', href: '/dashboard/projects', icon: Briefcase, description: 'Project management' },
]

const quickActions: Array<{
  name: string
  action: string
  icon: ComponentType<{ className?: string }>
  description: string
  capability?: DashboardCapability
}> = [
  {
    name: 'Create proposal',
    action: '/dashboard/proposals',
    icon: Plus,
    description: 'Generate new proposal',
    capability: 'proposals.manage',
  },
  { name: 'Add task', action: '/dashboard/tasks?action=create', icon: Plus, description: 'Create a new task' },
  { name: 'Open projects', action: '/dashboard/projects', icon: Plus, description: 'Jump to active projects' },
]

function itemAllowed(userRole: string | null, capability?: DashboardCapability, href?: string) {
  const resolved = capability ?? (href ? capabilityForHref(href) : null)
  if (!resolved) return true
  return can(userRole, resolved)
}

/** Exposed for tests: command palette entries filtered the same as the rendered menu. */
export function getNavigationItemsForUserRole(userRole: string | null) {
  return navigationItemDefs.filter((item) => itemAllowed(userRole, item.capability, item.href))
}

export function getQuickActionsForUserRole(userRole: string | null) {
  return quickActions.filter((item) => itemAllowed(userRole, item.capability, item.action))
}

export function CommandMenu({ onOpenHelp, onOpenShortcuts }: CommandMenuProps) {
  const [open, setOpen] = useState(false)
  const { push } = useRouter()
  const { user, authPhase } = useAuth()
  const { selectedClientId } = useClientContext()
  const workspaceId = user?.agencyId ?? null

  const navigationItems = getNavigationItemsForUserRole(user?.role ?? null)
  const quickActionItems = getQuickActionsForUserRole(user?.role ?? null)

  const [query, setQuery] = useState('')

  const canQueryWorkspace = authPhase === 'ready_active' && Boolean(workspaceId)

  const clientRows = useQuery(
    clientsApi.list,
    canQueryWorkspace
      ? {
          workspaceId: workspaceId!,
          limit: 100,
          includeAllWorkspaces: user?.role === 'admin',
        }
      : 'skip'
  ) as Array<SearchableClient> | undefined

  const taskRows = useQuery(
    selectedClientId ? tasksApi.listByClient : tasksApi.listForUser,
    canQueryWorkspace
      ? selectedClientId
        ? { workspaceId: workspaceId!, clientId: selectedClientId, limit: 100 }
        : user?.id
          ? { workspaceId: workspaceId!, userId: user.id }
          : 'skip'
      : 'skip'
  ) as Array<SearchableTask> | undefined

  const projectRows = useQuery(
    projectsApi.list,
    canQueryWorkspace
      ? {
          workspaceId: workspaceId!,
          clientId: selectedClientId ?? undefined,
          limit: 100,
        }
      : 'skip'
  ) as Array<SearchableProject> | undefined

  const proposalRows = useQuery(
    proposalsApi.list,
    canQueryWorkspace && selectedClientId
      ? {
          workspaceId: workspaceId!,
          clientId: selectedClientId,
          limit: 100,
        }
      : 'skip'
  ) as Array<SearchableProposal> | undefined

  const normalizedQuery = query.trim().toLowerCase()

  const searchResults = useMemo(() => {
    if (normalizedQuery.length < 2) {
      return [] as SearchEntityResult[]
    }

    const clientResults = limitResults(
      (Array.isArray(clientRows) ? clientRows : [])
        .filter((client) => includesQuery(client.name, normalizedQuery))
        .map((client) => ({
          id: `client-${client.legacyId}`,
          href: '/admin/clients',
          label: client.name,
          description: 'Client workspace',
          icon: Users,
          group: 'Clients' as const,
        }))
    )

    const taskResults = limitResults(
      (Array.isArray(taskRows) ? taskRows : [])
        .filter((task) => includesQuery(task.title, normalizedQuery) || includesQuery(task.projectName, normalizedQuery))
        .map((task) => ({
          id: `task-${task.legacyId}`,
          href: task.projectName
            ? `/dashboard/tasks?projectName=${encodeURIComponent(task.projectName)}`
            : '/dashboard/tasks',
          label: task.title,
          description: task.projectName || task.status || 'Task',
          icon: CheckSquare,
          group: 'Tasks' as const,
        }))
    )

    const projectResults = limitResults(
      (Array.isArray(projectRows) ? projectRows : [])
        .filter((project) => includesQuery(project.name, normalizedQuery))
        .map((project) => ({
          id: `project-${project.legacyId}`,
          href: `/dashboard/projects?projectId=${encodeURIComponent(project.legacyId)}&projectName=${encodeURIComponent(project.name)}`,
          label: project.name,
          description: project.status || 'Project',
          icon: Briefcase,
          group: 'Projects' as const,
        }))
    )

    const proposalResults = limitResults(
      (Array.isArray(proposalRows) ? proposalRows : [])
        .filter((proposal) => includesQuery(proposal.clientName, normalizedQuery) || includesQuery(proposal.legacyId, normalizedQuery))
        .map((proposal) => ({
          id: `proposal-${proposal.legacyId}`,
          href: `/dashboard/proposals/${encodeURIComponent(proposal.legacyId)}/deck`,
          label: proposal.clientName || 'Proposal deck',
          description: proposal.status || proposal.legacyId,
          icon: FileText,
          group: 'Proposals' as const,
        }))
    )

    return [...clientResults, ...taskResults, ...projectResults, ...proposalResults]
  }, [clientRows, normalizedQuery, projectRows, proposalRows, taskRows])

  const groupedSearchResults = useMemo(() => {
    return searchResults.reduce<Record<string, SearchEntityResult[]>>((accumulator, result) => {
      if (!accumulator[result.group]) {
        accumulator[result.group] = []
      }
      accumulator[result.group]!.push(result)
      return accumulator
    }, {})
  }, [searchResults])

  const isSearchLoading = useMemo(() => {
    if (normalizedQuery.length < 2 || !workspaceId) {
      return false
    }

    if (clientRows === undefined || taskRows === undefined || projectRows === undefined) {
      return true
    }

    if (selectedClientId && proposalRows === undefined) {
      return true
    }

    return false
  }, [clientRows, normalizedQuery.length, projectRows, proposalRows, selectedClientId, taskRows, workspaceId])

  const searchStatusMessage = useMemo(() => {
    if (!open) {
      return ''
    }

    if (normalizedQuery.length === 0) {
      return 'Type at least 2 characters to search pages, actions, and records.'
    }

    if (normalizedQuery.length === 1) {
      return 'Type 1 more character to start searching.'
    }

    if (isSearchLoading) {
      return `Searching for ${query.trim()}.`
    }

    if (searchResults.length === 0) {
      return `No results found for ${query.trim()}.`
    }

    const groupCount = Object.keys(groupedSearchResults).length
    return `${searchResults.length} results found for ${query.trim()} across ${groupCount} sections.`
  }, [groupedSearchResults, isSearchLoading, normalizedQuery.length, open, query, searchResults.length])

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
      setQuery('')
      push(href)
    },
    [push]
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
    onOpenShortcuts?.()
  }, [onOpenShortcuts])

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      setQuery('')
    }
  }, [])

  return (
    <>
      {/* Mobile: compact icon button */}
      <button
        id="tour-command-menu-mobile"
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
        <span className="flex-1 text-left truncate">Quick navigation…</span>
        <KeyboardShortcutBadge combo="mod+k" />
      </button>

      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        <p
          id={COMMAND_MENU_STATUS_ID}
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {searchStatusMessage}
        </p>
        <CommandInput
          placeholder="Search pages, actions, clients, tasks, projects, or proposals…"
          value={query}
          onValueChange={setQuery}
          aria-label="Search pages, actions, clients, tasks, projects, or proposals"
          aria-describedby={COMMAND_MENU_STATUS_ID}
        />
        <CommandList aria-busy={isSearchLoading} aria-label="Quick navigation results">
          <CommandEmpty>No results found.</CommandEmpty>

          {Object.entries(groupedSearchResults).length > 0 ? (
            <>
              {Object.entries(groupedSearchResults).map(([group, items]) => (
                <CommandGroup key={group} heading={group}>
                  {items.map((item) => (
                    <CommandMenuRouteItem
                      key={item.id}
                      description={item.description}
                      href={item.href}
                      icon={item.icon}
                      label={item.label}
                      onNavigate={handleNavigate}
                    />
                  ))}
                </CommandGroup>
              ))}

              <CommandSeparator />
            </>
          ) : null}

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
            >
              <CommandShortcut>?</CommandShortcut>
            </CommandMenuActionItem>
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
