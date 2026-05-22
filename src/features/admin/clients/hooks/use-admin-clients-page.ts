'use client'

import { useCallback, useMemo, useState } from 'react'
import { usePaginatedQuery, useQuery } from 'convex/react'
import { api } from '/_generated/api'
import { useAuth } from '@/shared/contexts/auth-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { useConvexQueryError } from '@/lib/hooks/use-convex-query-error'
import { getPreviewAdminUsers } from '@/lib/preview-data'
import {
  buildClientAllocationSummary,
  countUnmatchedClientAllocations,
  filterAllocationClients,
  getAssignableWorkspaceUsers,
  normalizeAllocationUsers,
  type AllocationUserRow,
} from '../../lib/client-allocation'
import { useAdminClients } from './use-admin-clients'
import type { ClientRecord } from '../admin-clients-types'

export function useAdminClientsPage() {
  const { user } = useAuth()
  const { isPreviewMode } = usePreview()
  const workspaceContext = useQuery(api.users.getMyWorkspaceContext, !isPreviewMode && user ? {} : 'skip')
  const workspaceId = workspaceContext?.workspaceId ?? null
  const includeAllWorkspaces = workspaceContext?.role === 'admin'

  const workspaceQueryError = useConvexQueryError({
    data: workspaceContext,
    skipped: isPreviewMode || !user,
    loading: !isPreviewMode && Boolean(user) && workspaceContext === undefined,
    fallbackMessage: 'Unable to load workspace context.',
  })

  const adminClients = useAdminClients()

  const { results: adminUserRows } = usePaginatedQuery(
    api.adminUsers.listUsers,
    !isPreviewMode && workspaceId
      ? {
          workspaceId,
          includeAllWorkspaces,
        }
      : 'skip',
    { initialNumItems: 200 }
  )

  const [clientSearch, setClientSearch] = useState('')

  const assignableUsers = useMemo(() => {
    if (isPreviewMode) {
      return getAssignableWorkspaceUsers(
        getPreviewAdminUsers().map((row) => ({
          id: row.id,
          name: row.name,
          email: row.email,
          role: row.role,
          status: row.status,
        }))
      )
    }

    const normalizedUsers = normalizeAllocationUsers((adminUserRows ?? []) as AllocationUserRow[])

    return getAssignableWorkspaceUsers(normalizedUsers)
  }, [adminUserRows, isPreviewMode])

  const allocationSummary = useMemo(
    () => buildClientAllocationSummary(assignableUsers, adminClients.clients),
    [assignableUsers, adminClients.clients]
  )

  const filteredClients = useMemo(
    () => filterAllocationClients(adminClients.clients, clientSearch),
    [adminClients.clients, clientSearch]
  )

  const unmatchedByClientId = useMemo(
    () => countUnmatchedClientAllocations(allocationSummary.unmatched),
    [allocationSummary.unmatched]
  )

  const handleRefresh = useCallback(() => void adminClients.loadClients(), [adminClients])
  const handleFormSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault()
      void adminClients.handleCreateClient()
    },
    [adminClients]
  )
  const handleClientNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => adminClients.setClientName(event.target.value),
    [adminClients]
  )
  const handleAccountManagerChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => adminClients.setClientAccountManager(event.target.value),
    [adminClients]
  )
  const handleClientSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setClientSearch(event.target.value),
    []
  )
  const handleUpdateTeamMemberName = useCallback(
    (key: string, value: string) => adminClients.updateTeamMemberField(key, 'name', value),
    [adminClients]
  )
  const handleUpdateTeamMemberRole = useCallback(
    (key: string, value: string) => adminClients.updateTeamMemberField(key, 'role', value),
    [adminClients]
  )
  const handleCancelDelete = useCallback(() => adminClients.handleDeleteDialogChange(false), [adminClients])
  const handleConfirmDelete = useCallback(() => void adminClients.handleDeleteClient(), [adminClients])
  const handleMemberNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => adminClients.setMemberName(event.target.value),
    [adminClients]
  )
  const handleMemberRoleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => adminClients.setMemberRole(event.target.value),
    [adminClients]
  )
  const handleCancelTeamDialog = useCallback(() => adminClients.handleTeamDialogChange(false), [adminClients])
  const handleConfirmAddTeamMember = useCallback(() => void adminClients.handleAddTeamMember(), [adminClients])
  const handleRemoveTeamMemberStable = useCallback(
    (client: ClientRecord, memberName: string) => void adminClients.handleRemoveTeamMember(client, memberName),
    [adminClients]
  )
  const handleEditTeamMemberRoleStable = useCallback(
    (client: ClientRecord, member: { name: string; role: string }) =>
      adminClients.requestEditTeamMemberRole(client, member),
    [adminClients]
  )
  const handleEditingMemberRoleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => adminClients.setEditingMemberRole(event.target.value),
    [adminClients]
  )
  const handleCancelEditRoleDialog = useCallback(
    () => adminClients.handleEditRoleDialogChange(false),
    [adminClients]
  )
  const handleConfirmEditTeamMemberRole = useCallback(
    () => void adminClients.handleUpdateTeamMemberRole(),
    [adminClients]
  )

  return {
    user,
    isPreviewMode,
    workspaceQueryError,
    assignableUsers,
    allocationSummary,
    filteredClients,
    unmatchedByClientId,
    clientSearch,
    ...adminClients,
    handleRefresh,
    handleFormSubmit,
    handleClientNameChange,
    handleAccountManagerChange,
    handleClientSearchChange,
    handleUpdateTeamMemberName,
    handleUpdateTeamMemberRole,
    handleCancelDelete,
    handleConfirmDelete,
    handleMemberNameChange,
    handleMemberRoleChange,
    handleCancelTeamDialog,
    handleConfirmAddTeamMember,
    handleRemoveTeamMemberStable,
    handleEditTeamMemberRoleStable,
    handleEditingMemberRoleChange,
    handleCancelEditRoleDialog,
    handleConfirmEditTeamMemberRole,
  }
}
