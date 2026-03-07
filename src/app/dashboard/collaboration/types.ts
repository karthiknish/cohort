import type { ClientTeamMember } from '@/types/clients'
import type { CollaborationChannelType } from '@/types/collaboration'

export type Channel = {
  id: string
  name: string
  type: CollaborationChannelType
  clientId: string | null
  projectId: string | null
  teamMembers: ClientTeamMember[]
  description?: string | null
  visibility?: 'public' | 'private'
  memberIds?: string[]
  isCustom?: boolean
}
