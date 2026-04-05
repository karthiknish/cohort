'use client'

import { useCallback, useMemo, useState } from 'react'
import { usePaginatedQuery, useQuery } from 'convex/react'
import { LoaderCircle, Plus, Trash2, Users as UsersIcon, X } from 'lucide-react'
import Link from 'next/link'

import { api } from '/_generated/api'
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
import { useAuth } from '@/shared/contexts/auth-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { getPreviewAdminUsers } from '@/lib/preview-data'

import { UserSearchPicker } from '../components/user-search-picker'
import {
  buildClientAllocationSummary,
  countUnmatchedClientAllocations,
  filterAllocationClients,
  getAssignableWorkspaceUsers,
  normalizeAllocationUsers,
  type AllocationUser,
  type AllocationUserRow,
} from '../lib/client-allocation'
import { useAdminClients } from './hooks'

type TeamMemberField = {
  key: string
  name: string
  role: string
}

type ClientRecord = {
  id: string
  name: string
  accountManager: string
  teamMembers: { name: string; role: string }[]
}

type TeamMemberFieldRowProps = {
  member: TeamMemberField
  index: number
  assignableUsers: AllocationUser[]
  clientSaving: boolean
  teamMembersLength: number
  onUpdateName: (key: string, value: string) => void
  onUpdateRole: (key: string, value: string) => void
  onRemove: (key: string) => void
  excludeNames: string[]
}

function TeamMemberFieldRow({
  member,
  index,
  assignableUsers,
  clientSaving,
  teamMembersLength,
  onUpdateName,
  onUpdateRole,
  onRemove,
  excludeNames,
}: TeamMemberFieldRowProps) {
  const handleNameChange = useCallback(
    (value: string) => onUpdateName(member.key, value),
    [member.key, onUpdateName]
  )
  const handleNameInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => onUpdateName(member.key, event.target.value),
    [member.key, onUpdateName]
  )
  const handleRoleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => onUpdateRole(member.key, event.target.value),
    [member.key, onUpdateRole]
  )
  const handleRemove = useCallback(() => onRemove(member.key), [member.key, onRemove])

  return (
    <div className="flex flex-col gap-2 rounded-md border p-4 sm:flex-row sm:items-center">
      <div className="flex-1 space-y-2">
        <Label htmlFor={`team-member-name-${member.key}`} className="text-xs uppercase tracking-wide text-muted-foreground">
          Name
        </Label>
        {assignableUsers.length > 0 ? (
          <UserSearchPicker
            id={`team-member-name-${member.key}`}
            value={member.name}
            onChange={handleNameChange}
            options={assignableUsers}
            placeholder={index === 0 ? 'Select teammate' : 'Choose teammate'}
            searchPlaceholder="Search teammates"
            emptyText="No matching teammate found."
            disabled={clientSaving}
            excludeNames={excludeNames}
          />
        ) : (
          <Input
            id={`team-member-name-${member.key}`}
            placeholder={index === 0 ? 'Alex Chen' : 'Teammate name'}
            value={member.name}
            onChange={handleNameInputChange}
            disabled={clientSaving}
          />
        )}
      </div>
      <div className="flex-1 space-y-2">
        <Label htmlFor={`team-member-role-${member.key}`} className="text-xs uppercase tracking-wide text-muted-foreground">
          Role
        </Label>
        <Input
          id={`team-member-role-${member.key}`}
          placeholder={index === 0 ? 'Paid Media Lead' : 'Role (optional)'}
          value={member.role}
          onChange={handleRoleChange}
          disabled={clientSaving}
        />
      </div>
      <div className="flex items-center justify-end pt-2 sm:pt-6">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive"
          onClick={handleRemove}
          disabled={teamMembersLength <= 1 || clientSaving}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Remove team member</span>
        </Button>
      </div>
    </div>
  )
}

type ClientRowProps = {
  client: ClientRecord
  unmatchedCount: number
  addingMember: boolean
  clientPendingMembersId: string | undefined
  deletingClientId: string | null | undefined
  removingTeamMemberKey: string | null | undefined
  onAddTeamMember: (client: ClientRecord) => void
  onDeleteClient: (client: ClientRecord) => void
  onRemoveTeamMember: (client: ClientRecord, memberName: string) => void
}

