'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from 'convex/react'
import {
  BarChart3,
  Briefcase,
  CheckSquare,
  FileText,
  Users,
} from 'lucide-react'

import { clientsApi, projectsApi, proposalsApi, tasksApi } from '@/lib/convex-api'
import { useAuth } from '@/shared/contexts/auth-context'
import { useClientContext } from '@/shared/contexts/client-context'
import { useKeyboardShortcut } from '@/shared/hooks/use-keyboard-shortcuts'

import { getNavigationItemsForUserRole, getQuickActionsForUserRole } from './command-menu-data'
import {
  includesQuery,
  limitResults,
  type CommandMenuProps,
  type SearchEntityResult,
  type SearchableClient,
  type SearchableProject,
  type SearchableProposal,
  type SearchableTask,
} from './command-menu-types'

export function useCommandMenu({ onOpenHelp, onOpenShortcuts }: CommandMenuProps) {
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
      : 'skip',
  ) as Array<SearchableClient> | undefined

  const taskRows = useQuery(
    selectedClientId ? tasksApi.listByClient : tasksApi.listForUser,
    canQueryWorkspace
      ? selectedClientId
        ? { workspaceId: workspaceId!, clientId: selectedClientId, limit: 100 }
        : user?.id
          ? { workspaceId: workspaceId!, userId: user.id }
          : 'skip'
      : 'skip',
  ) as Array<SearchableTask> | undefined

  const projectRows = useQuery(
    projectsApi.list,
    canQueryWorkspace
      ? {
          workspaceId: workspaceId!,
          clientId: selectedClientId ?? undefined,
          limit: 100,
        }
      : 'skip',
  ) as Array<SearchableProject> | undefined

  const proposalRows = useQuery(
    proposalsApi.list,
    canQueryWorkspace && selectedClientId
      ? {
          workspaceId: workspaceId!,
          clientId: selectedClientId,
          limit: 100,
        }
      : 'skip',
  ) as Array<SearchableProposal> | undefined

  const normalizedQuery = query.trim().toLowerCase()

  const searchResults = useMemo(() => {
    if (normalizedQuery.length < 2) {
      return [] as SearchEntityResult[]
    }

    const clientResults = limitResults(
      (Array.isArray(clientRows) ? clientRows : []).flatMap((client) =>
        includesQuery(client.name, normalizedQuery)
          ? [{
              id: `client-${client.legacyId}`,
              href: '/admin/clients',
              label: client.name,
              description: 'Client workspace',
              icon: Users,
              group: 'Clients' as const,
            }]
          : [],
      ),
    )

    const taskResults = limitResults(
      (Array.isArray(taskRows) ? taskRows : []).flatMap((task) =>
        includesQuery(task.title, normalizedQuery) || includesQuery(task.projectName, normalizedQuery)
          ? [{
              id: `task-${task.legacyId}`,
              href: task.projectName
                ? `/dashboard/tasks?projectName=${encodeURIComponent(task.projectName)}`
                : '/dashboard/tasks',
              label: task.title,
              description: task.projectName || task.status || 'Task',
              icon: CheckSquare,
              group: 'Tasks' as const,
            }]
          : [],
      ),
    )

    const projectResults = limitResults(
      (Array.isArray(projectRows) ? projectRows : []).flatMap((project) =>
        includesQuery(project.name, normalizedQuery)
          ? [{
              id: `project-${project.legacyId}`,
              href: `/dashboard/projects?projectId=${encodeURIComponent(project.legacyId)}&projectName=${encodeURIComponent(project.name)}`,
              label: project.name,
              description: project.status || 'Project',
              icon: Briefcase,
              group: 'Projects' as const,
            }]
          : [],
      ),
    )

    const proposalResults = limitResults(
      (Array.isArray(proposalRows) ? proposalRows : []).flatMap((proposal) =>
        includesQuery(proposal.clientName, normalizedQuery) || includesQuery(proposal.legacyId, normalizedQuery)
          ? [{
              id: `proposal-${proposal.legacyId}`,
              href: `/dashboard/proposals/${encodeURIComponent(proposal.legacyId)}/deck`,
              label: proposal.clientName || 'Proposal deck',
              description: proposal.status || proposal.legacyId,
              icon: FileText,
              group: 'Proposals' as const,
            }]
          : [],
      ),
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
    [push],
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

  return {
    open,
    query,
    setQuery,
    searchStatusMessage,
    isSearchLoading,
    groupedSearchResults,
    quickActionItems,
    navigationItems,
    handleOpen,
    handleOpenChange,
    handleNavigate,
    handleSettingsSelect,
    handleHelpSelect: onOpenHelp ? handleHelpSelect : undefined,
    handleKeyboardShortcutsSelect,
    showHelp: Boolean(onOpenHelp),
  }
}
