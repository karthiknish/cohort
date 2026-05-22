'use client'

import { notifyFailure } from '@/lib/notifications'
import { mergeQueryErrors, useConvexQueryError } from '@/lib/hooks/use-convex-query-error'
import { AdminActionErrorAlert } from '../components/admin-action-error-alert'
import { AdminQueryErrorAlert } from '../components/admin-query-error-alert'
import { useAdminActionError } from '../hooks/use-admin-action-error'
import { useCallback, useMemo, useReducer } from 'react'
import { useMutation, usePaginatedQuery, useQuery } from 'convex/react'
import {
  CircleAlert,
  MoreHorizontal,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users as UsersIcon,
} from 'lucide-react'
import Link from 'next/link'

import { api } from '/_generated/api'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Checkbox } from '@/shared/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { useToast } from '@/shared/ui/use-toast'
import { useAuth } from '@/shared/contexts/auth-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { DATE_FORMATS, formatDate as formatDateLib, formatRelativeTime } from '@/lib/dates'
import { getPreviewAdminInvitations, getPreviewAdminUsers } from '@/lib/preview-data'
import { cn } from '@/lib/utils'
import { AdminPageShell } from '../components/admin-page-shell'
import { ADMIN_USER_ROLES, ADMIN_USER_STATUSES, type AdminUserRecord, type AdminUserRole, type AdminUserStatus } from '@/types/admin'

type StatusFilter = 'all' | AdminUserStatus
type RoleFilter = 'all' | AdminUserRole
type InvitationLifecycleStatus = 'pending' | 'accepted' | 'expired' | 'revoked'

