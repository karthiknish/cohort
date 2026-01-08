'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { apiFetch } from '@/lib/api-client'
import { toErrorMessage } from '@/lib/error-utils'
import { useToast } from '@/components/ui/use-toast'
import type { ClientRecord, ClientTeamMember } from '@/types/clients'

export interface TeamMemberField extends ClientTeamMember {
    key: string
}

export function createEmptyMemberField(): TeamMemberField {
    return {
        key: `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
        name: '',
        role: '',
    }
}

export interface UseAdminClientsReturn {
    // Client list state
    clients: ClientRecord[]
    setClients: React.Dispatch<React.SetStateAction<ClientRecord[]>>
    clientsLoading: boolean
    clientsError: string | null
    nextCursor: string | null
    loadingMore: boolean
    existingTeamMembers: number

    // Actions
    loadClients: () => Promise<void>
    handleLoadMore: () => Promise<void>

    // Client form state
    clientName: string
    setClientName: (value: string) => void
    clientAccountManager: string
    setClientAccountManager: (value: string) => void
    teamMemberFields: TeamMemberField[]
    clientSaving: boolean

    // Form actions
    resetClientForm: () => void
    addTeamMemberField: () => void
    updateTeamMemberField: (key: string, field: keyof ClientTeamMember, value: string) => void
    removeTeamMemberField: (key: string) => void
    handleCreateClient: () => Promise<void>

    // Delete client
    clientPendingDelete: ClientRecord | null
    isDeleteDialogOpen: boolean
    deletingClientId: string | null
    requestDeleteClient: (client: ClientRecord) => void
    handleDeleteDialogChange: (open: boolean) => void
    handleDeleteClient: () => Promise<void>

    // Team member dialog
    clientPendingMembers: ClientRecord | null
    isTeamDialogOpen: boolean
    addingMember: boolean
    memberName: string
    memberRole: string
    setMemberName: (value: string) => void
    setMemberRole: (value: string) => void
    requestAddTeamMember: (client: ClientRecord) => void
    handleTeamDialogChange: (open: boolean) => void
    handleAddTeamMember: () => Promise<void>

    // Invoice state
    clientPendingInvoice: ClientRecord | null
    isInvoiceDialogOpen: boolean
    invoiceAmount: string
    invoiceDescription: string
    invoiceDueDate: Date | undefined
    invoiceEmail: string
    creatingInvoice: boolean
    invoiceError: string | null
    selectedInvoiceClientId: string | undefined

    // Invoice actions
    setInvoiceAmount: (value: string) => void
    setInvoiceDescription: (value: string) => void
    setInvoiceDueDate: (date: Date | undefined) => void
    setInvoiceEmail: (value: string) => void
    setSelectedInvoiceClientId: (id: string | undefined) => void
    requestInvoiceForClient: (client: ClientRecord) => void
    handleInvoiceDialogChange: (open: boolean) => void
    handleCreateInvoice: () => Promise<void>
}

export function useAdminClients(): UseAdminClientsReturn {
    const { user } = useAuth()
    const { toast } = useToast()

    // Client list state
    const [clients, setClients] = useState<ClientRecord[]>([])
    const [clientsLoading, setClientsLoading] = useState(false)
    const [clientsError, setClientsError] = useState<string | null>(null)
    const [nextCursor, setNextCursor] = useState<string | null>(null)
    const [loadingMore, setLoadingMore] = useState(false)

    // Delete dialog state
    const [clientPendingDelete, setClientPendingDelete] = useState<ClientRecord | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [deletingClientId, setDeletingClientId] = useState<string | null>(null)

    // Team member dialog state
    const [clientPendingMembers, setClientPendingMembers] = useState<ClientRecord | null>(null)
    const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false)
    const [addingMember, setAddingMember] = useState(false)
    const [memberName, setMemberName] = useState('')
    const [memberRole, setMemberRole] = useState('')

    // Client form state
    const [clientSaving, setClientSaving] = useState(false)
    const [clientName, setClientName] = useState('')
    const [clientAccountManager, setClientAccountManager] = useState('')
    const [teamMemberFields, setTeamMemberFields] = useState<TeamMemberField[]>([createEmptyMemberField()])

    // Invoice dialog state
    const [clientPendingInvoice, setClientPendingInvoice] = useState<ClientRecord | null>(null)
    const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false)
    const [invoiceAmount, setInvoiceAmount] = useState('')
    const [invoiceDescription, setInvoiceDescription] = useState('')
    const [invoiceDueDate, setInvoiceDueDate] = useState<Date | undefined>(undefined)
    const [invoiceEmail, setInvoiceEmail] = useState('')
    const [creatingInvoice, setCreatingInvoice] = useState(false)
    const [invoiceError, setInvoiceError] = useState<string | null>(null)
    const [selectedInvoiceClientId, setSelectedInvoiceClientId] = useState<string | undefined>(undefined)

    const existingTeamMembers = useMemo(
        () => clients.reduce((total, client) => total + client.teamMembers.length, 0),
        [clients]
    )

    // Load clients
    const loadClients = useCallback(async () => {
        if (!user?.id) {
            setClients([])
            setNextCursor(null)
            return
        }

        setClientsLoading(true)
        setClientsError(null)

        try {
            const data = await apiFetch<{ clients: ClientRecord[]; nextCursor: string | null }>('/api/clients', {
                cache: 'no-store',
            })

            setClients(data.clients)
            setNextCursor(data.nextCursor)
        } catch (err: unknown) {
            const message = toErrorMessage(err, 'Unable to load clients')
            setClientsError(message)
            toast({ title: 'Client load failed', description: message, variant: 'destructive' })
        } finally {
            setClientsLoading(false)
        }
    }, [user?.id, toast])

    // Load more clients
    const handleLoadMore = useCallback(async () => {
        if (!nextCursor || loadingMore) return

        setLoadingMore(true)
        try {
            const data = await apiFetch<{ clients: ClientRecord[]; nextCursor: string | null }>(
                `/api/clients?after=${encodeURIComponent(nextCursor)}`,
                { cache: 'no-store' }
            )

            setClients((prev) => [...prev, ...data.clients])
            setNextCursor(data.nextCursor)
        } catch (err: unknown) {
            const message = toErrorMessage(err, 'Unable to load more clients')
            toast({ title: 'Load more failed', description: message, variant: 'destructive' })
        } finally {
            setLoadingMore(false)
        }
    }, [nextCursor, loadingMore, toast])

    // Auto-load on mount
    useEffect(() => {
        if (!user?.id) {
            setClients([])
            return
        }
        void loadClients()
    }, [loadClients, user?.id])

    // Sync invoice client selection
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

    // Delete dialog handlers
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
        if (!clientPendingDelete) return

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
            const message = toErrorMessage(err, 'Unable to delete client')
            toast({ title: 'Client delete failed', description: message, variant: 'destructive' })
        } finally {
            setDeletingClientId(null)
        }
    }, [clientPendingDelete, toast])

    // Team member dialog handlers
    const handleTeamDialogChange = useCallback((open: boolean) => {
        setIsTeamDialogOpen(open)
        if (!open) {
            setClientPendingMembers(null)
            setMemberName('')
            setMemberRole('')
            setAddingMember(false)
        }
    }, [])

    const requestAddTeamMember = useCallback((client: ClientRecord) => {
        setClientPendingMembers(client)
        setMemberName('')
        setMemberRole('')
        setIsTeamDialogOpen(true)
    }, [])

    const handleAddTeamMember = useCallback(async () => {
        if (!clientPendingMembers) return

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
            const message = toErrorMessage(err, 'Unable to add teammate')
            toast({ title: 'Add teammate failed', description: message, variant: 'destructive' })
        } finally {
            setAddingMember(false)
        }
    }, [clientPendingMembers, memberName, memberRole, toast])

    // Invoice dialog handlers
    const handleInvoiceDialogChange = useCallback(
        (open: boolean) => {
            if (!open && creatingInvoice) return
            setIsInvoiceDialogOpen(open)
            if (!open) {
                setClientPendingInvoice(null)
                setInvoiceAmount('')
                setInvoiceDescription('')
                setInvoiceDueDate(undefined)
                setInvoiceEmail('')
                setInvoiceError(null)
            }
        },
        [creatingInvoice]
    )

    const requestInvoiceForClient = useCallback((client: ClientRecord) => {
        setClientPendingInvoice(client)
        setInvoiceAmount('')
        setInvoiceDescription('')
        setInvoiceDueDate(undefined)
        setInvoiceEmail(client.billingEmail ?? '')
        setInvoiceError(null)
        setIsInvoiceDialogOpen(true)
    }, [])

    const handleCreateInvoice = useCallback(async () => {
        if (!clientPendingInvoice) return

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
        if (invoiceDueDate) {
            dueDateIso = invoiceDueDate.toISOString()
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
                    if (record.id !== clientPendingInvoice.id) return record

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
            const message = toErrorMessage(err, 'Unable to send invoice')
            setInvoiceError(message)
            toast({ title: 'Invoice error', description: message, variant: 'destructive' })
        } finally {
            setCreatingInvoice(false)
        }
    }, [clientPendingInvoice, handleInvoiceDialogChange, invoiceAmount, invoiceDescription, invoiceDueDate, invoiceEmail, toast])

    // Client form handlers
    const resetClientForm = useCallback(() => {
        setClientName('')
        setClientAccountManager('')
        setTeamMemberFields([createEmptyMemberField()])
    }, [])

    const addTeamMemberField = useCallback(() => {
        setTeamMemberFields((prev) => [...prev, createEmptyMemberField()])
    }, [])

    const updateTeamMemberField = useCallback((key: string, field: keyof ClientTeamMember, value: string) => {
        setTeamMemberFields((prev) => prev.map((item) => (item.key === key ? { ...item, [field]: value } : item)))
    }, [])

    const removeTeamMemberField = useCallback((key: string) => {
        setTeamMemberFields((prev) => (prev.length <= 1 ? prev : prev.filter((item) => item.key !== key)))
    }, [])

    const handleCreateClient = useCallback(async () => {
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
            const message = toErrorMessage(err, 'Unable to create client')
            toast({ title: 'Client create failed', description: message, variant: 'destructive' })
        } finally {
            setClientSaving(false)
        }
    }, [clientAccountManager, clientName, resetClientForm, teamMemberFields, toast])

    return {
        // Client list
        clients,
        setClients,
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
        memberName,
        memberRole,
        setMemberName,
        setMemberRole,
        requestAddTeamMember,
        handleTeamDialogChange,
        handleAddTeamMember,

        // Invoice
        clientPendingInvoice,
        isInvoiceDialogOpen,
        invoiceAmount,
        invoiceDescription,
        invoiceDueDate,
        invoiceEmail,
        creatingInvoice,
        invoiceError,
        selectedInvoiceClientId,
        setInvoiceAmount,
        setInvoiceDescription,
        setInvoiceDueDate,
        setInvoiceEmail,
        setSelectedInvoiceClientId,
        requestInvoiceForClient,
        handleInvoiceDialogChange,
        handleCreateInvoice,
    }
}
