import type { AgentContextIds } from './agent-context'
import { can, normalizeAuthRole, type DashboardCapability } from '@/lib/access-control/dashboard-access'

export type AgentSuggestionCapability = 'execute' | 'navigate' | 'clarify'

export type AgentSuggestionFilterOptions = {
  role?: string | null
}

const CLIENT_READ_OPERATIONS = new Set([
  'summarizeMyTasks',
  'listActiveProjects',
  'listProposals',
  'summarizeMeetings',
  'generatePerformanceReport',
  'listWorkspaceClients',
  'summarizeAdsPerformance',
])

const AGENCY_WRITE_OPERATIONS = new Set([
  'createProject',
  'createTask',
  'updateProject',
  'createProposalDraft',
  'markAllNotificationsRead',
  'summarizeAdsPerformance',
])

function capabilityForOperation(operation: string): DashboardCapability | null {
  if (operation === 'createProposalDraft') return 'proposals.manage'
  if (operation.includes('Ads') || operation === 'summarizeAdsPerformance') return 'agency.ads'
  if (operation === 'listWorkspaceClients' || operation === 'createClient') return 'admin.directory'
  if (operation === 'generatePerformanceReport') return 'analytics.view'
  return null
}

function isSuggestionAllowed(suggestion: AgentSuggestion, role: string | null | undefined): boolean {
  if (suggestion.capability === 'navigate') return true

  const operation = suggestion.operation
  if (!operation) return true

  const normalized = normalizeAuthRole(role)
  const requiredCapability = capabilityForOperation(operation)

  if (normalized === 'client') {
    if (AGENCY_WRITE_OPERATIONS.has(operation)) return false
    return CLIENT_READ_OPERATIONS.has(operation)
  }

  if (requiredCapability && !can(role, requiredCapability)) return false

  if (normalized === 'team' && operation === 'createClient') return false

  return true
}

export type AgentSuggestion = {
  id: string
  label: string
  prompt: string
  capability: AgentSuggestionCapability
  operation?: string
}

const DEFAULT_SUGGESTIONS: AgentSuggestion[] = [
  {
    id: 'tasks-due',
    label: 'Tasks due this week',
    prompt: 'Summarize my tasks due this week',
    capability: 'execute',
    operation: 'summarizeMyTasks',
  },
  {
    id: 'ads-week',
    label: 'Ads this week',
    prompt: 'How are my ads performing this week?',
    capability: 'execute',
    operation: 'summarizeAdsPerformance',
  },
  {
    id: 'nav-analytics',
    label: 'Open analytics',
    prompt: 'Open analytics',
    capability: 'navigate',
  },
  {
    id: 'create-project',
    label: 'New project',
    prompt: 'Create project Website Refresh',
    capability: 'execute',
    operation: 'createProject',
  },
]

type RouteSuggestionRule = {
  match: (path: string) => boolean
  suggestions: AgentSuggestion[]
}

