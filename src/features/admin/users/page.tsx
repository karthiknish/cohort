'use client'

import { AdminUsersPageContent, AdminUsersSignInRequired } from './admin-users-sections'
import { useAdminUsersPage } from './hooks/use-admin-users-page'

export default function AdminUsersPage() {
  const page = useAdminUsersPage()

  if (!page.user && !page.isPreviewMode) {
    return <AdminUsersSignInRequired />
  }

  return (
    <AdminUsersPageContent
      isPreviewMode={page.isPreviewMode}
      loading={page.loading}
      summary={page.summary}
      listQueryError={page.listQueryError}
      actionError={page.actionError}
      clearActionError={page.clearActionError}
      searchTerm={page.searchTerm}
      statusFilter={page.statusFilter}
      roleFilter={page.roleFilter}
      filteredUsers={page.filteredUsers}
      savingId={page.savingId}
      paginatedStatus={page.paginatedStatus}
      loadingMore={page.loadingMore}
      invitationSearchTerm={page.invitationSearchTerm}
      invitationStatusFilter={page.invitationStatusFilter}
      invitationSummary={page.invitationSummary}
      invitationsLoading={page.invitationsLoading}
      filteredInvitations={page.filteredInvitations}
      invitationActionKey={page.invitationActionKey}
      inviteOpen={page.inviteOpen}
      inviteEmail={page.inviteEmail}
      inviteRole={page.inviteRole}
      inviteSending={page.inviteSending}
      revokeOpen={page.revokeOpen}
      detailsOpen={page.detailsOpen}
      selectedUser={page.selectedUser}
      onRefresh={page.handleRefresh}
      onInviteOpenChange={page.handleInviteOpenChange}
      onInviteEmailChange={page.handleInviteEmailChange}
      onInviteRoleChange={page.handleInviteRoleChange}
      onInviteClose={page.handleInviteClose}
      onInviteUser={page.handleInviteUser}
      onSearchChange={page.handleSearchChange}
      onStatusFilterChange={page.handleStatusFilterChange}
      onRoleFilterChange={page.handleRoleFilterChange}
      onRoleChange={page.handleRoleChange}
      onApprovalToggle={page.handleApprovalToggle}
      onViewDetails={page.handleViewDetails}
      onRevokeAccess={page.handleRevokeAccess}
      onLoadMore={page.handleLoadMore}
      onInvitationSearchChange={page.handleInvitationSearchChange}
      onInvitationStatusFilterChange={page.handleInvitationStatusFilterChange}
      onResendInvitation={page.handleResendInvitation}
      onRevokeInvitation={page.handleRevokeInvitation}
      onDetailsOpenChange={page.handleDetailsOpenChange}
      onDetailsClose={page.handleDetailsClose}
      onRevokeOpenChange={page.handleRevokeOpenChange}
      onRevokeClose={page.handleRevokeClose}
      onRevokeConfirm={page.handleRevokeConfirm}
    />
  )
}
