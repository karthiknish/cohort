export type ClientTeamMember = {
  id?: string
  name: string
  role: string
}

export type ClientRecord = {
  id: string
  workspaceId?: string | null
  name: string
  accountManager: string
  teamMembers: ClientTeamMember[]
  createdAt?: string | null
  updatedAt?: string | null
}