const ROUTE_SUGGESTIONS: RouteSuggestionRule[] = [
  {
    match: (path) => path.includes('/dashboard/tasks'),
    suggestions: [
      {
        id: 'tasks-due-week',
        label: 'Due this week',
        prompt: 'Summarize my tasks due this week',
        capability: 'execute',
        operation: 'summarizeMyTasks',
      },
      {
        id: 'create-task',
        label: 'New task',
        prompt: 'Create task Follow up with design team',
        capability: 'execute',
        operation: 'createTask',
      },
      {
        id: 'mark-notifications',
        label: 'Clear notifications',
        prompt: 'Mark all notifications as read',
        capability: 'execute',
        operation: 'markAllNotificationsRead',
      },
      {
        id: 'nav-tasks',
        label: 'Open tasks',
        prompt: 'Open tasks dashboard',
        capability: 'navigate',
      },
    ],
  },
  {
    match: (path) => path.includes('/dashboard/projects'),
    suggestions: [
      {
        id: 'list-projects',
        label: 'Active projects',
        prompt: 'List active projects in this workspace',
        capability: 'execute',
        operation: 'listActiveProjects',
      },
      {
        id: 'create-project-q2',
        label: 'New project',
        prompt: 'Create project Q2 Campaign',
        capability: 'execute',
        operation: 'createProject',
      },
      {
        id: 'update-project',
        label: 'Update status',
        prompt: 'Update this project status to active',
        capability: 'execute',
        operation: 'updateProject',
      },
      {
        id: 'nav-tasks-project',
        label: 'Project tasks',
        prompt: 'Open tasks for this project',
        capability: 'navigate',
      },
    ],
  },
  {
    match: (path) => path.includes('/dashboard/analytics'),
    suggestions: [
      {
        id: 'ga-summary',
        label: 'GA last 30 days',
        prompt: 'Summarize Google Analytics for the last 30 days',
        capability: 'clarify',
      },
      {
        id: 'weekly-report',
        label: 'Weekly report',
        prompt: 'Generate weekly performance report',
        capability: 'execute',
        operation: 'generatePerformanceReport',
      },
      {
        id: 'ads-performance',
        label: 'Ads snapshot',
        prompt: 'Summarize ads performance for this week',
        capability: 'execute',
        operation: 'summarizeAdsPerformance',
      },
      {
        id: 'compare-revenue',
        label: 'Compare revenue',
        prompt: 'Compare ads revenue vs the previous period',
        capability: 'execute',
        operation: 'summarizeAdsPerformance',
      },
      {
        id: 'nav-ads',
        label: 'Open ads',
        prompt: 'Open ads dashboard',
        capability: 'navigate',
      },
    ],
  },
  {
    match: (path) => path.includes('/dashboard/ads'),
    suggestions: [
      {
        id: 'meta-ads-week',
        label: 'Meta ads this week',
        prompt: 'How are my Meta ads doing this week?',
        capability: 'execute',
        operation: 'summarizeAdsPerformance',
      },
      {
        id: 'ads-summary',
        label: 'Ads summary',
        prompt: 'Summarize ads performance',
        capability: 'execute',
        operation: 'summarizeAdsPerformance',
      },
      {
        id: 'weekly-report-ads',
        label: 'Weekly report',
        prompt: 'Generate weekly performance report',
        capability: 'execute',
        operation: 'generatePerformanceReport',
      },
      {
        id: 'active-campaigns',
        label: 'Active campaigns',
        prompt: 'What ads are active right now?',
        capability: 'execute',
        operation: 'summarizeAdsPerformance',
      },
    ],
  },
  {
    match: (path) => path.includes('/dashboard/proposals'),
    suggestions: [
      {
        id: 'list-proposals',
        label: 'List proposals',
        prompt: 'List proposals in this workspace',
        capability: 'execute',
        operation: 'listProposals',
      },
      {
        id: 'proposal-draft',
        label: 'New draft',
        prompt: 'Create proposal draft for this client',
        capability: 'execute',
        operation: 'createProposalDraft',
      },
      {
        id: 'proposal-advance',
        label: 'Gather details',
        prompt: 'Advance proposal conversation',
        capability: 'execute',
        operation: 'advanceProposalConversation',
      },
      {
        id: 'proposal-generate',
        label: 'Generate proposal',
        prompt: 'Generate proposal from draft',
        capability: 'execute',
        operation: 'generateProposalFromDraft',
      },
      {
        id: 'nav-proposals',
        label: 'Open proposals',
        prompt: 'Open proposals dashboard',
        capability: 'navigate',
      },
    ],
  },
  {
    match: (path) => path.includes('/dashboard/clients'),
    suggestions: [
      {
        id: 'list-clients',
        label: 'List clients',
        prompt: 'List workspace clients',
        capability: 'execute',
        operation: 'listWorkspaceClients',
      },
      {
        id: 'client-tasks',
        label: 'Client tasks',
        prompt: 'Summarize client tasks',
        capability: 'execute',
        operation: 'summarizeClientTasks',
      },
      {
        id: 'create-client',
        label: 'New client',
        prompt: 'Create client Northwind Labs',
        capability: 'execute',
        operation: 'createClient',
      },
      {
        id: 'add-member',
        label: 'Add member',
        prompt: 'Add team member to this client',
        capability: 'execute',
        operation: 'addClientTeamMember',
      },
    ],
  },
  {
    match: (path) => path.includes('/dashboard/meetings'),
    suggestions: [
      {
        id: 'meeting-summaries',
        label: 'Meeting notes',
        prompt: 'Summarize recent meetings with notes',
        capability: 'execute',
        operation: 'summarizeMeetings',
      },
      {
        id: 'nav-meetings',
        label: 'Open meetings',
        prompt: 'Open meetings',
        capability: 'navigate',
      },
      {
        id: 'nav-collaboration',
        label: 'Team chat',
        prompt: 'Open collaboration',
        capability: 'navigate',
      },
      {
        id: 'create-task-meeting',
        label: 'Follow-up task',
        prompt: 'Create task Send meeting recap',
        capability: 'execute',
        operation: 'createTask',
      },
    ],
  },
  {
    match: (path) => path.startsWith('/for-you'),
    suggestions: [
      {
        id: 'nav-dashboard',
        label: 'Dashboard',
        prompt: 'Open dashboard overview',
        capability: 'navigate',
      },
      {
        id: 'tasks-today',
        label: 'Tasks today',
        prompt: 'Show my tasks for today',
        capability: 'execute',
        operation: 'summarizeMyTasks',
      },
      {
        id: 'ads-week-fy',
        label: 'Ads this week',
        prompt: 'How are ads performing this week?',
        capability: 'execute',
        operation: 'summarizeAdsPerformance',
      },
      {
        id: 'create-project-fy',
        label: 'New project',
        prompt: 'Create project Website Refresh',
        capability: 'execute',
        operation: 'createProject',
      },
    ],
  },
]

