'use client'

import type { AllocationUser } from '../lib/client-allocation'
import {
  AdminClientsAddTeamMemberDialog,
  AdminClientsDeleteDialog,
} from './admin-clients-page-content-sections'

type AdminClientsPageDialogsProps = {
  isDeleteDialogOpen: boolean
  clientPendingDeleteName: string | undefined
  deletingClientId: string | null
  onDeleteDialogChange: (open: boolean) => void
  onCancelDelete: () => void
  onConfirmDelete: () => void
  isTeamDialogOpen: boolean
  clientPendingMembersName: string | undefined
  assignableUsers: AllocationUser[]
  memberName: string
  memberRole: string
  addingMember: boolean
  existingMemberNames: string[]
  onTeamDialogChange: (open: boolean) => void
  onMemberNameChange: (value: string) => void
  onMemberNameInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onMemberRoleChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onCancelTeamDialog: () => void
  onConfirmAddTeamMember: () => void
}

export function AdminClientsPageDialogs({
  isDeleteDialogOpen,
  clientPendingDeleteName,
  deletingClientId,
  onDeleteDialogChange,
  onCancelDelete,
  onConfirmDelete,
  isTeamDialogOpen,
  clientPendingMembersName,
  assignableUsers,
  memberName,
  memberRole,
  addingMember,
  existingMemberNames,
  onTeamDialogChange,
  onMemberNameChange,
  onMemberNameInputChange,
  onMemberRoleChange,
  onCancelTeamDialog,
  onConfirmAddTeamMember,
}: AdminClientsPageDialogsProps) {
  return (
    <>
      <AdminClientsDeleteDialog
        open={isDeleteDialogOpen}
        clientName={clientPendingDeleteName}
        deletingClientId={deletingClientId}
        onOpenChange={onDeleteDialogChange}
        onCancel={onCancelDelete}
        onConfirm={onConfirmDelete}
      />

      <AdminClientsAddTeamMemberDialog
        open={isTeamDialogOpen}
        clientName={clientPendingMembersName}
        assignableUsers={assignableUsers}
        memberName={memberName}
        memberRole={memberRole}
        addingMember={addingMember}
        existingMemberNames={existingMemberNames}
        onOpenChange={onTeamDialogChange}
        onMemberNameChange={onMemberNameChange}
        onMemberNameInputChange={onMemberNameInputChange}
        onMemberRoleChange={onMemberRoleChange}
        onCancel={onCancelTeamDialog}
        onConfirm={onConfirmAddTeamMember}
      />
    </>
  )
}
