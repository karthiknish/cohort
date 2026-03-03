// =============================================================================
// CLIENTS PAGE - Data Management Hook
// =============================================================================

import { useEffect, useMemo, useState } from 'react'
import { useQuery } from 'convex/react'
import { useAuth } from '@/contexts/auth-context'
import { customFormulasApi, projectsApi, proposalsApi, tasksApi } from '@/lib/convex-api'
import { getPreviewProjects, getPreviewTasks, getPreviewProposals } from '@/lib/preview-data'
import type { ClientRecord } from '@/types/clients'

type QueryRow = Record<string, unknown>

function toStatus(row: QueryRow): string | null {
  return typeof row.status === 'string' ? row.status : null
}

export function useClientsData(selectedClient: ClientRecord | null, isPreviewMode: boolean) {
  const { user } = useAuth()
  const workspaceId = user?.agencyId ?? null

  // Real-time queries
  const proposalsRealtime = useQuery(
    proposalsApi.list,
    workspaceId && selectedClient ? { workspaceId, clientId: selectedClient.id, limit: 100 } : 'skip'
  ) as QueryRow[] | undefined

  const tasksRealtime = useQuery(
    tasksApi.listByClient,
    !isPreviewMode && workspaceId && selectedClient
      ? { workspaceId, clientId: selectedClient.id, limit: 200 }
      : 'skip'
  ) as QueryRow[] | undefined

  const projectsRealtime = useQuery(
    projectsApi.list,
    !isPreviewMode && workspaceId && selectedClient
      ? { workspaceId, clientId: selectedClient.id, limit: 200 }
      : 'skip'
  ) as QueryRow[] | undefined

  const [adStatusLoading, setAdStatusLoading] = useState(false)
  const [adAccountsConnected, setAdAccountsConnected] = useState<boolean | null>(null)

  // Formulas connectivity check
  const formulasConnectivity = useQuery(
    customFormulasApi.listByWorkspace,
    selectedClient ? { workspaceId: selectedClient.id, activeOnly: true } : 'skip'
  ) as QueryRow[] | undefined

  // Check ad connectivity
  useEffect(() => {
    if (!selectedClient) {
      setAdAccountsConnected(null)
      return
    }

    if (formulasConnectivity === undefined) {
      setAdStatusLoading(true)
      return
    }

    setAdAccountsConnected(Array.isArray(formulasConnectivity) ? formulasConnectivity.length > 0 : false)
    setAdStatusLoading(false)
  }, [selectedClient, formulasConnectivity])

  // Compute stats reactively from Convex queries
  const stats = useMemo(() => {
    if (!selectedClient) return null

    let projects: QueryRow[] = []
    let tasks: QueryRow[] = []
    let proposals: QueryRow[] = []

    if (isPreviewMode) {
      projects = getPreviewProjects(selectedClient.id)
      tasks = getPreviewTasks(selectedClient.id)
      proposals = getPreviewProposals(selectedClient.id)
    } else {
      projects = Array.isArray(projectsRealtime) ? projectsRealtime : []
      tasks = Array.isArray(tasksRealtime) ? tasksRealtime : []
      proposals = Array.isArray(proposalsRealtime) ? proposalsRealtime : []
    }

    const totalProjects = projects.length
    const activeProjects = projects.filter((project) => {
      const status = toStatus(project)
      return status === 'active' || status === 'in_progress'
    }).length

    const openTasks = tasks.filter((task) => {
      const status = toStatus(task)
      return status === 'todo' || status === 'in-progress'
    }).length
    const completedTasks = tasks.filter((task) => {
      const status = toStatus(task)
      return status === 'done' || status === 'completed'
    }).length

    const pendingProposals = proposals.filter((proposal) => {
      const status = toStatus(proposal)
      return status === 'draft' || status === 'pending' || status === 'sent'
    }).length

    return { activeProjects, totalProjects, openTasks, completedTasks, pendingProposals }
  }, [selectedClient, isPreviewMode, proposalsRealtime, tasksRealtime, projectsRealtime])

  // Stats loading state based on query loading
  const statsLoading = !isPreviewMode && (
    projectsRealtime === undefined ||
    tasksRealtime === undefined ||
    proposalsRealtime === undefined
  )

  return {
    // Queries
    proposalsRealtime,
    tasksRealtime,
    projectsRealtime,
    // State
    stats,
    statsLoading,
    adStatusLoading,
    adAccountsConnected,
  }
}
