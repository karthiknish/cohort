'use client'

import { useCallback, useMemo, useState } from 'react'

import type { ClientRecord, ClientTeamMember } from '@/types/clients'
import type { ProjectRecord } from '@/types/projects'
import { aggregateTeamMembers, normalizeTeamMembers } from '../utils'
import type { Channel } from '../types'

interface UseChannelsDataOptions {
  clients: ClientRecord[]
  projects: ProjectRecord[]
  fallbackDisplayName: string
  fallbackRole: string
}

export function useChannelsData({
  clients,
  projects,
  fallbackDisplayName,
  fallbackRole,
}: UseChannelsDataOptions) {
  const aggregatedTeamMembers = useMemo(
    () => aggregateTeamMembers(clients, fallbackDisplayName, fallbackRole),
    [clients, fallbackDisplayName, fallbackRole]
  )

  const channels = useMemo<Channel[]>(() => {
    const teamChannel: Channel = {
      id: 'team-agency',
      name: 'Agency Team',
      type: 'team',
      clientId: null,
      projectId: null,
      teamMembers: aggregatedTeamMembers,
    }

    const clientChannels = clients.map<Channel>((client) => ({
      id: `client-${client.id}`,
      name: client.name,
      type: 'client',
      clientId: client.id,
      projectId: null,
      teamMembers: normalizeTeamMembers(client.teamMembers),
    }))

    const projectChannels = projects.map<Channel>((project) => {
      const relatedClient = clients.find((client) => client.id === project.clientId)
      return {
        id: `project-${project.id}`,
        name: project.name,
        type: 'project',
        clientId: project.clientId,
        projectId: project.id,
        teamMembers: relatedClient
          ? normalizeTeamMembers(relatedClient.teamMembers)
          : aggregatedTeamMembers,
      }
    })

    return [teamChannel, ...clientChannels, ...projectChannels]
  }, [aggregatedTeamMembers, clients, projects])

  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const selectedChannel = useMemo(
    () => channels.find((channel) => channel.id === selectedChannelId) ?? null,
    [channels, selectedChannelId]
  )

  const filteredChannels = useMemo(() => {
    if (!searchQuery.trim()) return channels
    const query = searchQuery.toLowerCase().trim()
    return channels.filter((channel) => channel.name.toLowerCase().includes(query))
  }, [channels, searchQuery])

  const selectChannel = useCallback((channelId: string | null) => {
    setSelectedChannelId(channelId)
  }, [])

  const channelParticipants = useMemo<ClientTeamMember[]>(() => {
    if (!selectedChannel) return []

    const map = new Map<string, ClientTeamMember>()
    selectedChannel.teamMembers.forEach((member) => {
      const name = member.name.trim()
      if (!name) return
      const key = name.toLowerCase()
      if (!map.has(key)) {
        map.set(key, { name, role: member.role?.trim() || 'Contributor' })
      }
    })

    if (fallbackDisplayName) {
      const key = fallbackDisplayName.toLowerCase()
      if (!map.has(key)) {
        map.set(key, { name: fallbackDisplayName, role: fallbackRole })
      }
    }

    return Array.from(map.values())
  }, [fallbackDisplayName, fallbackRole, selectedChannel])

  return {
    aggregatedTeamMembers,
    channels,
    selectedChannelId,
    setSelectedChannelId,
    selectedChannel,
    searchQuery,
    setSearchQuery,
    filteredChannels,
    selectChannel,
    channelParticipants,
    totalChannels: channels.length,
    totalParticipants: aggregatedTeamMembers.length,
  }
}
