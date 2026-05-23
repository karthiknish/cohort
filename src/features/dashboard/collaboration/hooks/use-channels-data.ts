'use client'

import { useCallback, useMemo, useState } from 'react'

import type { ClientRecord, ClientTeamMember } from '@/types/clients'
import type { ProjectRecord } from '@/types/projects'
import { aggregateTeamMembers, normalizeTeamMembers } from '../utils'
import type { Channel } from '../types'

type CustomChannel = {
  legacyId: string
  name: string
  description?: string | null
  visibility?: 'public' | 'private'
  memberIds?: string[]
  memberSummaries?: Array<{
    id: string
    name: string
    role?: string | null
  }>
}

/** undefined = auto-pick default; null = explicitly no channel (DM view). */
export function resolveSelectedChannelId(
  channels: Array<{ id: string }>,
  pickedChannelId: string | null | undefined,
  visibleClientId: string | null = null,
): string | null {
  if (channels.length === 0) {
    return null
  }

  if (pickedChannelId === null) {
    return null
  }

  if (pickedChannelId && channels.some((channel) => channel.id === pickedChannelId)) {
    return pickedChannelId
  }

  if (pickedChannelId !== undefined) {
    return null
  }

  const preferredClientChannelId = visibleClientId ? `client-${visibleClientId}` : null
  return (
    (preferredClientChannelId && channels.some((channel) => channel.id === preferredClientChannelId)
      ? preferredClientChannelId
      : null) ?? channels[0]?.id ?? null
  )
}

interface UseChannelsDataOptions {
  clients: ClientRecord[]
  projects: ProjectRecord[]
  customChannels: CustomChannel[]
  fallbackDisplayName: string
  fallbackRole: string
  visibleClientId?: string | null
  channelAvatars?: Map<string, string>
}

export function useChannelsData({
  clients,
  projects,
  customChannels,
  fallbackDisplayName,
  fallbackRole,
  visibleClientId = null,
  channelAvatars,
}: UseChannelsDataOptions) {
  const avatarForChannel = useCallback(
    (channelId: string) => channelAvatars?.get(channelId) ?? null,
    [channelAvatars],
  )
  const aggregatedTeamMembers = useMemo(
    () => aggregateTeamMembers(clients, fallbackDisplayName, fallbackRole),
    [clients, fallbackDisplayName, fallbackRole]
  )

  const visibleClients = useMemo(
    () => (visibleClientId ? clients.filter((client) => client.id === visibleClientId) : clients),
    [clients, visibleClientId],
  )

  const channels = useMemo<Channel[]>(() => {
    const teamChannel: Channel = {
      id: 'team-agency',
      name: 'Agency Team',
      type: 'team',
      clientId: null,
      projectId: null,
      teamMembers: aggregatedTeamMembers,
      avatarUrl: avatarForChannel('team-agency'),
    }

    const clientChannels = visibleClients.map<Channel>((client) => {
      const id = `client-${client.id}`
      return {
        id,
        name: client.name,
        type: 'client',
        clientId: client.id,
        projectId: null,
        teamMembers: normalizeTeamMembers(client.teamMembers),
        avatarUrl: avatarForChannel(id),
      }
    })

    const projectChannels = projects.map<Channel>((project) => {
      const relatedClient = clients.find((client) => client.id === project.clientId)
      const id = `project-${project.id}`
      return {
        id,
        name: project.name,
        type: 'project',
        clientId: project.clientId,
        projectId: project.id,
        teamMembers: relatedClient
          ? normalizeTeamMembers(relatedClient.teamMembers)
          : aggregatedTeamMembers,
        avatarUrl: avatarForChannel(id),
      }
    })

    const customTeamChannels = customChannels.map<Channel>((channel) => ({
      id: channel.legacyId,
      name: channel.name,
      type: 'team',
      clientId: null,
      projectId: null,
      description: channel.description ?? null,
      visibility: channel.visibility ?? 'private',
      memberIds: Array.isArray(channel.memberIds) ? channel.memberIds : [],
      isCustom: true,
      teamMembers: Array.isArray(channel.memberSummaries) && channel.memberSummaries.length > 0
        ? channel.memberSummaries.map((member) => ({
            id: member.id,
            name: member.name,
            role: member.role?.trim() || 'Contributor',
          }))
        : aggregatedTeamMembers,
      avatarUrl: avatarForChannel(channel.legacyId),
    }))

    return [teamChannel, ...customTeamChannels, ...clientChannels, ...projectChannels]
  }, [aggregatedTeamMembers, avatarForChannel, clients, customChannels, projects, visibleClients])

  // undefined = auto-pick default channel; null = explicitly no channel (e.g. viewing a DM)
  const [pickedChannelId, setPickedChannelId] = useState<string | null | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState('')

  const selectedChannelId = useMemo(
    () => resolveSelectedChannelId(channels, pickedChannelId, visibleClientId),
    [channels, pickedChannelId, visibleClientId],
  )

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
    setPickedChannelId(channelId)
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
    setSelectedChannelId: setPickedChannelId,
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
