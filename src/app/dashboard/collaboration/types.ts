import type { ClientTeamMember } from '@/types/clients'
import type { CollaborationChannelType } from '@/types/collaboration'

export type Channel = {
  id: string
  name: string
  type: CollaborationChannelType
  clientId: string | null
  teamMembers: ClientTeamMember[]
}
