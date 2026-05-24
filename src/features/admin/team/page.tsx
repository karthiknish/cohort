'use client'

import { PageSkeletonBoundary } from '@/shared/ui/page-skeleton-boundary'
import { AdminTablePageSkeleton } from '@/features/admin/components/admin-table-page-skeleton'

import { AdminTeamPageContent, AdminTeamSignInRequired } from './admin-team-sections'
import { useAdminTeamPage } from './hooks/use-admin-team-page'

export default function AdminTeamPage() {
  const page = useAdminTeamPage()

  if (!page.user && !page.isPreviewMode) {
    return <AdminTeamSignInRequired />
  }

  return (
    <PageSkeletonBoundary loading={page.loading} loadingContent={<AdminTablePageSkeleton />}>
    <AdminTeamPageContent
      isPreviewMode={page.isPreviewMode}
      loading={page.loading}
      summary={page.summary}
      internalUsers={page.internalUsers}
      filteredUsers={page.filteredUsers}
      hasActiveFilters={page.hasActiveFilters}
      workspaceQueryError={page.workspaceQueryError}
      actionError={page.actionError}
      clearActionError={page.clearActionError}
      searchTerm={page.searchTerm}
      statusFilter={page.statusFilter}
      roleFilter={page.roleFilter}
      savingId={page.savingId}
      allocationSummary={page.allocationSummary}
      paginatedStatus={page.paginatedStatus}
      loadingMore={page.loadingMore}
      inviteOpen={page.inviteOpen}
      inviteEmail={page.inviteEmail}
      inviteEmailTrimmed={page.inviteEmailTrimmed}
      inviteEmailValid={page.inviteEmailValid}
      inviteRole={page.inviteRole}
      inviteSending={page.inviteSending}
      onRefresh={page.handleRefresh}
      onInviteOpenChange={page.handleInviteOpenChange}
      onInviteEmailChange={page.handleInviteEmailChange}
      onInviteRoleChange={page.handleInviteRoleChange}
      onCloseInviteDialog={page.handleCloseInviteDialog}
      onInviteFormSubmit={page.handleInviteFormSubmit}
      onSearchChange={page.handleSearchChange}
      onStatusFilterChange={page.handleStatusFilterChange}
      onRoleFilterChange={page.handleRoleFilterChange}
      onOpenInviteDialog={page.handleOpenInviteDialog}
      onClearFilters={page.handleClearFilters}
      onLoadMore={page.handleLoadMore}
      createRoleChangeHandler={page.createRoleChangeHandler}
      createAdminToggleHandler={page.createAdminToggleHandler}
      createStatusActionHandler={page.createStatusActionHandler}
    />
    </PageSkeletonBoundary>
  )
}
