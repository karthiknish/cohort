export type AuthRole = 'admin' | 'team' | 'client'
export type AuthStatus = 'active' | 'pending' | 'invited' | 'disabled' | 'suspended'

export interface AuthUser {
  id: string
  email: string
  name: string
  phoneNumber: string | null
  role: AuthRole
  status: AuthStatus
  agencyId: string
  createdAt: Date
  updatedAt: Date
}

export interface SignUpData {
  email: string
  password: string
  displayName?: string
}
