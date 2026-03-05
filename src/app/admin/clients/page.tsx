'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LoaderCircle, Plus, Trash2, Users as UsersIcon, X } from 'lucide-react'
import { useAdminClients } from './hooks'

export default function AdminClientsPage() {
  const { user } = useAuth()

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

  const [clientSearch, setClientSearch] = useState('')

  const filteredClients = useMemo(() => {
    const query = clientSearch.trim().toLowerCase()
    if (!query) return clients

    return clients.filter((client) => {
      const teamText = client.teamMembers.map((member) => `${member.name} ${member.role}`).join(' ')
      const haystack = `${client.name} ${client.accountManager} ${teamText}`.toLowerCase()
      return haystack.includes(query)
    })
  }, [clients, clientSearch])

  if (!user) {
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
            <p className="text-muted-foreground">Create new client pods and keep delivery teams in sync.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="outline">
              <Link href="/admin/team">Team</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin">Admin home</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => void loadClients()} disabled={clientsLoading} className="inline-flex items-center gap-2">
              <LoaderCircle className={`h-4 w-4 ${clientsLoading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          </div>
        </div>

         <div className="grid gap-4 sm:grid-cols-3">
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Quick start</CardTitle>
              <CardDescription>Need a workspace fast?</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={resetClientForm} disabled={clientSaving}>
                Reset form
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">Clears the form and seeds a fresh team member slot.</p>
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
              onSubmit={(event) => {
                event.preventDefault()
                void handleCreateClient()
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="admin-client-name">Client name</Label>
                  <Input
                    id="admin-client-name"
                    placeholder="e.g. Horizon Ventures"
                    value={clientName}
                    onChange={(event) => setClientName(event.target.value)}
                    required
                    disabled={clientSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-client-owner">Account manager</Label>
                  <Input
                    id="admin-client-owner"
                    placeholder="Primary owner"
                    value={clientAccountManager}
                    onChange={(event) => setClientAccountManager(event.target.value)}
                    required
                    disabled={clientSaving}
                  />
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
                    <div
                      key={member.key}
                      className="flex flex-col gap-2 rounded-md border p-4 sm:flex-row sm:items-center"
                    >
                      <div className="flex-1 space-y-2">
                        <Label htmlFor={`team-member-name-${member.key}`} className="text-xs uppercase tracking-wide text-muted-foreground">
                          Name
                        </Label>
                        <Input
                          id={`team-member-name-${member.key}`}
                          placeholder={index === 0 ? 'Alex Chen' : 'Teammate name'}
                          value={member.name}
                          onChange={(event) => updateTeamMemberField(member.key, 'name', event.target.value)}
                          disabled={clientSaving}
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label htmlFor={`team-member-role-${member.key}`} className="text-xs uppercase tracking-wide text-muted-foreground">
                          Role
                        </Label>
                        <Input
                          id={`team-member-role-${member.key}`}
                          placeholder={index === 0 ? 'Paid Media Lead' : 'Role (optional)'}
                          value={member.role}
                          onChange={(event) => updateTeamMemberField(member.key, 'role', event.target.value)}
                          disabled={clientSaving}
                        />
                      </div>
                      <div className="flex items-center justify-end pt-2 sm:pt-6">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeTeamMemberField(member.key)}
                          disabled={teamMemberFields.length <= 1 || clientSaving}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove team member</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Include anyone collaborating with this client. Account managers are automatically added if missing.</p>
              </div>

              <div className="flex justify-end">
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
                  onChange={(event) => setClientSearch(event.target.value)}
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
                    <div key={client.id} className="rounded-md border p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-bold text-foreground">{client.name}</p>
                          <p className="text-xs text-muted-foreground">Managed by {client.accountManager}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Team {client.teamMembers.length}</Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => requestAddTeamMember(client)}
                            disabled={addingMember && clientPendingMembers?.id === client.id}
                          >
                            <Plus className="mr-2 h-4 w-4" /> Add teammate
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => requestDeleteClient(client)}
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
                      {client.teamMembers.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {client.teamMembers.map((member) => (
                            <div
                              key={`${client.id}-${member.name}-${member.role}`}
                              className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground"
                            >
                              <span className="font-medium text-foreground">{member.name}</span>
                              {member.role && <span className="ml-2 text-muted-foreground">{member.role}</span>}
                              <button
                                type="button"
                                className="ml-2 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
                                onClick={() => void handleRemoveTeamMember(client, member.name)}
                                disabled={
                                  removingTeamMemberKey === `${client.id}:${member.name.toLowerCase()}` ||
                                  member.name.toLowerCase() === client.accountManager.toLowerCase()
                                }
                                aria-label={`Remove ${member.name} from ${client.name}`}
                                title={
                                  member.name.toLowerCase() === client.accountManager.toLowerCase()
                                    ? 'Account manager cannot be removed from the team'
                                    : `Remove ${member.name}`
                                }
                              >
                                {removingTeamMemberKey === `${client.id}:${member.name.toLowerCase()}` ? (
                                  <LoaderCircle className="h-3 w-3 animate-spin" />
                                ) : (
                                  <X className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
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
              onClick={() => handleDeleteDialogChange(false)}
              disabled={Boolean(deletingClientId)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleDeleteClient()}
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
              <Input
                id="team-member-name-input"
                placeholder="e.g. Priya Patel"
                value={memberName}
                onChange={(event) => setMemberName(event.target.value)}
                disabled={addingMember}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-member-role-input">Role (optional)</Label>
              <Input
                id="team-member-role-input"
                placeholder="e.g. Paid Media Lead"
                value={memberRole}
                onChange={(event) => setMemberRole(event.target.value)}
                disabled={addingMember}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleTeamDialogChange(false)} disabled={addingMember}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleAddTeamMember()} disabled={addingMember}>
              {addingMember && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
              Add teammate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
