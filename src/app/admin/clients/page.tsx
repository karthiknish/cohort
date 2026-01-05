'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FileText, Loader2, Plus, Trash2, Users as UsersIcon } from 'lucide-react'

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
import { apiFetch } from '@/lib/api-client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

  const [clientPendingMembers, setClientPendingMembers] = useState<ClientRecord | null>(null)
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false)
  const [addingMember, setAddingMember] = useState(false)
  const [memberName, setMemberName] = useState('')
  const [memberRole, setMemberRole] = useState('')

  const [clientSaving, setClientSaving] = useState(false)
  const [clientName, setClientName] = useState('')
  const [clientAccountManager, setClientAccountManager] = useState('')
  const [teamMemberFields, setTeamMemberFields] = useState<TeamMemberField[]>([createEmptyMemberField()])

  const [clientPendingInvoice, setClientPendingInvoice] = useState<ClientRecord | null>(null)
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false)
  const [invoiceAmount, setInvoiceAmount] = useState('')
  const [invoiceDescription, setInvoiceDescription] = useState('')
  const [invoiceDueDate, setInvoiceDueDate] = useState('')
  const [invoiceEmail, setInvoiceEmail] = useState('')
  const [creatingInvoice, setCreatingInvoice] = useState(false)
  const [invoiceError, setInvoiceError] = useState<string | null>(null)
  const [selectedInvoiceClientId, setSelectedInvoiceClientId] = useState<string | undefined>(undefined)

  const loadClients = useCallback(async () => {
    if (!user?.id) {
      setClients([])
      return
    }

    setClientsLoading(true)
    setClientsError(null)

    try {
      const data = await apiFetch<ClientRecord[]>('/api/clients', {
        cache: 'no-store',
      })

      const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name))
      setClients(sorted)
    } catch (err: unknown) {
      const message = extractErrorMessage(err, 'Unable to load clients')
      setClientsError(message)
      toast({ title: 'Client load failed', description: message, variant: 'destructive' })
    } finally {
      setClientsLoading(false)
    }
  }, [user?.id, toast])

  useEffect(() => {
    if (!user?.id) {
      setClients([])
      return
    }

    void loadClients()
  }, [loadClients, user?.id])

  useEffect(() => {
    if (clients.length === 0) {
      setSelectedInvoiceClientId(undefined)
      return
    }

    setSelectedInvoiceClientId((current) => {
      if (current && clients.some((client) => client.id === current)) {
        return current
      }
      return clients[0]?.id
    })
  }, [clients])

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

  const requestAddTeamMember = useCallback((client: ClientRecord) => {
    setClientPendingMembers(client)
    setMemberName('')
    setMemberRole('')
    setIsTeamDialogOpen(true)
  }, [])

  const requestInvoiceForClient = useCallback((client: ClientRecord) => {
    setClientPendingInvoice(client)
    setInvoiceAmount('')
    setInvoiceDescription('')
    setInvoiceDueDate('')
    setInvoiceEmail(client.billingEmail ?? '')
    setInvoiceError(null)
    setIsInvoiceDialogOpen(true)
  }, [])

  const handleTeamDialogChange = useCallback((open: boolean) => {
    setIsTeamDialogOpen(open)
    if (!open) {
      setClientPendingMembers(null)
      setMemberName('')
      setMemberRole('')
      setAddingMember(false)
    }
  }, [])

  const handleInvoiceDialogChange = useCallback((open: boolean) => {
    if (!open && creatingInvoice) {
      return
    }
    setIsInvoiceDialogOpen(open)
    if (!open) {
      setClientPendingInvoice(null)
      setInvoiceAmount('')
      setInvoiceDescription('')
      setInvoiceDueDate('')
      setInvoiceEmail('')
      setInvoiceError(null)
    }
  }, [creatingInvoice])

  const handleAddTeamMember = useCallback(async () => {
    if (!clientPendingMembers) {
      return
    }

    const name = memberName.trim()
    if (!name) {
      toast({ title: 'Name required', description: 'Enter a teammate name before adding.', variant: 'destructive' })
      return
    }

    const role = memberRole.trim()

    try {
      setAddingMember(true)
      const teamMembers = await apiFetch<ClientTeamMember[]>('/api/clients', {
        method: 'PATCH',
        body: JSON.stringify({ action: 'addTeamMember', id: clientPendingMembers.id, name, role }),
      })

      setClients((prev) =>
        prev.map((client) =>
          client.id === clientPendingMembers.id ? { ...client, teamMembers: teamMembers ?? [] } : client
        )
      )

      toast({ title: 'Teammate added', description: `${name} joined ${clientPendingMembers.name}.` })
      setMemberName('')
      setMemberRole('')
      setIsTeamDialogOpen(false)
      setClientPendingMembers(null)
    } catch (err: unknown) {
      const message = extractErrorMessage(err, 'Unable to add teammate')
      toast({ title: 'Add teammate failed', description: message, variant: 'destructive' })
    } finally {
      setAddingMember(false)
    }
  }, [clientPendingMembers, memberName, memberRole, toast])

  const handleCreateInvoice = useCallback(async () => {
    if (!clientPendingInvoice) {
      return
    }

    const amountValue = Number(invoiceAmount)
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setInvoiceError('Enter a positive amount to invoice.')
      return
    }

    const normalizedEmail = invoiceEmail.trim().toLowerCase()
    if (!normalizedEmail) {
      setInvoiceError('Add a billing email before sending the invoice.')
      return
    }

    let dueDateIso: string | undefined
    if (invoiceDueDate.trim().length > 0) {
      const dueDate = new Date(invoiceDueDate)
      if (Number.isNaN(dueDate.getTime())) {
        setInvoiceError('Provide a valid due date.')
        return
      }
      dueDateIso = dueDate.toISOString()
    }

    setCreatingInvoice(true)
    setInvoiceError(null)

    try {
      const { invoice, client } = await apiFetch<{
        invoice: {
          id: string
          number: string | null
          status: string | null
          amount: number
          currency: string | null
          amountDue: number | null
          issuedAt: string | null
          hostedInvoiceUrl: string | null
        }
        client: {
          id: string
          billingEmail?: string | null
          stripeCustomerId?: string | null
          lastInvoiceStatus?: string | null
          lastInvoiceAmount?: number | null
          lastInvoiceCurrency?: string | null
          lastInvoiceIssuedAt?: string | null
          lastInvoiceNumber?: string | null
          lastInvoiceUrl?: string | null
        }
      }>(`/api/clients/${encodeURIComponent(clientPendingInvoice.id)}/invoice`, {
        method: 'POST',
        body: JSON.stringify({
          amount: amountValue,
          description: invoiceDescription.trim().length > 0 ? invoiceDescription.trim() : undefined,
          dueDate: dueDateIso,
          email: normalizedEmail,
        }),
      })

      setClients((prev) =>
        prev.map((record) => {
          if (record.id !== clientPendingInvoice.id) {
            return record
          }

          const amountFromPayload =
            typeof client?.lastInvoiceAmount === 'number'
              ? client.lastInvoiceAmount
              : typeof invoice.amountDue === 'number'
                ? invoice.amountDue / 100
                : amountValue

          const issuedAtFromPayload = client?.lastInvoiceIssuedAt ?? invoice.issuedAt ?? record.lastInvoiceIssuedAt ?? new Date().toISOString()

          return {
            ...record,
            billingEmail: client?.billingEmail ?? normalizedEmail,
            stripeCustomerId: client?.stripeCustomerId ?? record.stripeCustomerId ?? null,
            lastInvoiceStatus: client?.lastInvoiceStatus ?? invoice.status ?? record.lastInvoiceStatus ?? null,
            lastInvoiceAmount: amountFromPayload,
            lastInvoiceCurrency: client?.lastInvoiceCurrency ?? invoice.currency ?? record.lastInvoiceCurrency ?? 'usd',
            lastInvoiceIssuedAt: issuedAtFromPayload,
            lastInvoiceNumber: client?.lastInvoiceNumber ?? invoice.number ?? record.lastInvoiceNumber ?? null,
            lastInvoiceUrl: client?.lastInvoiceUrl ?? invoice.hostedInvoiceUrl ?? record.lastInvoiceUrl ?? null,
          }
        })
      )

      const invoiceLabel = invoice.number ?? invoice.id
      toast({
        title: 'Invoice sent',
        description: `Invoice ${invoiceLabel} emailed to ${normalizedEmail}.`,
      })

      if (invoice.hostedInvoiceUrl) {
        try {
          window.open(invoice.hostedInvoiceUrl, '_blank', 'noopener')
        } catch (openError) {
          console.warn('[AdminClients] Failed to open invoice preview', openError)
        }
      }

      handleInvoiceDialogChange(false)
    } catch (err: unknown) {
      const message = extractErrorMessage(err, 'Unable to send invoice')
      setInvoiceError(message)
      toast({ title: 'Invoice error', description: message, variant: 'destructive' })
    } finally {
      setCreatingInvoice(false)
    }
  }, [
    clientPendingInvoice,
    handleInvoiceDialogChange,
    invoiceAmount,
    invoiceDescription,
    invoiceDueDate,
    invoiceEmail,
    setClients,
    toast,
  ])

  const handleDeleteClient = useCallback(async () => {
    if (!clientPendingDelete) {
      return
    }

    try {
      setDeletingClientId(clientPendingDelete.id)
      await apiFetch(`/api/clients/${encodeURIComponent(clientPendingDelete.id)}`, {
        method: 'DELETE',
      })

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
  }, [clientPendingDelete, toast])

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
      const client = await apiFetch<ClientRecord>('/api/clients', {
        method: 'POST',
        body: JSON.stringify({ name, accountManager, teamMembers }),
      })

      setClients((prev) => {
        const next = [...prev, client]
        return next.sort((a, b) => a.name.localeCompare(b.name))
      })
      toast({ title: 'Client created', description: `${client.name} is ready to use.` })
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
            <CardTitle className="text-lg">Raise invoice</CardTitle>
            <CardDescription>Send a Stripe invoice to any client workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-invoice-client">Client workspace</Label>
              <Select
                value={selectedInvoiceClientId ?? undefined}
                onValueChange={(value) => setSelectedInvoiceClientId(value)}
                disabled={clients.length === 0 || clientsLoading || creatingInvoice}
              >
                <SelectTrigger id="admin-invoice-client">
                  <SelectValue placeholder={clientsLoading ? 'Loading clients…' : 'Select client'} />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Opens the invoice composer to choose amount, due date, and billing email.
              </p>
              <Button
                type="button"
                onClick={() => {
                  if (!selectedInvoiceClientId) {
                    toast({
                      title: 'Select a client',
                      description: 'Pick the workspace you want to invoice first.',
                      variant: 'destructive',
                    })
                    return
                  }
                  const client = clients.find((record) => record.id === selectedInvoiceClientId)
                  if (!client) {
                    toast({
                      title: 'Client unavailable',
                      description: 'Refresh the list and try again.',
                      variant: 'destructive',
                    })
                    return
                  }
                  requestInvoiceForClient(client)
                }}
                disabled={!selectedInvoiceClientId || creatingInvoice || clients.length === 0}
                className="inline-flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Start invoice
              </Button>
            </div>
            {clients.length === 0 && !clientsLoading ? (
              <p className="text-sm text-muted-foreground">Add a client workspace before raising invoices.</p>
            ) : null}
          </CardContent>
        </Card>

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
                            variant="default"
                            size="sm"
                            onClick={() => requestInvoiceForClient(client)}
                            disabled={creatingInvoice}
                          >
                            <FileText className="mr-2 h-4 w-4" /> Invoice
                          </Button>
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
                      {(client.lastInvoiceStatus || typeof client.lastInvoiceAmount === 'number' || client.lastInvoiceIssuedAt || client.lastInvoiceNumber) && (
                        <div className="mt-4 rounded-md border border-muted/50 bg-background/80 p-3 text-xs text-muted-foreground">
                          <div className="flex flex-wrap items-center gap-2 text-foreground">
                            <span className="font-semibold">Latest invoice</span>
                            {client.lastInvoiceStatus ? (
                              <Badge variant="outline" className="capitalize">
                                {client.lastInvoiceStatus.replace(/_/g, ' ')}
                              </Badge>
                            ) : null}
                          </div>
                          {typeof client.lastInvoiceAmount === 'number' ? (
                            <p className="mt-1 text-foreground">
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: client.lastInvoiceCurrency?.toUpperCase() ?? 'USD',
                              }).format(client.lastInvoiceAmount)}
                              {client.lastInvoiceNumber ? ` • ${client.lastInvoiceNumber}` : ''}
                            </p>
                          ) : (
                            <p className="mt-1">No invoices issued yet.</p>
                          )}
                          {client.lastInvoiceIssuedAt ? (
                            <p className="mt-1">
                              Sent {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(client.lastInvoiceIssuedAt))}
                            </p>
                          ) : null}
                          {client.lastInvoiceUrl ? (
                            <p className="mt-1">
                              <a
                                href={client.lastInvoiceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary underline"
                              >
                                View hosted invoice
                              </a>
                            </p>
                          ) : null}
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
                autoFocus
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
              {addingMember && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add teammate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isInvoiceDialogOpen} onOpenChange={handleInvoiceDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send invoice</DialogTitle>
            <DialogDescription>
              Email a Stripe invoice to {clientPendingInvoice?.name ?? 'this client'} and track the payment in their workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="invoice-amount-input">Amount (USD)</Label>
              <Input
                id="invoice-amount-input"
                type="number"
                min={0}
                step="0.01"
                placeholder="5000"
                value={invoiceAmount}
                onChange={(event) => setInvoiceAmount(event.target.value)}
                disabled={creatingInvoice}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice-description-input">Line item description</Label>
              <Textarea
                id="invoice-description-input"
                placeholder="Describe the scope or milestone you are invoicing for"
                value={invoiceDescription}
                onChange={(event) => setInvoiceDescription(event.target.value)}
                disabled={creatingInvoice}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="invoice-due-date-input">Due date (optional)</Label>
                <Input
                  id="invoice-due-date-input"
                  type="date"
                  value={invoiceDueDate}
                  onChange={(event) => setInvoiceDueDate(event.target.value)}
                  disabled={creatingInvoice}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice-email-input">Billing email</Label>
                <Input
                  id="invoice-email-input"
                  type="email"
                  placeholder="billing@clientco.com"
                  value={invoiceEmail}
                  onChange={(event) => setInvoiceEmail(event.target.value)}
                  disabled={creatingInvoice}
                />
              </div>
            </div>
            {(clientPendingInvoice?.lastInvoiceStatus || typeof clientPendingInvoice?.lastInvoiceAmount === 'number' || clientPendingInvoice?.lastInvoiceNumber) && (
              <div className="rounded-md border border-muted/50 bg-muted/10 p-3 text-xs text-muted-foreground">
                <div className="flex flex-wrap items-center gap-2 text-foreground">
                  <p className="font-medium">Latest invoice</p>
                  {clientPendingInvoice?.lastInvoiceStatus ? (
                    <Badge variant="outline" className="capitalize">
                      {clientPendingInvoice.lastInvoiceStatus.replace(/_/g, ' ')}
                    </Badge>
                  ) : null}
                </div>
                {clientPendingInvoice?.lastInvoiceNumber ? (
                  <p className="mt-1 text-foreground">Invoice {clientPendingInvoice.lastInvoiceNumber}</p>
                ) : null}
                {typeof clientPendingInvoice?.lastInvoiceAmount === 'number' ? (
                  <p className="mt-1">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: clientPendingInvoice.lastInvoiceCurrency?.toUpperCase() ?? 'USD',
                    }).format(clientPendingInvoice.lastInvoiceAmount)}
                  </p>
                ) : (
                  <p className="mt-1">No invoice amount recorded.</p>
                )}
                {clientPendingInvoice?.lastInvoiceIssuedAt ? (
                  <p className="mt-1">
                    Sent on {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(clientPendingInvoice.lastInvoiceIssuedAt))}
                  </p>
                ) : null}
                {clientPendingInvoice?.lastInvoiceUrl ? (
                  <p className="mt-1">
                    <a href={clientPendingInvoice.lastInvoiceUrl} target="_blank" rel="noreferrer" className="text-primary underline">
                      View last invoice
                    </a>
                  </p>
                ) : null}
              </div>
            )}
            {invoiceError && <p className="text-sm text-destructive">{invoiceError}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleInvoiceDialogChange(false)} disabled={creatingInvoice}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleCreateInvoice()} disabled={creatingInvoice}>
              {creatingInvoice && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send invoice
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
