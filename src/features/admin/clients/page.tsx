'use client'

import { PageSkeletonBoundary } from '@/shared/ui/page-skeleton-boundary'
import { AdminTablePageSkeleton } from '@/features/admin/components/admin-table-page-skeleton'

import { AdminClientsPageContent, AdminClientsSignInRequired } from './admin-clients-sections'
import { useAdminClientsPage } from './hooks/use-admin-clients-page'

export default function AdminClientsPage() {
  const page = useAdminClientsPage()

  if (!page.user && !page.isPreviewMode) {
    return <AdminClientsSignInRequired />
  }

  return (
    <PageSkeletonBoundary loading={page.clientsLoading} loadingContent={<AdminTablePageSkeleton />}>
    <AdminClientsPageContent
      isPreviewMode={page.isPreviewMode}
      clientsLoading={page.clientsLoading}
      clients={page.clients}
      nextCursor={page.nextCursor}
      existingTeamMembers={page.existingTeamMembers}
      assignableUsers={page.assignableUsers}
      allocationSummary={page.allocationSummary}
      filteredClients={page.filteredClients}
      unmatchedByClientId={page.unmatchedByClientId}
      clientSearch={page.clientSearch}
      workspaceQueryError={page.workspaceQueryError}
      clientsError={page.clientsError}
      clientName={page.clientName}
      clientAccountManager={page.clientAccountManager}
      teamMemberFields={page.teamMemberFields}
      clientSaving={page.clientSaving}
      clientPendingDelete={page.clientPendingDelete}
      isDeleteDialogOpen={page.isDeleteDialogOpen}
      deletingClientId={page.deletingClientId}
      clientPendingMembers={page.clientPendingMembers}
      isTeamDialogOpen={page.isTeamDialogOpen}
      addingMember={page.addingMember}
      removingTeamMemberKey={page.removingTeamMemberKey}
      updatingMemberRoleKey={page.updatingMemberRoleKey}
      editingMemberRole={page.editingMemberRole}
      isEditRoleDialogOpen={page.isEditRoleDialogOpen}
      clientPendingEditMember={page.clientPendingEditMember}
      memberName={page.memberName}
      memberRole={page.memberRole}
      loadingMore={page.loadingMore}
      onRefresh={page.handleRefresh}
      onFormSubmit={page.handleFormSubmit}
      onClientNameChange={page.handleClientNameChange}
      onAccountManagerChange={page.setClientAccountManager}
      onAccountManagerInputChange={page.handleAccountManagerChange}
      onClientSearchChange={page.handleClientSearchChange}
      onAddTeamMemberField={page.addTeamMemberField}
      onUpdateTeamMemberName={page.handleUpdateTeamMemberName}
      onUpdateTeamMemberRole={page.handleUpdateTeamMemberRole}
      onRemoveTeamMemberField={page.removeTeamMemberField}
      onResetClientForm={page.resetClientForm}
      onRequestAddTeamMember={page.requestAddTeamMember}
      onRequestDeleteClient={page.requestDeleteClient}
      onRemoveTeamMember={page.handleRemoveTeamMemberStable}
      onEditTeamMemberRole={page.handleEditTeamMemberRoleStable}
      onLoadMore={page.handleLoadMore}
      onDeleteDialogChange={page.handleDeleteDialogChange}
      onCancelDelete={page.handleCancelDelete}
      onConfirmDelete={page.handleConfirmDelete}
      onTeamDialogChange={page.handleTeamDialogChange}
      onMemberNameChange={page.setMemberName}
      onMemberNameInputChange={page.handleMemberNameChange}
      onMemberRoleChange={page.handleMemberRoleChange}
      onCancelTeamDialog={page.handleCancelTeamDialog}
      onConfirmAddTeamMember={page.handleConfirmAddTeamMember}
      onEditRoleDialogChange={page.handleEditRoleDialogChange}
      onEditingMemberRoleChange={page.handleEditingMemberRoleChange}
      onCancelEditRoleDialog={page.handleCancelEditRoleDialog}
      onConfirmEditTeamMemberRole={page.handleConfirmEditTeamMemberRole}
    />
    </PageSkeletonBoundary>
  )
}
