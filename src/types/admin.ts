export type AdminUserRole = 'admin' | 'team' | 'client'

export type AdminUserStatus = 'active' | 'invited' | 'pending' | 'disabled' | 'suspended'

export type AdminUserRecord = {
  id: string
  name: string
  email: string
  role: AdminUserRole
  status: AdminUserStatus
  agencyId: string | null
  createdAt: string | null
  updatedAt?: string | null
  lastLoginAt: string | null
}

export const ADMIN_USER_ROLES: AdminUserRole[] = ['admin', 'team', 'client']

export const ADMIN_USER_STATUSES: AdminUserStatus[] = ['active', 'invited', 'pending', 'disabled', 'suspended']