export type AgentDashboardShortcut = {
  id: string
  label: string
  prompt: string
  icon?: 'tasks' | 'projects' | 'analytics' | 'ads' | 'proposals' | 'clients' | 'meetings'
  operation?: string
}

export const AGENT_DASHBOARD_SHORTCUTS: AgentDashboardShortcut[] = [
  {
    id: 'tasks',
    label: 'Tasks',
    prompt: 'Summarize my tasks and what is due soon',
    icon: 'tasks',
    operation: 'summarizeMyTasks',
  },
  {
    id: 'projects',
    label: 'Projects',
    prompt: 'List active projects in this workspace',
    icon: 'projects',
    operation: 'listActiveProjects',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    prompt: 'Generate weekly performance report',
    icon: 'analytics',
    operation: 'generatePerformanceReport',
  },
  {
    id: 'ads',
    label: 'Ads',
    prompt: 'Summarize ads performance for this week',
    icon: 'ads',
    operation: 'summarizeAdsPerformance',
  },
  {
    id: 'proposals',
    label: 'Proposals',
    prompt: 'Create proposal draft for this client',
    icon: 'proposals',
    operation: 'createProposalDraft',
  },
  {
    id: 'clients',
    label: 'Clients',
    prompt: 'List workspace clients',
    icon: 'clients',
    operation: 'listWorkspaceClients',
  },
]

export function isAgentSuggestionAllowed(
  suggestion: AgentSuggestion,
  role: string | null | undefined,
): boolean {
  return isSuggestionAllowed(suggestion, role)
}

export function filterAgentDashboardShortcuts<T extends { operation?: string }>(
  shortcuts: T[],
  role: string | null | undefined,
): T[] {
  return shortcuts.filter((shortcut) => {
    if (!shortcut.operation) return true
    return isSuggestionAllowed(
      {
        id: 'shortcut-filter',
        label: '',
        prompt: '',
        capability: 'execute',
        operation: shortcut.operation,
      },
      role,
    )
  })
}

export function getAgentSuggestions(
  pathname: string | null,
  options?: AgentSuggestionFilterOptions,
): AgentSuggestion[] {
  const path = pathname ?? ''
  const match = ROUTE_SUGGESTIONS.find((entry) => entry.match(path))
  const suggestions = match ? [...match.suggestions] : [...DEFAULT_SUGGESTIONS]
  return suggestions.filter((suggestion) => isSuggestionAllowed(suggestion, options?.role))
}

/** @deprecated Use getAgentSuggestions — returns prompt strings only. */
export function getAgentQuickSuggestions(pathname: string | null): string[] {
  return getAgentSuggestions(pathname).map((suggestion) => suggestion.prompt)
}

export function trackAgentSuggestionClick(options: {
  suggestionId: string
  prompt: string
  pathname: string | null
  operation?: string
}): void {
  if (typeof window === 'undefined') return
  void import('./analytics').then(({ logAnalyticsEvent }) => {
    void logAnalyticsEvent('agent_suggestion_clicked', {
      suggestion_id: options.suggestionId,
      prompt: options.prompt.slice(0, 120),
      pathname: options.pathname ?? '',
      operation: options.operation ?? null,
    })
  })
}

export function buildSuggestionContextHint(ids: AgentContextIds): string | null {
  const parts: string[] = []
  if (ids.activeClientId) parts.push(`active client ${ids.activeClientId}`)
  if (ids.activeProjectId) parts.push(`active project ${ids.activeProjectId}`)
  if (ids.activeProposalId) parts.push(`active proposal ${ids.activeProposalId}`)
  if (parts.length === 0) return null
  return parts.join(', ')
}