function ClientRow({
  client,
  unmatchedCount,
  addingMember,
  clientPendingMembersId,
  deletingClientId,
  removingTeamMemberKey,
  onAddTeamMember,
  onDeleteClient,
  onRemoveTeamMember,
}: ClientRowProps) {
  const handleAddTeamMember = useCallback(() => onAddTeamMember(client), [client, onAddTeamMember])
  const handleDeleteClient = useCallback(() => onDeleteClient(client), [client, onDeleteClient])

  return (
    <div key={client.id} className="rounded-md border p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-foreground">{client.name}</p>
          <p className="text-xs text-muted-foreground">Managed by {client.accountManager}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Team {client.teamMembers.length}</Badge>
          <Badge variant={unmatchedCount ? 'secondary' : 'outline'}>
            {unmatchedCount ? `${unmatchedCount} unmatched` : 'Mapped'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddTeamMember}
            disabled={addingMember && clientPendingMembersId === client.id}
          >
            <Plus className="mr-2 h-4 w-4" /> Add teammate
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteClient}
            disabled={Boolean(deletingClientId) && deletingClientId !== client.id}
          >
            {deletingClientId === client.id ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Deleting…
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </>
            )}
          </Button>
        </div>
      </div>
      {unmatchedCount ? (
        <p className="mt-3 text-xs text-warning">
          This client still has legacy allocation names that do not match current workspace users.
        </p>
      ) : null}
      {client.teamMembers.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {client.teamMembers.map((member) => (
            <ClientTeamMemberBadge
              key={`${client.id}-${member.name}-${member.role}`}
              client={client}
              member={member}
              removingTeamMemberKey={removingTeamMemberKey}
              onRemove={onRemoveTeamMember}
            />
          ))}
        </div>
      )}
    </div>
  )
}

type ClientTeamMemberBadgeProps = {
  client: ClientRecord
  member: { name: string; role: string }
  removingTeamMemberKey: string | null | undefined
  onRemove: (client: ClientRecord, memberName: string) => void
}

function ClientTeamMemberBadge({ client, member, removingTeamMemberKey, onRemove }: ClientTeamMemberBadgeProps) {
  const handleRemove = useCallback(
    () => onRemove(client, member.name),
    [client, member.name, onRemove]
  )
  const isRemoving = removingTeamMemberKey === `${client.id}:${member.name.toLowerCase()}`
  const isAccountManager = member.name.toLowerCase() === client.accountManager.toLowerCase()

  return (
    <div className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground">
      <span className="font-medium text-foreground">{member.name}</span>
      {member.role && <span className="ml-2 text-muted-foreground">{member.role}</span>}
      <button
        type="button"
        className="ml-2 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
        onClick={handleRemove}
        disabled={isRemoving || isAccountManager}
        aria-label={`Remove ${member.name} from ${client.name}`}
        title={
          isAccountManager
            ? 'Account manager cannot be removed from the team'
            : `Remove ${member.name}`
        }
      >
        {isRemoving ? (
          <LoaderCircle className="h-3 w-3 animate-spin" />
        ) : (
          <X className="h-3 w-3" />
        )}
      </button>
    </div>
  )
}

