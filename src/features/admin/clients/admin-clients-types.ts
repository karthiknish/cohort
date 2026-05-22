export type TeamMemberField = {
  key: string
  name: string
  role: string
}

export type ClientRecord = {
  id: string
  name: string
  accountManager: string
  teamMembers: { name: string; role: string }[]
}
