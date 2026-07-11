'use client';
import { useMemo } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { AdminPageShell } from '../components/admin-page-shell';
import { AdminActionErrorAlert } from '../components/admin-action-error-alert';
import { PageSkeletonBoundary } from '@/shared/ui/page-skeleton-boundary';
import type { AllocationUser } from '../lib/client-allocation';
import type { TeamMemberField } from './hooks/use-admin-clients';
import type { ClientRecord } from './admin-clients-types';
import { AdminClientsStatsGrid } from './admin-clients-page-content-sections';
import { AdminClientsPageDialogs } from './admin-clients-page-dialogs';
import { AdminClientsPageHeaderActions } from './admin-clients-page-header-actions';
import { AdminClientsWorkspaceManagementCard } from './admin-clients-page-shell-sections';
export function AdminClientsSignInRequired() {
    return (<div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-16">
      <Card className="max-w-md border-muted/60">
        <CardHeader>
          <CardTitle className="text-lg">Sign in required</CardTitle>
          <CardDescription>Log in to an admin account to manage client workspaces.</CardDescription>
        </CardHeader>
      </Card>
    </div>);
}
type AdminClientsPageContentProps = {
    isPreviewMode: boolean;
    clientsLoading: boolean;
    clients: ClientRecord[];
    nextCursor: string | null;
    existingTeamMembers: number;
    assignableUsers: AllocationUser[];
    allocationSummary: {
        unmatched: unknown[];
    };
    filteredClients: ClientRecord[];
    unmatchedByClientId: Record<string, number>;
    clientSearch: string;
    workspaceQueryError: string | null;
    clientsError: string | null;
    actionError: string | null;
    clearActionError: () => void;
    clientName: string;
    clientAccountManager: string;
    teamMemberFields: TeamMemberField[];
    clientSaving: boolean;
    clientPendingDelete: {
        name: string;
    } | null;
    isDeleteDialogOpen: boolean;
    deletingClientId: string | null;
    clientPendingMembers: ClientRecord | null;
    isTeamDialogOpen: boolean;
    addingMember: boolean;
    removingTeamMemberKey: string | null;
    memberName: string;
    memberRole: string;
    updatingMemberRoleKey: string | null;
    editingMemberRole: string;
    isEditRoleDialogOpen: boolean;
    clientPendingEditMember: {
        client: ClientRecord;
        memberName: string;
        memberRole: string;
    } | null;
    loadingMore: boolean;
    onRefresh: () => void;
    onFormSubmit: (event: React.FormEvent) => void;
    onClientNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onAccountManagerChange: (value: string) => void;
    onAccountManagerInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onClientSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onAddTeamMemberField: () => void;
    onUpdateTeamMemberName: (key: string, value: string) => void;
    onUpdateTeamMemberRole: (key: string, value: string) => void;
    onRemoveTeamMemberField: (key: string) => void;
    onResetClientForm: () => void;
    onRequestAddTeamMember: (client: ClientRecord) => void;
    onRequestDeleteClient: (client: ClientRecord) => void;
    onRemoveTeamMember: (client: ClientRecord, memberName: string) => void;
    onEditTeamMemberRole: (client: ClientRecord, member: {
        name: string;
        role: string;
    }) => void;
    onLoadMore: () => void;
    onDeleteDialogChange: (open: boolean) => void;
    onCancelDelete: () => void;
    onConfirmDelete: () => void;
    onTeamDialogChange: (open: boolean) => void;
    onMemberNameChange: (value: string) => void;
    onMemberNameInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onMemberRoleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onCancelTeamDialog: () => void;
    onConfirmAddTeamMember: () => void;
    onEditRoleDialogChange: (open: boolean) => void;
    onEditingMemberRoleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onCancelEditRoleDialog: () => void;
    onConfirmEditTeamMemberRole: () => void;
};
export function AdminClientsPageContent(props: AdminClientsPageContentProps) {
    const { isPreviewMode, clientsLoading, clients, nextCursor, existingTeamMembers, assignableUsers, allocationSummary, filteredClients, unmatchedByClientId, clientSearch, workspaceQueryError, clientsError, actionError, clearActionError, clientName, clientAccountManager, teamMemberFields, clientSaving, clientPendingDelete, isDeleteDialogOpen, deletingClientId, clientPendingMembers, isTeamDialogOpen, addingMember, removingTeamMemberKey, memberName, memberRole, updatingMemberRoleKey, editingMemberRole, isEditRoleDialogOpen, clientPendingEditMember, loadingMore, onRefresh, onFormSubmit, onClientNameChange, onAccountManagerChange, onAccountManagerInputChange, onClientSearchChange, onAddTeamMemberField, onUpdateTeamMemberName, onUpdateTeamMemberRole, onRemoveTeamMemberField, onResetClientForm, onRequestAddTeamMember, onRequestDeleteClient, onRemoveTeamMember, onEditTeamMemberRole, onLoadMore, onDeleteDialogChange, onCancelDelete, onConfirmDelete, onTeamDialogChange, onMemberNameChange, onMemberNameInputChange, onMemberRoleChange, onCancelTeamDialog, onConfirmAddTeamMember, onEditRoleDialogChange, onEditingMemberRoleChange, onCancelEditRoleDialog, onConfirmEditTeamMemberRole, } = props;
    const shellActions = <AdminClientsPageHeaderActions clientsLoading={clientsLoading} onRefresh={onRefresh}/>;
    const clientsContentSkeleton = (<div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {['stat-a', 'stat-b', 'stat-c', 'stat-d'].map((key) => (<div key={key} className="rounded-lg border border-border/60 bg-card p-5">
            <Skeleton className="h-4 w-28"/>
            <Skeleton className="mt-3 h-8 w-16"/>
            <Skeleton className="mt-2 h-3 w-40"/>
          </div>))}
      </div>
      <div className="space-y-4 rounded-lg border border-border/60 p-6">
        <Skeleton className="h-5 w-32"/>
        <Skeleton className="h-10 w-full"/>
        <Skeleton className="h-10 w-full"/>
        <Skeleton className="h-24 w-full"/>
      </div>
    </div>);
    return (<>
      <AdminActionErrorAlert error={actionError} onDismiss={clearActionError}/>
      <AdminPageShell title="Client workspaces" description={<>
            Allocate real internal teammates to each client workspace and keep ownership clean.
            {isPreviewMode ? ' Preview mode keeps client changes local to this session.' : ''}
          </>} isPreviewMode={isPreviewMode} actions={shellActions}>
        <PageSkeletonBoundary loading={clientsLoading && clients.length === 0} loadingContent={clientsContentSkeleton}>
          <AdminClientsStatsGrid clientsLoading={clientsLoading} clientsCount={clients.length} nextCursor={nextCursor} existingTeamMembers={existingTeamMembers} assignableUsersCount={assignableUsers.length} unmatchedCount={allocationSummary.unmatched.length}/>

          <AdminClientsWorkspaceManagementCard assignableUsers={assignableUsers} clientName={clientName} clientAccountManager={clientAccountManager} teamMemberFields={teamMemberFields} clientSaving={clientSaving} clientsLoading={clientsLoading} clientsCount={clients.length} clientsError={clientsError} workspaceQueryError={workspaceQueryError} clientSearch={clientSearch} filteredClients={filteredClients} unmatchedByClientId={unmatchedByClientId} nextCursor={nextCursor} loadingMore={loadingMore} addingMember={addingMember} clientPendingMembersId={clientPendingMembers?.id} deletingClientId={deletingClientId} removingTeamMemberKey={removingTeamMemberKey} updatingMemberRoleKey={updatingMemberRoleKey} onFormSubmit={onFormSubmit} onClientNameChange={onClientNameChange} onAccountManagerChange={onAccountManagerChange} onAccountManagerInputChange={onAccountManagerInputChange} onAddTeamMemberField={onAddTeamMemberField} onUpdateTeamMemberName={onUpdateTeamMemberName} onUpdateTeamMemberRole={onUpdateTeamMemberRole} onRemoveTeamMemberField={onRemoveTeamMemberField} onResetClientForm={onResetClientForm} onClientSearchChange={onClientSearchChange} onRequestAddTeamMember={onRequestAddTeamMember} onRequestDeleteClient={onRequestDeleteClient} onRemoveTeamMember={onRemoveTeamMember} onEditTeamMemberRole={onEditTeamMemberRole} onLoadMore={onLoadMore}/>
        </PageSkeletonBoundary>
      </AdminPageShell>

      <AdminClientsPageDialogs isDeleteDialogOpen={isDeleteDialogOpen} clientPendingDeleteName={clientPendingDelete?.name} deletingClientId={deletingClientId} onDeleteDialogChange={onDeleteDialogChange} onCancelDelete={onCancelDelete} onConfirmDelete={onConfirmDelete} isTeamDialogOpen={isTeamDialogOpen} clientPendingMembersName={clientPendingMembers?.name} assignableUsers={assignableUsers} memberName={memberName} memberRole={memberRole} addingMember={addingMember} existingMemberNames={(clientPendingMembers?.teamMembers ?? []).map((member) => member.name)} onTeamDialogChange={onTeamDialogChange} onMemberNameChange={onMemberNameChange} onMemberNameInputChange={onMemberNameInputChange} onMemberRoleChange={onMemberRoleChange} onCancelTeamDialog={onCancelTeamDialog} onConfirmAddTeamMember={onConfirmAddTeamMember} isEditRoleDialogOpen={isEditRoleDialogOpen} clientPendingEditMemberName={clientPendingEditMember?.memberName} clientPendingEditClientName={clientPendingEditMember?.client.name} editingMemberRole={editingMemberRole} updatingMemberRoleKey={updatingMemberRoleKey} onEditRoleDialogChange={onEditRoleDialogChange} onEditingMemberRoleChange={onEditingMemberRoleChange} onCancelEditRoleDialog={onCancelEditRoleDialog} onConfirmEditTeamMemberRole={onConfirmEditTeamMemberRole}/>
    </>);
}