export default function AdminClientsPage() {
  const { user } = useAuth()
  const { isPreviewMode } = usePreview()
  const workspaceContext = useQuery(api.users.getMyWorkspaceContext, !isPreviewMode && user ? {} : 'skip')
  const workspaceId = workspaceContext?.workspaceId ?? null
  const includeAllWorkspaces = workspaceContext?.role === 'admin'

  const {
    // Client list
    clients,
    clientsLoading,
    clientsError,
    nextCursor,
    loadingMore,
    existingTeamMembers,
    loadClients,
    handleLoadMore,

    // Client form
    clientName,
    setClientName,
    clientAccountManager,
    setClientAccountManager,
    teamMemberFields,
    clientSaving,
    resetClientForm,
    addTeamMemberField,
    updateTeamMemberField,
    removeTeamMemberField,
    handleCreateClient,

    // Delete
    clientPendingDelete,
    isDeleteDialogOpen,
    deletingClientId,
    requestDeleteClient,
    handleDeleteDialogChange,
    handleDeleteClient,

    // Team member
    clientPendingMembers,
    isTeamDialogOpen,
    addingMember,
    removingTeamMemberKey,
    memberName,
    memberRole,
    setMemberName,
    setMemberRole,
    requestAddTeamMember,
    handleTeamDialogChange,
    handleAddTeamMember,
    handleRemoveTeamMember,
  } = useAdminClients()

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
    () => buildClientAllocationSummary(assignableUsers, clients),
    [assignableUsers, clients]
  )

  const filteredClients = useMemo(
    () => filterAllocationClients(clients, clientSearch),
    [clients, clientSearch]
  )

  const unmatchedByClientId = useMemo(
    () => countUnmatchedClientAllocations(allocationSummary.unmatched),
    [allocationSummary.unmatched]
  )

  const handleRefresh = useCallback(() => void loadClients(), [loadClients])
  const handleFormSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault()
      void handleCreateClient()
    },
    [handleCreateClient]
  )
  const handleClientNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setClientName(event.target.value),
    [setClientName]
  )
  const handleAccountManagerChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setClientAccountManager(event.target.value),
    [setClientAccountManager]
  )
  const handleClientSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setClientSearch(event.target.value),
    []
  )
  const handleUpdateTeamMemberName = useCallback(
    (key: string, value: string) => updateTeamMemberField(key, 'name', value),
    [updateTeamMemberField]
  )
  const handleUpdateTeamMemberRole = useCallback(
    (key: string, value: string) => updateTeamMemberField(key, 'role', value),
    [updateTeamMemberField]
  )
  const handleCancelDelete = useCallback(() => handleDeleteDialogChange(false), [handleDeleteDialogChange])
  const handleConfirmDelete = useCallback(() => void handleDeleteClient(), [handleDeleteClient])
  const handleMemberNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setMemberName(event.target.value),
    [setMemberName]
  )
  const handleMemberRoleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setMemberRole(event.target.value),
    [setMemberRole]
  )
  const handleCancelTeamDialog = useCallback(() => handleTeamDialogChange(false), [handleTeamDialogChange])
  const handleConfirmAddTeamMember = useCallback(() => void handleAddTeamMember(), [handleAddTeamMember])
  const handleRemoveTeamMemberStable = useCallback(
    (client: ClientRecord, memberName: string) => void handleRemoveTeamMember(client, memberName),
    [handleRemoveTeamMember]
  )

  if (!user && !isPreviewMode) {
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

  return (
    <div className="bg-muted/40">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-10">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Client workspaces</h1>
            <p className="text-muted-foreground">
              Allocate real internal teammates to each client workspace and keep ownership clean.
              {isPreviewMode ? ' Preview mode keeps client changes local to this session.' : ''}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="outline">
              <Link href="/admin/team">Team</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin">Admin home</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={clientsLoading} className="inline-flex items-center gap-2">
              <LoaderCircle className={`h-4 w-4 ${clientsLoading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active clients</CardTitle>
              <UsersIcon className={`h-4 w-4 text-muted-foreground ${clientsLoading ? 'animate-spin' : ''}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{clients.length}</div>
              <p className="text-xs text-muted-foreground">{nextCursor ? 'First page loaded' : 'All clients loaded'}</p>
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
              <div className="text-2xl font-bold">{assignableUsers.length}</div>
              <p className="text-xs text-muted-foreground">Admins and team members available for client allocation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-1 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Allocation cleanup</CardTitle>
              <CardDescription>Legacy names to review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allocationSummary.unmatched.length}</div>
              <p className="text-xs text-muted-foreground">Client assignments that no longer map to current users</p>
            </CardContent>
          </Card>
        </div>

         <Card>
           <CardHeader>
             <CardTitle className="text-lg">New client</CardTitle>
            <CardDescription>Kick off a workspace with the key account team.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form
              className="space-y-4"
              onSubmit={handleFormSubmit}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="admin-client-name">Client name</Label>
                  <Input
                    id="admin-client-name"
                    placeholder="e.g. Horizon Ventures"
                    value={clientName}
                    onChange={handleClientNameChange}
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
                      onChange={setClientAccountManager}
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
                      onChange={handleAccountManagerChange}
                      required
                      disabled={clientSaving}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Label className="text-sm font-medium">Team members</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addTeamMemberField} disabled={clientSaving}>
                    <Plus className="mr-2 h-4 w-4" /> Add teammate
                  </Button>
                </div>
                <div className="space-y-2">
                  {teamMemberFields.map((member, index) => (
                    <TeamMemberFieldRow
                      key={member.key}
                      member={member}
                      index={index}
                      assignableUsers={assignableUsers}
                      clientSaving={clientSaving}
                      teamMembersLength={teamMemberFields.length}
                      onUpdateName={handleUpdateTeamMemberName}
                      onUpdateRole={handleUpdateTeamMemberRole}
                      onRemove={removeTeamMemberField}
                      excludeNames={teamMemberFields
                        .filter((candidate) => candidate.key !== member.key)
                        .map((candidate) => candidate.name)}
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
                <Button variant="outline" type="button" onClick={resetClientForm} disabled={clientSaving}>
                  Reset form
                </Button>
                <Button type="submit" disabled={clientSaving}>
                  {clientSaving && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                  Create client
                </Button>
              </div>
            </form>

            {/* Client List */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <UsersIcon className="h-4 w-4" />
                  <span>Existing client workspaces</span>
                  <Badge variant="secondary">{clients.length}</Badge>
                </div>
                <Input
                  value={clientSearch}
                  onChange={handleClientSearchChange}
                  placeholder="Search clients or teammates"
                  className="w-full sm:w-72"
                />
              </div>
              {clientsLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <LoaderCircle className="h-4 w-4 animate-spin" /> Loading clients…
                </div>
              ) : clientsError ? (
                <p className="text-sm text-destructive">{clientsError}</p>
              ) : clients.length === 0 ? (
                <p className="text-sm text-muted-foreground">No clients yet. Add a workspace to get started.</p>
              ) : filteredClients.length === 0 ? (
                <p className="text-sm text-muted-foreground">No client workspaces match your search.</p>
              ) : (
                <div className="space-y-3">
                  {filteredClients.map((client) => (
                    <ClientRow
                      key={client.id}
                      client={client}
                      unmatchedCount={unmatchedByClientId[client.id] ?? 0}
                      addingMember={addingMember}
                      clientPendingMembersId={clientPendingMembers?.id}
                      deletingClientId={deletingClientId}
                      removingTeamMemberKey={removingTeamMemberKey}
                      onAddTeamMember={requestAddTeamMember}
                      onDeleteClient={requestDeleteClient}
                      onRemoveTeamMember={handleRemoveTeamMemberStable}
                    />
                  ))}

                  {nextCursor && (
                    <div className="flex justify-center pt-4">
                      <Button
                        variant="outline"
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="w-full sm:w-auto"
                      >
                        {loadingMore ? (
                          <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Loading…
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
          </CardContent>
        </Card>
      </div>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={handleDeleteDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete client workspace</DialogTitle>
            <DialogDescription>
              This action permanently removes {clientPendingDelete?.name ?? 'this client'} and its workspace configuration. You can recreate it later, but the team list will need to be re-entered.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelDelete}
              disabled={Boolean(deletingClientId)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={Boolean(deletingClientId)}
            >
              {deletingClientId ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              {deletingClientId ? 'Deleting…' : 'Delete client'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Team Member Dialog */}
      <Dialog open={isTeamDialogOpen} onOpenChange={handleTeamDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add teammate</DialogTitle>
            <DialogDescription>
              Add a collaborator to {clientPendingMembers?.name ?? 'this client'}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="team-member-name-input">Name</Label>
              {assignableUsers.length > 0 ? (
                <UserSearchPicker
                  id="team-member-name-input"
                  value={memberName}
                  onChange={setMemberName}
                  options={assignableUsers}
                  placeholder="Select teammate"
                  searchPlaceholder="Search teammates"
                  emptyText="No matching teammate found."
                  disabled={addingMember}
                  excludeNames={(clientPendingMembers?.teamMembers ?? []).map((member) => member.name)}
                />
              ) : (
                <Input
                  id="team-member-name-input"
                  placeholder="e.g. Priya Patel"
                  value={memberName}
                  onChange={handleMemberNameChange}
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
                onChange={handleMemberRoleChange}
                disabled={addingMember}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancelTeamDialog} disabled={addingMember}>
              Cancel
            </Button>
            <Button type="button" onClick={handleConfirmAddTeamMember} disabled={addingMember}>
              {addingMember && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
              Add teammate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
