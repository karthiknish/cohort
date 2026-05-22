'use client'

import { LoaderCircle, Plus, Trash2, Users as UsersIcon } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { AdminQueryErrorAlert } from '../components/admin-query-error-alert'
import { UserSearchPicker } from '../components/user-search-picker'
import type { AllocationUser } from '../lib/client-allocation'
import type { ClientRecord } from './admin-clients-types'
import { AdminClientsClientRow, AdminClientsTeamMemberFieldRow } from './admin-clients-row-sections'
import type { TeamMemberField } from './hooks/use-admin-clients'

type AdminClientsStatsGridProps = {
  clientsLoading: boolean
  clientsCount: number
  nextCursor: string | null
  existingTeamMembers: number
  assignableUsersCount: number
  unmatchedCount: number
}

export function AdminClientsStatsGrid({
  clientsLoading,
  clientsCount,
  nextCursor,
  existingTeamMembers,
  assignableUsersCount,
  unmatchedCount,
}: AdminClientsStatsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Active clients</CardTitle>
          <UsersIcon className={`size-4 text-muted-foreground ${clientsLoading ? 'animate-spin' : ''}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{clientsCount}</div>
          <p className="text-xs text-muted-foreground">
            {nextCursor ? 'More workspaces available — use Load more.' : 'All matching pages loaded.'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Workspace coverage</CardTitle>
          <CardDescription>Team members attached</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{existingTeamMembers}</div>
          <p className="text-xs text-muted-foreground">Across all clients</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Assignable teammates</CardTitle>
          <CardDescription>Internal users available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{assignableUsersCount}</div>
          <p className="text-xs text-muted-foreground">Admins and team members available for client allocation</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Allocation cleanup</CardTitle>
          <CardDescription>Legacy names to review</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{unmatchedCount}</div>
          <p className="text-xs text-muted-foreground">Client assignments that no longer map to current users</p>
        </CardContent>
      </Card>
    </div>
  )
}

type AdminClientsNewClientFormProps = {
  assignableUsers: AllocationUser[]
  clientName: string
  clientAccountManager: string
  teamMemberFields: TeamMemberField[]
  clientSaving: boolean
  onFormSubmit: (event: React.FormEvent) => void
  onClientNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onAccountManagerChange: (value: string) => void
  onAccountManagerInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onAddTeamMemberField: () => void
  onUpdateTeamMemberName: (key: string, value: string) => void
  onUpdateTeamMemberRole: (key: string, value: string) => void
  onRemoveTeamMemberField: (key: string) => void
  onResetClientForm: () => void
}

export function AdminClientsNewClientForm({
  assignableUsers,
  clientName,
  clientAccountManager,
  teamMemberFields,
  clientSaving,
  onFormSubmit,
  onClientNameChange,
  onAccountManagerChange,
  onAccountManagerInputChange,
  onAddTeamMemberField,
  onUpdateTeamMemberName,
  onUpdateTeamMemberRole,
  onRemoveTeamMemberField,
  onResetClientForm,
}: AdminClientsNewClientFormProps) {
  return (
    <form className="space-y-4" onSubmit={onFormSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="admin-client-name">Client name</Label>
          <Input
            id="admin-client-name"
            placeholder="e.g. Horizon Ventures"
            value={clientName}
            onChange={onClientNameChange}
            required
            disabled={clientSaving}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-client-owner">Account manager</Label>
          {assignableUsers.length > 0 ? (
            <UserSearchPicker
              id="admin-client-owner"
              value={clientAccountManager}
              onChange={onAccountManagerChange}
              options={assignableUsers}
              placeholder="Select a workspace owner"
              searchPlaceholder="Search internal teammates"
              emptyText="No matching teammate found."
              disabled={clientSaving}
            />
          ) : (
            <Input
              id="admin-client-owner"
              placeholder="Primary owner"
              value={clientAccountManager}
              onChange={onAccountManagerInputChange}
              required
              disabled={clientSaving}
            />
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label className="text-sm font-medium">Team members</Label>
          <Button type="button" variant="outline" size="sm" onClick={onAddTeamMemberField} disabled={clientSaving}>
            <Plus className="mr-2 size-4" /> Add teammate
          </Button>
        </div>
        <div className="space-y-2">
          {teamMemberFields.map((member, index) => (
            <AdminClientsTeamMemberFieldRow
              key={member.key}
              member={member}
              index={index}
              assignableUsers={assignableUsers}
              clientSaving={clientSaving}
              teamMembersLength={teamMemberFields.length}
              onUpdateName={onUpdateTeamMemberName}
              onUpdateRole={onUpdateTeamMemberRole}
              onRemove={onRemoveTeamMemberField}
              excludeNames={teamMemberFields.flatMap((candidate) =>
                candidate.key !== member.key ? [candidate.name] : [],
              )}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {assignableUsers.length > 0
            ? 'Choose from active internal teammates so client ownership stays mapped to real workspace users. Account managers are automatically added to the client team.'
            : 'No internal teammates are available yet, so legacy free-text allocation is still enabled.'}
        </p>
      </div>

      <div className="flex justify-between gap-3">
        <Button variant="outline" type="button" onClick={onResetClientForm} disabled={clientSaving}>
          Reset form
        </Button>
        <Button type="submit" disabled={clientSaving}>
          {clientSaving && <LoaderCircle className="mr-2 size-4 animate-spin" />}
          Create client
        </Button>
      </div>
    </form>
  )
}

type AdminClientsWorkspaceListProps = {
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
  onClientSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onRequestAddTeamMember: (client: ClientRecord) => void
  onRequestDeleteClient: (client: ClientRecord) => void
  onRemoveTeamMember: (client: ClientRecord, memberName: string) => void
  onEditTeamMemberRole: (client: ClientRecord, member: { name: string; role: string }) => void
  updatingMemberRoleKey: string | null | undefined
  onLoadMore: () => void
}

export function AdminClientsWorkspaceList({
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
  onClientSearchChange,
  onRequestAddTeamMember,
  onRequestDeleteClient,
  onRemoveTeamMember,
  onEditTeamMemberRole,
  updatingMemberRoleKey,
  onLoadMore,
}: AdminClientsWorkspaceListProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <UsersIcon className="size-4" />
          <span>Existing client workspaces</span>
          <Badge variant="secondary">{clientsCount}</Badge>
        </div>
        <Input
          value={clientSearch}
          onChange={onClientSearchChange}
          placeholder="Search clients or teammates"
          className="w-full sm:w-72"
        />
      </div>
      <AdminQueryErrorAlert error={workspaceQueryError ?? clientsError} title="Unable to load clients" />
      {clientsLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" /> Loading clients…
        </div>
      ) : clientsCount === 0 && !clientsError && !workspaceQueryError ? (
        <p className="text-sm text-muted-foreground">No clients yet. Add a workspace to get started.</p>
      ) : filteredClients.length === 0 ? (
        <p className="text-sm text-muted-foreground">No client workspaces match your search.</p>
      ) : (
        <div className="space-y-3">
          {filteredClients.map((client) => (
            <AdminClientsClientRow
              key={client.id}
              client={client}
              unmatchedCount={unmatchedByClientId[client.id] ?? 0}
              addingMember={addingMember}
              clientPendingMembersId={clientPendingMembersId}
              deletingClientId={deletingClientId}
              removingTeamMemberKey={removingTeamMemberKey}
              onAddTeamMember={onRequestAddTeamMember}
              onDeleteClient={onRequestDeleteClient}
              onRemoveTeamMember={onRemoveTeamMember}
              onEditTeamMemberRole={onEditTeamMemberRole}
              updatingMemberRoleKey={updatingMemberRoleKey}
            />
          ))}

          {nextCursor && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={onLoadMore} disabled={loadingMore} className="w-full sm:w-auto">
                {loadingMore ? (
                  <>
                    <LoaderCircle className="mr-2 size-4 animate-spin" /> Loading…
                  </>
                ) : (
                  'Load more clients'
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

type AdminClientsDeleteDialogProps = {
  open: boolean
  clientName: string | undefined
  deletingClientId: string | null
  onOpenChange: (open: boolean) => void
  onCancel: () => void
  onConfirm: () => void
}

export function AdminClientsDeleteDialog({
  open,
  clientName,
  deletingClientId,
  onOpenChange,
  onCancel,
  onConfirm,
}: AdminClientsDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete client workspace</DialogTitle>
          <DialogDescription>
            This action permanently removes {clientName ?? 'this client'} and its workspace configuration. You can recreate it later, but the team list will need to be re-entered.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={Boolean(deletingClientId)}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={Boolean(deletingClientId)}>
            {deletingClientId ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <Trash2 className="mr-2 size-4" />}
            {deletingClientId ? 'Deleting…' : 'Delete client'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type AdminClientsAddTeamMemberDialogProps = {
  open: boolean
  clientName: string | undefined
  assignableUsers: AllocationUser[]
  memberName: string
  memberRole: string
  addingMember: boolean
  existingMemberNames: string[]
  onOpenChange: (open: boolean) => void
  onMemberNameChange: (value: string) => void
  onMemberNameInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onMemberRoleChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onCancel: () => void
  onConfirm: () => void
}

export function AdminClientsAddTeamMemberDialog({
  open,
  clientName,
  assignableUsers,
  memberName,
  memberRole,
  addingMember,
  existingMemberNames,
  onOpenChange,
  onMemberNameChange,
  onMemberNameInputChange,
  onMemberRoleChange,
  onCancel,
  onConfirm,
}: AdminClientsAddTeamMemberDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add teammate</DialogTitle>
          <DialogDescription>Add a collaborator to {clientName ?? 'this client'}.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="team-member-name-input">Name</Label>
            {assignableUsers.length > 0 ? (
              <UserSearchPicker
                id="team-member-name-input"
                value={memberName}
                onChange={onMemberNameChange}
                options={assignableUsers}
                placeholder="Select teammate"
                searchPlaceholder="Search teammates"
                emptyText="No matching teammate found."
                disabled={addingMember}
                excludeNames={existingMemberNames}
              />
            ) : (
              <Input
                id="team-member-name-input"
                placeholder="e.g. Priya Patel"
                value={memberName}
                onChange={onMemberNameInputChange}
                disabled={addingMember}
              />
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="team-member-role-input">Role (optional)</Label>
            <Input
              id="team-member-role-input"
              placeholder="e.g. Paid Media Lead"
              value={memberRole}
              onChange={onMemberRoleChange}
              disabled={addingMember}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={addingMember}>
            Cancel
          </Button>
          <Button type="button" onClick={onConfirm} disabled={addingMember}>
            {addingMember && <LoaderCircle className="mr-2 size-4 animate-spin" />}
            Add teammate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type AdminClientsEditTeamMemberRoleDialogProps = {
  open: boolean
  clientName: string | undefined
  memberName: string | undefined
  memberRole: string
  updatingRole: boolean
  onOpenChange: (open: boolean) => void
  onMemberRoleChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onCancel: () => void
  onConfirm: () => void
}

export function AdminClientsEditTeamMemberRoleDialog({
  open,
  clientName,
  memberName,
  memberRole,
  updatingRole,
  onOpenChange,
  onMemberRoleChange,
  onCancel,
  onConfirm,
}: AdminClientsEditTeamMemberRoleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit teammate role</DialogTitle>
          <DialogDescription>
            Set {memberName ?? 'this teammate'}&apos;s role on {clientName ?? 'this client'}. Roles can differ per client.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="edit-team-member-name">Name</Label>
            <Input id="edit-team-member-name" value={memberName ?? ''} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-team-member-role-input">Role</Label>
            <Input
              id="edit-team-member-role-input"
              placeholder="e.g. Paid Media Lead"
              value={memberRole}
              onChange={onMemberRoleChange}
              disabled={updatingRole}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={updatingRole}>
            Cancel
          </Button>
          <Button type="button" onClick={onConfirm} disabled={updatingRole}>
            {updatingRole && <LoaderCircle className="mr-2 size-4 animate-spin" />}
            Save role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
