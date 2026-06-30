'use client';
import type { AllocationUser } from '../lib/client-allocation';
import { AdminClientsAddTeamMemberDialog, AdminClientsDeleteDialog, AdminClientsEditTeamMemberRoleDialog, } from './admin-clients-page-content-sections';
type AdminClientsPageDialogsProps = {
    isDeleteDialogOpen: boolean;
    clientPendingDeleteName: string | undefined;
    deletingClientId: string | null;
    onDeleteDialogChange: (open: boolean) => void;
    onCancelDelete: () => void;
    onConfirmDelete: () => void;
    isTeamDialogOpen: boolean;
    clientPendingMembersName: string | undefined;
    assignableUsers: AllocationUser[];
    memberName: string;
    memberRole: string;
    addingMember: boolean;
    existingMemberNames: string[];
    onTeamDialogChange: (open: boolean) => void;
    onMemberNameChange: (value: string) => void;
    onMemberNameInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onMemberRoleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onCancelTeamDialog: () => void;
    onConfirmAddTeamMember: () => void;
    isEditRoleDialogOpen: boolean;
    clientPendingEditMemberName: string | undefined;
    clientPendingEditClientName: string | undefined;
    editingMemberRole: string;
    updatingMemberRoleKey: string | null;
    onEditRoleDialogChange: (open: boolean) => void;
    onEditingMemberRoleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onCancelEditRoleDialog: () => void;
    onConfirmEditTeamMemberRole: () => void;
};
export function AdminClientsPageDialogs({ isDeleteDialogOpen, clientPendingDeleteName, deletingClientId, onDeleteDialogChange, onCancelDelete, onConfirmDelete, isTeamDialogOpen, clientPendingMembersName, assignableUsers, memberName, memberRole, addingMember, existingMemberNames, onTeamDialogChange, onMemberNameChange, onMemberNameInputChange, onMemberRoleChange, onCancelTeamDialog, onConfirmAddTeamMember, isEditRoleDialogOpen, clientPendingEditMemberName, clientPendingEditClientName, editingMemberRole, updatingMemberRoleKey, onEditRoleDialogChange, onEditingMemberRoleChange, onCancelEditRoleDialog, onConfirmEditTeamMemberRole, }: AdminClientsPageDialogsProps) {
    return (<>
      <AdminClientsDeleteDialog open={isDeleteDialogOpen} clientName={clientPendingDeleteName} deletingClientId={deletingClientId} onOpenChange={onDeleteDialogChange} onCancel={onCancelDelete} onConfirm={onConfirmDelete}/>

      <AdminClientsAddTeamMemberDialog open={isTeamDialogOpen} clientName={clientPendingMembersName} assignableUsers={assignableUsers} memberName={memberName} memberRole={memberRole} addingMember={addingMember} existingMemberNames={existingMemberNames} onOpenChange={onTeamDialogChange} onMemberNameChange={onMemberNameChange} onMemberNameInputChange={onMemberNameInputChange} onMemberRoleChange={onMemberRoleChange} onCancel={onCancelTeamDialog} onConfirm={onConfirmAddTeamMember}/>

      <AdminClientsEditTeamMemberRoleDialog open={isEditRoleDialogOpen} clientName={clientPendingEditClientName} memberName={clientPendingEditMemberName} memberRole={editingMemberRole} updatingRole={Boolean(updatingMemberRoleKey)} onOpenChange={onEditRoleDialogChange} onMemberRoleChange={onEditingMemberRoleChange} onCancel={onCancelEditRoleDialog} onConfirm={onConfirmEditTeamMemberRole}/>
    </>);
}
