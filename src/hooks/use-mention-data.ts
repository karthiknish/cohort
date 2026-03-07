'use client'

import { useMemo } from 'react'

import { useQuery } from 'convex/react'

import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
import type { MentionItem } from '@/components/agent-mode/mention-dropdown'
import { projectsApi, usersApi } from '@/lib/convex-api'

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

type ProjectRow = {
  legacyId: string
  name?: string
  status?: string
}

const EMPTY_TEAM_MEMBERS: TeamMember[] = []

export function useMentionData() {
  const { user } = useAuth()
  const { clients: contextClients } = useClientContext()

  // Use clients from context (already fetched by ClientProvider)
  const clients = useMemo(
    () => contextClients.map((c) => ({ id: c.id, name: c.name, company: c.name })),
    [contextClients]
  )

  const workspaceId = user?.agencyId ? String(user.agencyId) : null

  const projectsRealtime = useQuery(
    projectsApi.list,
    !workspaceId
      ? 'skip'
      : {
          workspaceId,
          limit: 100,
        }
  ) as ProjectRow[] | undefined

  const projectsLoading = Boolean(workspaceId) && projectsRealtime === undefined

  const teamMembers = useQuery(
    usersApi.listWorkspaceMembers,
    workspaceId
      ? {
          workspaceId,
          limit: 500,
        }
      : 'skip'
  ) as TeamMember[] | undefined

  const teamLoading = Boolean(workspaceId) && teamMembers === undefined

  const allUsersRealtime = useQuery(
    usersApi.listAllUsers,
    workspaceId
      ? {
          limit: 500,
        }
      : 'skip',
  ) as TeamMember[] | undefined

  const allUsersLoading = Boolean(workspaceId) && allUsersRealtime === undefined

  const projects = useMemo(() => {
    const rows = Array.isArray(projectsRealtime) ? projectsRealtime : []
    return rows.map((row) => ({
      id: String(row.legacyId),
      name: String(row.name ?? ''),
      status: typeof row.status === 'string' ? row.status : undefined,
    }))
  }, [projectsRealtime])
  const users = useMemo(() => {
    const merged = new Map<string, TeamMember>()

    for (const member of teamMembers ?? EMPTY_TEAM_MEMBERS) {
      if (!member?.id) continue
      merged.set(member.id, member)
    }

    for (const member of allUsersRealtime ?? EMPTY_TEAM_MEMBERS) {
      if (!member?.id) continue
      if (!merged.has(member.id)) {
        merged.set(member.id, member)
      }
    }

    return Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [allUsersRealtime, teamMembers])

  // For now, treat teams as empty - could fetch actual team data if needed
  const teams: Team[] = useMemo(() => [], [])

  const isLoading = projectsLoading || teamLoading || allUsersLoading

  // Get all items as MentionItem array for quick access
  const allItems = useMemo((): MentionItem[] => {
    const items: MentionItem[] = []

    clients.forEach((c) => items.push({ id: c.id, name: c.name, type: 'client', subtitle: c.company }))
    projects.forEach((p) => items.push({ id: p.id, name: p.name, type: 'project', subtitle: p.status }))
    teams.forEach((t) =>
      items.push({ id: t.id, name: t.name, type: 'team', subtitle: t.memberCount ? `${t.memberCount} members` : undefined })
    )
    users.forEach((u: TeamMember) => items.push({ id: u.id, name: u.name, type: 'user', subtitle: u.role || u.email }))

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
