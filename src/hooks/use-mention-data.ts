'use client'

import { useMemo } from 'react'
import useSWR from 'swr'

import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
import type { MentionItem } from '@/components/agent-mode/mention-dropdown'

interface Project {
  id: string
  name: string
  status?: string
}

interface Team {
  id: string
  name: string
  memberCount?: number
}

interface TeamMember {
  id: string
  name: string
  email?: string
  role?: string
}

async function fetchWithAuth(url: string, token: string) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch')
  const payload = await res.json()
  // Most API routes return `{ success: true, data: ... }`.
  // Some legacy endpoints may return the data directly.
  return (payload && typeof payload === 'object' && 'data' in payload) 
    ? (payload as { data: unknown }).data 
    : payload
}

export function useMentionData() {
  const { getIdToken } = useAuth()
  const { selectedClient, clients: contextClients } = useClientContext()

  // Use clients from context (already fetched by ClientProvider)
  const clients = useMemo(
    () => contextClients.map((c) => ({ id: c.id, name: c.name, company: c.name })),
    [contextClients]
  )

  // Fetch projects for selected client
  const { data: projectsData, isLoading: projectsLoading } = useSWR<{ projects: Project[] }>(
    selectedClient ? `/api/projects?clientId=${selectedClient.id}` : null,
    async (url: string) => {
      const token = await getIdToken()
      return fetchWithAuth(url, token)
    },
    { revalidateOnFocus: false }
  )

  // Fetch team members - use current user's team
  const { data: teamData, isLoading: teamLoading } = useSWR<{ members: TeamMember[] }>(
    '/api/team/members',
    async (url: string) => {
      const token = await getIdToken()
      return fetchWithAuth(url, token)
    },
    { revalidateOnFocus: false }
  )

  const projects = useMemo(() => projectsData?.projects ?? [], [projectsData])
  const users = useMemo(() => teamData?.members ?? [], [teamData])

  // For now, treat teams as empty - could fetch actual team data if needed
  const teams: Team[] = useMemo(() => [], [])

  const isLoading = projectsLoading || teamLoading

  // Get all items as MentionItem array for quick access
  const allItems = useMemo((): MentionItem[] => {
    const items: MentionItem[] = []

    clients.forEach((c) => items.push({ id: c.id, name: c.name, type: 'client', subtitle: c.company }))
    projects.forEach((p) => items.push({ id: p.id, name: p.name, type: 'project', subtitle: p.status }))
    teams.forEach((t) =>
      items.push({ id: t.id, name: t.name, type: 'team', subtitle: t.memberCount ? `${t.memberCount} members` : undefined })
    )
    users.forEach((u) => items.push({ id: u.id, name: u.name, type: 'user', subtitle: u.role || u.email }))

    return items
  }, [clients, projects, teams, users])

  return {
    clients,
    projects,
    teams,
    users,
    allItems,
    isLoading,
  }
}
