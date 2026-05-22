import { getPreviewAdminInvitations, getPreviewAdminUsers } from '@/lib/preview-data'
import { ADMIN_USER_ROLES, ADMIN_USER_STATUSES, type AdminUserRecord, type AdminUserRole, type AdminUserStatus } from '@/types/admin'

export type StatusFilter = 'all' | AdminUserStatus
export type RoleFilter = 'all' | AdminUserRole
export type InvitationLifecycleStatus = 'pending' | 'accepted' | 'expired' | 'revoked'

export type AdminInvitationRecord = {
  id: string
  email: string
  role: AdminUserRole
  name: string | null
  message: string | null
  status: InvitationLifecycleStatus
  effectiveStatus: InvitationLifecycleStatus
  invitedBy: string
  invitedByName: string | null
  expiresAtMs: number
  createdAtMs: number
  acceptedAtMs: number | null
}

export const ROLE_ASSIGNABLE: AdminUserRole[] = ['team', 'client']
export const STATUS_OPTIONS: StatusFilter[] = ['all', ...ADMIN_USER_STATUSES]
export const INVITATION_STATUSES: InvitationLifecycleStatus[] = ['pending', 'accepted', 'expired', 'revoked']

export function normalizeAdminRole(value: string | null | undefined): AdminUserRole {
  if (typeof value === 'string' && ADMIN_USER_ROLES.includes(value as AdminUserRole)) {
    return value as AdminUserRole
  }
  return 'team'
}

export function normalizeAdminStatus(value: string | null | undefined): AdminUserStatus {
  if (typeof value === 'string' && ADMIN_USER_STATUSES.includes(value as AdminUserStatus)) {
    return value as AdminUserStatus
  }
  return 'pending'
}

export type AdminUsersPageState = {
  usersOverride: AdminUserRecord[] | null
  previewUsers: AdminUserRecord[]
  previewInvitations: AdminInvitationRecord[]
  loadingMore: boolean
  statusFilter: StatusFilter
  roleFilter: RoleFilter
  searchTerm: string
  invitationSearchTerm: string
  invitationStatusFilter: InvitationLifecycleStatus
  savingId: string | null
  invitationActionKey: string | null
  inviteOpen: boolean
  revokeOpen: boolean
  selectedUser: AdminUserRecord | null
  inviteEmail: string
  inviteRole: AdminUserRole
  inviteSending: boolean
}

export type AdminUsersPageAction =
  | { type: 'setUsersOverride'; value: AdminUserRecord[] | null | ((prev: AdminUserRecord[] | null) => AdminUserRecord[] | null) }
  | { type: 'setPreviewUsers'; value: AdminUserRecord[] | ((prev: AdminUserRecord[]) => AdminUserRecord[]) }
  | { type: 'setPreviewInvitations'; value: AdminInvitationRecord[] | ((prev: AdminInvitationRecord[]) => AdminInvitationRecord[]) }
  | { type: 'setLoadingMore'; value: boolean }
  | { type: 'setStatusFilter'; value: StatusFilter }
  | { type: 'setRoleFilter'; value: RoleFilter }
  | { type: 'setSearchTerm'; value: string }
  | { type: 'setInvitationSearchTerm'; value: string }
  | { type: 'setInvitationStatusFilter'; value: InvitationLifecycleStatus }
  | { type: 'setSavingId'; value: string | null }
  | { type: 'setInvitationActionKey'; value: string | null | ((prev: string | null) => string | null) }
  | { type: 'setInviteOpen'; value: boolean }
  | { type: 'setRevokeOpen'; value: boolean }
  | { type: 'setSelectedUser'; value: AdminUserRecord | null }
  | { type: 'setInviteEmail'; value: string }
  | { type: 'setInviteRole'; value: AdminUserRole }
  | { type: 'setInviteSending'; value: boolean }
  | { type: 'resetInviteForm' }
  | { type: 'refresh'; previewUsers: AdminUserRecord[]; previewInvitations: AdminInvitationRecord[] }

export function createInitialAdminUsersPageState(): AdminUsersPageState {
  return {
    usersOverride: null,
    previewUsers: getPreviewAdminUsers(),
    previewInvitations: getPreviewAdminInvitations(),
    loadingMore: false,
    statusFilter: 'all',
    roleFilter: 'all',
    searchTerm: '',
    invitationSearchTerm: '',
    invitationStatusFilter: 'pending',
    savingId: null,
    invitationActionKey: null,
    inviteOpen: false,
    revokeOpen: false,
    selectedUser: null,
    inviteEmail: '',
    inviteRole: 'team',
    inviteSending: false,
  }
}

export function adminUsersPageReducer(state: AdminUsersPageState, action: AdminUsersPageAction): AdminUsersPageState {
  switch (action.type) {
    case 'setUsersOverride':
      return {
        ...state,
        usersOverride:
          typeof action.value === 'function' ? action.value(state.usersOverride) : action.value,
      }
    case 'setPreviewUsers':
      return {
        ...state,
        previewUsers:
          typeof action.value === 'function' ? action.value(state.previewUsers) : action.value,
      }
    case 'setPreviewInvitations':
      return {
        ...state,
        previewInvitations:
          typeof action.value === 'function' ? action.value(state.previewInvitations) : action.value,
      }
    case 'setLoadingMore':
      return { ...state, loadingMore: action.value }
    case 'setStatusFilter':
      return { ...state, statusFilter: action.value }
    case 'setRoleFilter':
      return { ...state, roleFilter: action.value }
    case 'setSearchTerm':
      return { ...state, searchTerm: action.value }
    case 'setInvitationSearchTerm':
      return { ...state, invitationSearchTerm: action.value }
    case 'setInvitationStatusFilter':
      return { ...state, invitationStatusFilter: action.value }
    case 'setSavingId':
      return { ...state, savingId: action.value }
    case 'setInvitationActionKey':
      return {
        ...state,
        invitationActionKey:
          typeof action.value === 'function' ? action.value(state.invitationActionKey) : action.value,
      }
    case 'setInviteOpen':
      return { ...state, inviteOpen: action.value }
    case 'setRevokeOpen':
      return { ...state, revokeOpen: action.value }
    case 'setSelectedUser':
      return { ...state, selectedUser: action.value }
    case 'setInviteEmail':
      return { ...state, inviteEmail: action.value }
    case 'setInviteRole':
      return { ...state, inviteRole: action.value }
    case 'setInviteSending':
      return { ...state, inviteSending: action.value }
    case 'resetInviteForm':
      return { ...state, inviteOpen: false, inviteEmail: '', inviteRole: 'team' }
    case 'refresh':
      return {
        ...state,
        statusFilter: 'all',
        roleFilter: 'all',
        searchTerm: '',
        invitationStatusFilter: 'pending',
        invitationSearchTerm: '',
        usersOverride: null,
        previewUsers: action.previewUsers,
        previewInvitations: action.previewInvitations,
      }
    default:
      return state
  }
}

export function statusLabel(status: AdminUserStatus | 'all'): string {
  if (status === 'all') {
    return 'All'
  }
  return status.replace('_', ' ')
}

export function invitationStatusLabel(status: InvitationLifecycleStatus): string {
  return status.replace('_', ' ')
}
