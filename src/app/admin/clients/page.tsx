'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, Plus, Trash2, Users as UsersIcon } from 'lucide-react'

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
import { useToast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { ClientRecord, ClientTeamMember } from '@/types/clients'

interface TeamMemberField extends ClientTeamMember {
  key: string
}

function createEmptyMemberField(): TeamMemberField {
  return {
    key: `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
    name: '',
    role: '',
  }
}

export default function AdminClientsPage() {
  const { user, getIdToken } = useAuth()
  const { toast } = useToast()

  const [clients, setClients] = useState<ClientRecord[]>([])
  const [clientsLoading, setClientsLoading] = useState(false)
  const [clientsError, setClientsError] = useState<string | null>(null)
  const [clientPendingDelete, setClientPendingDelete] = useState<ClientRecord | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null)

  const [clientSaving, setClientSaving] = useState(false)
  const [clientName, setClientName] = useState('')
  const [clientAccountManager, setClientAccountManager] = useState('')
  const [teamMemberFields, setTeamMemberFields] = useState<TeamMemberField[]>([createEmptyMemberField()])

  const loadClients = useCallback(async () => {
    if (!user?.id) {
      setClients([])
      return
    }

    setClientsLoading(true)
    setClientsError(null)

    try {
      const token = await getIdToken()
      const response = await fetch('/api/clients', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      })

      const payload = (await response.json().catch(() => null)) as
        | { clients?: ClientRecord[]; error?: string }
        | null

      if (!response.ok || !payload || !Array.isArray(payload.clients)) {
        const message = typeof payload?.error === 'string' ? payload.error : 'Failed to load clients'
        throw new Error(message)
      }

      const sorted = [...payload.clients].sort((a, b) => a.name.localeCompare(b.name))
      setClients(sorted)
    } catch (err: unknown) {
      const message = extractErrorMessage(err, 'Unable to load clients')
      setClientsError(message)
      toast({ title: 'Client load failed', description: message, variant: 'destructive' })
    } finally {
      setClientsLoading(false)
    }
  }, [getIdToken, toast, user?.id])

  useEffect(() => {
    if (!user?.id) {
      setClients([])
      return
    }

    void loadClients()
  }, [loadClients, user?.id])

  const existingTeamMembers = useMemo(() => clients.reduce((total, client) => total + client.teamMembers.length, 0), [clients])

  const handleDeleteDialogChange = useCallback((open: boolean) => {
    setIsDeleteDialogOpen(open)
    if (!open) {
      setClientPendingDelete(null)
    }
  }, [])

  const requestDeleteClient = useCallback((client: ClientRecord) => {
    setClientPendingDelete(client)
    setIsDeleteDialogOpen(true)
  }, [])

  const handleDeleteClient = useCallback(async () => {
    if (!clientPendingDelete) {
      return
    }

    try {
      setDeletingClientId(clientPendingDelete.id)
      const token = await getIdToken()
      const response = await fetch('/api/clients', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: clientPendingDelete.id }),
      })

      const payload = (await response.json().catch(() => null)) as { error?: string } | null
      if (!response.ok) {
        const message = typeof payload?.error === 'string' ? payload.error : 'Failed to delete client'
        throw new Error(message)
      }

      setClients((prev) => prev.filter((client) => client.id !== clientPendingDelete.id))
      toast({ title: 'Client deleted', description: `${clientPendingDelete.name} has been removed.` })
      setClientPendingDelete(null)
      setIsDeleteDialogOpen(false)
    } catch (err: unknown) {
      const message = extractErrorMessage(err, 'Unable to delete client')
      toast({ title: 'Client delete failed', description: message, variant: 'destructive' })
    } finally {
      setDeletingClientId(null)
    }
  }, [clientPendingDelete, getIdToken, toast])

  const resetClientForm = () => {
    setClientName('')
    setClientAccountManager('')
    setTeamMemberFields([createEmptyMemberField()])
  }

  const addTeamMemberField = () => {
    setTeamMemberFields((prev) => [...prev, createEmptyMemberField()])
  }

  const updateTeamMemberField = (key: string, field: keyof ClientTeamMember, value: string) => {
    setTeamMemberFields((prev) => prev.map((item) => (item.key === key ? { ...item, [field]: value } : item)))
  }

  const removeTeamMemberField = (key: string) => {
    setTeamMemberFields((prev) => (prev.length <= 1 ? prev : prev.filter((item) => item.key !== key)))
  }

  const handleCreateClient = async () => {
    const name = clientName.trim()
    const accountManager = clientAccountManager.trim()

    if (!name || !accountManager) {
      toast({ title: 'Missing details', description: 'Client name and account manager are required.', variant: 'destructive' })
      return
    }

    const teamMembers = teamMemberFields
      .map((member) => ({
        name: member.name.trim(),
        role: member.role.trim(),
      }))
      .filter((member) => member.name.length > 0)
      .map((member) => ({ ...member, role: member.role || 'Contributor' }))

    setClientSaving(true)

    try {
      const token = await getIdToken()
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, accountManager, teamMembers }),
      })

      const payload = (await response.json().catch(() => null)) as { client?: ClientRecord; error?: string } | null
      if (!response.ok || !payload || !payload.client) {
        const message = typeof payload?.error === 'string' ? payload.error : 'Failed to create client'
        throw new Error(message)
      }

      setClients((prev) => {
        const next = [...prev, payload.client!]
        return next.sort((a, b) => a.name.localeCompare(b.name))
      })
      toast({ title: 'Client created', description: `${payload.client.name} is ready to use.` })
      resetClientForm()
    } catch (err: unknown) {
      const message = extractErrorMessage(err, 'Unable to create client')
      toast({ title: 'Client create failed', description: message, variant: 'destructive' })
    } finally {
      setClientSaving(false)
    }
  }

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
              <Link href="/admin/leads">Leads</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin">Admin home</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => void loadClients()} disabled={clientsLoading} className="inline-flex items-center gap-2">
              <Loader2 className={`h-4 w-4 ${clientsLoading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-muted/60 bg-background">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active clients</CardTitle>
              <UsersIcon className={`h-4 w-4 text-muted-foreground ${clientsLoading ? 'animate-spin' : ''}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{clients.length}</div>
              <p className="text-xs text-muted-foreground">Sorted alphabetically</p>
            </CardContent>
          </Card>

          <Card className="border-muted/60 bg-background">
            <CardHeader className="space-y-1 pb-2">
              <CardTitle className="text-sm font-medium">Workspace coverage</CardTitle>
              <CardDescription>Team members attached</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{existingTeamMembers}</div>
              <p className="text-xs text-muted-foreground">Across all clients</p>
            </CardContent>
          </Card>

          <Card className="border-muted/60 bg-background">
            <CardHeader className="space-y-1 pb-2">
              <CardTitle className="text-sm font-medium">Quick start</CardTitle>
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

        <Card className="border-muted/60 bg-background">
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
                      className="flex flex-col gap-2 rounded-md border border-muted/60 bg-muted/10 p-3 sm:flex-row sm:items-center"
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
                  {clientSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create client
                </Button>
              </div>
            </form>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <UsersIcon className="h-4 w-4" />
                <span>Existing client workspaces</span>
                <Badge variant="secondary">{clients.length}</Badge>
              </div>
              {clientsLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading clients…
                </div>
              ) : clientsError ? (
                <p className="text-sm text-destructive">{clientsError}</p>
              ) : clients.length === 0 ? (
                <p className="text-sm text-muted-foreground">No clients yet. Add a workspace to get started.</p>
              ) : (
                <div className="space-y-3">
                  {clients.map((client) => (
                    <div key={client.id} className="rounded-md border border-muted/60 bg-muted/10 p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{client.name}</p>
                          <p className="text-xs text-muted-foreground">Managed by {client.accountManager}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Team {client.teamMembers.length}</Badge>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => requestDeleteClient(client)}
                            disabled={Boolean(deletingClientId) && deletingClientId !== client.id}
                          >
                            {deletingClientId === client.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting…
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
                            <span
                              key={`${client.id}-${member.name}-${member.role}`}
                              className="rounded-full border border-muted/60 bg-background px-3 py-1 text-xs text-muted-foreground"
                            >
                              <span className="font-medium text-foreground">{member.name}</span>
                              {member.role && <span className="ml-2 text-muted-foreground">{member.role}</span>}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
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
              {deletingClientId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              {deletingClientId ? 'Deleting…' : 'Delete client'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.trim().length > 0) {
      return message
    }
  }
  return fallback
}
