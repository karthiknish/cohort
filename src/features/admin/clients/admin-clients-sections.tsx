'use client'

import Link from 'next/link'
import { LoaderCircle } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { AdminPageShell } from '../components/admin-page-shell'
import type { AllocationUser } from '../lib/client-allocation'
import type { TeamMemberField } from './hooks/use-admin-clients'
import type { ClientRecord } from './admin-clients-types'
import {
  AdminClientsAddTeamMemberDialog,
  AdminClientsDeleteDialog,
  AdminClientsNewClientForm,
  AdminClientsStatsGrid,
  AdminClientsWorkspaceList,
} from './admin-clients-page-content-sections'

export function AdminClientsSignInRequired() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-16">
      <Card className="max-w-md border-muted/60">
        <CardHeader>
          <CardTitle className="text-lg">Sign in required</CardTitle>
          <CardDescription>Log in to an admin account to manage client workspaces.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

type AdminClientsPageContentProps = {
  isPreviewMode: boolean
  clientsLoading: boolean
  clients: ClientRecord[]
  nextCursor: string | null
  existingTeamMembers: number
  assignableUsers: AllocationUser[]
  allocationSummary: { unmatched: unknown[] }
  filteredClients: ClientRecord[]
  unmatchedByClientId: Record<string, number>
  clientSearch: string
  workspaceQueryError: string | null
  clientsError: string | null
  clientName: string
  clientAccountManager: string
  teamMemberFields: TeamMemberField[]
  clientSaving: boolean
  clientPendingDelete: { name: string } | null
  isDeleteDialogOpen: boolean
  deletingClientId: string | null
  clientPendingMembers: ClientRecord | null
  isTeamDialogOpen: boolean
  addingMember: boolean
  removingTeamMemberKey: string | null
  memberName: string
  memberRole: string
  loadingMore: boolean
  onRefresh: () => void
  onFormSubmit: (event: React.FormEvent) => void
  onClientNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onAccountManagerChange: (value: string) => void
  onAccountManagerInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onClientSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onAddTeamMemberField: () => void
  onUpdateTeamMemberName: (key: string, value: string) => void
  onUpdateTeamMemberRole: (key: string, value: string) => void
  onRemoveTeamMemberField: (key: string) => void
  onResetClientForm: () => void
  onRequestAddTeamMember: (client: ClientRecord) => void
  onRequestDeleteClient: (client: ClientRecord) => void
  onRemoveTeamMember: (client: ClientRecord, memberName: string) => void
  onLoadMore: () => void
  onDeleteDialogChange: (open: boolean) => void
  onCancelDelete: () => void
  onConfirmDelete: () => void
  onTeamDialogChange: (open: boolean) => void
  onMemberNameChange: (value: string) => void
  onMemberNameInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onMemberRoleChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onCancelTeamDialog: () => void
  onConfirmAddTeamMember: () => void
}

export function AdminClientsPageContent(props: AdminClientsPageContentProps) {
  const {
    isPreviewMode,
    clientsLoading,
    clients,
    nextCursor,
    existingTeamMembers,
    assignableUsers,
    allocationSummary,
    filteredClients,
    unmatchedByClientId,
    clientSearch,
    workspaceQueryError,
    clientsError,
    clientName,
    clientAccountManager,
    teamMemberFields,
    clientSaving,
    clientPendingDelete,
    isDeleteDialogOpen,
    deletingClientId,
    clientPendingMembers,
    isTeamDialogOpen,
    addingMember,
    removingTeamMemberKey,
    memberName,
    memberRole,
    loadingMore,
    onRefresh,
    onFormSubmit,
    onClientNameChange,
    onAccountManagerChange,
    onAccountManagerInputChange,
    onClientSearchChange,
    onAddTeamMemberField,
    onUpdateTeamMemberName,
    onUpdateTeamMemberRole,
    onRemoveTeamMemberField,
    onResetClientForm,
    onRequestAddTeamMember,
    onRequestDeleteClient,
    onRemoveTeamMember,
    onLoadMore,
    onDeleteDialogChange,
    onCancelDelete,
    onConfirmDelete,
    onTeamDialogChange,
    onMemberNameChange,
    onMemberNameInputChange,
    onMemberRoleChange,
    onCancelTeamDialog,
    onConfirmAddTeamMember,
  } = props

  return (
    <>
      <AdminPageShell
        title="Client workspaces"
        description={
          <>
            Allocate real internal teammates to each client workspace and keep ownership clean.
            {isPreviewMode ? ' Preview mode keeps client changes local to this session.' : ''}
          </>
        }
        isPreviewMode={isPreviewMode}
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/team">Team</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin">Admin home</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={clientsLoading} className="inline-flex items-center gap-2">
              <LoaderCircle className={`size-4 ${clientsLoading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          </>
        }
      >
        <AdminClientsStatsGrid
          clientsLoading={clientsLoading}
          clientsCount={clients.length}
          nextCursor={nextCursor}
          existingTeamMembers={existingTeamMembers}
          assignableUsersCount={assignableUsers.length}
          unmatchedCount={allocationSummary.unmatched.length}
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">New client</CardTitle>
            <CardDescription>Kick off a workspace with the key account team.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <AdminClientsNewClientForm
              assignableUsers={assignableUsers}
              clientName={clientName}
              clientAccountManager={clientAccountManager}
              teamMemberFields={teamMemberFields}
              clientSaving={clientSaving}
              onFormSubmit={onFormSubmit}
              onClientNameChange={onClientNameChange}
              onAccountManagerChange={onAccountManagerChange}
              onAccountManagerInputChange={onAccountManagerInputChange}
              onAddTeamMemberField={onAddTeamMemberField}
              onUpdateTeamMemberName={onUpdateTeamMemberName}
              onUpdateTeamMemberRole={onUpdateTeamMemberRole}
              onRemoveTeamMemberField={onRemoveTeamMemberField}
              onResetClientForm={onResetClientForm}
            />

            <AdminClientsWorkspaceList
              clientsLoading={clientsLoading}
              clientsCount={clients.length}
              clientsError={clientsError}
              workspaceQueryError={workspaceQueryError}
              clientSearch={clientSearch}
              filteredClients={filteredClients}
              unmatchedByClientId={unmatchedByClientId}
              nextCursor={nextCursor}
              loadingMore={loadingMore}
              addingMember={addingMember}
              clientPendingMembersId={clientPendingMembers?.id}
              deletingClientId={deletingClientId}
              removingTeamMemberKey={removingTeamMemberKey}
              onClientSearchChange={onClientSearchChange}
              onRequestAddTeamMember={onRequestAddTeamMember}
              onRequestDeleteClient={onRequestDeleteClient}
              onRemoveTeamMember={onRemoveTeamMember}
              onLoadMore={onLoadMore}
            />
          </CardContent>
        </Card>
      </AdminPageShell>

      <AdminClientsDeleteDialog
        open={isDeleteDialogOpen}
        clientName={clientPendingDelete?.name}
        deletingClientId={deletingClientId}
        onOpenChange={onDeleteDialogChange}
        onCancel={onCancelDelete}
        onConfirm={onConfirmDelete}
      />

      <AdminClientsAddTeamMemberDialog
        open={isTeamDialogOpen}
        clientName={clientPendingMembers?.name}
        assignableUsers={assignableUsers}
        memberName={memberName}
        memberRole={memberRole}
        addingMember={addingMember}
        existingMemberNames={(clientPendingMembers?.teamMembers ?? []).map((member) => member.name)}
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
