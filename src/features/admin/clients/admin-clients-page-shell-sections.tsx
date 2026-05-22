'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

import type { AllocationUser } from '../lib/client-allocation'
import type { TeamMemberField } from './hooks/use-admin-clients'
import type { ClientRecord } from './admin-clients-types'
import {
  AdminClientsNewClientForm,
  AdminClientsWorkspaceList,
} from './admin-clients-page-content-sections'

type AdminClientsWorkspaceManagementCardProps = {
  assignableUsers: AllocationUser[]
  clientName: string
  clientAccountManager: string
  teamMemberFields: TeamMemberField[]
  clientSaving: boolean
  clientsLoading: boolean
  clientsCount: number
  clientsError: string | null
  workspaceQueryError: string | null
  clientSearch: string
  filteredClients: ClientRecord[]
  unmatchedByClientId: Record<string, number>
  nextCursor: string | null
  loadingMore: boolean
  addingMember: boolean
  clientPendingMembersId: string | undefined
  deletingClientId: string | null | undefined
  removingTeamMemberKey: string | null | undefined
  updatingMemberRoleKey: string | null | undefined
  onFormSubmit: (event: React.FormEvent) => void
  onClientNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onAccountManagerChange: (value: string) => void
  onAccountManagerInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onAddTeamMemberField: () => void
  onUpdateTeamMemberName: (key: string, value: string) => void
  onUpdateTeamMemberRole: (key: string, value: string) => void
  onRemoveTeamMemberField: (key: string) => void
  onResetClientForm: () => void
  onClientSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onRequestAddTeamMember: (client: ClientRecord) => void
  onRequestDeleteClient: (client: ClientRecord) => void
  onRemoveTeamMember: (client: ClientRecord, memberName: string) => void
  onEditTeamMemberRole: (client: ClientRecord, member: { name: string; role: string }) => void
  onLoadMore: () => void
}

export function AdminClientsWorkspaceManagementCard({
  assignableUsers,
  clientName,
  clientAccountManager,
  teamMemberFields,
  clientSaving,
  clientsLoading,
  clientsCount,
  clientsError,
  workspaceQueryError,
  clientSearch,
  filteredClients,
  unmatchedByClientId,
  nextCursor,
  loadingMore,
  addingMember,
  clientPendingMembersId,
  deletingClientId,
  removingTeamMemberKey,
  updatingMemberRoleKey,
  onFormSubmit,
  onClientNameChange,
  onAccountManagerChange,
  onAccountManagerInputChange,
  onAddTeamMemberField,
  onUpdateTeamMemberName,
  onUpdateTeamMemberRole,
  onRemoveTeamMemberField,
  onResetClientForm,
  onClientSearchChange,
  onRequestAddTeamMember,
  onRequestDeleteClient,
  onRemoveTeamMember,
  onEditTeamMemberRole,
  onLoadMore,
}: AdminClientsWorkspaceManagementCardProps) {
  return (
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
          clientsCount={clientsCount}
          clientsError={clientsError}
          workspaceQueryError={workspaceQueryError}
          clientSearch={clientSearch}
          filteredClients={filteredClients}
          unmatchedByClientId={unmatchedByClientId}
          nextCursor={nextCursor}
          loadingMore={loadingMore}
          addingMember={addingMember}
          clientPendingMembersId={clientPendingMembersId}
          deletingClientId={deletingClientId}
          removingTeamMemberKey={removingTeamMemberKey}
          onClientSearchChange={onClientSearchChange}
          onRequestAddTeamMember={onRequestAddTeamMember}
          onRequestDeleteClient={onRequestDeleteClient}
          onRemoveTeamMember={onRemoveTeamMember}
          onEditTeamMemberRole={onEditTeamMemberRole}
          updatingMemberRoleKey={updatingMemberRoleKey}
          onLoadMore={onLoadMore}
        />
      </CardContent>
    </Card>
  )
}