type AdminInvitationRecord = {
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

const ROLE_ASSIGNABLE: AdminUserRole[] = ['team', 'client']

const STATUS_OPTIONS: StatusFilter[] = ['all', ...ADMIN_USER_STATUSES]
const INVITATION_STATUSES: InvitationLifecycleStatus[] = ['pending', 'accepted', 'expired', 'revoked']

function normalizeAdminRole(value: string | null | undefined): AdminUserRole {
  if (typeof value === 'string' && ADMIN_USER_ROLES.includes(value as AdminUserRole)) {
    return value as AdminUserRole
  }
  return 'team'
}

function normalizeAdminStatus(value: string | null | undefined): AdminUserStatus {
  if (typeof value === 'string' && ADMIN_USER_STATUSES.includes(value as AdminUserStatus)) {
    return value as AdminUserStatus
  }
  return 'pending'
}

type AdminUsersPageState = {
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

type AdminUsersPageAction =
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

function createInitialAdminUsersPageState(): AdminUsersPageState {
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

function adminUsersPageReducer(state: AdminUsersPageState, action: AdminUsersPageAction): AdminUsersPageState {
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

function UserRow({
  record,
  savingId,
  onRoleChange,
  onApprovalToggle,
  onSelectUser,
  onRevokeOpen,
}: {
  record: AdminUserRecord
  savingId: string | null
  onRoleChange: (record: AdminUserRecord, role: AdminUserRole) => void
  onApprovalToggle: (record: AdminUserRecord, approved: boolean) => void
  onSelectUser: (user: AdminUserRecord) => void
  onRevokeOpen: () => void
}) {
  const handleRoleChange = useCallback(
    (value: string) => onRoleChange(record, value as AdminUserRole),
    [onRoleChange, record]
  )

  const handleApprovalToggle = useCallback(
    (checked: boolean | 'indeterminate') => onApprovalToggle(record, checked === true),
    [onApprovalToggle, record]
  )

  const handleViewDetails = useCallback(() => onSelectUser(record), [onSelectUser, record])

  return (
    <tr className="border-b border-muted/20">
      <th scope="row" className="py-3 pr-3 text-left font-normal">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="font-medium">{record.name}</span>
            <span className="text-xs text-muted-foreground">{record.email}</span>
          </div>
        </div>
      </th>
      <td className="py-3 pr-3">
        <Select
          value={record.role}
          onValueChange={handleRoleChange}
          disabled={savingId === record.id}
        >
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLE_ASSIGNABLE.map((role) => (
              <SelectItem key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="py-3 pr-3 text-center">
        <Checkbox
          checked={record.status === 'active'}
          onCheckedChange={handleApprovalToggle}
          disabled={savingId === record.id}
        />
      </td>
      <td className="py-3 pr-3">
        <Badge variant={record.status === 'active' ? 'default' : 'secondary'}>
          {record.status}
        </Badge>
      </td>
      <td className="py-3 pr-3 text-sm text-muted-foreground">
        {record.lastLoginAt ? formatRelativeTime(record.lastLoginAt) : 'Never'}
      </td>
      <td className="py-3 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="sm" aria-label={`Actions for ${record.name}`}>
              <MoreHorizontal className="size-4" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleViewDetails}>
              View details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onRevokeOpen}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 size-4" />
              Revoke access
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  )
}

function InvitationRow({
  invitation,
  invitationActionKey,
  onResend,
  onRevoke,
}: {
  invitation: AdminInvitationRecord
  invitationActionKey: string | null
  onResend: (invitation: AdminInvitationRecord) => void
  onRevoke: (invitation: AdminInvitationRecord) => void
}) {
  const isLoading = invitationActionKey === invitation.id

  const handleResend = useCallback(() => onResend(invitation), [invitation, onResend])

  const handleRevoke = useCallback(() => onRevoke(invitation), [invitation, onRevoke])

  return (
    <tr className="border-b border-muted/20">
      <th scope="row" className="py-3 pr-3 text-left font-normal">
        <div className="flex flex-col">
          <span className="font-medium">{invitation.name || invitation.email}</span>
          {invitation.name && <span className="text-xs text-muted-foreground">{invitation.email}</span>}
        </div>
      </th>
      <td className="py-3 pr-3">
        <Badge variant="outline">{invitation.role}</Badge>
      </td>
      <td className="py-3 pr-3">
        <Badge
          variant={
            invitation.effectiveStatus === 'accepted'
              ? 'default'
              : invitation.effectiveStatus === 'expired'
              ? 'destructive'
              : invitation.effectiveStatus === 'revoked'
              ? 'secondary'
              : 'outline'
          }
        >
          {invitation.effectiveStatus}
        </Badge>
      </td>
      <td className="py-3 pr-3 text-sm text-muted-foreground">
        {formatRelativeTime(invitation.createdAtMs)}
      </td>
      <td className="py-3 pr-3 text-sm text-muted-foreground">
        {formatRelativeTime(invitation.expiresAtMs)}
      </td>
      <td className="py-3 pr-3 text-sm text-muted-foreground">
        {invitation.invitedByName || invitation.invitedBy}
      </td>
      <td className="py-3 text-right">
        <div className="flex justify-end gap-2">
          {invitation.effectiveStatus === 'pending' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResend}
              disabled={isLoading}
            >
              Resend
            </Button>
          )}
          {(invitation.effectiveStatus === 'pending' || invitation.effectiveStatus === 'expired') && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRevoke}
              disabled={isLoading}
              className="text-destructive hover:text-destructive"
            >
              Revoke
            </Button>
          )}
        </div>
      </td>
    </tr>
  )
}

