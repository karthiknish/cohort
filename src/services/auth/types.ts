export type AuthRole = 'admin' | 'team' | 'client'
export type AuthStatus = 'active' | 'pending' | 'invited' | 'disabled' | 'suspended'

export interface AuthUser {
  id: string
  email: string
  name: string
  phoneNumber: string | null
  photoURL: string | null
  role: AuthRole
  status: AuthStatus
  agencyId: string
  createdAt: string
  updatedAt: string
  notificationPreferences?: {
    whatsapp?: {
      tasks?: boolean
      collaboration?: boolean
    }
  }
}

export interface SignUpData {
  email: string
  password: string
  displayName?: string
}
