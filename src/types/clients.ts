export type ClientTeamMember = {
  name: string
  role: string
}

export type ClientRecord = {
  id: string
  name: string
  accountManager: string
  teamMembers: ClientTeamMember[]
  createdAt?: string | null
  updatedAt?: string | null
}