export default function AdminUsersPage() {
  const { user } = useAuth()
  const { isPreviewMode } = usePreview()
  const { toast } = useToast()

  const [state, dispatch] = useReducer(adminUsersPageReducer, undefined, createInitialAdminUsersPageState)
  const {
    usersOverride,
    previewUsers,
    previewInvitations,
    loadingMore,
    statusFilter,
    roleFilter,
    searchTerm,
    invitationSearchTerm,
    invitationStatusFilter,
    savingId,
    invitationActionKey,
    inviteOpen,
    revokeOpen,
    selectedUser,
    inviteEmail,
    inviteRole,
    inviteSending,
  } = state
  const { actionError, clearActionError, reportActionFailure } = useAdminActionError()
  const workspaceContext = useQuery(api.users.getMyWorkspaceContext, !isPreviewMode && user ? {} : 'skip')
  const workspaceId = workspaceContext?.workspaceId ?? null
  const includeAllWorkspaces = workspaceContext?.role === 'admin'

  const { results: usersPage, status, loadMore, isLoading } = usePaginatedQuery(
    api.adminUsers.listUsers,
    !isPreviewMode && workspaceId
      ? {
          workspaceId,
          includeAllWorkspaces,
        }
      : 'skip',
    { initialNumItems: 50 }
  )

  const updateUserRoleStatus = useMutation(api.adminUsers.updateUserRoleStatus)
  const createInvitation = useMutation(api.adminInvitations.createInvitation)
  const resendInvitation = useMutation(api.adminInvitations.resendInvitation)
  const revokeInvitation = useMutation(api.adminInvitations.revokeInvitation)
  const invitationResponse = useQuery(api.adminInvitations.listInvitations, isPreviewMode ? 'skip' : { limit: 100 }) as
    | { invitations?: Array<Record<string, unknown>> }
    | undefined

  // Dialog states handled via reducer

  const users: AdminUserRecord[] = useMemo(() => {
    if (isPreviewMode) return previewUsers
    if (usersOverride) return usersOverride

    return (Array.isArray(usersPage) ? usersPage : []).map((row) => ({
      id: row.legacyId,
      email: row.email ?? '',
      name: row.name ?? '',
      role: normalizeAdminRole(row.role),
      status: normalizeAdminStatus(row.status),
      agencyId: row.agencyId ?? null,
      createdAt: row.createdAtMs ? new Date(row.createdAtMs).toISOString() : null,
      updatedAt: row.updatedAtMs ? new Date(row.updatedAtMs).toISOString() : null,
      lastLoginAt: null,
    }))
  }, [isPreviewMode, previewUsers, usersOverride, usersPage])

  const loading = isPreviewMode ? false : (user != null && workspaceContext === undefined) || isLoading
  const filteredUsers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()
    return users.filter((record) => {
      if (statusFilter !== 'all' && record.status !== statusFilter) {
        return false
      }
      if (roleFilter !== 'all' && record.role !== roleFilter) {
        return false
      }
      if (search.length > 0) {
        const haystack = `${record.name} ${record.email}`.toLowerCase()
        return haystack.includes(search)
      }
      return true
    })
  }, [users, statusFilter, roleFilter, searchTerm])

  const summary = useMemo(() => {
    const pending = users.filter((record) => record.status === 'pending' || record.status === 'invited').length
    const active = users.filter((record) => record.status === 'active').length
    const total = users.length
    const internal = users.filter((record) => record.role !== 'client').length
    const clients = users.filter((record) => record.role === 'client').length
    return { total, pending, active, internal, clients }
  }, [users])

  const invitationsLoading = isPreviewMode ? false : invitationResponse === undefined

  const workspaceQueryError = useConvexQueryError({
    data: workspaceContext,
    skipped: isPreviewMode || !user,
    loading: !isPreviewMode && Boolean(user) && workspaceContext === undefined,
    fallbackMessage: 'Unable to load workspace context.',
  })

  const invitationsQueryError = useConvexQueryError({
    data: invitationResponse,
    skipped: isPreviewMode,
    loading: invitationsLoading,
    fallbackMessage: 'Unable to load invitations.',
  })

  const listQueryError = mergeQueryErrors(workspaceQueryError, invitationsQueryError)

  const invitations: AdminInvitationRecord[] = useMemo(() => {
    if (isPreviewMode) {
      return previewInvitations
    }

    const rows = Array.isArray(invitationResponse?.invitations) ? invitationResponse.invitations : []

    return rows.flatMap((row) => {
        const invitation = row as {
          id?: string
          email?: string
          role?: AdminUserRole
          name?: string | null
          message?: string | null
          status?: InvitationLifecycleStatus
          effectiveStatus?: InvitationLifecycleStatus
          invitedBy?: string
          invitedByName?: string | null
          expiresAtMs?: number
          createdAtMs?: number
          acceptedAtMs?: number | null
        }

        const status = invitation.status ?? 'pending'
        const expiresAtMs = typeof invitation.expiresAtMs === 'number' ? invitation.expiresAtMs : 0
        const effectiveStatus =
          invitation.effectiveStatus ??
          status

        const mapped = {
          id: invitation.id ?? '',
          email: invitation.email ?? '',
          role: invitation.role ?? 'team',
          name: invitation.name ?? null,
          message: invitation.message ?? null,
          status,
          effectiveStatus,
          invitedBy: invitation.invitedBy ?? '',
          invitedByName: invitation.invitedByName ?? null,
          expiresAtMs,
          createdAtMs: typeof invitation.createdAtMs === 'number' ? invitation.createdAtMs : 0,
          acceptedAtMs: typeof invitation.acceptedAtMs === 'number' ? invitation.acceptedAtMs : null,
        }
        return mapped.id.length > 0 ? [mapped] : []
      })
  }, [invitationResponse, isPreviewMode, previewInvitations])

  const invitationSummary = useMemo(() => {
    return invitations.reduce<Record<InvitationLifecycleStatus, number>>(
      (acc, invitation) => {
        acc[invitation.effectiveStatus] += 1
        return acc
      },
      {
        pending: 0,
        accepted: 0,
        expired: 0,
        revoked: 0,
      }
    )
  }, [invitations])

  const filteredInvitations = useMemo(() => {
    const search = invitationSearchTerm.trim().toLowerCase()

    return invitations.filter((invitation) => {
      if (invitation.effectiveStatus !== invitationStatusFilter) {
        return false
      }

      if (search.length === 0) {
        return true
      }

      const haystack = `${invitation.email} ${invitation.name ?? ''}`.toLowerCase()
      return haystack.includes(search)
    })
  }, [invitations, invitationSearchTerm, invitationStatusFilter])

  const handleRoleChange = useCallback((record: AdminUserRecord, nextRole: AdminUserRole) => {
    if (record.role === nextRole) {
      return
    }

    if (!ROLE_ASSIGNABLE.includes(nextRole) && record.role !== nextRole) {
      // Only admin can assign admin role from team page
      notifyFailure({
        title: 'Unsupported role',
        message: 'This page only manages team or client roles.',
      })
      return
    }

    if (isPreviewMode) {
      dispatch({
        type: 'setPreviewUsers',
        value: (current) => current.map((userRecord) => (
          userRecord.id === record.id ? { ...userRecord, role: nextRole, updatedAt: new Date().toISOString() } : userRecord
        )),
      })
      toast({ title: 'Preview mode', description: `${record.name} is now ${nextRole} in the sample workspace.` })
      return
    }

    dispatch({ type: 'setSavingId', value: record.id })

    void updateUserRoleStatus({ legacyId: record.id, role: nextRole })
      .then(() => {
        dispatch({
          type: 'setUsersOverride',
          value: (prev) => {
            const base = prev ?? users
            return base.map((userRecord) => (userRecord.id === record.id ? { ...userRecord, role: nextRole } : userRecord))
          },
        })
        toast({ title: 'Role updated', description: `${record.name} is now ${nextRole}.` })
      })
      .catch((err: unknown) => {
        reportActionFailure({
          error: err,
          context: 'AdminUsers:handleRoleChange',
          title: 'Role update failed',
        })
      })
      .finally(() => {
        dispatch({ type: 'setSavingId', value: null })
      })
  }, [isPreviewMode, reportActionFailure, toast, updateUserRoleStatus, users])

  const handleApprovalToggle = useCallback((record: AdminUserRecord, approved: boolean) => {
    if (record.role === 'admin' && !approved) {
      notifyFailure({
        title: 'Cannot disable admin',
        message: 'Admin accounts must remain active.',
      })
      return
    }

    const nextStatus: AdminUserStatus = approved ? 'active' : 'pending'
    if (record.status === nextStatus) {
      return
    }

    if (isPreviewMode) {
      dispatch({
        type: 'setPreviewUsers',
        value: (current) => current.map((userRecord) => (
          userRecord.id === record.id ? { ...userRecord, status: nextStatus, updatedAt: new Date().toISOString() } : userRecord
        )),
      })
      toast({
        title: 'Preview mode',
        description: `${record.name} status set to ${nextStatus} in the sample workspace.`,
      })
      dispatch({ type: 'setRevokeOpen', value: false })
      return
    }

    dispatch({ type: 'setSavingId', value: record.id })

    void updateUserRoleStatus({ legacyId: record.id, status: nextStatus })
      .then(() => {
        dispatch({
          type: 'setUsersOverride',
          value: (prev) => {
            const base = prev ?? users
            return base.map((userRecord) => (userRecord.id === record.id ? { ...userRecord, status: nextStatus } : userRecord))
          },
        })
        toast({ title: approved ? 'Account approved' : 'Approval revoked', description: `${record.name} status set to ${nextStatus}.` })
        dispatch({ type: 'setRevokeOpen', value: false })
      })
      .catch((err: unknown) => {
        reportActionFailure({
          error: err,
          context: 'AdminUsers:handleApprovalToggle',
          title: 'Approval update failed',
        })
      })
      .finally(() => {
        dispatch({ type: 'setSavingId', value: null })
      })
  }, [isPreviewMode, reportActionFailure, toast, updateUserRoleStatus, users])

  const handleInviteUser = useCallback(() => {
    if (!inviteEmail) return

    if (isPreviewMode) {
      const nowMs = Date.now()
      dispatch({
        type: 'setPreviewInvitations',
        value: (current) => [
          {
            id: `preview-invite-${nowMs}`,
            email: inviteEmail,
            role: inviteRole,
            name: null,
            message: 'Created from the preview admin invite flow.',
            status: 'pending',
            effectiveStatus: 'pending',
            invitedBy: user?.id ?? 'preview-admin-1',
            invitedByName: user?.name ?? 'Avery Stone',
            createdAtMs: nowMs,
            expiresAtMs: nowMs + 7 * 24 * 60 * 60 * 1000,
            acceptedAtMs: null,
          },
          ...current,
        ],
      })
      toast({
        title: 'Preview mode',
        description: `Invitation queued for ${inviteEmail} in the sample workspace.`,
      })
      dispatch({ type: 'resetInviteForm' })
      return
    }

    if (!user?.id) return
    
    dispatch({ type: 'setInviteSending', value: true })

    void createInvitation({
      email: inviteEmail,
      role: inviteRole,
      invitedBy: user.id,
      invitedByName: user?.name ?? null,
    })
      .then(() => {
        toast({
          title: 'Invitation created',
          description: `Invitation created for ${inviteEmail} as ${inviteRole}. Email delivery depends on server integration settings.`,
        })
        dispatch({ type: 'resetInviteForm' })
      })
      .catch((err: unknown) => {
        reportActionFailure({
          error: err,
          context: 'AdminUsers:handleInviteUser',
          title: 'Invitation failed',
        })
      })
      .finally(() => {
        dispatch({ type: 'setInviteSending', value: false })
      })
  }, [createInvitation, inviteEmail, inviteRole, isPreviewMode, reportActionFailure, toast, user])

  const handleResendInvitation = useCallback((invitation: AdminInvitationRecord) => {
    if (isPreviewMode) {
      const nowMs = Date.now()
      dispatch({
        type: 'setPreviewInvitations',
        value: (current) => current.map((record) => (
          record.id === invitation.id
            ? {
                ...record,
                status: 'pending',
                effectiveStatus: 'pending',
                createdAtMs: nowMs,
                expiresAtMs: nowMs + 7 * 24 * 60 * 60 * 1000,
              }
            : record
        )),
      })
      toast({ title: 'Preview mode', description: `Sample invitation resent to ${invitation.email}.` })
      return
    }

    const actionKey = `resend:${invitation.id}`
    dispatch({ type: 'setInvitationActionKey', value: actionKey })

    void resendInvitation({ id: invitation.id })
      .then(() => {
        toast({
          title: 'Invitation resent',
          description: `A fresh invitation was created for ${invitation.email}. Email delivery depends on server integration settings.`,
        })
      })
      .catch((err: unknown) => {
        reportActionFailure({
          error: err,
          context: 'AdminUsers:handleResendInvitation',
          title: 'Resend failed',
        })
      })
      .finally(() => {
        dispatch({
          type: 'setInvitationActionKey',
          value: (current) => (current === actionKey ? null : current),
        })
      })
  }, [isPreviewMode, reportActionFailure, resendInvitation, toast])

  const handleRevokeInvitation = useCallback((invitation: AdminInvitationRecord) => {
    if (isPreviewMode) {
      dispatch({
        type: 'setPreviewInvitations',
        value: (current) => current.map((record) => (
          record.id === invitation.id
            ? { ...record, status: 'revoked', effectiveStatus: 'revoked' }
            : record
        )),
      })
      toast({ title: 'Preview mode', description: `${invitation.email} was revoked in the sample workspace.` })
      return
    }

    const actionKey = `revoke:${invitation.id}`
    dispatch({ type: 'setInvitationActionKey', value: actionKey })

    void revokeInvitation({ id: invitation.id })
      .then(() => {
        toast({
          title: 'Invitation revoked',
          description: `${invitation.email} can no longer use this invitation token.`,
        })
      })
      .catch((err: unknown) => {
        reportActionFailure({
          error: err,
          context: 'AdminUsers:handleRevokeInvitation',
          title: 'Revoke failed',
        })
      })
      .finally(() => {
        dispatch({
          type: 'setInvitationActionKey',
          value: (current) => (current === actionKey ? null : current),
        })
      })
  }, [isPreviewMode, reportActionFailure, revokeInvitation, toast])

  const handleRefresh = useCallback(() => {
    if (loading) return
    clearActionError()
    dispatch({
      type: 'refresh',
      previewUsers: isPreviewMode ? getPreviewAdminUsers() : state.previewUsers,
      previewInvitations: isPreviewMode ? getPreviewAdminInvitations() : state.previewInvitations,
    })
  }, [clearActionError, isPreviewMode, loading, state.previewInvitations, state.previewUsers])

  const handleInviteEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'setInviteEmail', value: e.target.value })
  }, [])

  const handleInviteRoleChange = useCallback((v: string) => {
    dispatch({ type: 'setInviteRole', value: v as AdminUserRole })
  }, [])

  const handleInviteClose = useCallback(() => {
    dispatch({ type: 'setInviteOpen', value: false })
  }, [])

  const handleInviteOpenChange = useCallback((open: boolean) => {
    dispatch({ type: 'setInviteOpen', value: open })
  }, [])

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'setSearchTerm', value: event.target.value })
  }, [])

  const handleStatusFilterChange = useCallback((value: string) => {
    dispatch({ type: 'setStatusFilter', value: value as StatusFilter })
  }, [])

  const handleRoleFilterChange = useCallback((value: string) => {
    dispatch({ type: 'setRoleFilter', value: value as RoleFilter })
  }, [])

  const handleInvitationSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'setInvitationSearchTerm', value: event.target.value })
  }, [])

  const handleInvitationStatusFilterChange = useCallback((value: string) => {
    dispatch({ type: 'setInvitationStatusFilter', value: value as InvitationLifecycleStatus })
  }, [])

  const handleRevokeClose = useCallback(() => {
    dispatch({ type: 'setRevokeOpen', value: false })
  }, [])

  const handleRevokeOpenChange = useCallback((open: boolean) => {
    dispatch({ type: 'setRevokeOpen', value: open })
  }, [])

  const handleSelectUser = useCallback((userRecord: AdminUserRecord) => {
    dispatch({ type: 'setSelectedUser', value: userRecord })
  }, [])

  const handleRevokeConfirm = useCallback(() => {
    if (selectedUser) {
      handleApprovalToggle(selectedUser, false)
    }
  }, [selectedUser, handleApprovalToggle])

  const handleLoadMore = useCallback(() => {
    if (isPreviewMode) return
    if (loadingMore) return
    dispatch({ type: 'setLoadingMore', value: true })
    void Promise.resolve()
      .then(() => loadMore(50))
      .catch((err: unknown) => {
        reportActionFailure({
          error: err,
          context: 'AdminUsers:loadMore',
          title: 'Could not load more',
        })
      })
      .finally(() => {
        dispatch({ type: 'setLoadingMore', value: false })
      })
  }, [isPreviewMode, loadingMore, loadMore, reportActionFailure])

  const handleRevokeOpen = useCallback(() => {
    dispatch({ type: 'setRevokeOpen', value: true })
  }, [])

  if (!user && !isPreviewMode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-16">
        <Card className="max-w-md border-muted/60">
          <CardHeader>
            <CardTitle className="text-lg">Sign in required</CardTitle>
            <CardDescription>Log in to an admin account to approve new users.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <>
    <AdminPageShell
      title="Users and approvals"
      description={
        <>
          Approve new accounts and assign access. Use Team management for internal staffing and Client workspaces for client allocation.
          {isPreviewMode ? ' Preview mode keeps user changes local to this session.' : ''}
        </>
      }
      isPreviewMode={isPreviewMode}
      actions={
        <>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/team">Team management</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/clients">Client workspaces</Link>
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleRefresh} disabled={loading} className="inline-flex items-center gap-2">
              <RefreshCw className={cn('size-4', loading && 'animate-spin')} /> Refresh
            </Button>
            <Dialog open={inviteOpen} onOpenChange={handleInviteOpenChange}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <UserPlus className="size-4" /> Invite user
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite new user</DialogTitle>
                  <DialogDescription>
                    Send an invitation email to add a new member to your organization.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email address</Label>
                     <Input
                      id="email"
                      placeholder="colleague@company.com"
                      value={inviteEmail}
                      onChange={handleInviteEmailChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={inviteRole} onValueChange={handleInviteRoleChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="team">Team Member</SelectItem>
                        <SelectItem value="client">Client</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleInviteClose} disabled={inviteSending}>Cancel</Button>
                  <Button onClick={handleInviteUser} disabled={!inviteEmail || inviteSending}>
                    {inviteSending ? 'Sending…' : 'Send Invitation'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </>
      }
    >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="border-muted/60 bg-background">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total users</CardTitle>
              <UsersIcon className={cn('size-4 text-muted-foreground', loading && 'animate-spin')} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{summary.total}</div>
              <p className="text-xs text-muted-foreground">All accounts in your organisation</p>
            </CardContent>
          </Card>

          <Card className="border-muted/60 bg-background">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending approval</CardTitle>
              <CircleAlert className="size-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{summary.pending}</div>
              <p className="text-xs text-muted-foreground">Awaiting activation</p>
            </CardContent>
          </Card>

          <Card className="border-muted/60 bg-background">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Internal team</CardTitle>
              <ShieldCheck className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{summary.internal}</div>
              <p className="text-xs text-muted-foreground">Admins and internal team accounts</p>
            </CardContent>
          </Card>

          <Card className="border-muted/60 bg-background">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Client access</CardTitle>
              <UsersIcon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{summary.clients}</div>
              <p className="text-xs text-muted-foreground">Accounts currently marked as client users</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-muted/60 bg-background">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle className="text-lg">Account directory</CardTitle>
              <CardDescription>Filter by status or role, approve users, and assign access. Internal staffing and client ownership are managed on the Team and Client pages.</CardDescription>
            </div>
            <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center">
              <Input
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={handleSearchChange}
                className="lg:w-64"
              />
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="lg:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === 'all' ? 'All statuses' : statusLabel(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
                <SelectTrigger className="lg:w-40">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  {ADMIN_USER_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <AdminQueryErrorAlert error={listQueryError} title="Unable to load workspace data" />
            <AdminActionErrorAlert error={actionError} onDismiss={clearActionError} />
            <div className="overflow-x-auto rounded-md border border-muted/40">
              <table className="min-w-full table-fixed text-left text-sm">
                <caption className="sr-only">Workspace users, roles, and approval status</caption>
                <thead>
                  <tr className="border-b border-muted/40">
                    <th scope="col" className="w-72 py-2 pr-3 font-medium">User</th>
                    <th scope="col" className="w-32 py-2 pr-3 font-medium">Role</th>
                    <th scope="col" className="w-32 py-2 pr-3 text-center font-medium">Approved</th>
                    <th scope="col" className="w-32 py-2 pr-3 font-medium">Status</th>
                    <th scope="col" className="w-40 py-2 pr-3 font-medium">Last active</th>
                    <th scope="col" className="py-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                        {loading
                          ? 'Loading users…'
                          : listQueryError
                            ? listQueryError
                            : 'No users match the current filters.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((record) => (
                      <UserRow
                        key={record.id}
                        record={record}
                        savingId={savingId}
                        onRoleChange={handleRoleChange}
                        onApprovalToggle={handleApprovalToggle}
                        onSelectUser={handleSelectUser}
                        onRevokeOpen={handleRevokeOpen}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {status === 'CanLoadMore' ? (
              <div className="mt-6 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                   onClick={handleLoadMore}

                  disabled={loadingMore}
                  className="inline-flex items-center gap-2"
                >
                  {loadingMore ? <RefreshCw className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                  {loadingMore ? 'Loading…' : 'Load more'}
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-muted/60 bg-background">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle className="text-lg">Invitation lifecycle</CardTitle>
              <CardDescription>
                Track pending, accepted, expired, and revoked invitations. Resend expired invites or revoke outstanding ones.
              </CardDescription>
            </div>
            <Input
              value={invitationSearchTerm}
              onChange={handleInvitationSearchChange}
              placeholder="Search invitations by name or email"
              className="lg:w-72"
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs
              value={invitationStatusFilter}
              onValueChange={handleInvitationStatusFilterChange}
              className="space-y-4"
            >
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                {INVITATION_STATUSES.map((status) => (
                  <TabsTrigger key={status} value={status} className="capitalize">
                    {invitationStatusLabel(status)} ({invitationSummary[status]})
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="overflow-x-auto rounded-md border border-muted/40">
              <table className="min-w-full table-fixed text-left text-sm">
                <caption className="sr-only">Invitation lifecycle by status</caption>
                <thead>
                  <tr className="border-b border-muted/40">
                    <th scope="col" className="w-64 py-2 pr-3 font-medium">Invitee</th>
                    <th scope="col" className="w-28 py-2 pr-3 font-medium">Role</th>
                    <th scope="col" className="w-28 py-2 pr-3 font-medium">Status</th>
                    <th scope="col" className="w-36 py-2 pr-3 font-medium">Sent</th>
                    <th scope="col" className="w-36 py-2 pr-3 font-medium">Expires</th>
                    <th scope="col" className="w-44 py-2 pr-3 font-medium">Invited by</th>
                    <th scope="col" className="py-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvitations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                        {invitationsLoading
                          ? 'Loading invitation lifecycle…'
                          : 'No invitations match this lifecycle status and search.'}
                      </td>
                    </tr>
                  ) : (
                    filteredInvitations.map((invitation) => (
                      <InvitationRow
                        key={invitation.id}
                        invitation={invitation}
                        invitationActionKey={invitationActionKey}
                        onResend={handleResendInvitation}
                        onRevoke={handleRevokeInvitation}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
    </AdminPageShell>

    <Dialog open={revokeOpen} onOpenChange={handleRevokeOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke access?</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke access for <strong>{selectedUser?.name}</strong>? They will no longer be able to sign in.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleRevokeClose}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleRevokeConfirm}
            >
              Revoke Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function statusLabel(status: AdminUserStatus | 'all'): string {
  if (status === 'all') {
    return 'All'
  }
  return status.replace('_', ' ')
}

function statusToVariant(status: AdminUserStatus) {
  switch (status) {
    case 'active':
      return 'default' as const
    case 'pending':
    case 'invited':
      return 'secondary' as const
    case 'disabled':
    case 'suspended':
      return 'destructive' as const
  }
}

function invitationStatusLabel(status: InvitationLifecycleStatus): string {
  return status.replace('_', ' ')
}

function invitationStatusToVariant(status: InvitationLifecycleStatus) {
  switch (status) {
    case 'accepted':
      return 'default' as const
    case 'pending':
      return 'secondary' as const
    case 'expired':
    case 'revoked':
      return 'destructive' as const
  }
}

function formatDateMs(value: number | null): string {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—'
  }
  return formatDate(new Date(value).toISOString())
}

function formatDate(value: string | null): string {
  return formatDateLib(value, DATE_FORMATS.WITH_TIME, undefined, '—')
}
