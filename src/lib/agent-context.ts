export type AgentContextIds = {
  activeProposalId?: string
  activeProjectId?: string
  activeClientId?: string
}

export type AgentContextChip = {
  id: string
  label: string
  href?: string
}

export type AgentDashboardShortcut = {
  id: string
  label: string
  prompt: string
  icon?: 'tasks' | 'projects' | 'analytics' | 'ads' | 'proposals' | 'clients' | 'meetings'
}

const DEFAULT_SUGGESTIONS = [
  'Summarize my open tasks',
  'How are my ads performing this week?',
  'Open analytics',
  'Create project Website Refresh',
] as const

const ROUTE_SUGGESTIONS: Array<{ match: (path: string) => boolean; suggestions: string[] }> = [
  {
    match: (path) => path.includes('/dashboard/tasks'),
    suggestions: [
      'Summarize my tasks due this week',
      'Create task Follow up with design team',
      'Mark all notifications as read',
      'Show overdue tasks',
    ],
  },
  {
    match: (path) => path.includes('/dashboard/projects'),
    suggestions: [
      'List active projects',
      'Create project Q2 Campaign',
      'Update this project status to active',
      'Open tasks for this project',
    ],
  },
  {
    match: (path) => path.includes('/dashboard/analytics'),
    suggestions: [
      'Summarize Google Analytics for the last 30 days',
      'Generate weekly performance report',
      'Compare revenue vs previous period',
      'Open ads dashboard',
    ],
  },
  {
    match: (path) => path.includes('/dashboard/ads'),
    suggestions: [
      'How are my Meta ads doing this week?',
      'Summarize ads performance',
      'Generate weekly report',
      'Pause underperforming campaigns',
    ],
  },
  {
    match: (path) => path.includes('/dashboard/proposals'),
    suggestions: [
      'Create proposal draft for Acme',
      'Advance proposal conversation',
      'Generate proposal from draft',
      'Open proposal analytics',
    ],
  },
  {
    match: (path) => path.includes('/dashboard/clients'),
    suggestions: [
      'List workspace clients',
      'Summarize client tasks',
      'Create client Northwind Labs',
      'Add team member to this client',
    ],
  },
  {
    match: (path) => path.includes('/dashboard/meetings'),
    suggestions: [
      'Schedule a meeting tomorrow at 2pm',
      'Summarize recent meeting notes',
      'Open collaboration',
    ],
  },
  {
    match: (path) => path.startsWith('/for-you'),
    suggestions: [
      'Open dashboard overview',
      'Show my tasks for today',
      'How are ads performing?',
      'Create project Website Refresh',
    ],
  },
]

export const AGENT_DASHBOARD_SHORTCUTS: AgentDashboardShortcut[] = [
  { id: 'tasks', label: 'Tasks', prompt: 'Show my tasks and what is due soon', icon: 'tasks' },
  { id: 'projects', label: 'Projects', prompt: 'List active projects in this workspace', icon: 'projects' },
  { id: 'analytics', label: 'Analytics', prompt: 'Open analytics and summarize the last 30 days', icon: 'analytics' },
  { id: 'ads', label: 'Ads', prompt: 'Summarize ads performance for this week', icon: 'ads' },
  { id: 'proposals', label: 'Proposals', prompt: 'List recent proposals and their status', icon: 'proposals' },
  { id: 'clients', label: 'Clients', prompt: 'List workspace clients', icon: 'clients' },
]

export function deriveActiveContextFromPath(pathname: string | null): AgentContextIds {
  if (!pathname) return {}

  const segments = pathname.split('/').filter(Boolean)

  const fromSection = (section: string): string | undefined => {
    const sectionIndex = segments.indexOf(section)
    if (sectionIndex === -1) return undefined

    const candidate = segments[sectionIndex + 1]
    if (!candidate) return undefined
    if (['new', 'viewer', 'deck'].includes(candidate)) return undefined
    return candidate
  }

  return {
    activeProposalId: fromSection('proposals'),
    activeProjectId: fromSection('projects'),
    activeClientId: fromSection('clients'),
  }
}

export function getAgentQuickSuggestions(pathname: string | null): string[] {
  const path = pathname ?? ''
  const match = ROUTE_SUGGESTIONS.find((entry) => entry.match(path))
  return match ? [...match.suggestions] : [...DEFAULT_SUGGESTIONS]
}

export function buildAgentContextChips(options: {
  pathname: string | null
  ids: AgentContextIds
  selectedClientName?: string | null
}): AgentContextChip[] {
  const chips: AgentContextChip[] = []
  const path = options.pathname ?? ''

  if (options.selectedClientName) {
    chips.push({
      id: 'workspace-client',
      label: `Client: ${options.selectedClientName}`,
      href: options.ids.activeClientId ? `/dashboard/clients/${options.ids.activeClientId}` : '/dashboard/clients',
    })
  }

  if (options.ids.activeProjectId) {
    chips.push({
      id: 'active-project',
      label: `Project ${options.ids.activeProjectId.slice(0, 8)}…`,
      href: `/dashboard/projects?projectId=${encodeURIComponent(options.ids.activeProjectId)}`,
    })
  }

  if (options.ids.activeProposalId) {
    chips.push({
      id: 'active-proposal',
      label: `Proposal ${options.ids.activeProposalId.slice(0, 8)}…`,
      href: `/dashboard/proposals/${options.ids.activeProposalId}`,
    })
  }

  if (path.includes('/dashboard/analytics')) {
    chips.push({ id: 'page', label: 'Analytics', href: '/dashboard/analytics' })
  } else if (path.includes('/dashboard/ads')) {
    chips.push({ id: 'page', label: 'Ads', href: '/dashboard/ads' })
  } else if (path.includes('/dashboard/tasks')) {
    chips.push({ id: 'page', label: 'Tasks', href: '/dashboard/tasks' })
  } else if (path.includes('/dashboard/projects')) {
    chips.push({ id: 'page', label: 'Projects', href: '/dashboard/projects' })
  } else if (path.includes('/dashboard/proposals')) {
    chips.push({ id: 'page', label: 'Proposals', href: '/dashboard/proposals' })
  } else if (path.startsWith('/for-you')) {
    chips.push({ id: 'page', label: 'For You', href: '/for-you' })
  } else if (path === '/dashboard' || path.startsWith('/dashboard/home')) {
    chips.push({ id: 'page', label: 'Overview', href: '/dashboard' })
  }

  return chips
}
